<template>
  <div class="dashboard-main">
    <baseContaner class="filter-container">
      <div class="filter-flex">
        <div class="filter-list">
          <div class="list-item">
            <span class="item-label">机床：</span>
            <el-select v-model="filterForm.machine" class="w-120">
              <el-option
                v-for="item in machineList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="list-item">
            <span class="item-label">检测类型：</span>
            <el-select v-model="filterForm.type" class="w-130">
              <el-option
                v-for="item in typeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="list-item">
            <span class="item-label">分组参数：</span>
            <el-cascader
              :options="paramList"
              v-model="filterForm.param"
              :props="{ checkStrictly: false }"
              style="width: 11.718vw"
            ></el-cascader>
          </div>
        </div>
        <div class="filter-switch">
          <el-radio-group v-model="chartType" @change="tabChange">
            <el-radio-button
              v-for="item in chartTypeList"
              :key="item.value"
              :label="item.value"
              :value="item.value"
              >{{ item.label }}</el-radio-button
            >
          </el-radio-group>
        </div>
      </div>
    </baseContaner>
    <!-- TODO chart图 -->
    <baseContaner class="chart-container" v-if="chartType === 1">
      <radarChart id="chart1" :showTitle="false" :temporalData="radarData"></radarChart>
    </baseContaner>
    <baseContaner class="chart-container" v-if="chartType === 2">
      <lineChart id="chart2" :showTitle="false" :temporalData="lineData"></lineChart>
    </baseContaner>
    <baseContaner class="chart-container" v-if="chartType === 3">
      <lineChart id="chart3" :showTitle="false" :temporalData="lineData2"></lineChart>
    </baseContaner>
    <baseContaner class="chart-container" v-if="chartType === 4">
      <temporalChart id="chart4" :showTitle="false" :temporalData="xyzData"></temporalChart>
    </baseContaner>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import baseContaner from '@renderer/components/common/baseContaner.vue'
import radarChart from './components/radarChart.vue'
import lineChart from './components/lineChart.vue'
import temporalChart from './components/3DChart.vue'

// 筛选参数
const filterForm = ref({
  machine: '',
  type: '',
  param: ''
})
const chartType = ref(1) // chart图类型
// 筛选框下拉列表组
const machineList = ref([
  {
    value: 1,
    label: 'BJ1234'
  },
  {
    value: 2,
    label: 'BJ4567'
  }
])
const typeList = ref([
  {
    value: 1,
    label: '主轴检测'
  },
  {
    value: 2,
    label: '进给轴检测'
  }
])
const paramList = ref([
  {
    value: '1',
    label: 'S1000',
    children: [
      {
        value: '1',
        label: '指标1'
      },
      {
        value: '2',
        label: '指标2'
      }
    ]
  },
  {
    value: '2',
    label: 'S2000',
    children: [
      {
        value: '1',
        label: '指标1'
      },
      {
        value: '2',
        label: '指标2'
      }
    ]
  },
  {
    value: '3',
    label: 'S3000'
  }
])
// chart类型选择
const chartTypeList = ref([
  {
    label: '指标雷达图',
    value: 1
  },
  {
    label: '工艺折线图',
    value: 2
  },
  {
    label: '指标趋势图',
    value: 3
  },
  {
    label: '运动分析图',
    value: 4
  }
])

const radarData = ref() // 指标雷达数据
const lineData = ref() // 工艺折线数据
const lineData2 = ref() // 指标趋势数据
const xyzData = ref() // 运动分析数据

onMounted(() => {})

const tabChange = () => {}
</script>

<style lang="scss" scoped>
.dashboard-main {
  .filter-container {
    .filter-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .filter-list {
      display: flex;
      align-items: center;
      .list-item {
        & + .list-item {
          margin-left: 12px;
        }
        .item-label {
          color: #ffffff;
          font-size: 22px;
          font-weight: 400;
          line-height: 31px;
        }
        .w-120 {
          width: 9.375vw;
        }
        .w-130 {
          width: 10.156vw;
        }
      }
    }
    .filter-switch {
      .UJ-radio-button {
        :deep(.UJ-radio-button__inner) {
          border-color: var(--UJ-color-primary);
          color: var(--UJ-color-primary);
          padding: 14px;
        }
        &.is-active {
          :deep(.UJ-radio-button__inner) {
            color: var(--UJ-color-white);
          }
        }
      }
    }
  }
}
</style>
