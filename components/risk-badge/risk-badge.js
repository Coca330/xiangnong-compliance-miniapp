/**
 * 风险等级徽章组件
 * 接收风险等级（绿/黄/红），渲染对应颜色的徽章
 * WXSS不支持类名中包含中文，因此通过observers映射为英文class
 */

const LEVEL_MAP = {
  '绿': 'green',
  '黄': 'yellow',
  '红': 'red'
}

Component({
  properties: {
    // 风险等级：绿/黄/红
    level: {
      type: String,
      value: '绿'
    }
  },

  data: {
    // 映射后的英文class后缀
    levelClass: 'green'
  },

  observers: {
    'level': function (val) {
      this.setData({
        levelClass: LEVEL_MAP[val] || 'green'
      })
    }
  }
})