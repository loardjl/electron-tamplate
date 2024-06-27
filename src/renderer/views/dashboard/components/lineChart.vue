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
        x: [1, 2, 3, 4],
        y: [16, 5, 11, 9],
        type: 'scatter'
      }
    ],
    {
      template: {
        data: { scatter: [{ type: 'scatter' }] },
        layout: {
          font: { color: '#ffffff' },
          paper_bgcolor: '#3B3D4C',
          plot_bgcolor: '#3B3D4C',
          xaxis: {
            showline: true,
            gridcolor: '#525462',
            linecolor: '#f6f6f7',
            ticks: '',
            title: { standoff: 15 },
            zerolinecolor: '#f6f6f7',
            automargin: true,
            zerolinewidth: 2
          },
          yaxis: {
            showline: true,
            gridcolor: '#525462',
            linecolor: '#f6f6f7',
            ticks: '',
            title: { standoff: 15 },
            zerolinecolor: '#f6f6f7',
            automargin: true,
            zerolinewidth: 2
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
