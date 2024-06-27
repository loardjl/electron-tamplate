/*
 * @Author: chunlaizhang chunlai.zhang@ujoin-tech.com
 * @Date: 2024-06-04 09:30:54
 * @LastEditors: chunlaizhang
 * @LastEditTime: 2024-06-04 16:24:13
 * @FilePath: \kws\src\renderer\components\common\messgeBox\index.jsx
 */
import { h, createApp } from 'vue'
import { ElButton } from 'element-plus'
import myDialog from '@renderer/components/common/dialog/index.vue'
import { _public } from '@renderer/utils/common'
import myContaner from '../myContaner.vue'
const btnType = {
  primary: 'primary',
  success: 'primary',
  warning: 'primary',
  error: 'danger'
}
const MessageBox = {
  confirm: (content, title = '提示', options = {}) => {
    return new Promise((resolve, reject) => {
      const div = document.createElement('div')
      document.body.appendChild(div)
      const app = createApp({
        render() {
          return h(
            myDialog,
            {
              modelValue: true,
              title,
              style: {
                width: `${_public.screenPx(600)}px`
              },
              [options.type]: options.type,
              'onUpdate:modelValue': val => {
                if (!val) {
                  app.unmount(div)
                  document.body.removeChild(div)
                  reject()
                }
              }
            },
            {
              default: () =>
                h(myContaner, () =>
                  h('p', {
                    style: {
                      fontSize: `${_public.screenPx(24)}px`,
                      color: '#fff'
                    },
                    innerHTML: content
                  })
                ),
              footer: () => {
                return h(
                  'div',
                  {
                    style: {
                      display: 'flex',
                      justifyContent: 'flex-end'
                    }
                  },
                  [
                    options.showCancelButton ?? true
                      ? h(
                          ElButton,
                          {
                            type: btnType[options.type],
                            plain: true,
                            style: {
                              fontSize: `${_public.screenPx(24)}px`
                            },
                            onClick: () => {
                              reject()
                              app.unmount(div)
                              document.body.removeChild(div)
                            }
                          },
                          () => options.cancelButtonText || '取消'
                        )
                      : null,
                    options.showConfirmButton ?? true
                      ? h(
                          ElButton,
                          {
                            type: btnType[options.type],
                            style: {
                              fontSize: `${_public.screenPx(24)}px`
                            },
                            onClick: () => {
                              resolve()
                              app.unmount(div)
                              document.body.removeChild(div)
                            }
                          },
                          () => options.confirmButtonText || '确定'
                        )
                      : null
                  ]
                )
              }
            }
          )
        }
      })
      app.mount(div)
    })
  }
}

export default MessageBox
