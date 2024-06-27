<!--
 * @Author: 何志祥
 * @Date: 2023-08-28 14:34:43
 * @LastEditors: chunlaizhang
 * @LastEditTime: 2024-06-12 09:24:44
 * @Description: NC详情
-->
<template>
  <div class="afr-detail-wrap">
    <headerDetail
      ref="refHeaderDetail"
      @getDetail="getDetail"
      type="NC"
      :pathNumList="pathNumList"
    ></headerDetail>
    <baseContaner v-show="refHeaderDetail?.detailData.connect_status">
      <div class="title">{{ t('collector.hardwareInfo') }}</div>
      <div class="content-wrap mt40" v-for="(item, i) in signalsList" :key="i">
        <div class="operate-wrap">
          <img
            @click="showToolLife(item, i)"
            src="@renderer/assets/icons/svg/operator/tool_life.svg"
            alt=""
          />
          <img
            @click="editFieldFunc(item)"
            src="@renderer/assets/icons/svg/operator/link_blue.svg"
            alt=""
          />
          <img
            @click="addFieldFunc(item)"
            src="@renderer/assets/icons/svg/operator/add_green.svg"
            alt=""
          />
          <img
            @click="customFieldFunc(item)"
            src="@renderer/assets/icons/svg/operator/blue_view_full.svg"
            alt=""
          />
        </div>
        <div class="des">Ch{{ i + 1 }}</div>
        <div class="con1">
          <div class="con-check-item" v-for="(child, j) in item" :key="j">
            <el-checkbox
              @change="changeSignal(child)"
              v-model="child.isChecked"
              :true-label="1"
              :false-label="0"
            ></el-checkbox>
            <el-tooltip
              class="box-item"
              append-to=".afr-detail-wrap"
              effect="dark"
              :content="child.display_name"
              placement="top"
            >
              <span class="axis-style">{{ child.display_name }}</span>
            </el-tooltip>
            <el-input
              disabled
              v-model="child.realTimeData.val[0]"
              v-if="child.realTimeData"
            ></el-input>
          </div>
        </div>
      </div>
    </baseContaner>
    <elDialog1
      :title="t('collector.addCustomField')"
      v-model="isAddField"
      class="customDialog"
      center
      destroy-on-close
    >
      <div class="add-tool-wrap">
        <div class="tool-content">
          <el-form :model="ruleForm" ref="addRuleForm" :rules="rules">
            <el-form-item :label="t('collector.addCustomField') + ':'" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item :label="t('collector.collectWay') + ':'" prop="addr_type">
              <el-select placeholder=" " v-model="ruleForm.addr_type">
                <el-option label="PMC" :value="1" />
                <el-option :label="t('collector.macroVariable')" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item
              :label="t('collector.targetAddress') + ':'"
              prop="addr"
              v-if="ruleForm.addr_type != 0"
            >
              <el-input v-model="ruleForm.addr"></el-input>
            </el-form-item>
            <el-form-item :label="t('collector.type') + ':'" prop="sig_data_type">
              <el-select placeholder=" " v-model="ruleForm.sig_data_type">
                <el-option label="int" :value="0" />
                <el-option label="float" :value="1" />
                <el-option label="string" :value="2" />
                <el-option label="boolean" :value="3" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <div class="btn-operate">
          <el-button type="primary" size="default" plain @click="resetForm(addRuleForm)">{{
            t('collector.cancel')
          }}</el-button>
          <el-button type="primary" @click="submitForm(addRuleForm)">{{
            t('collector.confirm')
          }}</el-button>
        </div>
      </div>
    </elDialog1>

    <elDialog1
      :title="t('collector.customField') + ':'"
      v-if="isCustomField"
      v-model="isCustomField"
      class="gatherDialog"
      center
    >
      <customField
        @getRealTime="getRealTime"
        @getDevList="getDevList"
        @unsubscribeRealTime="unsubscribeRealTime"
        :signalsList="signalsList"
        :curAdapterId="curAdapterId"
      ></customField>
    </elDialog1>

    <el-drawer v-model="isEditField" :with-header="false" direction="rtl" class="gatherDrawer">
      <editField
        v-if="isEditField"
        v-model:isEditField="isEditField"
        :signalsList="signalsList"
        :detailData="detailData"
        @getRealTime="getRealTime"
        @reloadNC="reloadNC"
        :curAdapterId="curAdapterId"
      ></editField>
    </el-drawer>
    <el-drawer1
      :headerTitle="t('collector.lookToolLife')"
      v-model="toolLifeDrawer"
      direction="rtl"
      size="35%"
      :close-on-click-modal="false"
    >
      <toolLife
        :toolLifeData="toolLifeData"
        :toolLifeCloumn="toolLifeCloumn"
        :ch="ch"
        @close="toolLifeDrawer = false"
      ></toolLife>
    </el-drawer1>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount, inject, nextTick } from 'vue'
import customField from '../components/customField.vue'
import editField from '../components/editField.vue'
import headerDetail from '../components/headerDetail.vue'
import baseContaner from '@renderer/components/common/baseContaner.vue'
import toolLife from '../components/toolLife.vue'
import { basicInterface, toolLifeApi } from '@renderer/api/system/system'
import { _public } from '@renderer/utils/common'
import { ElMessage, ElLoading } from 'element-plus'
import { useRoute } from 'vue-router'
import { dccDevNcCheckRun } from '@renderer/utils/enum'
const route = useRoute()
const _worker = inject('_worker')
import { useSignalController } from '@renderer/hooks/useSignalController'
const { signal } = useSignalController()
import { useStoreSignal } from '@renderer/store/useSignals'
const storeSignal = useStoreSignal()
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const adapterIds = route.query.adapter_id

const refHeaderDetail = ref()

_worker.addEventListener(
  'message',
  res => {
    const { type, payload } = res.data
    switch (type) {
      // ------ 实时数据回调
      case 'realTimeCharData':
        // 找到当前实时数据推送的数据是哪个信号，替换对应信号的值
        // 后端设计如此，前端要取出来匹配很复杂...
        for (const i in signalsList.value) {
          for (const [key, value] of Object.entries(payload)) {
            if (signalsList.value[i][0].id === +key) {
              for (const [childKey, childValue] of Object.entries(value.metric)) {
                let val = ''
                switch (childValue.sig_id) {
                  // 设备运行状态从枚举中取出id对应的label并赋值
                  case 2:
                    val = dccDevNcCheckRun.find(d => d.id === childValue.val[0])?.label
                    signalsList.value[i][
                      findSigId(signalsList.value[i], childKey)
                    ].realTimeData.val[0] = val
                    break
                  // FEATURE 后续需要取枚举对应的label可以往下加
                  default:
                    signalsList.value[i][
                      findSigId(signalsList.value[i], childKey)
                    ].realTimeData.val[0] = childValue.val[0]
                    break
                }
              }
            }
          }
        }
        storeSignal.changeSignalList(signalsList.value)
        break
    }
  },
  { signal }
)

// 准备订阅实时数据
let signalsList = ref([]) // 信号列表
const getRealTime = async callback => {
  // ----------------- 获取采集器信号列表
  signalsList.value = []
  if (Array.isArray(storeSignal.signalEnumList) && storeSignal.signalEnumList.length > 0) {
    // 如果内存有采集器信号，直接获取
    signalsList.value = JSON.parse(sessionStorage.getItem('signalEnumList'))
  } else {
    // 获取信号详情（包括采集方式地址等等）
    const path_num = detailData.value.path_num || 1
    for (let i = 0; i < path_num; i++) {
      // 采集器id
      const tempId = pathNumList.value.filter(child => child.path_num === i + 1)[0].id

      const resSignalDetail = await basicInterface({
        version: '1.0',
        method: 'enum_collector_detail_signal_info',
        id: '68',
        params: {
          dev_id: parseInt(route.query.dev_id),
          adapter_id: parseInt(tempId)
        }
      })
      signalsList.value.push(resSignalDetail.data.result.signal_info_list)

      // 获取采集器信号信息枚举（一些比如中文是不会返回在详情接口的，需要从枚举中拿）
      const resMenu = await basicInterface({
        version: '1.0',
        method: 'enum_signals',
        id: '4',
        params: {}
      })

      const tempList = [
        ...resMenu.data.result.fixed_signals,
        ...resMenu.data.result.dynamic_signals
      ]

      // 格式化信号枚举（通过信号id -> 信号obj）
      for (const j in signalsList.value[i]) {
        signalsList.value[i][j] = {
          id: tempId,
          ...signalsList.value[i][j],
          ..._public.findObj(tempList, 'sig_id', signalsList.value[i][j].sig_id),
          // isChecked: 1,
          // isChecked: storeSignal.signalEnumList
          //   ? storeSignal.signalEnumList[i].filter(item => item.isChecked)[0]?.isChecked
          //   : 1,
          // machineDetail.value.enable_signal_id_list：已经采集的信号
          isChecked: machineDetail.value
            .find(v => v.adapter_id === tempId)
            .enable_signal_id_list.includes(signalsList.value[i][j].sig_id)
            ? 1
            : 0,
          // 初始化 - 为了v-model不报错
          realTimeData: {
            val: ['--']
          }
        }
      }
    }
    storeSignal.changeSignalList(signalsList.value)
    if (callback) {
      callback()
    }
  }

  // 开始订阅
  subscribeRealTime()
}

// 订阅实时数据
const subscribeRealTime = async () => {
  // ------------ 开始订阅数据
  for (const adapter_id of adapterIds) {
    await basicInterface({
      version: '1.0',
      method: 'subscribe_single_signal',
      id: '32',
      params: {
        dev_id: parseInt(route.query.dev_id),
        adapter_id: parseInt(adapter_id),
        sig_id_list: [],
        token: sessionStorage.getItem('token')
      }
    })
  }
  _worker.postMessage({
    type: 'startPushChartData',
    payload: {}
  })
}

// 改变信号勾选状态（是否采集）
const changeSignal = async item => {
  await basicInterface({
    version: '1.0',
    method: 'set_signal_enabled',
    id: '20',
    params: {
      dev_id: parseInt(route.query.dev_id),
      adapter_id: parseInt(item.id),
      sig_id: item.sig_id,
      enabled: item.isChecked
    }
  })

  // 更新缓存中的状态
  for (const val of storeSignal.signalEnumList) {
    if (val[0].id === item.id) {
      for (const child of val) {
        if (child.sig_id === item.sig_id) {
          child.isChecked = item.isChecked
          if (!item.isChecked) {
            // 因为可能刚取消勾选还会有数据在推，不会那么及时，所以加了计时器
            setTimeout(() => {
              child.realTimeData.val[0] = '--'
              storeSignal.changeSignalList(storeSignal.signalEnumList)
            }, 1500)
          } else {
            storeSignal.changeSignalList(storeSignal.signalEnumList)
          }
          break
        }
      }
      break
    }
  }

  await unsubscribeRealTime()
  subscribeRealTime()
}

// 详情数据
const detailData = ref({})
const getDetail = value => {
  detailData.value = value
  getDevList()
}

// 获取机床详情列表
const machineDetailList = ref([])
let machineDetail = ref([]) // 当前机床当前采集器数据
let pathNumList = ref([])
const getDevList = async callback => {
  const res = await basicInterface({
    version: '1.0',
    method: 'enum_dev_detail_info',
    id: '67',
    params: {}
  })
  machineDetailList.value = res.data.result.dev_info_list
  pathNumList.value = []
  machineDetail.value = []
  // 找出所有NC的通道
  for (const item of machineDetailList.value) {
    if (item.dev_info.dev_id === +route.query.dev_id) {
      for (const val of item.adapter_info_list) {
        const curAdapter = route.query.adapter_id.find(d => +d === val.adapter_info.id)
        if (curAdapter) {
          machineDetail.value.push({
            ...val,
            adapter_id: +curAdapter
          })
        }
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
  }

  detailData.value.path_num = pathNumList.value.length

  // 订阅实时数据
  getRealTime(callback)
}

const ruleForm = ref({
  addr_type: 1,
  sig_data_type: 0
})
const rules = reactive({
  name: [{ required: true, message: t('collector.inputName'), trigger: 'blur' }],
  addr_type: [{ required: true, message: t('collector.inputCollectWay'), trigger: 'change' }],
  addr: [{ required: true, message: t('collector.inputTargetAddress'), trigger: 'blur' }],
  sig_data_type: [{ required: true, message: t('collector.selectType'), trigger: 'change' }]
})

// ----------- 新增自定义采集字段
const isAddField = ref(false)
const addFieldFunc = item => {
  curAdapterId.value = item[0].id
  isAddField.value = true
  nextTick(() => {
    resetForm(addRuleForm.value, true)
  })
}

// 新增表单提交
const addRuleForm = ref()
const addResField = ref({})
const submitForm = async formEl => {
  await formEl.validate(async valid => {
    if (valid) {
      const res = await basicInterface({
        version: '1.0',
        method: 'add_dynamic_signal',
        id: '19',
        params: {
          dev_id: parseInt(route.query.dev_id),
          name: ruleForm.value.name,
          adapter_id: parseInt(curAdapterId.value),
          display_name: ruleForm.value.name,
          sig_type: 1,
          sig_freq_type: 0,
          sig_freq: 1000,
          sig_data_type: ruleForm.value.sig_data_type
        }
      })
      addResField.value = res.data.result.signal_define

      // 调完新增还需调用更新才算新增成功
      const resUpdate = await basicInterface({
        version: '1.0',
        method: 'set_signal_info',
        id: '21',
        params: {
          dev_id: parseInt(route.query.dev_id),
          adapter_id: parseInt(curAdapterId.value),
          signal_info: {
            sig_id: addResField.value.sig_id,
            addr_type: ruleForm.value.addr_type,
            addr: ruleForm.value.addr_type === 0 ? '' : ruleForm.value.addr,
            addr_len: 5
          }
        }
      })

      // 更新使能
      await basicInterface({
        version: '1.0',
        method: 'set_signal_enabled',
        id: '20',
        params: {
          dev_id: parseInt(route.query.dev_id),
          adapter_id: parseInt(curAdapterId.value),
          sig_id: res.data.result.signal_define.sig_id,
          enabled: 1
        }
      })

      ElMessage.success('操作成功！')
      resetForm(addRuleForm.value)
      for (const item of signalsList.value) {
        if (item[0].id === curAdapterId.value) {
          item.push({
            ...res.data.result.signal_define,
            ...resUpdate.data.result.signal_info,
            isChecked: 1,
            id: item[0].id,
            // 初始化 - 为了v-model不报错
            realTimeData: {
              val: ['--']
            }
          })
          break
        }
      }
      storeSignal.changeSignalList(signalsList.value)
      // getRealTime()
      isAddField.value = false
    }
  })
}

const curAdapterId = ref(route.query.adapter_id[0])

// ----------- 编辑字段采集地址
const isEditField = ref(false)
const editFieldFunc = item => {
  curAdapterId.value = item[0].id
  isEditField.value = true
}

// ----------- 自定义采集字段
const isCustomField = ref(false)
const customFieldFunc = item => {
  curAdapterId.value = item[0].id
  isCustomField.value = true
}

// 清空表单
const resetForm = async (formEl, close = false) => {
  if (!formEl) return
  formEl.resetFields()
  ruleForm.value = {
    addr_type: 1,
    sig_data_type: 0
  }
  isAddField.value = close
}

// 查看刀具寿命
const toolLifeDrawer = ref(false)
const toolLifeData = ref([])
const toolLifeCloumn = ref([])
const ch = ref(0)
const showToolLife = (item, i) => {
  curAdapterId.value = item[0].id
  ch.value = i
  getToolLifeData(i)
}

const loading = ref()
let timer = null
const setLoadingTime = () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    loading.value.close()
  }, 120000)
}

const getToolLifeData = async i => {
  try {
    setLoadingTime()
    loading.value = ElLoading.service({
      lock: true,
      text: 'Loading'
    })
    const res = await toolLifeApi({
      version: '1.0',
      method: 'collect_nc_tool_life_list',
      id: '528',
      params: {
        dev_id: +dev_id,
        nc_channel: i + 1
      }
    })
    toolLifeCloumn.value = []
    toolLifeData.value = []
    loading.value.close()
    if (res.data.result) {
      const header = res.data.result.toolnum_life_header
      const data = res.data.result.toolnum_life_info
      header.forEach((item, index) => {
        toolLifeCloumn.value.push({
          label: item,
          prop: `cloumn_${index}`,
          minWidth: _public.screenPx(150)
        })
      })
      data.forEach(item => {
        const obj = {}
        item.forEach((child, index) => {
          obj[`cloumn_${index}`] = child
        })
        toolLifeData.value.push(obj)
      })
      toolLifeDrawer.value = true
    }
  } catch (error) {
    console.log(error)
    loading.value.close()
  }
}

// 刷新NC实时信息指标
const reloadNC = async () => {
  await unsubscribeRealTime()
  storeSignal.changeSignalList(null)
  // 订阅实时数据
  getRealTime()
}

// 停止订阅实时数据
const dev_id = +route.query.dev_id
const unsubscribeRealTime = async () => {
  // 取消订阅实时数据
  for (const adapter_id of adapterIds) {
    await basicInterface({
      version: '1.0',
      method: 'unsubscribe_single_signal',
      id: '33',
      params: {
        dev_id: parseInt(dev_id),
        adapter_id: parseInt(adapter_id),
        token: sessionStorage.getItem('token')
      }
    })
  }
  // 退订实时数据
  _worker.postMessage({
    type: 'stopPushChartData',
    payload: {}
  })
}

// 找到当前的sigId对应的下标
const findSigId = (arr, sig_id) => {
  for (const i in arr) {
    if (arr[i].sig_id === +sig_id) {
      return i
    }
  }
}

onBeforeUnmount(() => {
  unsubscribeRealTime()
})
</script>

<style scoped lang="scss">
:deep(.UJ-drawer__body) {
  padding: 0;
}
:deep(.UJ-form-item__error) {
  font-size: 20px;
}

:deep(.UJ-popper) {
  z-index: 2012;
  position: absolute;
  inset: auto auto 0px 0px;
  transform: translate3d(1030px, -478.667px, 0px);
  padding: 3px 10px;
  border: 8px solid rgb(26, 29, 44);
  border-radius: 6px;
  font-size: 18px;
  box-shadow: #e1e2e6 0px 0px 5px;

  .UJ-popper__arrow {
    top: 30px;
  }
}

.axis-style {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 160px;
}

.afr-detail-wrap {
  .title {
    font-size: 24px;
    margin-bottom: 40px;
    color: white;
  }

  .operate-wrap {
    position: absolute;
    right: 30px;
    margin-top: -75px;

    img {
      margin-left: 20px;
      cursor: pointer;
      width: 50px;
    }
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
      text-indent: -12px;
      margin-top: -65px;
      color: black;
    }

    .con {
      margin-bottom: 20px;

      :deep(.UJ-input) {
        width: 300px;
      }
      :deep(.UJ-input__wrapper) {
        background: transparent;
      }

      .con-header {
        display: flex;
        align-items: center;
        width: 100%;
        padding-bottom: 30px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.5);

        & > div {
          color: white;
          font-size: 22px;

          .gather-type {
            display: inline-block;
            background: rgba(42, 227, 4, 0.2);
            border-radius: 20px;
            color: rgb(42, 227, 4);
            padding: 3px 15px;
          }

          .link-type {
            color: rgb(42, 227, 4);
          }
          .link-status {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-left: 7px;
            background: rgb(42, 227, 4);
            position: relative;
            top: -1px;
          }
        }
      }

      .item-layout {
        margin-top: 30px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-start;

        :deep(.UJ-form-item__content) {
          font-size: 22px;
        }
        :deep(.UJ-input__wrapper) {
          background: transparent;
        }
        :deep(.UJ-form-item) {
          align-items: center;
        }
      }

      :deep(.UJ-form-item) {
        .UJ-form-item__label {
          font-size: 22px;
          width: 110px;
        }
      }
    }
  }

  .con-check {
    font-size: 22px;
    color: white;
    display: flex;
    margin-top: -25px;

    :deep(.UJ-checkbox__label) {
      font-size: 20px;
    }
  }

  .con1 {
    display: flex;
    flex-wrap: wrap;

    .con-check-item {
      font-size: 20px;
      color: white;
      display: flex;
      align-items: center;
      margin-right: 20px;
      margin-bottom: 30px;

      :deep(.UJ-input) {
        width: 192px !important;
        margin-left: 10px;
      }
      :deep(.UJ-input__wrapper) {
        background: transparent;
      }
      & > span {
        position: absolute;
        margin-top: -60px;
        margin-left: 50px;
        background: rgb(26, 29, 44);
        z-index: 10;
        color: rgb(197, 197, 197);
      }
    }
  }

  .add-tool-wrap {
    padding-bottom: 60px;
    .tool-content {
      background: rgb(26, 29, 44);
      border-radius: 10px;
      padding: 40px 25px 20px 25px;
      font-size: 22px;
      line-height: 50px;

      :deep(.UJ-input__wrapper) {
        background: rgb(26, 29, 44);
        width: 430px;
      }

      :deep(.UJ-form-item) {
        flex-direction: column;
        justify-content: center;
        align-items: baseline;

        .UJ-form-item__label {
          text-align: left;
          margin-bottom: 15px;
        }
      }
    }

    .btn-operate {
      margin-top: 35px;
      margin-bottom: -30px;
      float: right;
    }
  }
}
:deep(.customDialog) {
  width: 530px;
}
:deep(.gatherDialog) {
  width: 1200px;
}
:deep(.gatherDrawer) {
  width: 900px !important;
}
</style>
