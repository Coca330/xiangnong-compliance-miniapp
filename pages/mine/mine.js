/**
 * 我的页面逻辑
 * 负责用户信息展示、登录状态管理、页面跳转
 */

// 获取全局app实例
const app = getApp()

Page({
  /**
   * 页面初始数据
   */
  data: {
    // 是否已登录
    isLoggedIn: false,
    // 用户信息（头像、昵称、手机号等）
    userInfo: null,
    // 是否已实名认证
    isVerified: false,
    // 是否有未读消息通知（红点显示）
    hasNotification: false
  },

  /**
   * 页面显示时刷新登录状态
   * 每次从其他页面切换回来时都会执行
   */
  onShow() {
    this.checkLoginStatus()
  },

  /**
   * 检查登录状态
   * 从storage读取token和userInfo判断登录状态
   */
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')

    if (token && userInfo) {
      // 已登录状态
      this.setData({
        isLoggedIn: true,
        userInfo: userInfo,
        isVerified: userInfo.isVerified || false
      })
      // 同步全局数据
      app.globalData.token = token
      app.globalData.userInfo = userInfo

      // 检查是否有未读消息（可选）
      this.checkNotification()
    } else {
      // 未登录状态
      this.setData({
        isLoggedIn: false,
        userInfo: null,
        isVerified: false
      })
    }
  },

  /**
   * 检查是否有未读消息通知
   * 调用后端接口查询（预留）
   */
  checkNotification() {
    // TODO: 上线后取消注释，使用真实接口
    // const { request } = require('../../utils/request')
    // request({
    //   url: '/user/notification/unread',
    //   method: 'GET',
    //   needAuth: true
    // }).then(data => {
    //   this.setData({
    //     hasNotification: data && data.count > 0
    //   })
    // }).catch(() => {})
  },

  /**
   * 跳转到登录页
   */
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  /**
   * 跳转到识别历史页
   * 即首页的历史记录
   */
  goToHistory() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  /**
   * 跳转到我的清单页
   */
  goToMyChecklist() {
    wx.navigateTo({
      url: '/pages/checklist/checklist'
    })
  },

  /**
   * 跳转到消息通知页（预留）
   */
  goToNotification() {
    // TODO: 跳转到消息通知页
    // wx.navigateTo({
    //   url: '/pages/notification/notification'
    // })
    wx.showToast({
      title: '消息通知功能开发中',
      icon: 'none'
    })
  },

  /**
   * 实名认证（预留）
   * 未登录时跳转登录页，已登录时跳转认证流程
   */
  onRealNameAuth() {
    if (!this.data.isLoggedIn) {
      this.goToLogin()
      return
    }

    if (this.data.isVerified) {
      wx.showToast({
        title: '您已完成实名认证',
        icon: 'none'
      })
      return
    }

    // TODO: 跳转到实名认证页
    // wx.navigateTo({
    //   url: '/pages/verify/verify'
    // })
    wx.showToast({
      title: '实名认证功能开发中',
      icon: 'none'
    })
  },

  /**
   * 意见反馈（预留）
   */
  goToFeedback() {
    // TODO: 跳转到意见反馈页
    // wx.navigateTo({
    //   url: '/pages/feedback/feedback'
    // })
    wx.showToast({
      title: '意见反馈功能开发中',
      icon: 'none'
    })
  },

  /**
   * 关于我们（预留）
   */
  goToAbout() {
    // TODO: 跳转到关于我们页
    // wx.navigateTo({
    //   url: '/pages/about/about'
    // })
    wx.showToast({
      title: '关于我们页面开发中',
      icon: 'none'
    })
  },

  /**
   * 用户协议（预留）
   */
  goToAgreement() {
    // TODO: 跳转到用户协议页（webview打开H5页面）
    // wx.navigateTo({
    //   url: '/pages/webview/webview?url=https://xxx.com/agreement'
    // })
    wx.showToast({
      title: '用户协议页面开发中',
      icon: 'none'
    })
  },

  /**
   * 隐私政策（预留）
   */
  goToPrivacy() {
    // TODO: 跳转到隐私政策页（webview打开H5页面）
    // wx.navigateTo({
    //   url: '/pages/webview/webview?url=https://xxx.com/privacy'
    // })
    wx.showToast({
      title: '隐私政策页面开发中',
      icon: 'none'
    })
  },

  /**
   * 退出登录
   * 弹出确认弹窗，确认后清除登录态并刷新页面
   */
  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          // 调用app全局方法清除登录态
          app.clearLoginStatus()
          // 刷新当前页面数据
          this.setData({
            isLoggedIn: false,
            userInfo: null,
            isVerified: false,
            hasNotification: false
          })
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  },

  /**
   * 配置分享内容
   * 用户点击右上角分享时触发
   */
  onShareAppMessage() {
    return {
      title: '乡农合规通 - 拍照三秒，合规知道',
      path: '/pages/index/index'
    }
  }
})