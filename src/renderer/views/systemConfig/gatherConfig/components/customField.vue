<template>
  <div class="custom-field-wrap">
    <el-table :data="tableData" :border="true" style="width: 100%">
      <el-table-column :label="t('collector.name')">
        <template #default="scope">
          <el-input
            v-model="isEditList[scope.$index].value.sig_name"
            v-if="isEditList[scope.$index]?.isEdit"
          ></el-input>
          <span v-else class="gather-type">{{ scope.row.sig_name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('collector.collectWay')">
        <template #default="scope">
          <el-select
            v-if="isEditList[scope.$index]?.isEdit"
            v-model="isEditList[scope.$index].value.addr_type"
            @change="changeAddrType(isEditList[scope.$index].value.addr_type, scope.$index)"
            placeholder=" "
          >
            <el-option label="PMC" :value="1" />
            <el-option :label="t('collector.macroVariable')" :value="2" />
          </el-select>
          <span v-else class="gather-type">{{ enumAddrType.get(scope.row.addr_type) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('collector.targetAddress')">
        <template #default="scope">
          <el-input
            v-if="isEditList[scope.$index]?.isEdit"
            v-model="isEditList[scope.$index].value.addr"
            :disabled="isEditList[scope.$index].value.addr_type == 0"
          ></el-input>
          <span v-else>{{ scope.row.addr || '' }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('collector.type')">
        <template #default="scope">
          <el-select
            v-if="isEditList[scope.$index]?.isEdit"
            placeholder=" "
            v-model="isEditList[scope.$index].value.sig_data_type"
          >
            <el-option label="int" :value="0" />
            <el-option label="float" :value="1" />
            <el-option label="string" :value="2" />
            <el-option label="boolean" :value="3" />
          </el-select>
          <div v-else>{{ sig_data_type.get(scope.row.sig_data_type) }}</div>
        </template>
      </el-table-column>
      <el-table-column :label="t('collector.realTimeValue')">
        <template #default="scope"> {{ scope.row?.realTimeData?.val[0] }} </template>
      </el-table-column>
      <el-table-column :label="t('collector.operate')">
        <template #default="scope">
          <div class="operate-wrap">
            <img
              @click="deleteRow(scope.row)"
              src="@renderer/assets/icons/svg/operator/delete_c.svg"
              alt=""
            />
            <img
              @click="edit(scope.row, scope.$index)"
              v-show="!isEditList[scope.$index]?.isEdit"
              src="@renderer/assets/icons/svg/operator/yellowEdit.svg"
              alt=""
            />
            <img
              @click="edit(scope.row, scope.$index)"
              v-show="isEditList[scope.$index]?.isEdit"
              src="@renderer/assets/icons/svg/operator/confirm_green_full.svg"
              alt=""
            />
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { basicInterface } from '@renderer/api/system/system'
import { useRoute } from 'vue-router'
const route = useRoute()
import { sig_data_type, enumAddrType } from '@renderer/utils/enum'
import { _public } from '@renderer/utils/common'
import { ElMessage } from 'element-plus'
import { useStoreSignal } from '@renderer/store/useSignals'
const storeSignal = useStoreSignal()
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
  // 信号数据源
  signalsList: {
    type: Array
  },
  curAdapterId: {
    type: String
  }
})

const emit = defineEmits(['getRealTime', 'unsubscribeRealTime', 'getDevList'])

onMounted(() => {
  getList()
})

// ---------- 列表
const tableData = ref([])
const getList = async () => {
  const res = await basicInterface({
    version: '1.0',
    method: 'get_collector_signals',
    id: '17',
    params: {
      dev_id: parseInt(route.query.dev_id),
      adapter_id: parseInt(props.curAdapterId)
    }
  })
  getTableDetail(res.data.result.dynamic_signals)
}

// ---------- 是否编辑状态
const isEditList = ref([])

// 通过列表请求枚举
const getTableDetail = async dynamicSignalsList => {
  tableData.value = []
  // 找出当前采集器的NC数据
  const signalObjList = props.signalsList.filter(item => item[0].id === props.curAdapterId)[0]
  for (const val of dynamicSignalsList) {
    tableData.value.push({
      ..._public.findObj(signalObjList, 'sig_id', val)
    })
  }
  for (const val of tableData.value) {
    isEditList.value.push({
      isEdit: false,
      value: {
        ...val
      }
    })
  }
}

// 编辑（需要调两个接口）
const edit = async (row, index) => {
  // 判断必填
  if (isEditList.value[index].isEdit) {
    const temp = isEditList.value[index].value
    if (!temp.sig_name || !temp.addr_type || !temp.addr) {
      ElMessage.error(t('collector.inputAllInfo'))
      return
    }
  }

  isEditList.value[index].isEdit = !isEditList.value[index].isEdit
  if (!isEditList.value[index].isEdit) {
    await basicInterface({
      version: '1.0',
      method: 'set_signal_info',
      id: '21',
      params: {
        dev_id: parseInt(route.query.dev_id),
        adapter_id: parseInt(props.curAdapterId),
        signal_info: {
          sig_id: isEditList.value[index].value.sig_id,
          addr_type: isEditList.value[index].value.addr_type,
          addr: isEditList.value[index].value.addr,
          addr_len: 10
        }
      }
    })

    try {
      await basicInterface({
        version: '1.0',
        method: 'update_dynamic_signal_info',
        id: '60',
        params: {
          sig_id: isEditList.value[index].value.sig_id,
          name: isEditList.value[index].value.sig_name,
          sig_data_type: isEditList.value[index].value.sig_data_type
        }
      })
      tableData.value[index] = JSON.parse(JSON.stringify(isEditList.value[index].value))
      ElMessage.success(t('collector.updateSuccess'))
      // 刷新详情实时数据显示
      await emit('unsubscribeRealTime')
      storeSignal.changeSignalList(null)
      emit('getDevList', () => {
        getList()
      })
    } catch {
      isEditList.value[index].value = JSON.parse(JSON.stringify(tableData.value[index]))
    }
  }
}

// 删除
const deleteRow = async row => {
  await basicInterface({
    version: '1.0',
    method: 'delete_dynamic_signal',
    id: '61',
    params: {
      sig_id: row.sig_id
    }
  })
  ElMessage.success(t('collector.deleteSuccess'))

  // 刷新详情实时数据显示
  await emit('unsubscribeRealTime')
  storeSignal.changeSignalList(null)
  await emit('getRealTime')

  for (const i in tableData.value) {
    if (tableData.value[i].sig_id === row.sig_id) {
      isEditList.value.splice(i, 1)
      tableData.value.splice(i, 1)
      break
    }
  }
}

// 更改采集方式
const changeAddrType = (type, index) => {
  if (type === 0) {
    // CNC
    isEditList.value[index].value.addr = ''
  }
}
</script>

<style lang="scss" scoped>
.custom-field-wrap {
  .operate-wrap {
    & > img {
      cursor: pointer;
      width: 35px;
      margin-right: 10px;
    }
  }

  :deep(.UJ-input) {
    width: 130px;
    height: 45px;
    position: relative;
    margin-top: 5px;

    .UJ-input__wrapper {
      background: rgb(40, 45, 67);
    }
  }

  :deep(.UJ-table) {
    font-size: 22px;

    tr {
      height: 63px;
    }
  }
  :deep(.UJ-table__header) {
    height: 50px;
    .UJ-table__cell {
      background: rgb(26, 29, 44);
      color: rgb(65, 180, 207);
      border-bottom: 1px solid rgba(59, 61, 76);
    }
  }
  :deep(.UJ-table__row) {
    height: 50px;
  }
  :deep(.UJ-table__inner-wrapper::before),
  :deep(.UJ-table__inner-wrapper::after) {
    background-color: rgb(40, 45, 67);
  }
  :deep(.UJ-table__cell) {
    border-right: 1px solid rgba(59, 61, 76);
  }
  :deep(.UJ-table__body-wrapper) {
    .UJ-table__cell {
      background: rgb(40, 45, 67);
    }
  }
  :deep(.UJ-table__border-left-patch) {
    background: rgb(40, 45, 67);
  }
  :deep(td.UJ-table__cell) {
    border-bottom: 1px solid rgba(59, 61, 76);
  }
  :deep(.UJ-table--border::after) {
    background: rgb(40, 45, 67);
  }
}
</style>
