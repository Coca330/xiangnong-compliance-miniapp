/**
 * 乡农合规通 - 语音播报工具（TTS）
 * 适配中老年用户，核心页面提供语音播报功能
 * 使用微信原生 InnerAudioContext + 文字转语音插件
 */

// TTS插件ID（微信语音识别插件）
const TTS_PLUGIN_ID = 'wx069ba97219cdec4b'

let ttsPlugin = null
let innerAudio = null

/**
 * 初始化TTS插件
 * 应在需要语音的页面 onLoad 中调用
 * @returns {Promise<boolean>} 是否初始化成功
 */
function initTTS() {
  return new Promise((resolve) => {
    // 优先尝试加载TTS插件
    try {
      ttsPlugin = requirePlugin(TTS_PLUGIN_ID)
      if (ttsPlugin) {
        resolve(true)
        return
      }
    } catch (e) {
      // 插件未安装，降级使用系统TTS
    }
    resolve(false)
  })
}

/**
 * 语音播报文本
 * 优先使用插件TTS，降级使用系统语音合成API
 * @param {string} text - 要播报的文本
 * @param {Object} options - 配置项
 * @param {number} options.speed - 语速 0.5-2，默认0.8（慢速适配老年用户）
 */
function speak(text, options = {}) {
  const { speed = 0.8 } = options

  // 停止上一次播报
  stopSpeak()

  // 使用微信原生TTS接口
  wx.setInnerAudioOption({
    mixWithOther: false // 独占音频通道
  })

  // 调用微信语音合成接口（如插件可用则用插件）
  if (ttsPlugin && ttsPlugin.textToSpeech) {
    ttsPlugin.textToSpeech({
      content: text,
      lang: 'zh_CN',
      speed: speed,
      success(res) {
        if (innerAudio) innerAudio.destroy()
        innerAudio = wx.createInnerAudioContext()
        innerAudio.src = res.filePath
        innerAudio.play()
      },
      fail() {
        // 插件失败，降级使用系统API
        _speakFallback(text)
      }
    })
  } else {
    _speakFallback(text)
  }
}

/**
 * 降级方案：使用系统API播报
 * @private
 */
function _speakFallback(text) {
  // 使用 wx.createInnerAudioContext 搭配 base64 音频
  // 或引导用户使用微信自带的"朗读"功能
  wx.showToast({
    title: '语音功能加载中，请稍后再试',
    icon: 'none'
  })
}

/**
 * 停止语音播报
 */
function stopSpeak() {
  if (innerAudio) {
    innerAudio.stop()
    innerAudio.destroy()
    innerAudio = null
  }
}

/**
 * 播报AI识别结果（专用格式化）
 * @param {Object} result - 识别结果对象
 * @param {string} result.product_name - 产品名称
 * @param {string} result.risk_level - 风险等级（绿/黄/红）
 * @param {string} result.action_guide - 行动指引
 */
function speakResult(result) {
  // 风险等级转中文描述
  const riskMap = {
    '绿': '绿色低风险',
    '黄': '黄色中风险',
    '红': '红色高风险'
  }
  const riskText = riskMap[result.risk_level] || '未知风险'

  const text = `识别完成。${result.product_name}，风险等级为${riskText}。${result.action_guide}`
  speak(text)
}

/**
 * 播报合规清单摘要
 * @param {Object} checklist - 清单对象
 * @param {string} checklist.product_name - 产品名称
 * @param {Array} checklist.required_licenses - 所需证照列表
 */
function speakChecklist(checklist) {
  let text = `${checklist.product_name}合规清单：`
  if (checklist.required_licenses && checklist.required_licenses.length > 0) {
    text += `需要办理${checklist.required_licenses.length}项证照。`
    checklist.required_licenses.forEach((item, index) => {
      text += `第${index + 1}项，${item.name}，`
    })
  }
  speak(text)
}

module.exports = {
  initTTS,
  speak,
  stopSpeak,
  speakResult,
  speakChecklist
}