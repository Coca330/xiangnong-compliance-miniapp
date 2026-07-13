/**
 * 登录页逻辑 - 乡农合规通
 * 支持手机号快捷登录（getPhoneNumber）和微信一键登录（wx.login）
 */

// 引入网络请求工具
const { request } = require('../../utils/request')

// 获取app实例
const app = getApp()

Page({
  /**
   * 页面初始数据
   */
  data: {},

  /**
   * 手机号快捷登录
   * 使用微信 <button open-type="getPhoneNumber"> 获取加密手机号code
   * 将code发送到后端 POST /auth/bindPhone 换取真实手机号
   */
  onGetPhoneNumber(e) {
    // 用户拒绝授权
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({
        title: '需要授权手机号才能使用',
        icon: 'none'
      })
      return
    }

    // 获取加密code，发送到后端解密
    const code = e.detail.code
    wx.showLoading({ title: '登录中...', mask: true })

    request({
      url: '/auth/bindPhone',
      method: 'POST',
      data: { code: code },
      // 绑定手机号时可能还没有token，不需要鉴权
      needAuth: false
    }).then((data) => {
      // 保存token到全局和storage
      if (data.token) {
        app.globalData.token = data.token
        app.globalData.openid = data.openid
        wx.setStorageSync('token', data.token)
        wx.setStorageSync('openid', data.openid)
      }
      // 登录成功，处理用户信息
      this.loginSuccess(data.userInfo || data)
    }).catch(() => {
      // request工具已统一处理错误提示
    })
  },

  /**
   * 微信一键登录
   * 调用app.wxLogin()静默登录，获取openid和token
   * 不需要用户授权手机号，可快速进入首页
   */
  onWxLogin() {
    wx.showLoading({ title: '登录中...', mask: true })

    app.wxLogin().then(() => {
      // 静默登录成功，直接跳转首页
      wx.hideLoading()
      this.loginSuccess(app.globalData.userInfo)
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: err.message || '登录失败，请重试',
        icon: 'none'
      })
    })
  },

  /**
   * 登录成功后的统一处理
   * 保存用户信息到本地存储，跳转到首页（tabBar页面用switchTab）
   * @param {Object} userInfo - 用户信息对象
   */
  loginSuccess(userInfo) {
    // 保存用户信息到storage和全局变量
    if (userInfo) {
      app.globalData.userInfo = userInfo
      wx.setStorageSync('userInfo', userInfo)
    }

    wx.hideLoading()
    wx.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500
    })

    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }, 1500)
  },

  /**
   * 查看用户协议 / 隐私政策
   * 预留跳转，后续接入webview或本地协议页
   */
  viewAgreement() {
    wx.showModal({
      title: '提示',
      content: '协议页面正在完善中，敬请期待',
      showCancel: false,
      confirmText: '我知道了'
    })
    // 后续可替换为实际跳转：
    // wx.navigateTo({ url: '/pages/agreement/agreement' })
  }
})