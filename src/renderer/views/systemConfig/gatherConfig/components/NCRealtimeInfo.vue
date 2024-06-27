<template>
  <div class="realtime-wrap">
    <div class="title">NC实时信息</div>
    <div class="content-wrap" v-for="(item, i) in tempSignalsList.slice(0, 2)" :key="item.id">
      <div class="des">Ch{{ i + 1 }}</div>
      <div class="con-wrap">
        <div
          class="con"
          v-for="(child, i) in tempSignalsList > 1 ? item.slice(0, 6) : item.slice(0, 12)"
          :key="i"
        >
          <div class="con-item">
            <span>{{ child.display_name }}</span>
            <el-input disabled type="text" v-model="child.realTimeData.val[0]" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStoreSignal } from '@renderer/store/useSignals'
const storeSignal = useStoreSignal()
import { watch, ref } from 'vue'

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

const tempSignalsList = ref([])
watch(
  () => props.realTimeList,
  newVal => {
    // 找到当前实时数据推送的数据是哪个信号，替换对应信号的值
    // 后端设计如此，前端要取出来很复杂...
    tempSignalsList.value = props.signalsList
    for (const i in props.signalsList) {
      for (const [key, value] of Object.entries(newVal)) {
        if (tempSignalsList.value[i].some(d => d.id === +key)) {
          for (const [childKey, childValue] of Object.entries(value.metric)) {
            tempSignalsList.value[i][
              findSigId(tempSignalsList.value[i], childKey)
            ].realTimeData.val[0] = childValue.val[0]
          }
        }
      }
    }
    storeSignal.changeSignalList(tempSignalsList.value)
  },
  {
    deep: true
  }
)

// 找到当前的sigId对应的下标
const findSigId = (arr, sig_id) => {
  for (const i in arr) {
    if (arr[i].sig_id === +sig_id) {
      return i
    }
  }
}
</script>

<style lang="scss" scoped>
.realtime-wrap {
  padding: 20px 50px;
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
      margin-top: -65px;
      text-indent: -12px;
      margin-left: 10px;
      color: black;
    }

    .con-wrap {
      display: flex;
      flex-wrap: wrap;

      .con {
        margin-bottom: 30px;
        margin-right: 25px;

        .con-item {
          margin-right: 20px;
          color: rgb(197, 197, 197);

          & > span {
            position: absolute;
            z-index: 10;
            font-size: 22px;
            margin-top: -15px;
            margin-left: 10px;
            background: rgb(26, 29, 44);
            padding: 0 7px;
          }

          :deep(.UJ-input__wrapper) {
            background: transparent;
            width: 182px !important;
          }
        }
        .con-item:last-child {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
