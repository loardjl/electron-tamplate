<template>
  <div class="lock-screen-wrap" v-show="showLockScreen">
    <div class="lock-screen">
      <!-- <div class="logo"></div> -->
      <div class="form-wrap">
        <div>密码：</div>
        <el-input
          v-model="inputVal"
          type="password"
          class="input-wrap"
          @keyup.enter="handleSubmit"
        ></el-input>
        <el-button type="primary" @click="handleSubmit" class="btn">下一步</el-button>
      </div>
    </div>
  </div>
  <div class="mask-once" v-show="showLockMask" @click="hideLockMaskFn"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLockScreenStore } from '@renderer/store/useLockScreen'
import { useSysStore } from '@renderer/store/useSys'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
const inputVal = ref()
const useLockScreen = useLockScreenStore()
const useSys = useSysStore()
const { showLockMask, showLockScreen } = storeToRefs(useLockScreen)
// const { rules } = storeToRefs(useSys)
const showLock = () => {
  useLockScreen.setShowLockScreen(true)
}
const hideLock = () => {
  useLockScreen.setShowLockScreen(false)
}
const showLockMaskFn = () => {
  useLockScreen.setShowLockMask(true)
}
const hideLockMaskFn = () => {
  useLockScreen.setShowLockMask(false)
  showLock()
}
const { ipcRenderer } = require('electron')
const handleSubmit = () => {
  ipcRenderer
    .invoke('reload', {
      type: 1,
      password: inputVal.value,
      rules: ['1']
    })
    .then(res => {
      sessionStorage.setItem('lock', '1')
      if (res.status) {
        inputVal.value = ''
        hideLock()
      } else {
        ElMessage.error(`密码错误，请重试`)
      }
    })
}
defineExpose({
  showLockMaskFn,
  showLock,
  hideLock
})
</script>

<style lang="scss" scoped>
.lock-screen-wrap,
.mask-once {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 99;
}
.lock-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  width: 600px;
  height: 360px;
  padding-bottom: 60px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  color: #fff;
  background: url('@renderer/assets/images/setBack.png') center/100% 100% no-repeat;

  .logo {
    padding: 43px;
    height: 43px;
    width: 280px;
    background: url('@renderer/assets/images/logo.svg') center/100% 100% no-repeat;
  }
  .form-wrap {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    .input-wrap {
      width: 300px;
    }
    .btn {
      margin-left: 10px;
    }
  }
}
</style>
