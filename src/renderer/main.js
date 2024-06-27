/*
 * @Author: chunlaizhang chunlai.zhang@ujoin-tech.com
 * @Date: 2024-06-03 16:50:56
 * @LastEditors: chunlaizhang
 * @LastEditTime: 2024-06-04 17:09:32
 * @FilePath: \kws\src\renderer\main.js
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './styles/index.scss'
import './permission'
import App from './App.vue'
import router from './router'
import { errorHandler } from './error'
import * as echarts from 'echarts'
import TitleBar from './components/common/TitleBar.vue'
import { localforage } from '@renderer/common/database'
import myInputDireactive from './direactive/myInput'
import myInput from '@renderer/components/common/myInput/index.vue'
import elPopover from '@renderer/components/common/popover/index.vue'
import elDialog from '@renderer/components/common/dialog/index.vue'
import elDrawer from '@renderer/components/common/drawer/index.vue'
import popMenu from '@renderer/components/common/popMenu/index.vue'
import popMenuItem from '@renderer/components/common/popMenu/popMenuItem.vue'
import popMenuList from '@renderer/components/common/popMenu/popMenuList.vue'
import ClickOutside from 'element-plus/es/directives/click-outside/index.mjs'
import MessageBox from '@renderer/components/common/messgeBox/index'
import alertMsg from '@renderer/components/common/alertMsg/index'
import { i18n } from './i18n'
import filter from '@renderer/utils/filter'
import zRenderEnv from 'zrender/lib/core/env'
zRenderEnv.touchEventsSupported = true
zRenderEnv.pointerEventsSupported = false
const app = createApp(App)

const worker = new Worker(new URL('./worker/monitor.js', import.meta.url), {
  type: 'module'
})
const filters = {}
Object.keys(filter).forEach(function (key) {
  filters[key] = filter[key]
})
app.config.globalProperties.$filters = {
  ...filters
}
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(ElementPlus)
app.use(router)
app.use(pinia)
app.use(i18n)
errorHandler(app)
app.provide('echarts', echarts)
app.provide('Plotly', window.Plotly) // plotly.js组件引入使用
app.provide('_localforage', localforage)
app.provide('_worker', worker)
app.directive('myInput', myInputDireactive.myInput)
app.directive('Clickoutside', ClickOutside)

// 全局引入 TitleBar 组件
app.component('TitleBar', TitleBar)
app.component('myInput', myInput)
app.component('elPopover1', elPopover)
app.component('elDialog1', elDialog)
app.component('elDrawer1', elDrawer)
app.component('popMenu', popMenu)
app.component('popMenuItem', popMenuItem)
app.component('popMenuList', popMenuList)

app.config.globalProperties.$confirm1 = MessageBox.confirm
app.config.globalProperties.$alertMsg = alertMsg

app.mount('#app')
