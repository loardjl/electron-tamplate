<template>
  <div class="window-title" v-if="!IsUseSysTitle && isNotMac && !IsWeb">
    <!-- 菜单栏位置 -->
    <div></div>
    <!-- 中间标题位置 -->
    <div style="-webkit-app-region: drag" class="title"></div>
    <div class="controls-container"></div>
  </div>
  <div v-else-if="!IsUseSysTitle && !isNotMac" class="window-title"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const IsUseSysTitle = ref(false)
const isNotMac = ref(process.platform !== 'darwin')
const IsWeb = ref(process.env.BUILD_TARGET)
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.window-title {
  width: 100%;
  height: 24px;
  line-height: 24px;
  background-color: transparent;
  display: flex;
  -webkit-app-region: drag;
  position: fixed;
  top: 0;
  z-index: 99999;
  .icon-logo {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
  .title {
    text-align: center;
  }
  .logo {
    margin-left: 20px;
  }
  .controls-container {
    display: flex;
    flex-grow: 0;
    flex-shrink: 0;
    text-align: center;
    position: relative;
    z-index: 3000;
    -webkit-app-region: no-drag;
    height: 100%;
    width: 138px;
    margin-left: auto;
    .windows-icon-bg {
      display: inline-block;
      -webkit-app-region: no-drag;
      height: 100%;
      width: 33.34%;
      color: rgba(129, 129, 129, 0.6);
      .icon-size {
        width: 12px;
        height: 15px;
        vertical-align: -0.15em;
        fill: currentColor;
        overflow: hidden;
      }
    }
    .windows-icon-bg:hover {
      background-color: rgba(182, 182, 182, 0.2);
      color: #333;
    }
    .close-icon:hover {
      background-color: rgba(232, 17, 35, 0.9);
      color: #fff;
    }
    .lang {
      display: inline-block;
      -webkit-app-region: no-drag;
      height: 100%;
      width: 100px;
      font-size: 18px;
      vertical-align: middle;
      color: rgba(129, 129, 129, 0.6);
      cursor: pointer;
    }
    .logoPic {
      width: 212px;
      height: 86px;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
