/**
 * 首页逻辑 - 乡农合规通
 * 负责历史记录加载、页面跳转、语音播报、分享功能
 */

// 引入网络请求工具
const { request } = require('../../utils/request')
// 引入语音播报工具
const { initTTS, speakResult, stopSpeak } = require('../../utils/tts')

Page({
  /**
   * 页面初始数据
   */
  data: {
    // 历史识别记录列表
    records: [],
    // 是否有识别记录（控制空状态显示）
    hasRecord: false,
    // 最后一次识别结果（用于语音播报）
    lastResult: null
  },

  /**
   * 页面加载 - 获取历史识别记录并初始化语音
   */
  onLoad() {
    // 加载历史记录
    this.loadHistory()
    // 初始化TTS语音插件
    initTTS()
  },

  /**
   * 页面显示 - 每次显示时刷新历史记录（从scan页返回时更新）
   */
  onShow() {
    this.loadHistory()
  },

  /**
   * 加载历史识别记录
   * 调用后端接口 GET /scan/history
   */
  loadHistory() {
    request({
      url: '/scan/history',
      method: 'GET',
      showLoading: false
    }).then((data) => {
      // 兼容返回格式：data可能是数组或包含list字段的对象
      const records = Array.isArray(data) ? data : (data.list || data.records || [])
      this.setData({
        records: records,
        hasRecord: records.length > 0,
        // 取最后一条记录作为播报内容
        lastResult: records.length > 0 ? records[0] : null
      })
    }).catch(() => {
      // 请求失败时静默处理，保持当前列表不变
    })
  },

  /**
   * 跳转到拍照识别页
   */
  goToScan() {
    wx.navigateTo({
      url: '/pages/scan/scan'
    })
  },

  /**
   * 跳转到合规清单页
   */
  goToChecklist() {
    wx.navigateTo({
      url: '/pages/checklist/checklist'
    })
  },

  /**
   * 跳转到模板下载页
   */
  goToTemplates() {
    wx.switchTab({
      url: '/pages/templates/templates'
    })
  },

  /**
   * 跳转到知识库页
   */
  goToKnowledge() {
    wx.switchTab({
      url: '/pages/knowledge/knowledge'
    })
  },

  /**
   * 语音播报最近一次识别结果
   * 调用tts.js的speakResult方法
   */
  playVoice() {
    const { lastResult } = this.data
    if (!lastResult) {
      wx.showToast({
        title: '暂无识别结果可播报',
        icon: 'none'
      })
      return
    }
    // 调用TTS工具播报识别结果
    speakResult(lastResult)
  },

  /**
   * 配置分享内容
   * 用户点击右上角分享时触发
   */
  onShareAppMessage() {
    return {
      title: '乡农合规通 - 拍照三秒，合规知道',
      path: '/pages/index/index',
      imageUrl: '' // 可设置分享封面图路径
    }
  }
})