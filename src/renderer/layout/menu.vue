<template>
  <div class="nav-menu" v-cloak>
    <img :src="imgBase64" alt="" class="logo" v-if="showLogo && !isPickUp" />
    <div class="nav-menu-content">
      <div class="nav-packup">
        <img
          src="@renderer/assets/icons/svg/menu/pack_up.svg"
          :class="isPickUp ? 'pick-up' : ''"
          @click="pickUp"
        />
      </div>
      <el-menu :default-active="activeMenu" unique-opened :collapse="isPickUp">
        <template v-for="menu in routes" :key="menu.path">
          <menuItem :menu="menu"></menuItem>
        </template>
      </el-menu>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { router } from '@renderer/router/loadRouter'
import menuItem from './menuItem.vue'
import { useSysStore } from '@renderer/store/useSys'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { _public } from '@renderer/utils/common'
import { useLayoutStore } from '@renderer/store/useLayout'

const routes = ref([])
const route = useRoute()
const activeMenu = computed(() => (route.meta.activeMenu ? route.meta.activeMenu : route.path))
const imgBase64 = ref('')
const store = useSysStore()
const layoutStore = useLayoutStore()
const { showLogo } = storeToRefs(store)
const { isPickUp } = storeToRefs(layoutStore)
const languag = ref('zh-cn')

onMounted(() => {
  router.sort((a, b) => {
    return a.meta.order - b.meta.order
  })
  routes.value = JSON.parse(JSON.stringify([...router]))
  process.env.NODE_ENV === 'development' ? getLogo() : getRealLogo()
})

const { ipcRenderer } = require('electron')
const getLogo = async () => {
  imgBase64.value = await _public.imageToBase64(getImageUrl())
  ipcRenderer.invoke('setLogo', imgBase64.value.split(',')[1])
}
const getImageUrl = () => {
  const cnHref = new URL('../assets/images/png/logo/logo.png', import.meta.url).href
  const enHref = new URL('../assets/images/png/logo/logo_en.png', import.meta.url).href
  return languag.value === 'zh-cn' ? cnHref : enHref
}
const getRealLogo = async change => {
  const res = await ipcRenderer.invoke('getLogo')
  if (res.status && !change) {
    imgBase64.value = `data:image/png;base64,${res.data}`
  } else {
    imgBase64.value = await _public.imageToBase64(getImageUrl())
    ipcRenderer.invoke('setRealLogo', imgBase64.value.split(',')[1])
  }
}
const navWidth = computed(() => {
  return isPickUp.value ? '60px' : '100%'
})
const pickUp = () => {
  isPickUp.value = !isPickUp.value
}
const navContentOp = ref(0)
watch(
  () => isPickUp.value,
  () => {
    navContentOp.value = 0
    setTimeout(() => {
      navContentOp.value = 1
    }, 400)
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.nav-menu {
  --mt: 32px;
  --b: 87px;
  --lh: 90px;
  position: relative;
  padding: 24px 0;
  background-color: $base-bg-color-light;
  width: v-bind('navWidth');
  height: 100%;
  text-align: center;
  transition: all 0.3s;
  .line {
    height: 1px;
    width: 80%;
    margin: 18px 0 0 20px;
    background: linear-gradient(
      90deg,
      rgba(224, 225, 226, 0),
      rgb(224, 225, 226) 50%,
      rgba(224, 225, 226, 0.16)
    );
  }
  .logo {
    height: var(--lh);
  }
  .nav-menu-content {
    margin-block-start: var(--mt);
    height: calc(100% - var(--lh) - var(--mt));
    overflow: auto;
    opacity: v-bind('navContentOp');
    transition: opacity 0.3s;
    &::-webkit-scrollbar {
      display: none;
    }
    .nav-packup {
      display: flex;
      padding: 6px 15%;
      img {
        width: 40px;
        height: 40px;
        transition: all 0.3s ease-in-out;
        cursor: pointer;
        &.pick-up {
          transform: rotateY(180deg);
        }
      }
    }
    ul {
      background-color: $base-bg-color-light;
      width: 100%;
      height: 64px;
      :deep(.UJ-menu-item) {
        height: 100%;
        color: #fff;
        margin-block-end: 25px;
        &:hover,
        &.is-active {
          border-right: solid 1px $border-color;
          background: linear-gradient(180deg, $bg-color, $bg-color-l1 100%);
        }
      }
    }
  }
}
.nav-swatich__content {
  border-radius: 20px;
  background: rgb(26, 29, 44);
  box-shadow: 0px 18px 30px rgba(112, 144, 176, 0.12);
  height: 90px;
  line-height: 90px;
  font-size: 24px;
  font-weight: 400;
}
</style>
<style lang="scss">
.UJ-menu--popup {
  .UJ-menu-item {
    height: 100%;
    color: #fff;
    margin-block-end: 15px;
    &:hover,
    &.is-active {
      border-right: solid 1px $border-color;
      background: linear-gradient(180deg, $bg-color, $bg-color-l1 100%);
    }
  }
}
</style>
