<template>
  <div class="afr-detail-wrap">
    <headerDetail ref="refHeaderDetail" @getDetail="getDetail" type="AFR"></headerDetail>
    <baseContaner v-if="refHeaderDetail?.detailData.connect_status">
      <div class="title">{{ t('collector.realTimeData') }}</div>

      <AFRInfo
        :data="{
          id: 'afr-line-chat5',
          name:
            detailData.extra_param[0].value == 0
              ? t('collector.speedRate')
              : t('collector.FeedRate'),
          chartList: afr_chartList
        }"
      >
      </AFRInfo>
    </baseContaner>

    <elDialog1
      class="send-dialog"
      :title="'【' + t('collector.sendPulse') + '】'"
      v-model="isAddTool"
      center
    >
      <impulsing
        v-model:isAddTool="isAddTool"
        :doList="doList"
        @sendImpulsing="sendImpulsing"
      ></impulsing>
    </elDialog1>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject } from 'vue'
import baseContaner from '@renderer/components/common/baseContaner.vue'
import AFRInfo from '../components/lineChart.vue'
import headerDetail from '../components/headerDetail.vue'
import impulsing from '../components/impulsing.vue'
import { basicInterface } from '@renderer/api/system/system'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
const route = useRoute()
const _worker = inject('_worker')
import { useSignalController } from '@renderer/hooks/useSignalController'
const { signal } = useSignalController()
const { t } = useI18n()

const refHeaderDetail = ref()

_worker.addEventListener(
  'message',
  res => {
    const { type, payload } = res.data
    switch (type) {
      // ------ 实时数据回调
      case 'realTimeCharData':
        console.log(payload)

        if (payload[route.query.adapter_id]?.['310'].length) {
          afr_chartList.value.push(...payload[route.query.adapter_id]['310'])

          // 只保留最近30s的数据
          let beginIndex = 0
          for (let i = afr_chartList.value.length - 1; i >= 0; i--) {
            if (
              (afr_chartList.value[i].timestamp - afr_chartList.value[beginIndex].timestamp) /
                1000 >
              30
            ) {
              afr_chartList.value[beginIndex] = false
              beginIndex++
            } else {
              break
            }
          }
          afr_chartList.value = afr_chartList.value.filter(Boolean)
        }
        break
      // Do信号回调
      case 'receiveDoData':
        if (payload.property_name === 'do0') {
          DoValue.value = payload.property_value
        }
        break
    }
  },
  { signal }
)

// 详情数据
const detailData = ref({})
const getDetail = value => {
  detailData.value = value
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
      property_name: ['do0']
    }
  })

  // 订阅实时数据
  getRealTime()
  routerQuery = route.query
})

// 获取动态信号
let timer = null
let DoValue = ref()

let afr_chartList = ref([])

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

// 发送脉冲
const isAddTool = ref(false)
const doList = ref([
  {
    label: 'DO 0',
    value: '0'
  }
])
// 发送脉冲接口调用成功添加计时器
const sendImpulsing = (status, time, doType) => {
  setTimeout(async () => {
    await basicInterface({
      version: '1.0',
      method: 'adapter_dev_ctrl',
      id: '38',
      params: {
        dev_id: parseInt(route.query.dev_id),
        collector_id: parseInt(route.query.adapter_id),
        ctrl_type: 0,
        ctrl_addr_type: 2,
        addr: doType,
        data_type: 0,
        value: status ? '1' : '0'
      }
    })
  }, parseInt(time))
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

    .send-icon {
      position: absolute;
      right: 45px;
      margin-top: -80px;
      cursor: pointer;
      img {
        width: 50px;
      }
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

:deep(.send-dialog) {
  width: 600px;
}
</style>
