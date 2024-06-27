<template>
  <div class="list-wrap">
    <div class="list-operate">
      <el-button type="primary" size="default" @click="handleAdd">
        {{ t('tempConfig.newAddition') }}
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
        ></myTable>
      </div>
    </baseContaner>
    <elDialog1
      :title="t('tempConfig.addTemplate')"
      v-model="addVisiable"
      center
      width="540px"
      v-if="addVisiable"
    >
      <div class="add-template-wrap">
        <el-form
          :model="addForm"
          ref="addRuleForm"
          :rules="rules"
          label-position="top"
          class="add-template-form"
        >
          <el-form-item :label="t('tempConfig.templateName') + '：'" prop="name">
            <el-input v-model="addForm.name" :placeholder="t('pleaseEnter')"></el-input>
          </el-form-item>
          <el-form-item :label="t('tempConfig.referencingTemplates') + '：'" prop="template_id">
            <el-select
              v-model="addForm.template_id"
              :placeholder="t('pleaseSelect')"
              style="width: 100%"
            >
              <el-option
                v-for="item in templateList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="btn-operate">
        <el-button type="primary" size="default" plain @click="resetForm">{{
          t('tempConfig.cancel')
        }}</el-button>
        <el-button type="primary" @click="submitForm">{{ t('tempConfig.newAddition') }}</el-button>
      </div>
    </elDialog1>
  </div>
</template>

<script lang="jsx" setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import baseContaner from '@renderer/components/common/baseContaner.vue'
import myTable from '@renderer/components/common/myTable/myTable.vue'
import { useI18n } from 'vue-i18n'
// import { _public } from '@renderer/utils/common'

const { t } = useI18n()
const getImageUrl = name => {
  return `../../../assets/icons/svg/operator/${name}.svg`
}

// 列表相关
onMounted(() => {
  getList()
})

const columns = computed(() =>
  reactive([
    {
      label: t('tempConfig.serialNumber'),
      type: 'index',
      width: 80
    },
    {
      label: t('tempConfig.templateName'),
      prop: 'templateName'
    },
    {
      label: t('tempConfig.detectionTask'),
      prop: 'detectionTask'
    },
    {
      label: t('tempConfig.source'),
      prop: 'source'
    },
    {
      label: t('tempConfig.version'),
      prop: 'version'
    },
    {
      label: t('button.operator'),
      prop: 'opreator',
      render: ({ row }) => {
        return (
          <div className="operate-wrap">
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

//删除
const handleDelete = row => {
  console.log(row)
  ElMessageBox.confirm(t('tempConfig.confirmDelete'), t('tips'), {
    confirmButtonText: t('tempConfig.confirm'),
    cancelButtonText: t('tempConfig.cancel'),
    appendTo: '.list-wrap'
  })
    .then(() => {
      ElMessage({
        type: 'success',
        message: t('tempConfig.deleteSuccessful')
      })
    })
    .catch(() => {})
}
const getList = () => {
  tableData.value = [
    {
      id: 1,
      templateName: '主轴检测-001',
      detectionTask: '主轴检测',
      source: '公有',
      version: 'v1.0'
    },
    {
      id: 2,
      templateName: '主轴检测-001',
      detectionTask: '主轴检测',
      source: '公有',
      version: 'v1.0'
    },
    {
      id: 3,
      templateName: '主轴检测-001',
      detectionTask: '主轴检测',
      source: '公有',
      version: 'v1.0'
    },
    {
      id: 4,
      templateName: '主轴检测-001',
      detectionTask: '主轴检测',
      source: '公有',
      version: 'v1.0'
    }
  ]
}
//新增模版
const addVisiable = ref(false)
const addForm = reactive({})
const addRuleForm = ref()
const rules = reactive({
  name: [{ required: true, message: t('tempConfig.formVerification1'), trigger: 'blur' }],
  template_id: [
    {
      required: true,
      message: t('tempConfig.formVerification2'),
      trigger: 'change'
    }
  ]
})
const handleAdd = () => {
  addVisiable.value = true
}
//云端模版
const templateList = ref([
  {
    id: 1,
    name: '模版一'
  },
  {
    id: 2,
    name: '模版二'
  }
])
//重置表单
const resetForm = () => {
  addRuleForm.value.resetFields()
  addVisiable.value = false
}
//表单提交
const submitForm = () => {
  addRuleForm.value.validate((valid, fields) => {
    if (valid) {
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
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
.add-template-wrap {
  border-radius: 20px;
  background: rgb(26, 29, 44);
  .add-template-form {
    padding: 24px 32px;
    margin-bottom: 24px;
    :deep(.UJ-form-item__label) {
      margin-bottom: 16px !important;
    }
    :deep(.UJ-form-item__content) {
      margin-bottom: 24px !important;
    }
  }
}
.btn-operate {
  text-align: right;
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
