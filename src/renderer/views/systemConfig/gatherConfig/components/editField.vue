<template>
  <div class="edit-field-wrap">
    <div class="header-wrap">
      <span>{{ t('collector.editFieldAdress') }}</span>
      <em class="myDialog-header__close" @click="emit('update:isEditField', false)"></em>
    </div>

    <div class="aisle-wrap">
      <el-form>
        <div class="item-layout">
          <el-form-item :label="t('collector.selectChannel') + ':'">
            <el-select class="aisle-select" v-model="path_num" @change="changePathNum">
              <el-option
                v-for="item in pathNumList"
                :key="item.id"
                :value="item.id"
                :label="'Ch' + item.path_num"
              ></el-option>
            </el-select>
          </el-form-item>
        </div>
      </el-form>
    </div>
    <el-form :model="tempSignalForm" ref="tempSignalFormRef" :scroll-to-error="true">
      <div class="type-wrap aisle-wrap">
        <template v-for="(item, i) in tempSignalForm.tempSignal" :key="item.sig_id">
          <div class="con-check-item-wrap">
            <div class="con-check-item mb18">
              <span>{{ item.display_name }}</span>
              <el-input v-model="item.realTimeData.val[0]" disabled></el-input>
            </div>
            <div class="con-check-item mb18">
              <span>{{ t('collector.collectWay') }}</span>
              <el-select v-model="item.addr_type" @change="changeAddrType(item.addr_type, i)">
                <el-option label="CNC" :value="0" />
                <el-option label="PMC" :value="1" />
                <el-option :label="t('collector.macroVariable')" :value="2" />
                <el-option :label="t('collector.fixedValue')" :value="3" />
              </el-select>
            </div>
            <el-form-item
              :prop="`tempSignal[${i}].addr`"
              :rules="item.addr_type !== 3 ? {} : rules.addr"
            >
              <div class="con-check-item">
                <span>{{
                  item.addr_type !== 3 ? t('collector.adress') : t('collector.value')
                }}</span>
                <el-input
                  v-model="item.addr"
                  :disabled="item.addr_type === 0 ? true : false"
                ></el-input>
              </div>
            </el-form-item>
          </div>
        </template>
      </div>
    </el-form>
    <div class="btn-operate">
      <el-button type="primary" size="default" plain @click="emit('update:isEditField', false)">{{
        t('collector.cancel')
      }}</el-button>
      <el-button type="primary" @click="submit">{{ t('collector.confirm') }}</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const route = useRoute()
import { basicInterface } from '@renderer/api/system/system'
import { _public } from '@renderer/utils/common'

const props = defineProps({
  detailData: {
    type: Object
  },
  // 信号数据源
  signalsList: {
    type: Array
  },
  isEditField: {
    type: Boolean
  },
  curAdapterId: {
    type: Number
  }
})

onMounted(() => {
  getDevList()
})

// 通道下拉选择改变
const changePathNum = id => {
  for (const i in pathNumList.value) {
    if (pathNumList.value[i].id === id) {
      tempSignal.value = props.signalsList[pathNumList.value[i].path_num - 1].filter(item => {
        return item.sig_id < 1000
      })
      break
    }
  }
  copyTempSignal = _public.deepCopy(tempSignal.value)
  tempSignalForm.value.tempSignal = tempSignal.value
}

// 更改采集方式
const changeAddrType = (type, index) => {
  tempSignalFormRef.value.clearValidate(`tempSignal[${index}].addr`)
  if (type === 0) {
    // CNC
    tempSignalForm.value.tempSignal[index].addr = ''
  }
}

// 详情数据
const emit = defineEmits(['update:isEditField', 'reloadNC'])
const path_num = ref(+props.curAdapterId) // 默认选中第一个通道
const pathNumList = ref([]) // 所有的通道列表
// 当前需要展示通道下的指标
const tempSignal = ref([])
let copyTempSignal = []

// 获取机床详情列表
const machineDetailList = ref([])
const getDevList = async () => {
  const res = await basicInterface({
    version: '1.0',
    method: 'enum_dev_detail_info',
    id: '67',
    params: {}
  })
  machineDetailList.value = res.data.result.dev_info_list
  // 找出所有NC的通道
  for (const item of machineDetailList.value) {
    if (item.dev_info.dev_id === +route.query.dev_id) {
      for (const val of item.adapter_info_list) {
        // = 1 代表是nc
        if (val.adapter_info.collector_type_id === 1) {
          // 代表是 NC
          pathNumList.value.push({
            id: val.adapter_info.id,
            path_num: val.adapter_info.path_num
          })
        }
      }
    }
    // break
  }
  tempSignal.value = JSON.parse(
    JSON.stringify(
      props.signalsList[pathNumList.value.find(d => d.id === +props.curAdapterId).path_num - 1]
    )
  ).filter(item => {
    return item.sig_id < 1000
  })
  copyTempSignal = _public.deepCopy(tempSignal.value)
  tempSignalForm.value.tempSignal = tempSignal.value
}

const tempSignalForm = ref({
  tempSignal: tempSignal.value
})
const tempSignalFormRef = ref(null)
const rules = {
  addr: [
    {
      required: true,
      message: t('pleaseEnter'),
      trigger: 'blur'
    }
  ]
}

const findEditFields = () => {
  const result = []
  copyTempSignal.forEach(old => {
    tempSignalForm.value.tempSignal.forEach(cur => {
      if (old.sig_id === cur.sig_id && !_public._equals(cur, old)) {
        result.push(cur)
      }
    })
  })
  return result
}

// 点击保存
const submit = async () => {
  const valid = await tempSignalFormRef.value.validate()
  if (!valid) {
    return
  }
  const loading = ElLoading.service({
    lock: true,
    text: t('collector.saveStatus'),
    background: 'rgba(0, 0, 0, 0.7)'
  })
  const arr = findEditFields()
  try {
    for (const val of arr) {
      if ((val.addr && val.addr_type !== 0) || (!val.addr && val.addr_type !== 3)) {
        const tempId = pathNumList.value.filter(item => item.id === val.id)[0].id
        await basicInterface({
          version: '1.0',
          method: 'set_signal_info',
          id: '21',
          params: {
            dev_id: parseInt(route.query.dev_id),
            adapter_id: parseInt(tempId),
            signal_info: {
              sig_id: val.sig_id,
              addr_type: val.addr_type,
              addr: val.addr.toString(),
              addr_len: isNaN(+val.addr_len) ? 10 : +val.addr_len
            }
          }
        })
      }
    }
  } catch {
    loading.close()
  }
  emit('reloadNC')
  loading.close()
  ElMessage.success(t('collector.operateSuccess'))
  emit('update:isEditField', false)
}
</script>

<style scoped lang="scss">
.edit-field-wrap {
  width: 100%;
  height: 100%;
  padding: 20px;
  background: rgb(59, 61, 76);

  .header-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;

    span {
      font-size: 26px;
    }
    span::before {
      content: '';
      display: inline-block;
      width: 5px;
      height: 28px;
      border-radius: 10px;
      margin-right: 10px;
      position: relative;
      top: 3px;
      background: rgb(65, 180, 207);
    }

    .myDialog-header__close {
      width: 21px;
      height: 21px;
      background: url('@renderer/assets/icons/svg/operator/close.svg') no-repeat center center;
      background-size: 100% 100%;
      cursor: pointer;
    }
  }

  .aisle-wrap {
    background: rgb(26, 29, 44);
    border-radius: 20px;
    padding: 20px;
    margin-top: 20px;

    :deep(.UJ-form-item) {
      flex-direction: column;
      justify-content: center;
      align-items: baseline;

      .UJ-form-item__label {
        text-align: left;
        margin-bottom: 15px;
      }
    }
    :deep(.aisle-select) {
      width: 810px;
    }
  }

  .type-wrap {
    padding: 35px 20px 20px 20px;

    .con-check-item-wrap {
      display: flex;
      align-items: center;
      margin-bottom: 30px;

      .con-check-item {
        font-size: 20px;
        color: white;
        margin-right: 15px;
        position: relative;

        :deep(.UJ-input) {
          width: 248px !important;
          margin-left: 10px;
        }
        & > span {
          position: absolute;
          margin-top: -15px;
          margin-left: 15px;
          display: inline-block;
          padding: 0 5px;
          background: rgb(26, 29, 44);
          z-index: 10;
          color: rgb(197, 197, 197);
        }
      }
    }
  }

  .btn-operate {
    margin-top: 35px;
    margin-bottom: -30px;
    padding-bottom: 20px;
    float: right;
  }
}
:deep(.UJ-input__wrapper) {
  background: transparent;
}
</style>
