<template>
  <div class="list-wrap">
    <div class="list-operate">
      <el-button type="primary" size="default" @click="operator = 'del'" v-show="operator === ''">
        {{ t('batchDeletion') }}
      </el-button>
      <el-button
        type="primary"
        size="default"
        plain
        @click="handleCancle"
        v-show="operator === 'del'"
      >
        {{ t('cancel') }}
      </el-button>
      <el-button
        type="primary"
        size="default"
        @click="handleBatchDelete"
        v-show="operator === 'del'"
      >
        {{ t('delete') }}
      </el-button>
    </div>
    <baseContaner>
      <div class="table-wrap">
        <myTable
          :columns="columns"
          :table-data="tableData"
          :table-setting="tableSetting"
          :page-setting="pageSetting"
          @currentChange="handleCurrentChange"
          @sizeChange="handleSizeChange"
          ref="historyTable"
        ></myTable>
      </div>
    </baseContaner>
  </div>
</template>

<script lang="jsx" setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import baseContaner from '@renderer/components/common/baseContaner.vue'
import myTable from '@renderer/components/common/myTable/myTable.vue'
import { useI18n } from 'vue-i18n'
import { _public } from '@renderer/utils/common'
// import { useSignalController } from '@renderer/hooks/useSignalController'

// const { signal } = useSignalController()
// const _worker = inject('_worker')
const { t } = useI18n()
const getImageUrl = name => {
  return `../../../assets/icons/svg/operator/${name}.svg`
}
//操作按钮
const operator = ref('')
const handleCancle = () => {
  operator.value = ''
  historyTable.value.clearCheck()
}
// 列表相关
onMounted(() => {
  getList()
})
const historyTable = ref()
const columns = computed(() =>
  reactive([
    {
      type: 'selection',
      width: 50,
      show: computed(() => operator.value === 'del'),
      selectableFn: row => {
        return row.dataStatus === 0
      }
    },
    {
      label: t('serialNumber'),
      type: 'index',
      width: 80
    },
    {
      label: t('detectionTime'),
      prop: 'time',
      width: _public.screenPx(280)
    },
    {
      label: t('detectionDuration'),
      prop: 'detectionDuration'
    },
    {
      label: t('detectionConditions'),
      prop: 'detectionConditions'
    },
    {
      label: t('openMode'),
      prop: 'openMode'
    },
    {
      label: t('dataSize'),
      prop: 'dataSize'
    },
    {
      label: t('dataStatus'),
      prop: 'dataStatus',
      render: ({ row }) => {
        if (row.dataStatus === 0) {
          return (
            <>
              <span class="wait-status">待上传</span>
            </>
          )
        } else if (row.dataStatus === 1) {
          return (
            <>
              <span class="upload-status">上传中</span>
            </>
          )
        } else if (row.dataStatus === 2) {
          return (
            <>
              <span class="success-status">已上传</span>
            </>
          )
        }
      }
    },
    {
      label: t('button.operator'),
      prop: 'opreator',
      width: _public.screenPx(200),
      render: ({ row }) => {
        if (row.dataStatus === 0) {
          return (
            <div className="operate-wrap">
              <img src={getImageUrl('upload')} onClick={() => handleUpload(row)} />
              <img src={getImageUrl('delete_c')} onClick={() => handleDelete(row)} />
            </div>
          )
        } else {
          return (
            <div className="operate-wrap">
              <img src={getImageUrl('delete_c')} onClick={() => handleDelete(row)} />
            </div>
          )
        }
      }
    }
  ])
)
const tableData = ref([])
const tableSetting = {
  border: false,
  isPager: true
  // height: '31.86vw'
}
const pageSetting = {
  pageNum: 1,
  pageSize: 10,
  total: 0,
  layout: 'prev, pager, next,sizes'
}
const handleCurrentChange = val => {
  pageSetting.pageNum = val
  getList()
}
const handleSizeChange = val => {
  pageSetting.pageSize = val
  getList()
}
//上传
const handleUpload = row => {
  console.log(row)
}
//删除
const handleDelete = row => {
  console.log(row)
  ElMessageBox.confirm(t('confirmDelete1'), t('tips'), {
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel'),
    appendTo: '.list-wrap'
  })
    .then(() => {
      ElMessage({
        type: 'success',
        message: t('deleteSuccessful')
      })
    })
    .catch(() => {})
}
//批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(t('confirmDelete1'), t('tips'), {
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel'),
    appendTo: '.list-wrap'
  })
    .then(() => {
      ElMessage({
        type: 'success',
        message: t('deleteSuccessful')
      })
    })
    .catch(() => {})
}
const getList = () => {
  tableData.value = [
    {
      id: 1,
      detectionDuration: '21',
      detectionConditions: '转速15000',
      openMode: '手动模式',
      detectionTemplate: '主轴检测',
      dataSize: '2.21M',
      dataStatus: 0,
      time: '2024-06-07  15:54:42'
    },
    {
      id: 2,
      detectionDuration: '21',
      detectionConditions: '转速15000',
      openMode: '手动模式',
      detectionTemplate: '主轴检测',
      dataSize: '2.21M',
      dataStatus: 1,
      time: '2024-06-07  15:54:42'
    },
    {
      id: 3,
      detectionDuration: '21',
      detectionConditions: '转速15000',
      openMode: '手动模式',
      detectionTemplate: '主轴检测',
      dataSize: '2.21M',
      dataStatus: 2,
      time: '2024-06-07  15:54:42'
    },
    {
      id: 4,
      detectionDuration: '21',
      detectionConditions: '转速15000',
      openMode: '手动模式',
      detectionTemplate: '主轴检测',
      dataSize: '2.21M',
      dataStatus: 0,
      time: '2024-06-07  15:54:42'
    }
  ]
}
</script>

<style lang="scss" scoped>
:deep(.row-expand-cover) {
  .UJ-table__expand-icon {
    display: none;
  }
}

.list-wrap {
  color: white;
  position: relative;
  .list-operate {
    margin-bottom: 16px;
    text-align: right;
  }
  .no-data {
    font-size: 22px;
    text-align: center;
    position: absolute;
    top: 200px;
    left: 50%;
    transform: translateX(-50%);
    span {
      margin-right: 20px;
    }
  }

  .table-wrap {
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
  :deep(.UJ-pagination .UJ-input) {
    height: 56px;
  }
  :deep(.UJ-pagination .UJ-input__wrapper) {
    background: #282d43;
    box-shadow: none;
  }
}
:deep(.UJ-message-box) {
  min-width: 540px;
  border-radius: 20px;
  box-shadow: 0px 0px 10px 2px rgba(161, 203, 213, 0.5);
  background: rgb(59, 61, 76);
  border: 0;
}
:deep(.UJ-message-box__title) {
  font-size: 24px;
  &::before {
    content: '';
    display: inline-block;
    border-radius: 5px;
    background: rgb(252, 12, 3);
    width: 6px;
    height: 28px;
    margin-right: 10px;
    position: relative;
    top: 4px;
  }
}
:deep(.UJ-message-box__close) {
  border: 2px solid #fff;
  border-radius: 12px;
  width: 36px;
  height: 36px;
}
:deep(.UJ-message-box__headerbtn .UJ-message-box__close) {
  font-size: 20px;
  font-weight: bold;
}
:deep(.UJ-message-box__content) {
  border-radius: 20px;
  box-shadow: 0px 18px 30px 0px rgba(112, 144, 176, 0.12);
  background: rgb(26, 29, 44);
  padding: 32px 24px;
  margin: 24px;
}
:deep(.UJ-message-box__btns) {
  font-size: 22px;
  font-weight: 500;
  .UJ-button {
    width: 103px;
    height: 58px;
    border: 1px solid rgb(65, 180, 207);
    color: rgb(65, 180, 207);
    border-radius: 8px;
  }
  .UJ-button--primary {
    border: 1px solid rgb(252, 12, 3);
    background: rgb(252, 12, 3);
    color: #fff;
    margin-left: 16px;
  }
}
</style>
<style lang="scss">
.operate-wrap {
  & > img {
    width: 44px;
    margin-right: 20px;
    cursor: pointer;
  }
}
.wait-status {
  color: #eb6a02;
}
.upload-status {
  color: #fcc803;
}
.success-status {
  color: #2ae304;
}
</style>
