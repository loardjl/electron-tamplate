<template>
  <div class="list-wrap">
    <baseContaner>
      <div class="list-search">
        <div>
          <span>{{ t('machineName') }}:</span>
          <el-select v-model="searchForm.mchName" :placeholder="t('pleaseSelect')">
            <el-option
              v-for="item in machineList"
              :key="item.dev_id"
              :label="item.value"
              :value="item.dev_id"
            />
          </el-select>
        </div>
        <div>
          <span>{{ t('detectionTemplate') }}:</span>
          <el-select v-model="searchForm.detectionTemplate" :placeholder="t('pleaseSelect')">
            <el-option
              v-for="item in detectionTemplateList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </div>
        <div class="list-search-button">
          <el-button @click="getList" type="primary" size="default">
            {{ t('search') }}
          </el-button>
        </div>
      </div>
      <div class="table-wrap">
        <myTable
          :columns="columns"
          :table-data="tableData"
          :table-setting="tableSetting"
          :page-setting="pageSetting"
          @currentChange="handleCurrentChange"
          @sizeChange="handleSizeChange"
        ></myTable>
        <!-- <el-table
          :data="tableData"
          :border="true"
          :empty-text="t('noData')"
          style="width: 100%"
        >
          <el-table-column :label="t('serialNumber')" type="index" width="80" align="center"> </el-table-column>
          <el-table-column :label="t('machineName')" prop="mchName" align="center"> </el-table-column>
          <el-table-column :label="t('detectionTemplate')" prop="detectionTemplate" align="center"> </el-table-column>
          <el-table-column :label="t('lastDetectionTime')" prop="time" align="center"> </el-table-column>
          <el-table-column :label="t('operater')" align="center">
            <template #default="{ row,$index }">
              <div class="operate-wrap">
                <img
                  src="@renderer/assets/images/operate24.svg"
                  alt="历史记录"
                />
                <img
                  src="@renderer/assets/images/operate25.svg"
                  alt="数据分析"
                />
                 <el-popover
                  ref="popover"
                  class="popover-wrap"
                  placement="bottom"
                  :width="450"
                  trigger="click"
                  :visible="isPopoverList[$index]"
                >
                  <template #reference>
                    <img
                      @click="isPopoverList[$index] = true"
                      src="@renderer/assets/images/operate2.svg"
                      alt=""
                    />
                  </template>
                  <div class="popover-content">
                    <div class="title-wrap">
                      <div class="title">
                        <div></div>
                        <div>{{ t('tips') }}</div>
                      </div>
                      <img
                        @click="closePopover($index)"
                        src="@renderer/assets/images/error-box.svg"
                        alt=""
                      />
                    </div>
                    <div class="content">
                      {{ t('confirmDelete', { val: row.mchName }) }}
                    </div>
                    <div class="operate-btn">
                      <el-button
                        type="primary"
                        size="default"
                        plain
                        @click="closePopover($index)"
                        >{{ t('cancel') }}</el-button
                      >
                      <el-button
                        @click="deleteAdapter(row, $index)"
                        type="primary"
                        size="default"
                        style="background: red; border: none"
                      >
                        {{ t('delete') }}
                      </el-button>
                    </div>
                  </div>
                </el-popover>
              </div>
            </template>
          </el-table-column>
        </el-table> -->
      </div>
    </baseContaner>
  </div>
</template>

<script lang="jsx" setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import baseContaner from '@renderer/components/common/baseContaner.vue'
import myTable from '@renderer/components/common/myTable/myTable.vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
// import dayjs from 'dayjs'
const router = useRouter()
const { t } = useI18n()
const getImageUrl = name => {
  return `../../../assets/icons/svg/operator/${name}.svg`
}
// 搜索
const searchForm = reactive({})
//机床雷彪
const machineList = ref([
  {
    dev_id: 1,
    value: 'BJ1235'
  },
  {
    dev_id: 2,
    value: 'BJ1236'
  }
])
//检测模版
const detectionTemplateList = ref([
  {
    id: 1,
    name: '模版一'
  },
  {
    id: 2,
    name: '模版二'
  }
])

// 过程列表相关
onMounted(() => {
  getList()
})

const columns = computed(() =>
  reactive([
    {
      label: t('serialNumber'),
      type: 'index',
      width: 80
    },
    {
      label: t('machineName'),
      prop: 'mchName'
    },
    {
      label: t('detectionTemplate'),
      prop: 'detectionTemplate'
    },
    {
      label: t('lastDetectionTime'),
      prop: 'time'
    },
    {
      label: t('button.operator'),
      prop: 'opreator',
      render: ({ row }) => {
        return (
          <div className="operate-wrap">
            <img src={getImageUrl('record')} onClick={() => handleHistory(row)} />
            <img src={getImageUrl('chart')} />
            <img src={getImageUrl('delete_c')} onClick={() => handleDelete(row)} />
          </div>
        )
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
//历史记录
const handleHistory = row => {
  router.push({
    path: '/record/history',
    query: { id: row.id }
  })
}
//删除
const handleDelete = row => {
  console.log(row)
  ElMessageBox.confirm(t('confirmDelete'), t('tips'), {
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
      mchName: 'BJ1235',
      detectionTemplate: '主轴检测',
      time: '2024-06-07  15:54:42'
    },
    {
      id: 2,
      mchName: 'BJ1235',
      detectionTemplate: '主轴检测',
      time: '2024-06-07  15:54:42'
    },
    {
      id: 3,
      mchName: 'BJ1235',
      detectionTemplate: '主轴检测',
      time: '2024-06-07  15:54:42'
    },
    {
      id: 4,
      mchName: 'BJ1235',
      detectionTemplate: '主轴检测',
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
  .list-search {
    margin-bottom: 16px;
    display: flex;
    div {
      margin-right: 24px;
      span {
        display: inline-block;
        width: 109px;
      }
      :deep(.UJ-input) {
        width: 227px;
      }
    }
    &-button {
      margin-left: auto;
    }
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
</style>
