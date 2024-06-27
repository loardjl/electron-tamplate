<template>
  <div class="table-expend-wrap">
    <div v-if="props.row.collector_type_name == 'NC'">
      <NCRealtimeInfo
        :row="row"
        :selectedMachine="selectedMachine"
        :realTimeList="props.realTimeList"
        :signalsList="props.signalsList"
      ></NCRealtimeInfo>
    </div>
    <div v-else-if="props.row.collector_type_name == 'USV'">
      <div class="title">{{ t('collector.realTimeData') }}</div>
      <div class="content-wrap" v-if="row.hardware_id === 851">
        <div class="des">{{ t('collector.DOOutput') }}</div>
        <div class="con">
          <div class="con-item">
            <div>DO 0：</div>
            <el-input type="text" disabled v-model="DoValue" />
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
    </div>
    <div v-else-if="props.row.collector_type_name == 'USP'">
      <div class="title">{{ t('collector.realTimeData') }}</div>
      <div class="content-wrap">
        <div class="des">{{ t('collector.DOOutput') }}</div>
        <div class="con">
          <div class="con-item">
            <div>DO 0：</div>
            <el-input type="text" disabled v-model="DoValue" />
          </div>
          <div class="con-item ml30" v-if="props.row.hardware_id === 502">
            <div>DO 1：</div>
            <el-input type="text" disabled v-model="Do1Value" />
          </div>
          <div class="con-item ml30" v-if="props.row.hardware_id === 502">
            <div>DO 2：</div>
            <el-input type="text" disabled v-model="Do2Value" />
          </div>
        </div>
      </div>
      <div class="content-wrap mt40">
        <div class="des">DI</div>
        <div class="con">
          <div class="con-item">
            <div>DI 0：</div>
            <el-input type="text" disabled v-model="DI0Value" />
          </div>
          <div class="con-item ml30">
            <div>DI 1：</div>
            <el-input type="text" disabled v-model="DI1Value" />
          </div>
        </div>
      </div>
      <template v-if="props.row.hardware_id === 501">
        <lineChart
          :data="{
            id: 'afr-line-chat5',
            name: t('collector.HXPower'),
            chartList: usp_a_chartList
          }"
        >
        </lineChart>
        <lineChart
          :data="{
            id: 'afr-line-chat6',
            name: t('collector.BXElectricity'),
            chartList: usp_b_chartList
          }"
        >
        </lineChart>
        <lineChart
          :data="{
            id: 'afr-line-chat7',
            name: t('collector.CXVoltage'),
            chartList: usp_c_chartList
          }"
        >
        </lineChart>
      </template>
    </div>
    <div v-else-if="props.row.collector_type_name == 'AFR'">
      <div class="title">{{ t('collector.realTimeData') }}</div>
      <lineChart
        :data="{
          id: 'afr-line-chat1',
          name: props.row.extra_param[0].value == 0 ? '转速旋钮倍率' : '进给旋钮倍率',
          chartList: afr_chartList
        }"
      >
      </lineChart>
    </div>
    <div v-else-if="props.row.collector_type_name == '采集卡'">
      <template v-if="props.row.hardware_id == 1102">
        <div class="title">{{ t('collector.realTimeData') }}</div>
        <div class="content-wrap">
          <div class="des">{{ t('collector.DOOutput') }}</div>
          <div class="con">
            <div class="con-item">
              <div>DO 0：</div>
              <el-input type="text" disabled v-model="Do0Value" />
            </div>
            <div class="con-item ml30">
              <div>DO 1：</div>
              <el-input type="text" disabled v-model="Do1Value" />
            </div>
            <div class="con-item ml30">
              <div>DO 2：</div>
              <el-input type="text" disabled v-model="Do2Value" />
            </div>
          </div>
        </div>
        <div class="content-wrap mt40">
          <div class="des">DI</div>
          <div class="con">
            <div class="con-item">
              <div>DI 4：</div>
              <el-input type="text" disabled v-model="DI4Value" />
            </div>
            <div class="con-item ml30">
              <div>DI 5：</div>
              <el-input type="text" disabled v-model="DI5Value" />
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="title">{{ t('collector.realTimeData') }}</div>
        <div class="content-wrap">
          <div class="des">{{ t('collector.DOOutput') }}</div>
          <div class="con">
            <div class="con-item">
              <div>DO 0：</div>
              <el-input type="text" disabled v-model="Do0Value" />
            </div>
            <div class="con-item ml30">
              <div>DO 1：</div>
              <el-input type="text" disabled v-model="Do1Value" />
            </div>
            <!-- <div class="con-item ml30">
              <div>DO 2：</div>
              <el-input type="text" disabled v-model="Do2Value" />
            </div> -->
          </div>
        </div>
        <div class="content-wrap mt40">
          <div class="des">DI</div>
          <div class="con">
            <div class="con-item">
              <div>DI 0：</div>
              <el-input type="text" disabled v-model="DI0Value" />
            </div>
          </div>
        </div>
        <lineChart
          :data="{
            id: 'afr-line-chat5',
            name: t('collector.ADVoltage'),
            chartList: ld_chartList
          }"
        >
        </lineChart>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, inject } from 'vue'
import NCRealtimeInfo from './NCRealtimeInfo.vue'
import lineChart from './lineChart.vue'
import { useI18n } from 'vue-i18n'
const _worker = inject('_worker')
const controller = new AbortController()
const { signal } = controller
const { t } = useI18n()

_worker.addEventListener(
  'message',
  res => {
    const { type, payload } = res.data
    switch (type) {
      // Do信号回调
      case 'receiveDoData':
        if (['do0', 'do'].includes(payload.property_name)) {
          DoValue.value = payload.property_value
          Do0Value.value = payload.property_value
        } else if (payload.property_name === 'do1') {
          Do1Value.value = payload.property_value
        } else if (payload.property_name === 'do2') {
          Do2Value.value = payload.property_value
        }
        break
    }
  },
  { signal }
)

const props = defineProps({
  row: {
    type: Object,
    required: true
  },
  // 实时数据
  realTimeList: {
    type: Object
  },
  // 机床id
  selectedMachine: {
    type: Number
  },
  // 信号数据源
  signalsList: {
    type: Array
  }
})

onMounted(async () => {
  // 订阅 do 信号
  if (['USV', 'USP', '采集卡'].includes(props.row.collector_type_name)) {
    let property_name_list = ['do0']
    if (props.row.collector_type_name === 'USV') {
      property_name_list = ['do']
    } else if (props.row.collector_type_name === 'USP') {
      if (props.row.hardware_id === 502) {
        // UGD采集器判断
        property_name_list = ['do0', 'do1', 'do2']
      } else {
        property_name_list = ['do0']
      }
    } else if (props.row.collector_type_name === '采集卡') {
      if (props.row.hardware_id === 1102) {
        // UGD采集器判断
        property_name_list = ['do0', 'do1', 'do2']
      } else {
        property_name_list = ['do0', 'do1']
      }
    }
    _worker.postMessage({
      type: 'cancelDoData',
      payload: {
        batch: true
      }
    })
    _worker.postMessage({
      type: 'subscribeDoData',
      payload: {
        dev_id: parseInt(props.selectedMachine),
        adapter_id: parseInt(props.row.id),
        property_name: property_name_list,
        batch: true
      }
    })
  }
})

// 获取动态信号
let timer = null
let DoValue = ref() // do信号
let Do0Value = ref() // do信号
let Do1Value = ref() // do信号
let Do2Value = ref() // do信号
const DI0Value = ref()
const DI1Value = ref()
const DI2Value = ref()
const DI3Value = ref()
const DI4Value = ref()
const DI5Value = ref()
const usv_x_chartList = ref([])
const usv_y_chartList = ref([])
const usv_z_chartList = ref([])
const usp_a_chartList = ref([])
const usp_b_chartList = ref([])
const usp_c_chartList = ref([])
const afr_chartList = ref([])
const ld_chartList = ref([])
watch(
  () => props.realTimeList,
  newVal => {
    // -------------------------- usv ------------------------------
    // USV 有三个轴，需要三个图
    if (['USV'].includes(props.row.collector_type_name)) {
      usvDataConvert(newVal)
    }
    // -------------------------------- usp -------------------------------------
    else if (['USP'].includes(props.row.collector_type_name)) {
      uspDataConvert(newVal)
    }
    // -------------------------------- afr -------------------------------------
    else if (['AFR'].includes(props.row.collector_type_name)) {
      afrDataConvert(newVal)
    }
    // -------------------------------- 采集卡 - LD -------------------------------------
    else if (['采集卡'].includes(props.row.collector_type_name)) {
      collectorCardDataFn(newVal)
    }
  }
)

const usvDataConvert = newVal => {
  // 分别处理三个轴的数据
  const isUsv357 = props.row.hardware_id === 851
  if (newVal[props.row.id]?.['300']?.length || newVal[props.row.id]?.['303']?.length) {
    isUsv357 && usv_x_chartList.value.push(...newVal[props.row.id]['300'])
    !isUsv357 && usv_x_chartList.value.push(...newVal[props.row.id]['303'])
    usv_x_chartList.value = setChartList(usv_x_chartList.value)
  }
  if (newVal[props.row.id]?.['301']?.length || newVal[props.row.id]?.['304']?.length) {
    isUsv357 && usv_y_chartList.value.push(...newVal[props.row.id]['301'])
    !isUsv357 && usv_y_chartList.value.push(...newVal[props.row.id]['304'])
    usv_y_chartList.value = setChartList(usv_y_chartList.value)
  }
  if (newVal[props.row.id]?.['302']?.length || newVal[props.row.id]?.['305']?.length) {
    isUsv357 && usv_z_chartList.value.push(...newVal[props.row.id]['302'])
    !isUsv357 && usv_z_chartList.value.push(...newVal[props.row.id]['305'])
    usv_z_chartList.value = setChartList(usv_z_chartList.value)
  }
}

const afrDataConvert = newVal => {
  if (newVal[props.row.id]?.metric['114']) {
    DI0Value.value = newVal[props.row.id].metric['114'].val[0]
  }

  if (newVal[props.row.id]?.['310'].length) {
    afr_chartList.value.push(...newVal[props.row.id]['310'])
    afr_chartList.value = setChartList(afr_chartList.value)
  }
}
const uspDataConvert = newVal => {
  if (newVal[props.row.id]?.metric['114']) {
    DI0Value.value = newVal[props.row.id].metric['114'].val[0]
  }
  if (newVal[props.row.id]?.metric['115']) {
    DI1Value.value = newVal[props.row.id].metric['115'].val[0]
  }
  if (newVal[props.row.id]?.['50'].length) {
    usp_a_chartList.value.push(...newVal[props.row.id]['50'])
    usp_a_chartList.value = setChartList(usp_a_chartList.value)
  }
  if (newVal[props.row.id]?.['51'].length) {
    usp_b_chartList.value.push(...newVal[props.row.id]['51'])
    usp_b_chartList.value = setChartList(usp_b_chartList.value)
  }
  if (newVal[props.row.id]?.['52'].length) {
    usp_c_chartList.value.push(...newVal[props.row.id]['52'])
    usp_c_chartList.value = setChartList(usp_c_chartList.value)
  }
}
const collectorCardDataFn = newVal => {
  if (newVal[props.row.id]?.metric['114']) {
    DI0Value.value = newVal[props.row.id].metric['114'].val[0]
  }
  if (newVal[props.row.id]?.metric['115']) {
    DI1Value.value = newVal[props.row.id].metric['115'].val[0]
  }
  if (newVal[props.row.id]?.metric['116']) {
    DI2Value.value = newVal[props.row.id].metric['116'].val[0]
  }
  if (newVal[props.row.id]?.metric['117']) {
    DI3Value.value = newVal[props.row.id].metric['117'].val[0]
  }
  if (newVal[props.row.id]?.metric['118']) {
    DI4Value.value = newVal[props.row.id].metric['118'].val[0]
  }
  if (newVal[props.row.id]?.metric['119']) {
    DI5Value.value = newVal[props.row.id].metric['119'].val[0]
  }

  if (newVal[props.row.id]?.['57'].length) {
    ld_chartList.value.push(...newVal[props.row.id]['57'])
    ld_chartList.value = setChartList(ld_chartList.value)
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

onBeforeUnmount(() => {
  clearInterval(timer)
  timer = null

  _worker.postMessage({
    type: 'cancelDoData',
    payload: {
      batch: true
    }
  })
})
</script>

<style lang="scss" scoped>
.table-expend-wrap {
  padding: 20px 50px;
  position: relative;
  height: 550px;
  overflow: auto;
  &::-webkit-scrollbar {
    display: none;
  }

  .con-select {
    position: absolute;
    right: 50px;
    margin-top: 30px;

    :deep(.UJ-input__wrapper) {
      background: transparent;
    }
  }

  .title {
    font-size: 24px;
    margin-bottom: 40px;
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
      margin-left: 10px;
      color: black;
    }

    .con {
      margin-bottom: 30px;
      display: flex;

      .con-item {
        display: flex;
        align-items: center;
        & > div {
          font-size: 22px;
          background: rgb(26, 29, 44);
        }
        :deep(.UJ-input) {
          width: 190px;
        }
        :deep(.UJ-input__wrapper) {
          background: transparent;
        }
      }
    }
  }
}
</style>
