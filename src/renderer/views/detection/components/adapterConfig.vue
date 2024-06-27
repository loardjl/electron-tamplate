<template>
  <div class="detection-right h-100" v-if="isConfig">
    <div class="header">
      <label>传感器配置</label>
      <el-button type="primary" @click="preview" plain>预览数据</el-button>
    </div>
    <div class="view">
      <div class="sensor-list">
        <label>传感器列表</label>
        <div class="tabs">
          <myTabs v-model="category" :tab-list="categoryList" @change="categoryChange"></myTabs>
        </div>
        <div class="search-list">
          <div
            class="item"
            :class="selectedSensor === item ? 'active' : ''"
            v-for="item in sensorList"
            :key="item.value"
            @click="handleSelectSensor(item)"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
      <div class="sensor-content">
        <div class="sensor-view">
          <div class="axis-warp">
            <label>{{ selectedSensor.label }}</label>
            <div class="axis">
              <img class="x" src="@renderer/assets/icons/svg/detection/xAxis.svg" alt="" />
              <img class="y" src="@renderer/assets/icons/svg/detection/yAxis.svg" alt="" />
              <img class="z" src="@renderer/assets/icons/svg/detection/zAxis.svg" alt="" />
            </div>
          </div>
          <div class="machine">
            <canvas id="machine" class="img"></canvas>
          </div>
        </div>
        <div class="sensor-tool">
          <div class="tab" :class="!tabEnable ? 'disabled' : ''" @click="poseChange">
            <span>
              <img src="@renderer/assets/icons/svg/detection/tab.svg" />
            </span>
            <span>切 换</span>
          </div>
          <div class="save" :class="!saveEnable ? 'disabled' : ''" @click="save">
            <span>
              <img src="@renderer/assets/icons/svg/detection/save.svg" />
            </span>
            <span>保 存</span>
          </div>
          <div class="delete" :class="!deleteEnable ? 'disabled' : ''" @click="clear">
            <span>
              <img src="@renderer/assets/icons/svg/detection/delete.svg" />
            </span>
            <span>移 除</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="detection-right" v-else>
    <div class="preview-list">
      <myContaner class="preview-list-item" v-for="item in 3" :key="item">
        <div class="list-item-title">USV-{{ item }}</div>
        <el-tabs
          v-model="selectedParam[item]"
          class="list-sensor-tabs"
          tab-position="top"
          @tab-click="tabChange"
        >
          <el-tab-pane
            v-for="item in paramTabList"
            :key="item.value"
            :label="item.label"
            :name="item.value"
          >
          </el-tab-pane>
        </el-tabs>
        <LineChart
          :data="{
            id: 'USV-' + item,
            name: 'USV-' + item,
            chartList: usv_1_list
          }"
        >
        </LineChart>
      </myContaner>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import myTabs from '@renderer/components/common/myTabs/index.vue'
import { useSysStore } from '@renderer/store/useSys'
import { storeToRefs } from 'pinia'
import machine_tmp from '@renderer/assets/icons/svg/detection/machine_tamp.svg'
import axis from '@renderer/assets/icons/svg/detection/axis.svg'
import point from '@renderer/assets/icons/svg/detection/point.svg'
import disabledPoint from '@renderer/assets/icons/svg/detection/disabled_point.svg'
import { _public } from '@renderer/utils/common'
import { useDrawMachine } from './combinable/useDrawMachine.js'
import myContaner from '@renderer/components/common/myContaner.vue'
import LineChart from './lineChart.vue'

const { adapterList } = storeToRefs(useSysStore())
const axisImg = new Image()
const ponitImg = new Image()
const disabledPointImg = new Image()
const img = new Image()

const isConfig = ref(true)
const usv_1_list = ref([])
const selectedParam = ref({
  1: 1,
  2: 1,
  3: 1
})
const paramTabList = ref([
  {
    label: 'x轴',
    value: 1
  },
  {
    label: 'y轴',
    value: 2
  },
  {
    label: 'z轴',
    value: 3
  }
])

onMounted(() => {
  categoryChange(categoryList.value[0].value)
  axisImg.src = axis
  ponitImg.src = point
  img.src = machine_tmp
  disabledPointImg.src = disabledPoint
  drewMachine()
})

const preview = () => {
  isConfig.value = false
}
const categoryList = ref([
  {
    label: 'USV',
    value: 'USV'
  },
  {
    label: 'USP',
    value: 'USP'
  }
])
const category = ref('')
const categoryChange = val => {
  category.value = val
  selectedSensor.value = ''
  getSensorList(val)
}
// 传感器列表
const sensorList = ref([])
// 根据传感器类型获取传感器列表
const getSensorList = val => {
  sensorList.value = adapterList.value
    .filter(item => item.collector_type_name === val)
    .map(item => {
      return {
        label: item.name,
        value: item.id
      }
    })
}
const selectedSensor = ref('')
// 当前模板需要几个传感器
const axisSensorList = ref([
  {
    x: _public.screenPx(178),
    y: _public.screenPx(329)
  },
  {
    x: _public.screenPx(312),
    y: _public.screenPx(171)
  }
])
// 选择传感器
const handleSelectSensor = item => {
  selectedSensor.value = item
  axisSensorList.value.find(item => item.checked).label = item.label
  drewMachine()
}
// 机床模型
// 姿态相关操作
const tabEnable = computed(() => {
  return selectedSensor.value
})
const saveEnable = ref(false)
const deleteEnable = computed(() => {
  return selectedSensor.value
})
// 切换姿态
const curPose = ref(1)
const poseList = [
  {
    code: 1, // 姿态
    pose: [0, 0, 0], // 旋转角度
    translate: [0, 0] // 平移距离
  },
  {
    code: 2,
    pose: [-225, 45, 0],
    translate: [45, -45]
  },
  {
    code: 3,
    pose: [-270, 45, -135],
    translate: [45, -65]
  },
  {
    code: 4,
    pose: [-270, 0, -270],
    translate: [0, -65]
  },
  {
    code: 5,
    pose: [0, -45, -135],
    translate: [45, -45]
  },
  {
    code: 6,
    pose: [-45, -45, -270],
    translate: [0, 0]
  }
]
const pose = computed(() => {
  return poseList.find(item => item.code === curPose.value)
})
const xDeg = computed(() => `${pose.value.pose[0]}deg`)
const yDeg = computed(() => `${pose.value.pose[1]}deg`)
const zDeg = computed(() => `${pose.value.pose[2]}deg`)
const xt = computed(() => `${pose.value.translate[0]}px`)
const yt = computed(() => `${pose.value.translate[1]}px`)
const poseChange = () => {
  if (curPose.value === 6) {
    curPose.value = 1
  } else {
    curPose.value++
  }
}
const { drewMachine } = useDrawMachine(
  axisSensorList,
  selectedSensor,
  img,
  ponitImg,
  disabledPointImg,
  axisImg
)
// 保存
const save = () => {
  console.log('save')
}
// 移除
const clear = () => {
  console.log('clear')
}
</script>

<style lang="scss" scoped>
.detection-right {
  // height: 100%;
  overflow: hidden;
  &.h-100 {
    height: 100%;
  }
  .header {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    label {
      font-size: 22px;
      color: #fff;
    }
  }
  .view {
    height: calc(100% - 72px);
    display: grid;
    grid-template-columns: 206px 1fr;
    gap: 16px;
    %common {
      padding: 24px;
      border-radius: 16px;
      background-color: rgb(50, 52, 66);
    }
    .sensor-list {
      @extend %common;
      height: 100%;
      display: flex;
      flex-direction: column;
      label {
        font-size: 22px;
        color: #fff;
      }
      .tabs {
        margin: 16px 0 24px 0;
      }
      .search-list {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow-y: auto;
        width: 100%;
        .item {
          min-height: 61px;
          width: 100%;
          border: 1px solid rgb(129, 137, 146);
          border-radius: 6px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          font-size: 22px;
          color: #fff;
          cursor: pointer;
          &:not(:first-child) {
            margin-top: 24px;
          }
        }
        .active {
          border: 1px solid rgb(65, 180, 207);
          color: rgb(65, 180, 207);
        }
      }
    }
    .sensor-content {
      height: 100%;
      display: grid;
      grid-template-rows: 1fr 100px;
      gap: 16px;
      .sensor-view {
        @extend %common;
        display: flex;
        .axis-warp {
          width: 100px;
          display: flex;
          flex-direction: column;
          position: relative;
          label {
            height: max-content;
            font-size: 28px;
            color: #fff;
          }
          .axis {
            --x: v-bind(xDeg);
            --y: v-bind(yDeg);
            --z: v-bind(zDeg);
            --xt: v-bind(xt);
            --yt: v-bind(yt);
            margin-top: auto;
            transform-style: preserve-3d;
            perspective: 500px;
            transform: translate(var(--xt), var(--yt));
            .x {
              width: 90px;
              height: 32px;
              position: absolute;
              bottom: 0;
              transform-origin: left center;
              transform: translate3d(15px, 15px, 0px) rotate3d(0, 0, 1, var(--x));
              transition: all 0.3s;
            }
            .y {
              width: 56px;
              height: 56px;
              position: absolute;
              bottom: 0;
              transform-origin: bottom left;
              transform: translate3d(15px, 0px, 0px) rotate3d(0, 0, 1, var(--y));
              transition: all 0.3s;
            }
            .z {
              width: 32px;
              height: 90px;
              position: absolute;
              bottom: 0;
              transform-origin: center bottom;
              transform: translate3d(0px, 0px, 0px) rotate3d(0, 0, 1, var(--z));
              transition: all 0.3s;
            }
          }
        }
        .machine {
          height: 100%;
          flex: 1;
          text-align: center;
          .img {
            width: 571px;
            height: 600px;
          }
        }
      }
      %baseBtn {
        min-width: 261px;
        font-size: 24px;
        color: rgb(65, 180, 207);
        padding: 20px 24px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        cursor: pointer;
        background: rgb(43, 45, 56);
        vertical-align: middle;
        &.disabled {
          color: rgb(102, 102, 102);
          pointer-events: none;
          img {
            filter: grayscale(1);
            opacity: 0.5;
          }
        }
      }
      .sensor-tool {
        display: flex;
        justify-content: space-between;
        .tab {
          @extend %baseBtn;
          img {
            width: 56px;
            height: 56px;
          }
        }
        .save {
          @extend %baseBtn;
          img {
            width: 52px;
            height: 52px;
          }
        }
        .delete {
          @extend %baseBtn;
          img {
            width: 52px;
            height: 52px;
          }
        }
      }
    }
  }
  .preview-list {
    .preview-list-item {
      margin-bottom: 20px;
      .list-item-title {
        color: #fff;
        font-size: 24px;
        font-weight: 500;
        margin-bottom: 24px;
      }
    }
  }
}
</style>
