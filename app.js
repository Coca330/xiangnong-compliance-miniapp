/**
 * 乡农合规通 - 小程序入口文件
 * 负责全局生命周期管理、登录状态检查、全局数据初始化
 */

App({
  /**
   * 全局数据
   */
  globalData: {
    // 后端API基础地址（开发环境）
    baseUrl: 'https://your-api-domain.com/api',
    // 用户登录态信息
    userInfo: null,
    // 用户token（后端签发）
    token: '',
    // 用户openid
    openid: '',
    // 系统信息（屏幕尺寸等，用于适配）
    systemInfo: null
  },

  /**
   * 小程序启动时执行
   * 检查登录态，获取系统信息
   */
  onLaunch() {
    // 获取系统信息（使用新API替代已废弃的wx.getSystemInfoSync）
    try {
      const deviceInfo = wx.getDeviceInfo()
      const windowInfo = wx.getWindowInfo()
      const appBaseInfo = wx.getAppBaseInfo()
      this.globalData.systemInfo = {
        ...deviceInfo,
        ...windowInfo,
        ...appBaseInfo
      }
    } catch (e) {
      // 兼容旧版本基础库
      this.globalData.systemInfo = wx.getSystemInfoSync()
    }

    // 检查登录态是否有效
    this.checkLoginStatus()
  },

  /**
   * 检查登录态
   * 从本地存储读取token，验证有效性
   */
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    if (token) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
    }
  },

  /**
   * 微信静默登录
   * 调用wx.login获取code，后端换取openid和session_key
   * @returns {Promise<string>} 返回token
   */
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (loginRes) => {
          if (loginRes.code) {
            // 开发阶段：无后端时使用mock token
            const mockToken = 'mock_token_' + Date.now()
            this.globalData.token = mockToken
            this.globalData.openid = 'mock_openid'
            wx.setStorageSync('token', mockToken)
            wx.setStorageSync('openid', 'mock_openid')
            resolve(mockToken)

            // TODO: 正式上线时替换为真实后端请求
            // wx.request({
            //   url: this.globalData.baseUrl + '/auth/login',
            //   method: 'POST',
            //   data: { code: loginRes.code },
            //   success: (res) => {
            //     if (res.data.code === 0) {
            //       const { token, openid } = res.data.data
            //       this.globalData.token = token
            //       this.globalData.openid = openid
            //       wx.setStorageSync('token', token)
            //       wx.setStorageSync('openid', openid)
            //       resolve(token)
            //     } else {
            //       reject(new Error(res.data.msg || '登录失败'))
            //     }
            //   },
            //   fail: (err) => reject(err)
            // })
          } else {
            reject(new Error('wx.login 获取code失败'))
          }
        },
        fail: (err) => reject(err)
      })
    })
  },

  /**
   * 清除登录态
   */
  clearLoginStatus() {
    this.globalData.token = ''
    this.globalData.openid = ''
    this.globalData.userInfo = null
    wx.removeStorageSync('token')
    wx.removeStorageSync('openid')
    wx.removeStorageSync('userInfo')
  }
})