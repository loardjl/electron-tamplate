import { reactive, computed, watchEffect } from 'vue'
const fontColor = 'rgb(65, 180, 207)'
const editType = ['edit', 'add']
const wordWidth = '1.51'
const intReg = /^-?\d+$/
const floatOnePointReg = /^-?\d+(\.\d{0,1})?$/
const floatReg = /^-?\d+(\.\d+)?$/
const onePointList = ['']
function getFullNum(num) {
  //处理非数字
  if (isNaN(num)) {
    return num
  }
  //处理不需要转换的数字
  var str = '' + num
  if (!/e/i.test(str)) {
    return num
  }
  return Number(num)
    .toFixed(18)
    .replace(/\.?0+$/, '')
}

// 根据配置生成编辑表单
function convertToEditForm(cfg, arr, channelList, ncAdapterChannel, t) {
  arr.splice(4)
  cfg.forEach((c, index) => {
    const { type: cType, specs } = c.desc
    const width = c.displayname.length * wordWidth
    const isEnumType = ['list', 'enum'].includes(cType)
    const item = {
      label: c.displayname,
      key: c.name,
      type: isEnumType ? 'selectFn' : 'input',
      placeholder: isEnumType ? t('prepro.pleaseSelect') : t('prepro.pleaseEnter'),
      width: `${width}vw`,
      inputWidth:
        c.name === 'PreprocessWindowDuration'
          ? `${12 - width}vw`
          : index % 2 === 0
          ? `${17 - width}vw`
          : `${13.5 - width}vw`,
      multiple: cType === 'list',
      lineStyle: {
        marginBottom: '3.02vw'
      },
      ...(c.name === 'PreprocessWindowDuration' ? { suffix: 'ms' } : {}),
      ...(c.name === 'PreprocessSpSpeedSource'
        ? {
            option: ncAdapterChannel.value.map(d => ({
              label: `${t('prepro.channel')}${d.channel}`,
              value: d.channel
            }))
          }
        : isEnumType
        ? {
            option: specs.enum
              ? specs.enum.map(s => ({
                  label: s.name,
                  value: s.value
                }))
              : c.name === 'PreprocessUsingTunnels'
              ? channelList.value.map(s => ({
                  label: s.name,
                  value: s.value
                }))
              : specs.list.map(s => ({
                  label: s,
                  value: s
                }))
          }
        : {})
    }
    arr.push(item)
  })
}
// 根据配置生成展示表单
function convertToShowForm(cfg, curRow, arr, channelList, t) {
  arr.splice(4)
  curRow.value.save_data &&
    cfg.forEach((c, index) => {
      const width = c.displayname.length * wordWidth
      const item = {
        label: c.displayname,
        width: `${width}vw`,
        value: computed(() => {
          const prop = curRow.value.save_data[c.name]
          const { type, specs } = c.desc
          if (type === 'enum') {
            if (c.name === 'PreprocessSpSpeedSource') {
              return `${t('prepro.channel')}${prop}`
            } else {
              const { enum: enums } = specs
              return enums.find(e => e.value === prop)?.name
            }
          } else if (type === 'list' && c.name === 'PreprocessUsingTunnels') {
            const channelCode = prop.split(',').map(p => +p)
            const cur = channelCode.filter(d => channelList.value.find(c => c.value === d))
            return cur.map(p => channelList.value.find(c => c.value === p)?.name).join(',')
          } else {
            return prop
          }
        }),
        ...(c.name === 'PreprocessWindowDuration' ? { suffix: 'ms' } : {}),
        style: {
          width: index % 2 === 0 ? `${15.5 - width}vw` : `${12.5 - width}vw`,
          margin: '1.46vw 0'
        }
      }
      arr.push(item)
    })
}
function generateRule(cfg, rule, aliasNameList, t) {
  cfg.forEach(c => {
    const { specs, type } = c.desc
    rule[c.name] = {
      validator: (rule, value, callback) => {
        if (value === '' || value === undefined || value === null || value.length === 0) {
          callback(new Error(t('prepro.ruleInteger', { val: c.displayname })))
        } else if (specs.range) {
          let [min, max] = specs.range
          min = getFullNum(min)
          max = getFullNum(max)
          if (type.includes('int') && !intReg.test(value)) {
            callback(new Error(t('prepro.ruleInteger', { val: c.displayname })))
          } else if (onePointList.includes(c.name) && !floatOnePointReg.test(value)) {
            callback(new Error(t('prepro.ruleNumberText')))
          } else if (type.includes('float') && !floatReg.test(value)) {
            callback(new Error(t('prepro.ruleNumber', { val: c.displayname })))
          } else if (+value < min || +value > max) {
            callback(new Error(t('prepro.ruleRange', { min, max })))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    }
  })
  rule['alias'] = {
    validator: (rule, value, callback) => {
      if (value === '' || value === undefined || value === null || value.length === 0) {
        callback(new Error(t('prepro.pleaseEnterMetricAliases')))
      } else if (aliasNameList.value.includes(value)) {
        callback(new Error(t('prepro.metricAliasesExist')))
      } else {
        callback()
      }
    },
    trigger: ['blur', 'change']
  }
  rule['adapterCode'] = {
    validator: (rule, value, callback) => {
      if (value === '' || value === undefined || value === null || value.length === 0) {
        callback(new Error(t('prepro.pleaseSelectSensor')))
      } else {
        callback()
      }
    },
    trigger: ['blur']
  }
  rule['operator'] = {
    validator: (rule, value, callback) => {
      if (value === '' || value === undefined || value === null || value.length === 0) {
        callback(new Error(t('prepro.pleaseSelectOperator')))
      } else {
        callback()
      }
    },
    trigger: ['blur']
  }
}
export const useFormData = (
  type,
  curRow,
  cfg,
  adapterList,
  algoList,
  selectedAlgo,
  selectedAdapter,
  channelList,
  ncAdapterChannel,
  aliasNameList,
  t
) => {
  const arr = reactive([
    {
      label: t('prepro.sensorName'),
      key: 'adapterCode',
      type: 'selectFn',
      placeholder: t('prepro.pleaseSelectSensorName'),
      inputWidth: '9.74vw',
      width: '7.25vw',
      option: adapterList,
      fn: val => {
        selectedAdapter.value = val
      }
    },
    {
      label: t('prepro.metricAliases'),
      key: 'alias',
      type: 'input',
      width: '6.25vw',
      inputWidth: '7.5vw'
    },
    {
      label: t('prepro.operatorName'),
      key: 'operator',
      type: 'selectFn',
      placeholder: t('prepro.pleaseSelectOperatorName'),
      inputWidth: '9.74vw',
      width: '7.25vw',
      option: algoList,
      fn: val => {
        selectedAlgo.value = val
      }
    },
    {
      label: '',
      lineStyle: {
        width: '100%',
        margin: '.83vw 0 3.49vw 0',
        border: 'solid 1px rgba(255, 255, 255, 0.31)'
      }
    }
  ])
  const arr1 = reactive([
    {
      label: t('prepro.sensorName'),
      width: '7.25vw',
      value: computed(() => curRow.value.name),
      style: {
        color: fontColor,
        width: '10.94vw'
      }
    },
    {
      label: t('prepro.metricAliases'),
      width: '6.25vw',
      value: computed(() => curRow.value.alias),
      style: {
        color: fontColor,
        width: '6.25vw'
      }
    },
    {
      label: t('prepro.operatorName'),
      width: '7.25vw',
      value: computed(() => curRow.value.operatorName),
      style: {
        color: fontColor,
        width: '6.25vw'
      }
    },
    {
      label: '',
      lineStyle: {
        width: '100%',
        margin: '.83vw 0 2.03vw 0',
        border: 'solid 1px rgba(255, 255, 255, 0.31)'
      }
    }
  ])
  const rules = {}
  watchEffect(() => {
    if (cfg.value && Reflect.ownKeys(cfg.value).length) {
      convertToEditForm(cfg.value, arr, channelList, ncAdapterChannel, t)
      convertToShowForm(cfg.value, curRow, arr1, channelList, t)
      generateRule(cfg.value, rules, aliasNameList, t)
    }
  })
  const formData = reactive({
    id: 'preprocessForm',
    inline: true,
    labelSuffix: ':',
    arr: computed(() => (editType.includes(type.value) ? arr : arr1))
  })
  return {
    formData,
    rules
  }
}
