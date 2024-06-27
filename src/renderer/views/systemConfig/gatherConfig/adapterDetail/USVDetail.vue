<!--
 * @Author: 何志祥
 * @Date: 2023-08-28 14:34:43
 * @LastEditors: 何志祥
 * @LastEditTime: 2023-11-03 11:03:53
 * @Description: 
-->
<template>
  <div class="afr-detail-wrap">
    <headerDetail ref="refHeaderDetail" @getDetail="getDetail" type="USV"></headerDetail>
    <baseContaner v-if="refHeaderDetail?.detailData.connect_status">
      <div class="title">{{ t('collector.realTimeData') }}</div>
      <div class="content-wrap mt40" v-if="refHeaderDetail?.detailData.hardware_id === 851">
        <div class="des">{{ t('collector.DOOutput') }}</div>
        <div class="con1">
          <div class="con-check-item">
            <div class="mr20">DO: <el-input disabled v-model="DoValue"></el-input></div>
          </div>
        </div>
      </div>
      <lineChart
        :data="{
          id: 'afr-line-chat2',
          name: 'usv-x',
          chartList: usv_x_chartList
        }"
      >
      </lineChart>
      <lineChart
        :data="{
          id: 'afr-line-chat3',
          name: 'usv-y',
          chartList: usv_y_chartList
        }"
      >
      </lineChart>
      <lineChart
        :data="{
          id: 'afr-line-chat4',
          name: 'usv-z',
          chartList: usv_z_chartList
        }"
      >
      </lineChart>
    </baseContaner>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject } from 'vue'
import baseContaner from '@renderer/components/common/baseContaner.vue'
import lineChart from '../components/lineChart.vue'
import headerDetail from '../components/headerDetail.vue'
import { basicInterface } from '@renderer/api/system/system'
import { useRoute } from 'vue-router'
const route = useRoute()
const _worker = inject('_worker')
import { useSignalController } from '@renderer/hooks/useSignalController'
const { signal } = useSignalController()
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const refHeaderDetail = ref()

_worker.addEventListener(
  'message',
  res => {
    const { type, payload } = res.data
    const isUsv357 = refHeaderDetail.value?.detailData.hardware_id === 851
    switch (type) {
      // ------ 实时数据回调
      case 'realTimeCharData':
        doRealTimeCharData(payload, isUsv357)
        break
      // Do信号回调
      case 'receiveDoData':
        if (payload.property_name === 'do') {
          DoValue.value = payload.property_value
        }
        break
    }
  },
  { signal }
)

const doRealTimeCharData = (payload, isUsv357) => {
  // USV 有三个轴，需要三个图
  // 分别处理三个轴的数据
  if (
    payload[route.query.adapter_id]?.['300']?.length ||
    payload[route.query.adapter_id]?.['303']?.length
  ) {
    isUsv357 && usv_x_chartList.value.push(...payload[route.query.adapter_id]['300'])
    !isUsv357 && usv_x_chartList.value.push(...payload[route.query.adapter_id]['303'])
    usv_x_chartList.value = setChartList(usv_x_chartList.value)
  }
  if (
    payload[route.query.adapter_id]?.['301']?.length ||
    payload[route.query.adapter_id]?.['304']?.length
  ) {
    isUsv357 && usv_y_chartList.value.push(...payload[route.query.adapter_id]['301'])
    !isUsv357 && usv_y_chartList.value.push(...payload[route.query.adapter_id]['304'])

    usv_y_chartList.value = setChartList(usv_y_chartList.value)
  }
  if (
    payload[route.query.adapter_id]?.['302']?.length ||
    payload[route.query.adapter_id]?.['305']?.length
  ) {
    isUsv357 && usv_z_chartList.value.push(...payload[route.query.adapter_id]['302'])
    !isUsv357 && usv_z_chartList.value.push(...payload[route.query.adapter_id]['305'])

    usv_z_chartList.value = setChartList(usv_z_chartList.value)
  }
}
const setChartList = list => {
  // 只保留最近30s的数据
  let beginIndex = 0
  for (let i = list.length - 1; i >= 0; i--) {
    if ((list[i].timestamp - list[beginIndex].timestamp) / 1000 > 30) {
      list[beginIndex] = false
      beginIndex++
    } else {
      break
    }
  }
  return list.filter(Boolean)
}

let routerQuery = {} // onBeforeUnmount 获取不到参数，保存一份
onMounted(async () => {
  // 订阅 do 信号
  _worker.postMessage({
    type: 'cancelDoData',
    payload: {
      batch: true
    }
  })
  _worker.postMessage({
    type: 'subscribeDoData',
    payload: {
      dev_id: parseInt(route.query.dev_id),
      adapter_id: parseInt(route.query.adapter_id),
      property_name: ['do'],
      batch: true
    }
  })

  // 订阅实时数据
  getRealTime()

  routerQuery = route.query
})

// 详情数据
const detailData = ref({})
const getDetail = value => {
  detailData.value = value
}

// 获取动态信号
let timer = null
let DoValue = ref()

let usv_x_chartList = ref([])
let usv_y_chartList = ref([])
let usv_z_chartList = ref([])

// 准备订阅实时数据
const getRealTime = async () => {
  subscribeRealTime()
}

// 订阅实时数据
const subscribeRealTime = async () => {
  // ------------ 开始订阅数据
  await basicInterface({
    version: '1.0',
    method: 'subscribe_single_signal',
    id: '32',
    params: {
      dev_id: parseInt(route.query.dev_id),
      adapter_id: parseInt(route.query.adapter_id),
      sig_id_list: [],
      token: sessionStorage.getItem('token')
    }
  })
  _worker.postMessage({
    type: 'startPushChartData',
    payload: {}
  })
}

// 停止订阅实时数据
const unsubscribeRealTime = async () => {
  // 取消订阅实时数据
  await basicInterface({
    version: '1.0',
    method: 'unsubscribe_single_signal',
    id: '33',
    params: {
      dev_id: parseInt(routerQuery.dev_id),
      adapter_id: parseInt(routerQuery.adapter_id),
      token: sessionStorage.getItem('token')
    }
  })
  // 退订实时数据
  _worker.postMessage({
    type: 'stopPushChartData',
    payload: {}
  })
}
onBeforeUnmount(() => {
  clearInterval(timer)
  timer = null
  unsubscribeRealTime()

  _worker.postMessage({
    type: 'cancelDoData',
    payload: {
      batch: true
    }
  })
})
</script>

<style scoped lang="scss">
:deep(.UJ-drawer__body) {
  padding: 0;
}
:deep(.UJ-form-item__error) {
  font-size: 20px;
}

.afr-detail-wrap {
  .title {
    font-size: 24px;
    margin-bottom: 40px;
    color: white;
  }

  .operate-wrap {
    position: absolute;
    right: 30px;
    margin-top: -75px;

    img {
      margin-left: 20px;
      cursor: pointer;
      width: 50px;
    }
  }

  .content-wrap {
    background: rgb(26, 29, 44);
    border-radius: 15px;
    margin-top: 20px;
    padding: 50px 25px 10px 25px;

    .des {
      background-image: url('@renderer/assets/icons/svg/common/cardback.svg');
      background-repeat: no-repeat;
      background-size: 100% 100%;
      font-size: 22px;
      text-align: center;
      width: 130px;
      line-height: 39px;
      position: absolute;
      text-indent: -12px;
      margin-top: -65px;
      color: black;
    }

    .con {
      margin-bottom: 20px;

      :deep(.UJ-input) {
        width: 300px;
      }
      :deep(.UJ-input__wrapper) {
        background: transparent;
      }

      .con-header {
        display: flex;
        align-items: center;
        width: 100%;
        padding-bottom: 30px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.5);

        & > div {
          color: white;
          font-size: 22px;

          .gather-type {
            display: inline-block;
            background: rgba(42, 227, 4, 0.2);
            border-radius: 20px;
            color: rgb(42, 227, 4);
            padding: 3px 15px;
          }

          .link-type {
            color: rgb(42, 227, 4);
          }
          .link-status {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-left: 7px;
            background: rgb(42, 227, 4);
            position: relative;
            top: -1px;
          }
        }
      }

      .item-layout {
        margin-top: 30px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;

        :deep(.UJ-form-item__content) {
          font-size: 22px;
        }
        :deep(.UJ-input__wrapper) {
          background: transparent;
        }
        :deep(.UJ-form-item) {
          align-items: center;
        }
      }

      :deep(.UJ-form-item) {
        .UJ-form-item__label {
          font-size: 22px;
          width: 110px;
        }
      }
    }
  }

  .con-check {
    font-size: 22px;
    color: white;
    display: flex;
    margin-top: -25px;

    :deep(.UJ-checkbox__label) {
      font-size: 20px;
    }
  }

  .con1 {
    display: flex;
    flex-wrap: wrap;

    .con-check-item {
      font-size: 20px;
      color: white;
      display: flex;
      align-items: center;
      margin-right: 20px;
      margin-bottom: 30px;

      :deep(.UJ-input) {
        width: 192px !important;
        margin-left: 10px;
      }
      :deep(.UJ-input__wrapper) {
        background: transparent;
      }
      & > span {
        position: absolute;
        margin-top: -60px;
        margin-left: 50px;
        background: rgb(26, 29, 44);
        z-index: 10;
        color: rgb(197, 197, 197);
      }
    }
  }

  .add-tool-wrap {
    padding-bottom: 60px;
    .tool-content {
      background: rgb(26, 29, 44);
      border-radius: 10px;
      padding: 40px 25px 20px 25px;
      font-size: 22px;
      line-height: 50px;

      :deep(.UJ-input__wrapper) {
        background: rgb(26, 29, 44);
        width: 430px;
      }

      :deep(.UJ-form-item) {
        flex-direction: column;
        justify-content: center;
        align-items: baseline;

        .UJ-form-item__label {
          text-align: left;
          margin-bottom: 15px;
        }
      }
    }

    .btn-operate {
      margin-top: 35px;
      margin-bottom: -30px;
      float: right;
    }
  }
}
:deep(.customDialog) {
  width: 530px;
}
:deep(.gatherDialog) {
  width: 1000px;
}
:deep(.gatherDrawer) {
  width: 900px !important;
}
</style>
