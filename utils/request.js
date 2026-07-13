/**
 * 乡农合规通 - 网络请求封装
 * 统一处理token注入、错误码、登录态过期跳转
 * 开发阶段：无后端时自动使用mock数据兜底，避免页面卡死
 */

const app = getApp()

/**
 * Mock数据映射表
 * 开发阶段无后端时，根据url返回模拟数据
 */
const MOCK_DATA = {
  // 手机号登录（开发mock）
  '/auth/bindPhone': {
    token: 'mock_token_' + Date.now(),
    openid: 'mock_openid',
    userInfo: {
      nickName: '乡农用户',
      phone: '138****8888',
      avatar: '',
      isVerified: false
    }
  },
  // 历史识别记录
  '/scan/history': {
    records: [
      {
        scan_id: 'mock_001',
        product_name: '土鸡蛋',
        risk_level: '绿',
        category: '初级农产品',
        created_at: '2026-07-10 14:30',
        image_url: ''
      },
      {
        scan_id: 'mock_002',
        product_name: '红薯干',
        risk_level: '黄',
        category: '初加工农产品',
        created_at: '2026-07-09 10:15',
        image_url: ''
      },
      {
        scan_id: 'mock_003',
        product_name: '自制辣椒酱',
        risk_level: '红',
        category: '预包装深加工食品',
        created_at: '2026-07-08 16:42',
        image_url: ''
      }
    ]
  },
  // 识别结果
  '/scan/result': {
    image_url: '',
    product_name: '土鸡蛋',
    category: '初级农产品',
    risk_level: '绿',
    action_guide: '该产品属于初级农产品，无需办理食品生产许可证。销售时需确保产品来源可追溯，建议标注产地、生产日期等信息。',
    legal_basis: '《农产品质量安全法》第二条规定，农产品是指来源于农业的初级产品，即在农业活动中获得的植物、动物、微生物及其产品。',
    certain: true
  },
  // 合规清单生成
  '/checklist/generate': {
    required_licenses: [
      {
        name: '农产品承诺达标合格证',
        department: '乡镇农产品质量安全监管站',
        legal_basis: '《农产品质量安全法》第十条',
        duration: '1-3个工作日'
      }
    ],
    label_requirements: [
      {
        content: '标注产品名称、产地、生产者、生产日期',
        standard: 'GB 7718-2011'
      },
      {
        content: '散装农产品应在容器或外包装上标明信息',
        standard: '《农产品包装和标识管理办法》'
      }
    ],
    forbidden_words: ['最优质', '纯天然', '无污染', '绿色食品（未经认证）', '有机（未经认证）'],
    suggested_words: ['新鲜采摘', '产地直发', '当日新鲜'],
    high_risk_words: ['第一品牌', '国家级', '免检产品', '最高级', '绝无仅有']
  },
  // 模板列表
  '/template/list': [
    { id: 1, name: '食品标签模板', format: 'docx', category: '标签模板', downloads: 1256, url: '' },
    { id: 2, name: '代销协议模板', format: 'docx', category: '协议模板', downloads: 892, url: '' },
    { id: 3, name: '小作坊申报表', format: 'xlsx', category: '证照模板', downloads: 734, url: '' },
    { id: 4, name: '合规话术指南', format: 'pdf', category: '指南', downloads: 2103, url: '' },
    { id: 5, name: '委托加工协议', format: 'docx', category: '协议模板', downloads: 567, url: '' },
    { id: 6, name: '承诺达标合格证模板', format: 'docx', category: '标签模板', downloads: 1589, url: '' }
  ],
  // 知识库搜索
  '/knowledge/search': [
    {
      id: 1,
      title: '中华人民共和国食品安全法',
      summary: '为保证食品安全，保障公众身体健康和生命安全，制定本法。食品生产经营者应当依照法律、法规和食品安全标准从事生产经营活动。',
      source: '国家法律',
      sourceType: 'law'
    },
    {
      id: 2,
      title: '中华人民共和国农产品质量安全法',
      summary: '为保障农产品质量安全，维护公众健康，促进农业和农村经济发展，制定本法。从事农产品生产经营活动的单位和个人，应当依照法律、法规和农产品质量安全标准从事生产经营活动。',
      source: '国家法律',
      sourceType: 'law'
    },
    {
      id: 3,
      title: 'GB 7718-2011 预包装食品标签通则',
      summary: '本标准适用于直接提供给消费者的预包装食品标签和非直接提供给消费者的预包装食品标签。规定了预包装食品标签的通用要求、强制标示内容和非强制标示内容。',
      source: 'GB标准',
      sourceType: 'gb'
    },
    {
      id: 4,
      title: '中华人民共和国广告法',
      summary: '为了规范广告活动，保护消费者的合法权益，维护社会经济秩序，促进广告业的健康发展，制定本法。农产品生产经营者在宣传推广中应当遵守本法关于虚假广告、极限用语等相关规定。',
      source: '国家法律',
      sourceType: 'law'
    },
    {
      id: 5,
      title: '食品生产许可管理办法',
      summary: '为规范食品生产许可活动，加强食品生产监督管理，保障食品安全，根据《中华人民共和国食品安全法》等法律法规，制定本办法。从事食品生产应当依法取得食品生产许可。',
      source: '国家法律',
      sourceType: 'law'
    },
    {
      id: 6,
      title: '食品小作坊小餐饮和食品摊贩管理条例',
      summary: '为规范食品小作坊、小餐饮和食品摊贩的生产经营行为，加强食品安全管理，保障公众身体健康和生命安全，根据《中华人民共和国食品安全法》，结合本省实际，制定本条例。',
      source: '地方法规',
      sourceType: 'local'
    }
  ],
  // 专家咨询历史
  '/consult/history': [
    {
      id: 1,
      type: '标签规范',
      content: '请问散装农产品需要在包装上标注哪些信息？',
      status: 'replied',
      reply: '根据《农产品包装和标识管理办法》，散装农产品应在容器或外包装上标明：产品名称、产地、生产者、生产日期、保质期、储存条件等信息。',
      created_at: '2026-07-05 09:30'
    },
    {
      id: 2,
      type: '宣传合规',
      content: '在朋友圈卖农产品，可以用"纯天然"这样的宣传语吗？',
      status: 'replied',
      reply: '不建议使用"纯天然"作为宣传用语。根据《广告法》和相关规定，"纯天然"属于容易引起误解的表述，且可能被职业打假人投诉。建议替换为"新鲜采摘""产地直发"等客观描述。',
      created_at: '2026-07-03 15:20'
    },
    {
      id: 3,
      type: '证照办理',
      content: '自家做的辣椒酱想在微信上卖，需要什么证件？',
      status: 'pending',
      created_at: '2026-07-11 11:45'
    }
  ]
}

/**
 * 尝试获取mock数据
 * @private
 */
function _getMockData(url, method) {
  // GET请求直接匹配
  if (method === 'GET' && MOCK_DATA[url]) {
    return JSON.parse(JSON.stringify(MOCK_DATA[url]))
  }
  // POST请求（如checklist/generate）
  if (method === 'POST' && MOCK_DATA[url]) {
    return JSON.parse(JSON.stringify(MOCK_DATA[url]))
  }
  return null
}

/**
 * 基础请求方法
 * @param {Object} options - 请求配置
 * @param {string} options.url - 接口路径（不含baseUrl）
 * @param {string} options.method - 请求方法，默认GET
 * @param {Object} options.data - 请求参数
 * @param {boolean} options.needAuth - 是否需要鉴权，默认true
 * @param {boolean} options.showLoading - 是否显示loading，默认false
 * @param {boolean} options.useMock - 是否使用mock数据（开发阶段默认true）
 * @returns {Promise<Object>} 接口返回数据
 */
function request(options) {
  const {
    url,
    method = 'GET',
    data = {},
    needAuth = true,
    showLoading = false,
    useMock = true
  } = options

  // 开发阶段：优先使用mock数据，避免无后端时页面卡死
  if (useMock) {
    const mockResult = _getMockData(url, method)
    if (mockResult !== null) {
      return new Promise((resolve) => {
        if (showLoading) {
          wx.showLoading({ title: '加载中...', mask: true })
        }
        // 模拟网络延迟
        setTimeout(() => {
          if (showLoading) wx.hideLoading()
          resolve(mockResult)
        }, 300)
      })
    }
  }

  // 显示加载提示
  if (showLoading) {
    wx.showLoading({ title: '正在加载...', mask: true })
  }

  // 构造请求头
  const header = {
    'Content-Type': 'application/json'
  }

  // 注入鉴权token
  if (needAuth) {
    const token = app.globalData.token || wx.getStorageSync('token')
    if (token) {
      header['Authorization'] = 'Bearer ' + token
    }
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.baseUrl + url,
      method,
      data,
      header,
      success(res) {
        if (showLoading) wx.hideLoading()

        // HTTP状态码异常
        if (res.statusCode === 401) {
          app.clearLoginStatus()
          wx.showToast({ title: '请重新登录', icon: 'none' })
          setTimeout(() => {
            wx.redirectTo({ url: '/pages/login/login' })
          }, 1500)
          reject(new Error('登录已过期'))
          return
        }

        // 业务状态码判断
        if (res.data && res.data.code === 0) {
          resolve(res.data.data)
        } else {
          // 请求失败时尝试mock兜底
          const mockFallback = _getMockData(url, method)
          if (mockFallback !== null) {
            resolve(mockFallback)
          } else {
            wx.showToast({
              title: (res.data && res.data.msg) || '请求失败',
              icon: 'none',
              duration: 2000
            })
            reject(new Error(res.data ? res.data.msg : '请求失败'))
          }
        }
      },
      fail(err) {
        if (showLoading) wx.hideLoading()
        // 网络失败时尝试mock兜底
        const mockFallback = _getMockData(url, method)
        if (mockFallback !== null) {
          resolve(mockFallback)
        } else {
          wx.showToast({
            title: '网络连接失败',
            icon: 'none',
            duration: 2000
          })
          reject(err)
        }
      }
    })
  })
}

/**
 * 上传文件（用于图片识别）
 * @param {string} filePath - 本地文件临时路径
 * @param {Object} formData - 额外表单参数
 * @returns {Promise<Object>} 接口返回数据
 */
/**
 * 开发阶段：根据图片路径模拟不同识别结果
 * 同一张图片返回一致结果，不同图片返回不同结果
 */
function _mockRecognize(filePath) {
  // 简单哈希：将路径字符串转为数字
  let hash = 0
  for (let i = 0; i < filePath.length; i++) {
    hash = ((hash << 5) - hash) + filePath.charCodeAt(i)
    hash |= 0
  }
  const idx = Math.abs(hash) % MOCK_PRODUCTS.length
  return { ...MOCK_PRODUCTS[idx], scan_id: 'mock_' + Date.now(), image_url: filePath }
}

const MOCK_PRODUCTS = [
  {
    product_name: '土鸡蛋',
    category: '初级农产品',
    risk_level: '绿',
    action_guide: '该产品属于初级农产品，无需办理食品生产许可证。销售时需确保产品来源可追溯，建议标注产地、生产日期等信息。',
    legal_basis: '《农产品质量安全法》第二条规定，农产品是指来源于农业的初级产品，即在农业活动中获得的植物、动物、微生物及其产品。',
    certain: true
  },
  {
    product_name: '红薯干',
    category: '初加工农产品',
    risk_level: '黄',
    action_guide: '该产品属于初加工农产品，需确保生产环境卫生，建议办理小作坊登记证。包装需标注生产者信息、生产日期等。',
    legal_basis: '《食品安全法》第三十六条规定，食品生产加工小作坊和食品摊贩等从事食品生产经营活动，应当符合本法规定的与其生产经营规模、条件相适应的食品安全要求。',
    certain: true
  },
  {
    product_name: '自制辣椒酱',
    category: '预包装深加工食品',
    risk_level: '红',
    action_guide: '该产品属于预包装深加工食品，必须办理食品生产许可证（SC证）。严禁无证生产销售，建议委托有资质的食品厂代工。',
    legal_basis: '《食品安全法》第三十五条规定，国家对食品生产经营实行许可制度。从事食品生产、食品销售、餐饮服务，应当依法取得许可。',
    certain: true
  },
  {
    product_name: '新鲜苹果',
    category: '初级农产品',
    risk_level: '绿',
    action_guide: '该产品属于初级农产品，无需办理食品生产许可证。建议使用食用农产品合格证，标明产地、生产者等信息。',
    legal_basis: '《农产品质量安全法》第二条规定，农产品是指来源于农业的初级产品。食用农产品市场销售应当遵守《食用农产品市场销售质量安全监督管理办法》。',
    certain: true
  },
  {
    product_name: '腊肉',
    category: '初加工农产品',
    risk_level: '黄',
    action_guide: '腊肉属于初加工肉制品，需在符合卫生条件的场所生产。建议办理小作坊登记证，并确保产品检验合格。',
    legal_basis: '《食品安全法》第三十六条规定，食品生产加工小作坊从事食品生产经营活动，应当符合与其生产经营规模、条件相适应的食品安全要求。',
    certain: true
  },
  {
    product_name: '农家蜂蜜',
    category: '初级农产品',
    risk_level: '绿',
    action_guide: '蜂蜜属于初级农产品，无需办理食品生产许可证。建议提供产地证明，不得宣传保健或治疗功效。',
    legal_basis: '《农产品质量安全法》第二条规定，农产品是指来源于农业的初级产品。蜂产品属于食用农产品范畴。',
    certain: true
  },
  {
    product_name: '手工豆腐乳',
    category: '预包装深加工食品',
    risk_level: '红',
    action_guide: '豆腐乳属于发酵豆制品，必须办理食品生产许可证。家庭自制不得对外销售，建议委托有资质的食品厂代工或办理SC证。',
    legal_basis: '《食品安全法》第三十五条规定，从事食品生产应当依法取得许可。发酵豆制品属于食品生产许可管理范畴。',
    certain: true
  },
  {
    product_name: '干香菇',
    category: '初加工农产品',
    risk_level: '黄',
    action_guide: '干制菌菇属于初加工农产品，需保证原料安全和生产过程卫生。建议办理小作坊登记证，标签标注完整信息。',
    legal_basis: '《食品安全法》第三十六条规定，食品生产加工小作坊从事食品生产经营活动，应当符合食品安全要求。',
    certain: true
  }
]

function uploadFile(filePath, formData = {}) {
  // 开发阶段：无后端时返回mock识别结果
  return new Promise((resolve) => {
    wx.showLoading({ title: '正在识别中...', mask: true })
    setTimeout(() => {
      wx.hideLoading()
      // 根据图片路径返回不同的模拟识别结果
      resolve(_mockRecognize(filePath))
    }, 1500)

    // TODO: 正式上线时替换为真实上传
    // const token = app.globalData.token || wx.getStorageSync('token')
    // wx.uploadFile({ ... })
  })
}

/**
 * 下载文件并预览（模板下载中心使用）
 * 遵循微信文件沙箱限制
 * @param {string} fileUrl - 文件下载地址
 * @param {string} fileName - 文件名称（含后缀）
 */
function downloadAndPreview(fileUrl, fileName) {
  if (!fileUrl) {
    wx.showToast({ title: '模板下载地址未配置', icon: 'none' })
    return
  }
  wx.showLoading({ title: '正在下载...', mask: true })
  wx.downloadFile({
    url: fileUrl,
    success(res) {
      wx.hideLoading()
      if (res.statusCode === 200) {
        wx.openDocument({
          filePath: res.tempFilePath,
          showMenu: true,
          success() {
            wx.showModal({
              title: '文件已打开',
              content: '点击右上角"..."可转发给好友或保存到手机',
              showCancel: false,
              confirmText: '我知道了'
            })
          },
          fail() {
            wx.showToast({ title: '文件打开失败', icon: 'none' })
          }
        })
      }
    },
    fail() {
      wx.hideLoading()
      wx.showToast({ title: '下载失败，请检查网络', icon: 'none' })
    }
  })
}

module.exports = {
  request,
  uploadFile,
  downloadAndPreview
}