<template>
  <title-bar />
  <el-config-provider :locale="i18nt" namespace="UJ">
    <router-view v-slot="{ Component }">
      <div class="app">
        <keep-alive v-if="route.meta.KeepAlive">
          <component :is="Component" />
        </keep-alive>
        <component v-else :is="Component" />
      </div>
    </router-view>
  </el-config-provider>
</template>

<script setup>
import TitleBar from './components/common/TitleBar.vue'
import { computed, onMounted } from 'vue'
import { ElConfigProvider } from 'element-plus'
import { i18n } from './i18n'
import { useRoute } from 'vue-router'
import { useSignalController } from '@renderer/hooks/useSignalController'

const route = useRoute()
const i18nt = computed(() => i18n.global.messages.value[i18n.global.locale.value].el)

const { signal, _worker } = useSignalController()

_worker.addEventListener(
  'message',
  e => {
    const { type, payload } = e.data
    if (type === 'getTokenRes') {
      sessionStorage.setItem('token', payload.token)
    }
    if (type === 'dcStatus') {
      // 数据中心服务连接状态推送
      if (payload.status === 1) {
        // 已连接
        _worker.postMessage({
          type: 'getToken',
          payload: {}
        })
      } else if (payload.status === 2) {
        // 断连
        sessionStorage.setItem('token', '')
      }
    }
  },
  { signal }
)

window.addEventListener(
  'keydown',
  e => {
    if (e.key === 'F5') {
      e.preventDefault()
      return
    }
  },
  { signal }
)

onMounted(() => {
  getDcStatus()
})
const getDcStatus = () => {
  // 数据中心服务连接状态推送
  _worker.postMessage({
    type: 'getDcStatus',
    payload: {}
  })
}
</script>

<style lang="scss">
.app {
  height: 100vh;
  overflow: hidden;
}
</style>
