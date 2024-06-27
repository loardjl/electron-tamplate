<template>
  <div class="charts-wrap">
    <div
      class="charts"
      :id="props.id"
      :style="
        chartsWH && chartsWH.width
          ? { width: chartsWH.width + 'px', height: chartsWH.height + 'px' }
          : {}
      "
    ></div>
  </div>
</template>

<script setup>
// ---------------------- 时频图
import { nextTick, onMounted, inject, watch, getCurrentInstance, onBeforeUnmount } from 'vue'

const props = defineProps({
  id: {
    type: String
  },
  temporalData: {
    type: Object
  },
  // 渲染次数，控制每次进来初始化一次
  renderTimes: {
    type: Number,
    default: () => {
      return 1
    }
  },
  showTitle: {
    type: Boolean,
    default: () => {
      return true
    }
  },
  chartsWH: {
    type: Object,
    default: () => {}
  }
})
const { proxy } = getCurrentInstance()

watch(
  () => props.renderTimes,
  () => {
    nextTick(() => {
      init()
    })
  }
)

onMounted(() => {
  init()
})

// 绘制运动分析图
const Plotly = inject('Plotly')
const init = () => {
  Plotly.newPlot(
    props.id,
    [
      {
        fill: 'toself',
        marker: { color: 'lightsalmon' },
        name: '\u673a\u5e8a1',
        r: [0, 2, 4, 4, 5, 6, 7, 8, 9],
        theta: [
          '\u6307\u68071',
          '\u6307\u68072',
          '\u6307\u68073',
          '\u6307\u68074',
          '\u6307\u68075',
          '\u6307\u68076',
          '\u6307\u68077',
          '\u6307\u68078',
          '\u6307\u68079'
        ],
        type: 'scatterpolar'
      },
      {
        fill: 'toself',
        marker: { color: 'lightslategrey' },
        name: '\u673a\u5e8a2',
        r: [2, 3, 4, 5, 6, 7, 8, 9, 10],
        theta: [
          '\u6307\u68071',
          '\u6307\u68072',
          '\u6307\u68073',
          '\u6307\u68074',
          '\u6307\u68075',
          '\u6307\u68076',
          '\u6307\u68077',
          '\u6307\u68078',
          '\u6307\u68079'
        ],
        type: 'scatterpolar'
      }
    ],
    {
      template: {
        data: { scatter: [{ type: 'scatter' }] },
        layout: {
          font: { color: '#ffffff' },
          paper_bgcolor: '#3B3D4C',
          polar: {
            bgcolor: '#3B3D4C',
            radialaxis: {
              color: '#eeeeee'
            },
            angularaxis: {
              color: '#eeeeee'
            }
          }
        }
      }
    },
    { responsive: true }
  )
}
onBeforeUnmount(() => {
  Plotly.purge(props.id)
  proxy.$globalTemporalData = null // 时频
})
</script>

<style scoped lang="scss">
.charts-wrap {
  height: 100%;
  width: 100%;

  .charts {
    height: 100%;
    width: 100%;
  }
}
</style>
