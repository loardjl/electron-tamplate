<template>
  <div class="realtime-wrap">
    <div class="con-chart">
      <div :id="props.data.id" class="line-charts"></div>
    </div>
  </div>
</template>

<script setup>
import { inject, onMounted, onUnmounted, watch, toRaw } from 'vue'
import { useChartStore } from '@renderer/store/useChart'
import { storeToRefs } from 'pinia'
const echarts = inject('echarts')
const store = useChartStore()
const { echarts: myChart } = storeToRefs(store)
const props = defineProps({
  data: {
    type: Object,
    default: () => {}
  }
})
watch(
  () => props.data,
  () => {
    initCharts()
  },
  {
    deep: true
  }
)

const colors = {
  blue: 'rgb(15, 146, 218)',
  red: 'rgb(255, 52, 52)',
  yellow: 'rgb(253, 171, 62)'
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', resize)
})

const initCharts = () => {
  let curChart = null
  const echartsID = props.data.id
  if (myChart.value.has(echartsID)) {
    curChart = toRaw(myChart.value.get(echartsID))
    curChart.clear()
  } else {
    curChart = echarts.init(document.getElementById(echartsID))
    store.setEcharts(echartsID, curChart)
  }

  // 处理xy轴数据
  const axisList = []
  for (const val of props.data.chartList) {
    // 需要处理成这样格式
    // [
    //   ['2019-10-10', 200],
    //   ['2019-10-11', 560],
    // ],
    axisList.push([val.timestamp, val.val])
  }

  const series = {
    animation: false,
    type: 'line',
    connectNulls: false,
    symbol: 'none',
    sampling: 'lttb',
    smooth: true,
    data: axisList,
    itemStyle: {
      color: colors.blue
    }
  }
  const option = {
    // tooltip: {
    //   trigger: 'axis'
    // },
    title: {
      textStyle: {
        fontSize: 24,
        fontWeight: '500',
        color: '#fff'
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '10%',
      top: '5%'
    },
    animation: true,
    xAxis: {
      type: 'time',
      boundaryGap: false,
      axisLabel: {
        color: '#fff'
      },
      maxInterval: 3 * 1000,
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisTick: {
        alignWithLabel: true
      },
      axisLine: {
        show: true
      },
      axisLabel: {
        color: '#fff'
      },
      splitLine: {
        show: false
      }
    },
    dataZoom: [
      {
        show: false
      }
    ],
    series
  }
  curChart.setOption(option)
}

const chartArr = Array.from(myChart.value, ([key, value]) => ({ id: key, chart: value }))
const resize = () => {
  chartArr.forEach(item => {
    item.chart.resize()
  })
}
onUnmounted(() => {
  store.clearEcahrts()
  window.removeEventListener('resize', resize)
})
</script>

<style lang="scss" scoped>
.realtime-wrap {
  height: 100%;
  .con-chart {
    // padding: 40px 20px;
    background: rgb(26, 29, 44);
    // border-radius: 20px;

    .line-charts {
      width: 100%;
      height: 346px;
    }
  }
}
</style>
