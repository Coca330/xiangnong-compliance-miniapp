/**
 * 拍照识别页逻辑 - 乡农合规通
 * 负责拍照/选图、图片压缩、上传识别及页面跳转
 */

const { uploadFile } = require('../../utils/request.js')

// 图片大小限制：1MB
const MAX_IMAGE_SIZE = 1 * 1024 * 1024

Page({
  data: {
    /** 展示用的图片路径（压缩后的本地路径） */
    imagePath: '',
    /** 用于上传的临时文件路径 */
    tempFilePath: '',
    /** 是否正在上传识别中 */
    uploading: false
  },

  /**
   * 页面加载
   * 接收从result页可能返回的参数（如重新识别时的提示）
   */
  onLoad(options) {
    if (options && options.msg) {
      wx.showToast({ title: options.msg, icon: 'none' })
    }
  },

  /**
   * 从相机拍照
   * 调用 wx.chooseMedia 的 camera 模式
   */
  chooseFromCamera() {
    this._chooseMedia(['camera'])
  },

  /**
   * 从相册选择
   * 调用 wx.chooseMedia 的 album 模式
   */
  chooseFromAlbum() {
    this._chooseMedia(['album'])
  },

  /**
   * 统一媒体选择方法（内部复用）
   * @param {Array} sourceType - 来源类型 ['camera'] 或 ['album']
   */
  _chooseMedia(sourceType) {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: sourceType,
      sizeType: ['compressed'],
      maxDuration: 0,
      success: (res) => {
        const file = res.tempFiles[0]

        // 校验文件大小，超过1MB提示用户
        if (file.size > MAX_IMAGE_SIZE) {
          wx.showToast({
            title: '图片过大，请选择1MB以内的图片',
            icon: 'none',
            duration: 2500
          })
          return
        }

        // 设置图片路径用于预览和上传
        this.setData({
          imagePath: file.tempFilePath,
          tempFilePath: file.tempFilePath
        })
      },
      fail: (err) => {
        // 用户取消选择，不做特殊处理
        console.log('选择媒体取消或失败:', err)
      }
    })
  },

  /**
   * 删除已选图片
   * 清空图片路径，恢复占位提示
   */
  deleteImage() {
    this.setData({
      imagePath: '',
      tempFilePath: ''
    })
  },

  /**
   * 开始识别
   * 校验已选图片，上传至后端，成功后跳转结果页
   */
  async startRecognize() {
    // 校验是否已选择图片
    if (!this.data.tempFilePath) {
      wx.showToast({
        title: '请先拍照或选择图片',
        icon: 'none'
      })
      return
    }

    // 防止重复提交
    if (this.data.uploading) return

    this.setData({ uploading: true })

    try {
      // 调用封装的 uploadFile 方法上传图片
      const res = await uploadFile(this.data.tempFilePath)

      // 获取后端返回的 scan_id
      const scanId = res.scan_id

      if (!scanId) {
        wx.showToast({ title: '识别异常，请重试', icon: 'none' })
        return
      }

      // 跳转到识别结果页，传递 scan_id 和图片路径（用于结果页展示）
      wx.redirectTo({
        url: '/pages/result/result?scan_id=' + scanId + '&image_path=' + encodeURIComponent(this.data.tempFilePath)
      })
    } catch (err) {
      // 错误已在 request.js 中统一处理
      console.error('识别失败:', err)
    } finally {
      this.setData({ uploading: false })
    }
  }
})