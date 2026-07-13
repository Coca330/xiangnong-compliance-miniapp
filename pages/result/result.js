/**
 * 识别结果页逻辑 - 乡农合规通
 * 负责获取并展示AI识别结果、法律依据、手动选择及语音播报
 */

const { request } = require('../../utils/request.js')
const tts = require('../../utils/tts.js')

// 三级联动品类数据
const CATEGORY_DATA = [
  // 大类：初级农产品
  [
    '初级农产品', '初加工农产品', '预包装深加工食品'
  ],
  // 子类：蔬菜/水果/肉类/水产/粮食/其他
  [
    ['蔬菜', '水果', '肉类', '水产', '粮食', '其他'],
    ['干制蔬菜', '干制水果', '腌制蔬菜', '熏制肉', '粮食加工品', '其他'],
    ['罐头', '饮料', '糕点', '调味品', '方便食品', '其他']
  ],
  // 具体品类（每个子类下的选项）
  [
    // 初级 - 蔬菜
    ['白菜', '萝卜', '番茄', '黄瓜', '辣椒', '其他'],
    // 初级 - 水果
    ['苹果', '柑橘', '香蕉', '葡萄', '西瓜', '其他'],
    // 初级 - 肉类
    ['猪肉', '牛肉', '羊肉', '鸡肉', '鸭肉', '其他'],
    // 初级 - 水产
    ['鱼类', '虾类', '蟹类', '贝类', '藻类', '其他'],
    // 初级 - 粮食
    ['水稻', '小麦', '玉米', '大豆', '薯类', '其他'],
    // 初级 - 其他
    ['蜂蜜', '茶叶', '中药材', '其他', '', ''],
    // 初加工 - 干制蔬菜
    ['干蘑菇', '干木耳', '黄花菜', '其他', '', ''],
    // 初加工 - 干制水果
    ['葡萄干', '红枣', '柿饼', '其他', '', ''],
    // 初加工 - 腌制蔬菜
    ['泡菜', '咸菜', '酱菜', '其他', '', ''],
    // 初加工 - 熏制肉
    ['腊肉', '熏鱼', '火腿', '其他', '', ''],
    // 初加工 - 粮食加工品
    ['大米', '面粉', '杂粮粉', '其他', '', ''],
    // 初加工 - 其他
    ['植物油', '食用糖', '其他', '', '', ''],
    // 深加工 - 罐头
    ['水果罐头', '肉类罐头', '蔬菜罐头', '其他', '', ''],
    // 深加工 - 饮料
    ['果汁', '茶饮料', '碳酸饮料', '其他', '', ''],
    // 深加工 - 糕点
    ['饼干', '面包', '蛋糕', '月饼', '其他', ''],
    // 深加工 - 调味品
    ['酱油', '醋', '味精', '料酒', '其他', ''],
    // 深加工 - 方便食品
    ['方便面', '速冻食品', '自热食品', '其他', '', ''],
    // 深加工 - 其他
    ['休闲零食', '保健食品', '其他', '', '', '']
  ]
]

Page({
  data: {
    /** 识别记录ID */
    scanId: '',
    /** 识别的农产品图片路径 */
    imagePath: '',
    /** 产品名称 */
    productName: '',
    /** 产品类别 */
    category: '',
    /** 风险等级（绿/黄/红） */
    riskLevel: '',
    /** 风险等级英文（用于WXSS类名） */
    riskLevelEn: 'green',
    /** 行动指引 */
    actionGuide: '',
    /** 法律依据文本 */
    legalBasis: '',
    /** AI是否确定识别结果 */
    certain: true,
    /** 法律依据面板是否展开 */
    showLegal: false,
    /** 三级联动picker数据 */
    categoryOptions: CATEGORY_DATA,
    /** 三级联动picker当前选中索引 */
    categoryIndex: [0, 0, 0],
    /** picker显示文本 */
    categoryDisplay: '',
    /** 用户所在省份（用于生成合规清单） */
    province: ''
  },

  /**
   * 页面加载
   * 从 options 获取 scan_id 和图片路径，调用后端获取识别结果
   */
  onLoad(options) {
    // 优先使用参数传入的图片路径（用户刚上传的本地临时路径）
    if (options.image_path) {
      this.setData({ imagePath: decodeURIComponent(options.image_path) })
    }

    if (options.scan_id) {
      this.setData({ scanId: options.scan_id })
      this._fetchResult(options.scan_id)
    }

    // 获取全局省份信息
    const app = getApp()
    if (app.globalData && app.globalData.province) {
      this.setData({ province: app.globalData.province })
    }
  },

  /**
   * 风险等级中文转英文（WXSS类名不支持中文）
   */
  _mapRiskLevel(level) {
    const map = { '绿': 'green', '黄': 'yellow', '红': 'red' }
    return map[level] || 'green'
  },

  /**
   * 获取识别结果
   * @param {string} scanId - 识别记录ID
   */
  async _fetchResult(scanId) {
    wx.showLoading({ title: '加载中...', mask: true })

    try {
      const res = await request({
        url: '/scan/result',
        method: 'GET',
        data: { scan_id: scanId },
        showLoading: false
      })

      const riskLevel = res.risk_level || '绿'
      // 处理并设置页面数据
      // imagePath 优先保留（可能已从 options.image_path 设置）
      const newImagePath = res.image_url || res.imagePath || ''
      this.setData({
        imagePath: this.data.imagePath || newImagePath,
        productName: res.product_name || '未识别',
        category: res.category || '',
        riskLevel: riskLevel,
        riskLevelEn: this._mapRiskLevel(riskLevel),
        actionGuide: res.action_guide || '',
        legalBasis: res.legal_basis || '',
        certain: res.certain !== false // 默认为true
      })
    } catch (err) {
      console.error('获取识别结果失败:', err)
      wx.showToast({ title: '获取结果失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  /**
   * 切换法律依据面板展开/收起
   */
  toggleLegal() {
    this.setData({
      showLegal: !this.data.showLegal
    })
  },

  /**
   * 三级联动 picker 列变更（某一列滚动时触发）
   * 联动更新第三列的具体品类数据
   */
  onColumnChange(e) {
    const { column, value } = e.detail
    const categoryOptions = this.data.categoryOptions
    const categoryIndex = this.data.categoryIndex

    // 更新当前列的选中索引
    categoryIndex[column] = value

    // 第一列变化时，需要重置第二、第三列
    if (column === 0) {
      categoryIndex[1] = 0
      categoryIndex[2] = 0
    }

    // 第二列变化时，重置第三列
    if (column === 1) {
      categoryIndex[2] = 0
    }

    // 计算第三列数据的起始索引
    // 第三列是一个扁平数组，需要根据第一、第二列的索引定位
    const col1Index = categoryIndex[0]
    const col2Index = categoryIndex[1]

    // 计算第三列起始位置（累加前面大类的子类数量）
    let offset = 0
    for (let i = 0; i < col1Index; i++) {
      offset += categoryOptions[1][i].length
    }
    offset += col2Index

    // 更新数据
    this.setData({
      categoryIndex: categoryIndex,
      categoryDisplay: categoryOptions[0][categoryIndex[0]] + ' > ' +
        categoryOptions[1][categoryIndex[0]][categoryIndex[1]] + ' > ' +
        categoryOptions[2][offset][categoryIndex[2]]
    })
  },

  /**
   * 三级联动 picker 确认选择
   */
  onCategoryChange(e) {
    const value = e.detail.value
    const categoryOptions = this.data.categoryOptions
    const categoryIndex = value

    // 计算第三列数据的起始索引
    let offset = 0
    for (let i = 0; i < categoryIndex[0]; i++) {
      offset += categoryOptions[1][i].length
    }
    offset += categoryIndex[1]

    const displayText = categoryOptions[0][categoryIndex[0]] + ' > ' +
      categoryOptions[1][categoryIndex[0]][categoryIndex[1]] + ' > ' +
      categoryOptions[2][offset][categoryIndex[2]]

    this.setData({
      categoryIndex: value,
      categoryDisplay: displayText
    })
  },

  /**
   * 手动选择品类确认
   * 调用后端更新识别结果
   */
  async onManualConfirm() {
    if (!this.data.categoryDisplay) {
      wx.showToast({ title: '请先选择品类', icon: 'none' })
      return
    }

    const categoryOptions = this.data.categoryOptions
    const categoryIndex = this.data.categoryIndex

    // 计算第三列偏移
    let offset = 0
    for (let i = 0; i < categoryIndex[0]; i++) {
      offset += categoryOptions[1][i].length
    }
    offset += categoryIndex[1]

    const selectedCategory = categoryOptions[2][offset][categoryIndex[2]]

    try {
      const res = await request({
        url: '/scan/confirm',
        method: 'POST',
        data: {
          scan_id: this.data.scanId,
          category: selectedCategory
        },
        showLoading: true
      })

      // 更新页面数据
      this.setData({
        productName: res.product_name || selectedCategory,
        category: res.category || this.data.categoryDisplay,
        riskLevel: res.risk_level || '绿',
        actionGuide: res.action_guide || '',
        legalBasis: res.legal_basis || '',
        certain: true
      })

      wx.showToast({ title: '已更新识别结果', icon: 'success' })
    } catch (err) {
      console.error('手动确认失败:', err)
    }
  },

  /**
   * 跳转合规清单页
   * 传递 scan_id 和 province 信息
   */
  goChecklist() {
    let url = '/pages/checklist/checklist?scan_id=' + this.data.scanId
    if (this.data.province) {
      url += '&province=' + encodeURIComponent(this.data.province)
    }
    wx.navigateTo({ url })
  },

  /**
   * 语音播报识别结果
   * 调用 TTS 工具播报
   */
  playVoice() {
    tts.speakResult({
      product_name: this.data.productName,
      risk_level: this.data.riskLevel,
      action_guide: this.data.actionGuide
    })
  },

  /**
   * 重新识别
   * 返回拍照识别页
   */
  reScan() {
    wx.navigateTo({
      url: '/pages/scan/scan'
    })
  }
})