/**
 * 专家咨询页面逻辑
 * 负责留言提交、图片上传、历史留言查看与展开
 */

// 引入网络请求工具
const { request } = require('../../utils/request')

Page({
  /**
   * 页面初始数据
   */
  data: {
    // 问题类型列表
    questionTypes: ['证照办理', '标签规范', '宣传合规', '代工合规', '其他'],
    // 当前选中的问题类型索引（-1表示未选择）
    typeIndex: -1,
    // 问题描述内容
    content: '',
    // 已上传的图片临时路径列表
    images: [],
    // 已上传图片数量
    imageCount: 0,
    // 历史留言列表
    historyList: [],
    // 是否正在提交
    submitting: false
  },

  /**
   * 页面加载 - 获取历史留言列表
   */
  onLoad() {
    this.loadHistory()
  },

  /**
   * 页面显示时刷新历史记录（从其他页面返回时更新）
   */
  onShow() {
    this.loadHistory()
  },

  /**
   * 问题类型选择变化
   * @param {Object} e - picker事件，e.detail.value 为选中索引
   */
  onTypeChange(e) {
    this.setData({
      typeIndex: parseInt(e.detail.value)
    })
  },

  /**
   * 问题描述输入事件
   * @param {Object} e - 输入事件，e.detail.value 为输入内容
   */
  onContentInput(e) {
    this.setData({
      content: e.detail.value
    })
  },

  /**
   * 选择图片
   * 调用wx.chooseMedia，最多选择3张
   */
  chooseImage() {
    // 计算剩余可上传数量
    const remainCount = 3 - this.data.images.length
    if (remainCount <= 0) {
      wx.showToast({
        title: '最多上传3张图片',
        icon: 'none'
      })
      return
    }

    wx.chooseMedia({
      count: remainCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        // 获取新选择的图片临时路径
        const newImages = res.tempFiles.map(file => file.tempFilePath)
        // 合并到已有图片列表
        this.setData({
          images: this.data.images.concat(newImages),
          imageCount: this.data.images.length + newImages.length
        })
      },
      fail: () => {
        // 用户取消选择，静默处理
      }
    })
  },

  /**
   * 删除已选图片
   * @param {Object} e - 事件对象，e.currentTarget.dataset.index 为图片索引
   */
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images
    // 从数组中移除指定索引的图片
    images.splice(index, 1)
    this.setData({
      images: images,
      imageCount: images.length
    })
  },

  /**
   * 提交咨询问题
   * 校验必填项，调用 POST /consult/submit
   */
  submitQuestion() {
    const { typeIndex, questionTypes, content, images, submitting } = this.data

    // 防止重复提交
    if (submitting) return

    // 校验问题类型
    if (typeIndex < 0) {
      wx.showToast({
        title: '请选择问题类型',
        icon: 'none'
      })
      return
    }

    // 校验问题描述
    if (!content.trim()) {
      wx.showToast({
        title: '请描述您的合规问题',
        icon: 'none'
      })
      return
    }

    // 设置提交状态
    this.setData({ submitting: true })

    // 构造提交数据
    const submitData = {
      questionType: questionTypes[typeIndex],
      content: content.trim(),
      images: images // TODO: 上线前需先上传图片获取服务端URL
    }

    // TODO: 上线后取消注释，使用真实接口
    // request({
    //   url: '/consult/submit',
    //   method: 'POST',
    //   data: submitData,
    //   needAuth: true,
    //   showLoading: true
    // }).then(() => {
    //   this.setData({ submitting: false })
    //   wx.showToast({
    //     title: '提交成功，请耐心等待回复',
    //     icon: 'none'
    //   })
    //   // 清空表单
    //   this.setData({
    //     typeIndex: -1,
    //     content: '',
    //     images: [],
    //     imageCount: 0
    //   })
    //   // 刷新历史列表
    //   this.loadHistory()
    // }).catch(() => {
    //   this.setData({ submitting: false })
    // })

    // 开发阶段模拟提交
    setTimeout(() => {
      this.setData({ submitting: false })
      wx.showToast({
        title: '提交成功，请耐心等待回复',
        icon: 'none'
      })
      // 清空表单
      this.setData({
        typeIndex: -1,
        content: '',
        images: [],
        imageCount: 0
      })
      // 刷新历史列表
      this.loadHistory()
    }, 1000)
  },

  /**
   * 加载历史留言列表
   * 调用 GET /consult/history
   */
  loadHistory() {
    // TODO: 上线后取消注释，使用真实接口
    // request({
    //   url: '/consult/history',
    //   method: 'GET',
    //   needAuth: true
    // }).then(data => {
    //   // 为每条记录添加展开状态字段
    //   const list = (data || []).map(item => ({
    //     ...item,
    //     expanded: false
    //   }))
    //   this.setData({ historyList: list })
    // }).catch(() => {})

    // 开发阶段使用mock数据
    const mockHistory = [
      {
        id: 1,
        questionType: '标签规范',
        content: '我生产的土特产包装上需要标注哪些信息？是否需要标注营养成分表？小作坊生产的预包装食品标签有什么特殊要求？',
        status: '已回复',
        time: '2026-07-10 14:30',
        reply: '根据《食品安全法》第六十七条和GB 7718-2011，预包装食品标签应标明：食品名称、配料表、净含量和规格、生产者/经销者信息、生产日期和保质期、贮存条件、食品生产许可证编号等。小作坊生产的食品如果属于"预包装食品"，同样需要遵守上述标签规定。营养成分表并非所有类别都强制要求，但豁免范围较窄，建议参照GB 28050的具体规定。',
        expanded: false
      },
      {
        id: 2,
        questionType: '证照办理',
        content: '请问农村小作坊生产红薯干需要办理哪些证照？需要食品生产许可证吗？',
        status: '待回复',
        time: '2026-07-11 09:15',
        reply: '',
        expanded: false
      },
      {
        id: 3,
        questionType: '宣传合规',
        content: '我在朋友圈宣传自家蜂蜜，说"纯天然无添加，治疗失眠效果好"，这样宣传有没有问题？',
        status: '已回复',
        time: '2026-07-08 16:45',
        reply: '根据《广告法》和相关法规，普通食品不得宣称保健功能和治疗功效。"纯天然无添加"需要确保真实，如有检测报告可以标注。"治疗失眠效果好"属于明示或暗示疾病治疗功能的宣传用语，已违反《广告法》第十七条和第二十八条，建议修改为"口感醇厚、品质优良"等客观描述性用语。',
        expanded: false
      }
    ]

    this.setData({ historyList: mockHistory })
  },

  /**
   * 展开/收起历史留言的回复内容
   * @param {Object} e - 事件对象，e.currentTarget.dataset.index 为记录索引
   */
  toggleHistory(e) {
    const index = e.currentTarget.dataset.index
    const key = 'historyList[' + index + '].expanded'
    // 切换展开状态
    this.setData({
      [key]: !this.data.historyList[index].expanded
    })
  },

  /**
   * 添加企业微信客服（预留）
   * 跳转企业微信客服会话
   */
  addWechat() {
    // TODO: 接入企业微信客服
    // wx.openCustomerServiceChat({
    //   extId: '企业微信客服ID',
    //   corpId: '企业微信CorpID',
    //   success: () => {},
    //   fail: () => {
    //     wx.showToast({ title: '客服连接失败', icon: 'none' })
    //   }
    // })

    // 开发阶段提示
    wx.showToast({
      title: '企业微信客服功能开发中',
      icon: 'none'
    })
  },

  /**
   * 配置分享内容
   */
  onShareAppMessage() {
    return {
      title: '乡农合规通 - 专家咨询',
      path: '/pages/consult/consult'
    }
  }
})