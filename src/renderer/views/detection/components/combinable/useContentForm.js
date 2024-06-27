import { reactive, watchEffect } from 'vue'

const typeEnum = {
  string: 'input',
  number: 'input',
  boolean: 'switch',
  enum: 'select',
  list: 'select'
}

/**
 * @description 检测内容表单
 */
export const useContentForm = cfg => {
  const arr = reactive([])
  const rules = {}
  const formData = reactive({
    id: 'checkForm',
    inline: true,
    labelSuffix: ':',
    labelPosition: 'top',
    arr
  })
  const convertFormData = (cfg, arr) => {
    arr.splice(0)
    cfg.forEach(c => {
      const { name, code } = c
      const item = {
        key: code,
        label: name,
        type: typeEnum[c.codeType],
        inputWidth: '100%'
      }
      arr.push(item)
    })
  }
  const generateRule = (cfg, rules) => {
    cfg.forEach(c => {
      const { code, name } = c
      rules[code] = [
        {
          validator: (rule, value, callback) => {
            if (value === '') {
              callback(new Error('请输入' + name))
            } else {
              callback()
            }
          },
          trigger: ['blur', 'change']
        },
        { required: true, message: '请输入' + name, trigger: 'blur' }
      ]
    })
  }
  watchEffect(() => {
    if (cfg.value && Reflect.ownKeys(cfg.value).length) {
      convertFormData(cfg.value, arr)
      generateRule(cfg.value, rules)
    }
  })
  return {
    formData,
    rules
  }
}
