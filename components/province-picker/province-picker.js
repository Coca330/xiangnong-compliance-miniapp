/**
 * 省份选择器组件
 * 使用微信原生picker，适配全国34个省级行政区
 */
const { provinces } = require('../../utils/provinces')

Component({
  properties: {
    // 占位提示文字
    placeholder: {
      type: String,
      value: '请选择省份'
    },
    // 外部传入的值（用于回显）
    value: {
      type: String,
      value: ''
    }
  },

  data: {
    provinces: provinces,
    selectedIndex: 0
  },

  observers: {
    // 监听value变化，同步选中索引
    'value': function (val) {
      if (val) {
        const idx = this.data.provinces.indexOf(val)
        if (idx >= 0) {
          this.setData({ selectedIndex: idx })
        }
      }
    }
  },

  methods: {
    /**
     * picker选择变更
     */
    onPickerChange(e) {
      const idx = e.detail.value
      const selectedProvince = this.data.provinces[idx]
      this.setData({
        selectedIndex: idx,
        value: selectedProvince
      })
      // 触发父组件事件
      this.triggerEvent('change', { value: selectedProvince })
    }
  }
})