<template>
  <div v-if="menu.children?.length && (menu.meta.show ?? true)" class="sub-main">
    <i :class="menu.meta.icon" v-if="isPickUp"></i>
    <div class="menu-content">
      <el-sub-menu :index="menu.path">
        <template #title>
          <div class="sub-content">
            <i :class="menu.meta.icon" v-if="!isPickUp"></i>
            <span class="sub-title">
              {{ t(menu.meta.title) }}
            </span>
          </div>
        </template>
        <menuItem v-for="item in menu.children" :key="item.path" :menu="item"></menuItem>
      </el-sub-menu>
    </div>
  </div>
  <el-menu-item :index="menu.path" v-else-if="menu.meta.show ?? true" @click="handleClick(menu)">
    <i :class="menu.meta.icon"></i>
    <template #title>
      <div class="menu-content">
        <span class="menu-title">
          {{ t(menu.meta.title) }}
        </span>
      </div>
    </template>
  </el-menu-item>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useLayoutStore } from '@renderer/store/useLayout'
import { storeToRefs } from 'pinia'
defineProps({
  menu: {
    type: Object,
    default: () => {}
  }
})
const { t } = useI18n()
const router = useRouter()
const { isPickUp } = storeToRefs(useLayoutStore())

const arrowShow = computed(() => {
  return isPickUp.value ? 'none' : ''
})
const subItemWidth = computed(() => {
  return isPickUp.value ? '100%' : '9.38vw'
})

const handleClick = menu => {
  if (menu.path) {
    router.push(menu.path)
  }
}
</script>

<style lang="scss" scoped>
.sub-main {
  margin-bottom: 25px;
  position: relative;
  i:before {
    width: 40px;
    height: 40px;
    position: absolute;
    left: 15%;
    top: 15%;
    z-index: 1;
  }
  .menu-content {
    font-size: 22px;
    :deep(.UJ-menu-item) {
      padding: 6px 0;
    }
    :deep(.UJ-menu) {
      transform: translateY(12.5px);
    }
  }
}
.UJ-menu-item {
  position: relative;
  i:before {
    width: 40px;
    height: 40px;
    position: absolute;
    left: 15%;
    top: 15%;
    z-index: 1;
  }
}
.menu-content {
  width: 100%;
  position: relative;
  font-size: 22px;
  i:before {
    width: 40px;
    height: 40px;
    position: absolute;
    left: 10%;
    top: 15%;
  }
  :deep(.menu-title) {
    padding-inline-start: 25px;
    width: 150px;
    display: inline-block;
    text-align: start;
  }
  :deep(.UJ-sub-menu) {
    background-color: rgb(59, 61, 76);
    width: 100%;
    .UJ-sub-menu__icon-arrow {
      font-size: 18px;
      margin-top: -0.45em;
      display: v-bind('arrowShow');
    }
    .UJ-sub-menu__title {
      height: 64px;
      color: #fff;
      display: flex;
      align-items: center;
      &:hover {
        background: linear-gradient(180deg, rgba(65, 180, 207, 0.4), rgba(65, 180, 207, 0.1) 100%);
      }
      .sub-content {
        width: 100%;
        position: relative;
        z-index: 2;
        i:before {
          width: 40px;
          height: 40px;
          position: absolute;
          left: 11%;
          top: 15%;
        }
      }
      .sub-title {
        padding-inline-start: 52px;
        width: v-bind('subItemWidth');
        display: inline-block;
        text-align: start;
      }
    }
    ul {
      background-color: rgb(59, 61, 76);
      width: 100%;
      &.is-active {
        background: linear-gradient(180deg, rgba(65, 180, 207, 0.4), rgba(65, 180, 207, 0.1) 100%);
        border-right: solid 1px rgb(65, 180, 207);
      }
    }
  }
}
</style>
