<template>
  <div class="detection-left">
    <div class="top-tool">
      <span class="item">
        <span class="label">检测机床:</span>
        <el-cascader :options="machineGroup" v-model="machine" :props="{ checkStrictly: false }">
        </el-cascader>
      </span>
      <span class="item">
        <span class="label">检测模版:</span>
        <el-select v-model="detectionTemp">
          <el-option
            v-for="item in tempList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </span>
      <el-divider direction="horizontal" content-position="center" class="divider"></el-divider>
    </div>
    <myContaner title="当前检测内容" class="content">
      <div class="content-warp">
        <div class="form-warp">
          <myForm :form-data="formData" :rules="rules" ref="contentFormRef"></myForm>
        </div>
        <div class="content-tip">
          <span>检测要求:</span>
          <p>1、需要检查数据长度达到15s以上；</p>
          <p>2、需要达到固定稳定转速后开始检测。</p>
        </div>
      </div>
    </myContaner>
    <div class="footer">
      <div class="start" :class="canDoCheck ? '' : 'disabled'" @click="doAction">
        <span>
          <img src="@renderer/assets/icons/svg/detection/start.svg" v-show="!isStartCheck" />
          <img src="@renderer/assets/icons/svg/detection/pause.svg" v-show="isStartCheck" />
        </span>
        <span>{{ speedTime }}</span>
      </div>
      <div class="clear" :class="!timer ? 'disabled' : ''" @click="doClear">
        <span>
          <img src="@renderer/assets/icons/svg/detection/clear.svg" />
        </span>
        <span>取消</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import myContaner from '@renderer/components/common/myContaner.vue'
import myForm from '@renderer/components/common/myForm.vue'
import { useContentForm } from './combinable/useContentForm'
let timer = null
onMounted(() => {
  machineGroup.value = [
    {
      value: '1',
      label: '机床组',
      children: [
        {
          value: '1',
          label: '机床1'
        }
      ]
    }
  ]
  tempList.value = [
    {
      value: '1',
      label: '模版1'
    }
  ]
})
// 检测机床选项
const machine = ref([])
const machineGroup = ref([])
const detectionTemp = ref('')
const tempList = ref([])
// 当前检测内容
const contentFields = ref([
  {
    code: 'rpm',
    id: 0,
    name: '检测转速',
    codeType: 'string',
    samplingType: 0,
    travelConfig: 'string',
    type: 0
  }
])
const { formData, rules } = useContentForm(contentFields)
const contentFormRef = ref(null)

// 检测操作
const speedTime = ref('00:00')
const isStartCheck = ref(false)
const canDoCheck = computed(() => {
  if (!contentFormRef.value) {
    return false
  }
  const hasContent = Object.values(contentFormRef.value.searchForm).every(value => {
    return value !== ''
  })
  return machine.value.length && detectionTemp.value && hasContent
})
let nowDate = new Date().getTime()
const startLoop = () => {
  timer = requestAnimationFrame(startLoop)
  const curTime = new Date().getTime()
  if (curTime - nowDate < 1000) {
    return
  }
  nowDate = curTime
  const time = speedTime.value.split(':')
  let min = parseInt(time[0])
  let sec = parseInt(time[1])
  if (sec < 59) {
    min = min.toString().padStart(2, 0)
    sec = (sec + 1).toString().padStart(2, 0)
    speedTime.value = `${min}:${sec}`
  } else {
    min = (min + 1).toString().padStart(2, 0)
    speedTime.value = `${min}:00`
  }
}
const doAction = () => {
  if (!isStartCheck.value) {
    startLoop()
  } else {
    cancelAnimationFrame(timer)
  }
  isStartCheck.value = !isStartCheck.value
}
const doClear = () => {
  cancelAnimationFrame(timer)
  timer = null
  isStartCheck.value = false
  speedTime.value = '00:00'
}
</script>

<style lang="scss" scoped>
.detection-left {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  .top-tool {
    display: flex;
    flex-direction: column;
    gap: 16px;
    .item {
      display: flex;
      align-items: center;
      gap: 16px;
      .label {
        color: #fff;
        font-size: 22px;
        flex-shrink: 0;
      }
    }
    .divider {
      opacity: 0.4;
      margin: 8px 0 24px 0;
    }
  }
  .content {
    flex: 1;
    flex-shrink: 0;
    .content-warp {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      .form-warp {
        height: 350px;
        overflow-y: auto;
        margin-left: 12px;
        &::-webkit-scrollbar {
          display: none;
        }
        :deep(.UJ-form-item) {
          margin-right: 0;
        }
      }
      .content-tip {
        height: 153px;
        margin-top: auto;
        letter-spacing: 1px;
        padding: 14px 24px;
        border-radius: 16px;
        font-size: 18px;
        color: rgb(179, 179, 179);
        background-color: rgb(43, 45, 56);
        p {
          margin: 0;
        }
      }
    }
  }
  .footer {
    display: flex;
    justify-content: space-between;
    %baseBtn {
      font-size: 24px;
      color: #fff;
      padding: 20px 24px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      background: rgb(43, 45, 56);
      vertical-align: middle;
    }
    .start {
      min-width: 206px;
      @extend %baseBtn;
      img {
        width: 52px;
        height: 52px;
      }
      &.disabled {
        color: rgb(129, 137, 146);
        pointer-events: none;
        img {
          filter: grayscale(0.8);
        }
      }
    }
    .clear {
      @extend %baseBtn;
      img {
        width: 34px;
        height: 34px;
        filter: brightness(2);
      }
      &.disabled {
        color: rgb(129, 137, 146);
        pointer-events: none;
        img {
          filter: brightness(1);
        }
      }
    }
  }
}
</style>
