/**
 * 乡农合规通 - 合规清单页
 * 根据产品信息和发货/销售地，生成合规清单
 */

const { request } = require('../../utils/request.js')
const tts = require('../../utils/tts.js')

Page({
  data: {
    // 扫描记录ID
    scanId: '',
    // 产品名称
    productName: '',
    // 风险等级
    riskLevel: '',
    // 产品类别
    category: '',
    // 免责声明是否已勾选
    disclaimerChecked: false,
    // 发货地省份
    provinceFrom: '',
    // 销售地省份
    provinceTo: '',
    // 清单数据（生成后填充）
    checklistData: null,
    // 是否显示高危词弹出层
    showWarning: false,
    // 禁用词列表
    forbiddenWords: [],
    // 是否正在生成清单
    generating: false
  },

  /**
   * 页面加载 - 获取扫描结果中的产品信息
   */
  onLoad(options) {
    // 从页面参数获取scan_id
    const scanId = options.scan_id || ''
    this.setData({ scanId })

    // 调用接口获取产品信息
    if (scanId) {
      this._loadScanResult(scanId)
    }

    // 初始化TTS语音播报
    tts.initTTS()
  },

  /**
   * 加载扫描结果信息
   * @private
   */
  _loadScanResult(scanId) {
    request({
      url: '/scan/result',
      method: 'GET',
      data: { scan_id: scanId },
      showLoading: true
    }).then(data => {
      this.setData({
        productName: data.product_name || '未知产品',
        riskLevel: data.risk_level || '绿',
        category: data.category || '未分类'
      })
    }).catch(() => {
      wx.showToast({ title: '获取产品信息失败', icon: 'none' })
    })
  },

  /**
   * 切换免责声明勾选状态（自定义勾选框）
   */
  toggleDisclaimer() {
    this.setData({
      disclaimerChecked: !this.data.disclaimerChecked
    })
  },

  /**
   * 发货地省份变更
   */
  onFromChange(e) {
    this.setData({
      provinceFrom: e.detail.value
    })
  },

  /**
   * 销售地省份变更
   */
  onToChange(e) {
    this.setData({
      provinceTo: e.detail.value
    })
  },

  /**
   * 判断是否满足生成清单条件
   * @returns {boolean}
   */
  _canGenerate() {
    return this.data.disclaimerChecked &&
           this.data.provinceFrom &&
           this.data.provinceTo
  },

  /**
   * 生成合规清单
   */
  generateChecklist() {
    // 校验免责声明
    if (!this.data.disclaimerChecked) {
      wx.showToast({ title: '请先勾选免责声明', icon: 'none' })
      return
    }

    // 校验发货地
    if (!this.data.provinceFrom) {
      wx.showToast({ title: '请选择发货地', icon: 'none' })
      return
    }

    // 校验销售地
    if (!this.data.provinceTo) {
      wx.showToast({ title: '请选择销售地', icon: 'none' })
      return
    }

    // 开始生成，显示加载状态
    this.setData({ generating: true })

    request({
      url: '/checklist/generate',
      method: 'POST',
      data: {
        scan_id: this.data.scanId,
        province_from: this.data.provinceFrom,
        province_to: this.data.provinceTo
      },
      showLoading: true
    }).then(data => {
      // 设置清单数据
      this.setData({
        checklistData: data,
        forbiddenWords: data.forbidden_words || [],
        generating: false,
        // 生成成功后弹出高危词警告
        showWarning: true
      })
    }).catch(() => {
      this.setData({ generating: false })
    })
  },

  /**
   * 关闭高危词弹出层
   */
  closeWarning() {
    this.setData({ showWarning: false })
  },

  /**
   * 语音播报清单内容
   */
  playVoice() {
    if (!this.data.checklistData) {
      wx.showToast({ title: '暂无清单内容', icon: 'none' })
      return
    }
    // 调用TTS工具播报清单摘要
    tts.speakChecklist(this.data.checklistData)
  },

  /**
   * 下载清单（小程序内简化方案：复制到剪贴板）
   */
  downloadChecklist() {
    if (!this.data.checklistData) {
      wx.showToast({ title: '暂无清单内容', icon: 'none' })
      return
    }

    // 拼接清单文本内容
    let content = `【${this.data.productName}】合规清单\n`
    content += `发货地：${this.data.provinceFrom}  销售地：${this.data.provinceTo}\n\n`

    const data = this.data.checklistData

    // 证照办理指引
    if (data.required_licenses && data.required_licenses.length > 0) {
      content += '=== 证照办理指引 ===\n'
      data.required_licenses.forEach(item => {
        content += `- ${item.name}  办理部门：${item.department}  预计时长：${item.duration}\n`
        if (item.legal_basis) {
          content += `  依据：${item.legal_basis}\n`
        }
      })
      content += '\n'
    }

    // 标签规范要求
    if (data.label_requirements && data.label_requirements.length > 0) {
      content += '=== 标签规范要求 ===\n'
      data.label_requirements.forEach(item => {
        content += `- ${item.content}`
        if (item.standard) {
          content += `（${item.standard}）`
        }
        content += '\n'
      })
      content += '\n'
    }

    // 宣传话术规范
    if (data.forbidden_words && data.forbidden_words.length > 0) {
      content += '=== 禁用词 ===\n'
      content += data.forbidden_words.join('、') + '\n\n'
    }
    if (data.suggested_words && data.suggested_words.length > 0) {
      content += '=== 建议替代词 ===\n'
      content += data.suggested_words.join('、') + '\n'
    }

    // 复制到剪贴板
    wx.setClipboardData({
      data: content,
      success() {
        wx.showToast({ title: '清单已复制到剪贴板', icon: 'success' })
      }
    })
  }
})