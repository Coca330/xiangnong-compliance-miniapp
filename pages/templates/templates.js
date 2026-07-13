/**
 * 乡农合规通 - 模板下载页
 * 提供各类合规模板的浏览与下载功能
 */

const { request, downloadAndPreview } = require('../../utils/request.js')

Page({
  data: {
    // 分类tabs列表
    tabs: ['全部', '证照模板', '协议模板', '标签模板', '指南'],
    // 当前选中的tab索引（默认"全部"）
    currentTab: 0,
    // 完整模板列表（接口返回）
    templateList: [],
    // 按分类过滤后的列表
    filteredList: []
  },

  /**
   * 页面加载 - 获取模板列表
   */
  onLoad() {
    this._loadTemplateList()
  },

  /**
   * 加载模板列表
   * 开发阶段使用mock数据，上线后切换为接口请求
   * @private
   */
  _loadTemplateList() {
    // TODO: 上线后取消注释，使用真实接口
    // request({
    //   url: '/template/list',
    //   method: 'GET',
    //   showLoading: true
    // }).then(data => {
    //   this.setData({
    //     templateList: data,
    //     filteredList: data
    //   })
    // })

    // 开发阶段使用mock数据
    const mockData = [
      { id: 1, name: '食品标签模板', format: 'docx', category: '标签模板', downloads: 1256, url: '' },
      { id: 2, name: '代销协议模板', format: 'docx', category: '协议模板', downloads: 892, url: '' },
      { id: 3, name: '小作坊申报表', format: 'xlsx', category: '证照模板', downloads: 734, url: '' },
      { id: 4, name: '合规话术指南', format: 'pdf', category: '指南', downloads: 2103, url: '' },
      { id: 5, name: '委托加工协议', format: 'docx', category: '协议模板', downloads: 567, url: '' },
      { id: 6, name: '承诺达标合格证模板', format: 'docx', category: '标签模板', downloads: 1589, url: '' }
    ]

    this.setData({
      templateList: mockData,
      filteredList: mockData
    })
  },

  /**
   * 切换分类tab
   * @param {Object} e - 事件对象，e.currentTarget.dataset.index 为tab索引
   */
  onTabChange(e) {
    const index = e.currentTarget.dataset.index
    const tabName = this.data.tabs[index]

    // "全部"分类显示所有模板，否则按category过滤
    let filtered = this.data.templateList
    if (tabName !== '全部') {
      filtered = this.data.templateList.filter(item => item.category === tabName)
    }

    this.setData({
      currentTab: index,
      filteredList: filtered
    })
  },

  /**
   * 下载模板
   * 获取模板url和文件名，调用request工具的downloadAndPreview方法
   * @param {Object} e - 事件对象
   */
  downloadTemplate(e) {
    const { url, name, format } = e.currentTarget.dataset

    // 开发阶段无真实url，提示用户
    if (!url) {
      wx.showToast({ title: '开发阶段，暂无下载链接', icon: 'none' })
      return
    }

    // 拼接文件名（含后缀）
    const fileName = name + '.' + format

    // 调用request工具中的下载预览方法
    downloadAndPreview(url, fileName)
  }
})