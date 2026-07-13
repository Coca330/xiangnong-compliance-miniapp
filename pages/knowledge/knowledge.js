/**
 * 法规知识库页面逻辑
 * 负责法规搜索、热门标签筛选、推荐内容展示
 */

// 引入网络请求工具
const { request } = require('../../utils/request')

Page({
  /**
   * 页面初始数据
   */
  data: {
    // 搜索关键词
    keyword: '',
    // 热门分类标签列表
    hotTags: ['食品安全法', '农产品质量安全法', '广告法', '三小条例', 'GB标准', '典型案例'],
    // 当前选中的热门标签
    activeTag: '',
    // 搜索结果/推荐列表
    resultList: [],
    // 是否正在搜索（控制空状态显示）
    isSearching: false
  },

  /**
   * 页面加载 - 加载推荐内容
   * 无搜索词时显示推荐法规
   */
  onLoad() {
    this.loadRecommend()
  },

  /**
   * 加载推荐内容（无搜索词时的默认展示）
   * 调用 GET /knowledge/recommend 获取推荐法规
   */
  loadRecommend() {
    // TODO: 上线后取消注释，使用真实接口
    // request({
    //   url: '/knowledge/recommend',
    //   method: 'GET'
    // }).then(data => {
    //   this.setData({ resultList: data })
    // }).catch(() => {})

    // 开发阶段使用mock数据
    const mockData = [
      {
        id: 1,
        title: '中华人民共和国食品安全法',
        summary: '为保证食品安全，保障公众身体健康和生命安全，制定本法。在中华人民共和国境内从事食品生产和加工、食品销售和餐饮服务、食品添加剂的生产经营等相关活动，应当遵守本法。',
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
    ]

    this.setData({
      resultList: mockData,
      isSearching: false
    })
  },

  /**
   * 搜索输入事件
   * @param {Object} e - 输入事件，e.detail.value 为输入值
   */
  onKeywordInput(e) {
    this.setData({
      keyword: e.detail.value,
      // 清除热门标签选中状态
      activeTag: ''
    })
  },

  /**
   * 执行搜索
   * 调用 GET /knowledge/search?keyword=xxx
   */
  onSearch() {
    const { keyword } = this.data

    // 关键词为空时加载推荐内容
    if (!keyword.trim()) {
      this.loadRecommend()
      return
    }

    // 设置搜索状态
    this.setData({ isSearching: true })

    // TODO: 上线后取消注释，使用真实接口
    // request({
    //   url: '/knowledge/search',
    //   method: 'GET',
    //   data: { keyword: keyword.trim() },
    //   showLoading: true
    // }).then(data => {
    //   this.setData({
    //     resultList: data,
    //     isSearching: false
    //   })
    // }).catch(() => {
    //   this.setData({ isSearching: false })
    // })

    // 开发阶段使用mock搜索数据
    const mockSearchData = [
      {
        id: 101,
        title: '食品安全法 第三十四条',
        summary: '禁止生产经营用非食品原料生产的食品或者添加食品添加剂以外的化学物质和其他可能危害人体健康物质的食品。',
        source: '国家法律',
        sourceType: 'law'
      },
      {
        id: 102,
        title: '食品安全法 第六十七条',
        summary: '预包装食品的包装上应当有标签。标签应当标明下列事项：名称、规格、净含量、生产日期、保质期等。',
        source: '国家法律',
        sourceType: 'law'
      }
    ]

    this.setData({
      resultList: mockSearchData,
      isSearching: false
    })
  },

  /**
   * 热门标签点击
   * 自动填入搜索框并触发搜索
   * @param {Object} e - 事件对象，e.currentTarget.dataset.tag 为标签文字
   */
  onTagClick(e) {
    const tag = e.currentTarget.dataset.tag
    this.setData({
      keyword: tag,
      activeTag: tag
    })
    // 触发搜索
    this.onSearch()
  },

  /**
   * 语音输入（预留）
   * 调用微信语音识别插件，识别结果填入搜索框
   */
  onVoiceInput() {
    // TODO: 接入微信语音识别插件
    // const plugin = requirePlugin('WechatSI')
    // const manager = plugin.getRecordRecognitionManager()

    // manager.onRecognize = (res) => {
    //   this.setData({ keyword: res.result })
    // }
    // manager.start({ duration: 5000, lang: 'zh_CN' })

    // 开发阶段提示
    wx.showToast({
      title: '语音识别功能开发中',
      icon: 'none'
    })
  },

  /**
   * 跳转知识库详情页（预留）
   * @param {Object} e - 事件对象，e.currentTarget.dataset.id 为法规id
   */
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    // TODO: 跳转到知识库详情页
    // wx.navigateTo({
    //   url: '/pages/knowledge/detail/detail?id=' + id
    // })

    // 开发阶段提示
    wx.showToast({
      title: '详情页开发中',
      icon: 'none'
    })
  },

  /**
   * 配置分享内容
   */
  onShareAppMessage() {
    return {
      title: '乡农合规通 - 法规知识库',
      path: '/pages/knowledge/knowledge'
    }
  }
})