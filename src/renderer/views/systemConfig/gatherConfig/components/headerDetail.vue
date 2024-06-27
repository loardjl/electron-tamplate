<template>
  <baseContaner>
    <div class="title">{{ detailData.name }}{{ t('collector.detail') }}</div>
    <div class="content-wrap">
      <div style="color: white"></div>
      <div class="des">{{ t('collector.detail') }}</div>
      <div class="operate">
        <!-- 删除 -->
        <el-popover
          ref="popover"
          class="popover-wrap"
          placement="bottom"
          :width="450"
          trigger="click"
        >
          <template #reference>
            <img src="@renderer/assets/icons/svg/operator/del_full.svg" alt="" />
          </template>
          <div class="popover-content">
            <div class="title-wrap">
              <div class="title">
                <div></div>
                <div>{{ t('collector.tips') }}</div>
              </div>
              <img
                @click="closePopover"
                src="@renderer/assets/icons/svg/operator/close.svg"
                alt=""
              />
            </div>
            <div class="content">
              {{ t('decious.confirmDelete', { val: detailData.name }) }}
            </div>
            <div class="operate-btn">
              <el-button type="primary" size="default" plain @click="closePopover">{{
                t('collector.cancel')
              }}</el-button>
              <el-button
                @click="deleteDetail(detailData)"
                type="primary"
                size="default"
                style="background: red; border: none"
              >
                {{ t('collector.delete') }}
              </el-button>
            </div>
          </div>
        </el-popover>
        <img
          @click="editDetail(addRuleForm)"
          v-show="!isEdit"
          src="@renderer/assets/icons/svg/operator/yellow_edit_full.svg"
          alt=""
        />
        <img
          @click="editDetail(addRuleForm)"
          v-show="isEdit"
          src="@renderer/assets/icons/svg/operator/green_confirm_full.svg"
          alt=""
        />
      </div>
      <div class="con">
        <div class="con-header">
          <div class="header-item">
            {{ t('collector.adapterName') }}：<el-input
              :maxlength="20"
              :disabled="!isEdit"
              v-model="detailData.name"
            ></el-input>
          </div>
          <div class="header-item">
            {{ t('collector.adapterType') }}：
            <span class="gather-type">{{ detailData.collector_type_name }}</span>
          </div>
          <div class="header-item">
            {{ t('collector.status') }}：
            <span :class="detailData.connect_status ? 'link-type' : 'link-type-disabled'">{{
              detailData.connect_status_name
            }}</span>
            <span
              class="link-status"
              :class="detailData.connect_status ? '' : 'link-status-disabled'"
            ></span>
          </div>
          <div
            v-if="detailData.collector_type_name == 'AFR' && detailData.hardware_id != 505"
            class="header-item"
          >
            <img
              v-if="+controlStatus === 1"
              class="multiplying"
              src="@renderer/assets/images/png/headerDetail/open.png"
              alt=""
            />
            <img
              v-else
              class="multiplying"
              src="@renderer/assets/images/png/headerDetail/close.png"
              alt=""
            />
          </div>
          <div
            class="header-item magnification"
            v-if="detailData.collector_type_name == 'AFR' && detailData.hardware_id === 505"
          >
            <div>
              <span> 开关状态 </span>
              <el-switch
                active-value="1"
                inactive-value="0"
                v-model="switchvalue"
                @change="beforeChange(detailData, 'switch_enable')"
              />
            </div>
          </div>
          <div class="header-item magnification" v-if="detailData.collector_type_name == 'AFR'">
            <div>
              <span> 使用AFR倍率 </span>
              <el-switch
                active-value="1"
                inactive-value="0"
                v-model="afrvalue"
                @change="beforeChange(detailData, 'replace_switch')"
              />
            </div>
          </div>
          <el-popover
            placement="bottom-end"
            :width="420"
            trigger="click"
            ref="popoverRef"
            :visible="mannualSwitchShow"
          >
            <template #reference>
              <div
                class="header-item mr0 magnification"
                v-if="detailData.collector_type_name == 'AFR'"
              >
                <div @click="mannualSwitchShow = true" v-click-outside="onClickOutside">
                  <span> 允许人为干预 </span>
                  <img class="switch" src="@renderer/assets/icons/svg/common/switch.svg" alt="" />
                </div>
              </div>
            </template>
            <div class="popover-content2">
              <div class="left">
                <div class="subtitle">控制人为干预开关</div>
                <el-radio-group v-model="mannualSwitch">
                  <el-radio label="1">开启</el-radio>
                  <el-radio label="0">关闭</el-radio>
                </el-radio-group>
              </div>
              <div class="right" @click="beforeChange(detailData, 'mannual_switch')">发送命令</div>
            </div>
          </el-popover>
        </div>

        <el-form :model="detailData" ref="addRuleForm" :rules="rules" label-position="right">
          <div class="item-layout">
            <el-form-item :label="t('collector.deviceManufacturer') + ':'" prop="maker_id">
              <el-select v-model="detailData.maker_id" placeholder=" " disabled>
                <el-option
                  v-for="item in makerList"
                  :key="item.maker_id"
                  :label="item.display_name"
                  :value="item.maker_id"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              :label="t('collector.ipAdress') + ':'"
              prop="ip"
              v-if="
                ['NC', 'USV', 'UGD', '采集卡'].includes(props.type) && detailData.maker_id !== 10
              "
            >
              <el-input v-model="detailData.ip" :disabled="!isEdit"></el-input>
            </el-form-item>
            <el-form-item
              :label="t('collector.channelNum') + ':'"
              prop="path_num"
              v-if="['NC'].includes(props.type)"
            >
              <!-- <el-input v-model="detailData.path_num" :disabled="!isEdit"></el-input> -->
              <el-input v-model="detailData.path_num" disabled></el-input>
            </el-form-item>
            <el-form-item :label="t('collector.model') + ':'" prop="hardware_id">
              <el-select v-model="detailData.hardware_id" placeholder=" " disabled>
                <el-option
                  v-for="item in hardwareList"
                  :key="item.id"
                  :label="item.display_name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              :label="t('collector.port') + ':'"
              prop="port"
              v-if="
                ['NC', 'USV', 'UGD', '采集卡'].includes(props.type) && detailData.maker_id !== 10
              "
            >
              <el-input v-model="detailData.port" :disabled="!isEdit"></el-input>
            </el-form-item>
            <el-form-item
              :label="t('collector.sampleFrequency') + ':'"
              prop="freq"
              v-if="['NC'].includes(props.type)"
            >
              <el-input
                oninput="value = value.replace(/[^\d]/g,'')"
                v-model="detailData.freq"
                :disabled="!isEdit"
              ></el-input>
            </el-form-item>
            <el-form-item
              label="连接方式："
              prop="port"
              v-if="['USP'].includes(props.type) && detailData.hardware_id === 501"
            >
              <el-select v-model="connetWay" :disabled="!isEdit" placeholder=" ">
                <el-option label="串口连接" :value="0" />
                <el-option label="网口连接" :value="1" />
              </el-select>
            </el-form-item>
            <el-form-item
              :label="t('collector.ipAdress') + ':'"
              prop="ip"
              v-if="
                (['USP'].includes(props.type) &&
                  detailData.hardware_id === 501 &&
                  connetWay === 1) ||
                (['USP'].includes(props.type) && detailData.hardware_id === 502)
              "
            >
              <el-input v-model="detailData.ip" :disabled="!isEdit"></el-input>
            </el-form-item>
            <el-form-item
              :label="t('collector.port') + ':'"
              prop="port"
              v-if="
                (['USP'].includes(props.type) &&
                  detailData.hardware_id === 501 &&
                  connetWay === 1) ||
                (['USP'].includes(props.type) && detailData.hardware_id === 502)
              "
            >
              <el-input v-model="detailData.port" :disabled="!isEdit"></el-input>
            </el-form-item>
            <el-form-item
              label="Com Port:"
              prop="port"
              v-if="
                ['USP'].includes(props.type) && detailData.hardware_id === 501 && connetWay === 0
              "
            >
              <el-select v-model="detailData.port" :disabled="!isEdit" placeholder=" ">
                <el-option label="Com1" :value="1" />
                <el-option label="Com2" :value="2" />
                <el-option label="Com3" :value="3" />
                <el-option label="Com4" :value="4" />
                <el-option label="Com5" :value="5" />
                <el-option label="Com6" :value="6" />
                <el-option label="Com7" :value="7" />
                <el-option label="Com8" :value="8" />
                <el-option label="Com9" :value="9" />
                <el-option label="Com10" :value="10" />
                <el-option label="Com11" :value="11" />
              </el-select>
            </el-form-item>
            <el-form-item
              label="Com Port:"
              prop="port"
              v-if="['AFR'].includes(props.type) && detailData.hardware_id !== 505"
            >
              <el-select v-model="detailData.port" :disabled="!isEdit" placeholder=" ">
                <el-option label="Com1" :value="1" />
                <el-option label="Com2" :value="2" />
                <el-option label="Com3" :value="3" />
              </el-select>
            </el-form-item>
            <el-form-item
              :label="t('collector.bindChannel') + ':'"
              prop="path_num2"
              v-if="['AFR'].includes(props.type)"
            >
              <el-select v-model="detailData.path_num" placeholder=" " :disabled="!isEdit">
                <el-option
                  v-for="item in channelList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              :label="t('collector.gatherType') + ':'"
              prop="collect_type"
              v-if="['AFR'].includes(props.type)"
            >
              <el-select v-model="detailData.extra_param[0].value" placeholder=" " disabled>
                <el-option :label="t('collector.speedRate')" value="0" />
                <el-option :label="t('collector.FeedRate')" value="1" />
              </el-select>
            </el-form-item>
            <el-form-item
              :label="t('collector.controlAddress') + ':'"
              prop="ctrl_addr"
              class="form-constribe"
              v-if="['AFR'].includes(props.type) && detailData.hardware_id === 505"
            >
              <el-cascader
                :options="deciousNC"
                :placeholder="t('latheContent.pleaseSelect')"
                v-model="controlAddressCas"
                class="UJdecious-cascader"
                :disabled="!isEdit"
              >
              </el-cascader>
              <el-input
                :placeholder="t('latheContent.pleaseEnter')"
                v-model="controlAddress"
                class="UJdecious-input"
                :disabled="!isEdit"
              ></el-input>
            </el-form-item>
            <el-form-item
              :label="t('collector.onOffAddress') + ':'"
              prop="switch_addr"
              class="form-constribe"
              v-if="
                ['AFR'].includes(props.type) && detailData.hardware_id === 505 && showAddressInput
              "
            >
              <el-cascader
                :options="deciousAll"
                :placeholder="t('latheContent.pleaseSelect')"
                v-model="onOffAddressCas"
                class="UJdecious-cascader"
                :disabled="!isEdit"
                @change="handleCascaderChange"
              >
              </el-cascader>
              <el-input
                :placeholder="t('latheContent.pleaseEnter')"
                v-model="onOffAddress"
                class="UJdecious-input"
                :disabled="!isEdit"
              ></el-input>
            </el-form-item>
            <el-form-item
              :label="t('collector.onOffAddress') + ':'"
              prop="switch_addr"
              v-if="
                ['AFR'].includes(props.type) && detailData.hardware_id === 505 && !showAddressInput
              "
            >
              <el-cascader
                :options="deciousAll"
                :placeholder="t('latheContent.pleaseSelect')"
                v-model="onOffAddressCas"
                :disabled="!isEdit"
                @change="handleCascaderChange"
              >
              </el-cascader>
            </el-form-item>
            <el-form-item
              :label="t('collector.onOffDataResource') + ':'"
              prop="conditionsele2"
              v-if="['AFR'].includes(props.type) && detailData.hardware_id === 505"
            >
              <el-cascader
                :options="adapterSigList"
                :placeholder="t('latheContent.pleaseSelect')"
                v-model="onOffResourceCas"
                :disabled="!isEdit"
              >
              </el-cascader>
            </el-form-item>
            <el-form-item
              :label="t('collector.dataResource') + ':'"
              prop="conditionsele"
              v-if="['AFR'].includes(props.type) && detailData.hardware_id === 505"
            >
              <el-cascader
                :options="ncSigList"
                :placeholder="t('latheContent.pleaseSelect')"
                v-model="dataResourceCas"
                :disabled="!isEdit"
              >
              </el-cascader>
            </el-form-item>
            <el-form-item
              :label="t('collector.collectionFrequency') + ':'"
              prop="maker_id"
              v-if="['采集卡'].includes(props.type)"
            >
              <el-input
                oninput="value = value.replace(/[^\d]/g,'')"
                v-model="detailData.extra_param[1].value"
                disabled
              ></el-input>
            </el-form-item>
            <el-form-item
              :label="t('collector.acquisitionRange') + ':'"
              prop="maker_id"
              v-if="['采集卡'].includes(props.type)"
            >
              <el-select disabled v-model="detailData.extra_param[0].value" placeholder=" ">
                <el-option label="-5 ~ +5" value="1" />
                <el-option label="-10 ~ +10" value="0" />
              </el-select>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </div>
  </baseContaner>
</template>

<script setup>
import { ref, unref, onMounted, reactive } from 'vue'
import { ClickOutside as vClickOutside } from 'element-plus'
import baseContaner from '@renderer/components/common/baseContaner.vue'
import { ElMessage, ElLoading, ElPopover } from 'element-plus'
import { basicInterface } from '@renderer/api/system/system'
import { basicDecision } from '@renderer/api/system/decision'
import { adapterSigSelect } from '@renderer/api/system/nodeurl'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

const props = defineProps({
  // 采集器类型
  type: {
    type: String
  },
  pathNumList: {
    type: Array
  }
})

const connetWay = ref(1) // 连接方式

const emit = defineEmits(['getDetail'])
const tempPathNumList = ref()

onMounted(async () => {
  tempPathNumList.value = props.pathNumList
  await getAdapterSigList()
  await getEnum()
  await getListInfo()
  await getCollectorList()
})

const rules = reactive({
  collector_type_id: [
    { required: true, message: t('collector.selectAdapterName'), trigger: 'change' }
  ],
  maker_id: [
    {
      required: true,
      message: t('collector.selectDeviceManufacturer'),
      trigger: 'change'
    }
  ],
  hardware_id: [
    {
      required: true,
      message: t('collector.selectModel'),
      trigger: 'change'
    }
  ],
  port: [
    {
      required: true,
      message: t('collector.inputPort'),
      trigger: 'blur'
    },
    {
      pattern:
        /^([1-9](\d{0,3}))$|^([1-5]\d{4})$|^(6[0-4]\d{3})$|^(65[0-4]\d{2})$|^(655[0-2]\d)$|^(6553[0-5])$/,
      message: t('collector.portLimit'),
      trigger: 'blur'
    }
  ],
  ip: [
    {
      required: true,
      message: t('collector.inputIPAdress'),
      trigger: 'blur'
    },
    {
      // 此正则代表：X.X.X.X；X在0-255之间
      pattern:
        /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      message: t('collector.inputIPAdressLimit'),
      trigger: 'blur'
    }
  ],
  path_num: [
    {
      required: true,
      message: t('collector.inputChannel'),
      trigger: 'blur'
    },
    {
      pattern: /^[1-9]\d*$/,
      message: t('collector.inputPositiveInt'),
      trigger: 'blur'
    }
  ],
  freq: [
    {
      required: true,
      message: t('collector.inputSampleFrequency'),
      trigger: 'blur'
    },
    {
      pattern: /^[1-9]\d*(\.\d+)?$/,
      message: t('collector.inputInt'),
      trigger: 'blur'
    }
  ],
  collect_frequency: [
    {
      required: true,
      message: t('collector.inputCollectionFrequency'),
      trigger: 'blur'
    }
  ],
  full_scale: [
    {
      required: true,
      message: t('collector.selectAcquisitionRange'),
      trigger: 'change'
    }
  ]
})
const adaperId = Array.isArray(route.query.adapter_id)
  ? +route.query.adapter_id[0]
  : +route.query.adapter_id

// 获取控制状态
const controlStatus = ref('0')
const getControlStatus = async () => {
  try {
    const res = await basicInterface({
      version: '1.0',
      method: 'get_adapter_property',
      id: '59',
      params: {
        // 机床ID
        dev_id: parseInt(route.query.dev_id),
        // 采集器ID
        adapter_id: parseInt(detailData.value.id),
        // 属性名
        property_name: 'afr_rate_ctrl'
      }
    })
    console.log('getControlStatus', res)
    controlStatus.value = res.data.result.property_value
  } catch (e) {
    console.log(e)
  }
}

// 获取详情数据
let detailData = ref({
  extra_param: [{}]
})
const afrvalue = ref(0)
const switchvalue = ref(1)
let adapterInitName = '' // 采集器没修改前的名字
let pathNum = 0
const getDetail = async () => {
  const res = await basicInterface({
    version: '1.0',
    method: 'enum_adapters',
    id: '8',
    params: {
      dev_id: parseInt(route.query.dev_id)
    }
  })
  console.log(res.data.result.adapter_list)
  tempPathNumList.value = []
  detailData.value = res.data.result.adapter_list.filter(item => {
    if (item.collector_type_id === 1) {
      tempPathNumList.value.push(item)
    }
    return item.id === adaperId
  })[0]
  pathNum = tempPathNumList.value?.length
  detailData.value.path_num = pathNum
  adapterInitName = detailData.value.name

  if (detailData.value.collector_type_id !== 1) {
    tempPathNumList.value = []
  }

  if (props.type === 'AFR') {
    afrvalue.value = detailData.value.extra_param?.find(
      item => item.key === 'replace_switch'
    )?.value
    switchvalue.value = detailData.value.extra_param?.find(
      item => item.key === 'switch_enable'
    )?.value
    mannualSwitch.value = detailData.value.extra_param.find(d => d.key === 'mannual_switch').value
    await getControlStatus()
    if (detailData.value.hardware_id === 505) {
      setAFRDetail(detailData.value.extra_param)
    }
  }
  if (props.type === 'USP') {
    connetWay.value = +detailData.value?.extra_param?.find(
      item => item.key === 'usp900_connection_type'
    )?.value
  }

  // 获取采集器状态
  const resStatus = await basicInterface({
    version: '1.0',
    method: 'get_adapter_status',
    id: '46',
    params: {
      dev_id: parseInt(route.query.dev_id),
      adapter_id: +adaperId
    }
  })
  detailData.value = {
    ...detailData.value,
    connect_status: resStatus.data.result.connect_status,
    connect_status_name: resStatus.data.result.connect_status ? '已连接' : '未连接',
    collector_type_name: collectorList.value.filter(
      val => val.type_id === detailData.value.collector_type_id
    )[0].name
  }
  emit('getDetail', detailData.value)
}
const beforeChange = async (val, name) => {
  let value
  if (name === 'switch_enable') {
    value = switchvalue.value
  } else if (name === 'replace_switch') {
    value = afrvalue.value
  } else if (name === 'mannual_switch') {
    value = mannualSwitch.value
  }
  try {
    await basicInterface({
      version: '1.0',
      method: 'set_adapter_extra_param',
      id: '108',
      params: {
        dev_id: +route.query.dev_id,
        adapter_id: +val.id,
        extra_param_name: name,
        extra_param_value: value
      }
    })
    if (name === 'mannual_switch') {
      const msg = `允许人为干预开关，已${+mannualSwitch.value === 1 ? '开启' : '关闭'}！`
      ElMessage.success(msg)
      mannualSwitchShow.value = false
    }
  } catch (error) {
    if (name === 'mannual_switch') {
      const msg = `允许人为干预开关，${+mannualSwitch.value === 1 ? '开启' : '关闭'}失败！`
      ElMessage.error(msg)
    }
  }
}

// AFR 允许人为干预
const mannualSwitch = ref('0')
const mannualSwitchShow = ref(false)
const popoverRef = ref()
const onClickOutside = e => {
  if (mannualSwitchShow.value && !unref(popoverRef).popperRef?.contentRef.contains(e.target)) {
    mannualSwitchShow.value = false
  }
}

// 编辑
const isEdit = ref(false)
const addRuleForm = ref()
const editDetail = async formEl => {
  if (!detailData.value.name) {
    ElMessage.error(t('collector.inputAdapterName'))
    return
  }

  if (detailData.value.name.length > 20) {
    ElMessage.error(t('collector.adapterNameLimit10'))
    return
  }

  // 判断采集器名称有没有重复
  const res = await basicInterface({
    version: '1.0',
    method: 'enum_adapters',
    id: '8',
    params: {
      dev_id: parseInt(route.query.dev_id)
    }
  })
  for (const val of res.data.result.adapter_list) {
    if (val.name === detailData.value.name && adapterInitName !== detailData.value.name) {
      ElMessage.error(t('collector.NameLimit'))
      return
    }
  }

  if (!isEdit.value) {
    isEdit.value = !isEdit.value
    return
  }

  if (!formEl) return

  // eslint-disable-next-line complexity
  await formEl.validate(async valid => {
    if (valid) {
      if (props.type === 'AFR' && detailData.value.hardware_id === 505) {
        if (!controlAddress.value) {
          ElMessage.error('请输入控制地址！')
          return
        }
        if (!onOffAddressCas.value || (onOffAddressCas.value[0] === 1 && !onOffAddress.value)) {
          ElMessage.error('请输入开关地址！')
          return
        }
      }
      isEdit.value = !isEdit.value
      if (!isEdit.value) {
        let addTimes = 0 // 需要调用几次新增接口
        let editTimes = 1 // 调用几次编辑接口
        let deleteTimes = 0 // 调用几次删除接口
        pathNum = tempPathNumList.value?.length
        if (detailData.value.collector_type_name === 'NC') {
          // 如果通道数比如 3 -> 5, 那么需要调用3遍编辑，2遍新增
          // 如果通道数比如 5 -> 3, 那么需要调用2遍删除
          if (pathNum > detailData.value.path_num) {
            // 减少了通道数
            deleteTimes = pathNum - detailData.value.path_num
            editTimes = pathNum - deleteTimes
          } else if (pathNum < detailData.value.path_num) {
            // 增加了通道数
            addTimes = detailData.value.path_num - pathNum
            editTimes = pathNum + addTimes
          }
        }

        // 编辑接口
        let temp_extra_param = []
        if (props.type === 'AFR') {
          if (detailData.value.hardware_id !== 505) {
            temp_extra_param = [
              {
                key: 'collect_type',
                value: detailData.value.extra_param[0].value
              }
            ]
          } else {
            temp_extra_param = [
              {
                key: 'collect_type',
                value: detailData.value.extra_param[0].value
              },
              {
                key: 'ctrl_addr_adapter_id',
                value: controlAddressCas.value[1] + ''
              },
              {
                key: 'ctrl_addr_type',
                value: controlAddressCas.value[2] + ''
              },
              {
                key: 'ctrl_addr',
                value: controlAddress.value + ''
              },
              {
                key: 'switch_ctrl_type',
                value: onOffAddressCas.value[0] + ''
              },
              {
                key: 'switch_addr_adapter_id',
                value: onOffAddressCas.value[1] + ''
              },
              {
                key: 'switch_addr_type',
                value: onOffAddressCas.value[2] + ''
              },
              {
                key: 'switch_addr',
                value: onOffAddress.value + ''
              },
              {
                key: 'switch_source_is_nc',
                value: !onOffResourceCas.value
                  ? '-1'
                  : onOffResourceCas.value[0] === 'nc'
                  ? '1'
                  : '0'
              },
              {
                key: 'switch_source_adapter_id',
                value: onOffResourceCas.value[1] + ''
              },
              {
                key: 'switch_source_sig_id',
                value: onOffResourceCas.value[2] + ''
              },
              {
                key: 'data_source_adapter_id',
                value: dataResourceCas.value ? dataResourceCas.value[1] + '' : '0'
              },
              {
                key: 'data_source_signal_id',
                value: dataResourceCas.value ? dataResourceCas.value[2] + '' : '0'
              },
              {
                key: 'mannual_switch',
                value: mannualSwitch.value
              }
            ]
          }
        } else if (props.type === '采集卡') {
          temp_extra_param = [
            {
              key: 'full_scale',
              value: detailData.value.extra_param[0].value
            },
            {
              key: 'collect_frequency',
              value: detailData.value.extra_param[1].value
            }
          ]
        } else if (props.type === 'USP') {
          temp_extra_param = [
            {
              key: 'usp900_connection_type',
              value: connetWay.value + ''
            }
          ]
        }

        ElMessage.warning('正在连接...')
        for (let i = 0; i < editTimes; i++) {
          await basicInterface({
            version: '1.0',
            method: 'update_adapter',
            id: '15',
            params: {
              dev_id: parseInt(route.query.dev_id),
              adapter_info: {
                id: tempPathNumList.value?.[i]?.id || parseInt(adaperId),
                collector_type_id: parseInt(detailData.value.collector_type_id),
                collect_freq: detailData.value.collector_type_name === 'USV' ? 4000 : 1000,
                maker_id: parseInt(detailData.value.maker_id) || 0,
                hardware_id: parseInt(detailData.value.hardware_id) || 0,
                path_num: i + 1,
                name: detailData.value.name || '',
                ip: detailData.value.ip || '',
                port: parseInt(detailData.value.port) || 0,
                freq: parseInt(detailData.value.freq) || 10,
                adapter_type: detailData.value.collector_type_name,
                extra_param: temp_extra_param
              }
            }
          })
          // 编辑后需要重连
          const loading = ElLoading.service({
            lock: true,
            text: t('collector.connectStatusList'),
            background: 'rgba(0, 0, 0, 0.7)'
          })
          try {
            await basicInterface({
              version: '1.0',
              method: 'adapter_connect',
              id: '52',
              params: {
                dev_id: parseInt(route.query.dev_id),
                adapter_id: tempPathNumList.value?.[i]?.id || parseInt(adaperId)
              }
            })
            ElMessage.success(t('collector.connectSuccess'))
          } catch {
            loading.close()
            ElMessage.error(t('collector.connectFail'))
          }
          loading.close()
        }
        ElMessage.success(t('collector.editSuccess'))
        getDetail()
      }
    }
  })
}

// 删除
const deleteDetail = async () => {
  if (detailData.value.collector_type_id === 1) {
    // 代表是 NC，需要把所有的NC采集器一并删除
    for (const val of tempPathNumList.value) {
      await basicInterface({
        version: '1.0',
        method: 'delete_adapter',
        id: '16',
        params: {
          dev_id: parseInt(route.query.dev_id),
          adapter_id: val.id
        }
      })
    }
  } else {
    await basicInterface({
      version: '1.0',
      method: 'delete_adapter',
      id: '16',
      params: {
        dev_id: parseInt(route.query.dev_id),
        adapter_id: detailData.value.id
      }
    })
  }
  closePopover()
  router.push({
    path: '/system/gatherConfig'
  })
}
// ------------ popover 弹窗相关
const popover = ref(null)
const closePopover = () => {
  popover.value.hide()
}

// 获取采集器类型
let collectorList = ref([])
const getCollectorList = async () => {
  const res = await basicInterface({
    version: '1.0',
    method: 'enum_collector_type',
    id: '5',
    params: {}
  })
  collectorList.value = res.data.result.collector_type_list
  await getDetail()
  // 找出id对应数据
  for (const i in collectorList.value) {
    if (collectorList.value[i].type_id === detailData.value.collector_type_id) {
      getMakerList(i)
      break
    }
  }
}

// 获取厂商
const makerList = ref([])
const getMakerList = async index => {
  const res = await basicInterface({
    version: '1.0',
    method: 'enum_maker',
    id: '6',
    params: {
      // 采集器类型ID
      collector_type_id: collectorList.value[index].type_id
    }
  })
  makerList.value = res.data.result.maker_list
  getHardwareList(index)
}

// 获取型号
const hardwareList = ref([])
const getHardwareList = async index => {
  const res = await basicInterface({
    version: '1.0',
    method: 'enum_hardware',
    id: '7',
    params: {
      // 采集器类型ID
      collector_type_id: collectorList.value[index].type_id,
      // 厂商ID
      maker_id: detailData.value.maker_id
    }
  })
  hardwareList.value = res.data.result.hardware_list
}

// 获取信号三级下拉列表
const adapterSigList = ref([]) // 所有信号列表
const ncSigList = ref([]) // NC信号列表
const getAdapterSigList = async () => {
  const res = await adapterSigSelect({ devId: parseInt(route.query.dev_id) })
  adapterSigList.value = res.data
  ncSigList.value = res.data?.filter(item => item.value === 'nc')
}

// ------------ 获取枚举字典
const enumDict = ref()
const getEnum = async () => {
  const res = await basicDecision({
    version: '1.0',
    method: 'enum_dict',
    id: '2',
    params: {}
  })
  enumDict.value = res.data.result
}

// ------------ 查询反控数据字典
const deciousInfo = ref()
const getListInfo = async () => {
  const res = await basicDecision({
    version: '1.0',
    method: 'enum_dev_ctrl_device_info',
    id: '3',
    params: {
      dev_id: parseInt(route.query.dev_id)
    }
  })
  deciousInfo.value = res.data.result
  setDeciousNC()
  setDeciousOnOff()
}

// 设置n控制地址及开关地址下拉项
const deciousNC = ref([
  {
    label: 'NC',
    value: 'nc',
    children: []
  }
]) // 控制地址及开关地址下拉项
const channelList = ref([]) // 通道下拉项
const setDeciousNC = () => {
  console.log(deciousInfo.value)
  const list = []
  const list2 = []
  for (const val of deciousInfo.value.dev_nc_decision_base_info_list) {
    const option = {
      label: t('decious.channel') + val.channel_num,
      value: val.channel_nc_adapter_id
    }
    list.push({
      ...option,
      children: [
        {
          label: t('decious.macroVariables'),
          value: 1
        },
        {
          label: 'PMC',
          value: 0
        }
      ]
    })
    list2.push({ ...option })
  }
  deciousNC.value[0].children = list
  channelList.value = list2
}

// ---------------- 反控地址级联选择器数据组装
const deciousAll = ref([])
const setDeciousOnOff = () => {
  const onOffNC = []
  const onOffDO = []
  const onOffList = enumDict.value?.remark_list[0].lookup_list?.filter(
    item => item.name.indexOf('AFR') < 0
  )
  console.log(onOffList)
  for (const val of deciousInfo.value.dev_nc_decision_base_info_list) {
    onOffNC.push({
      label: t('decious.channel') + val.channel_num,
      value: val.channel_nc_adapter_id,
      children: [
        {
          label: t('decious.macroVariables'),
          value: 1
        },
        {
          label: 'PMC',
          value: 0
        }
      ]
    })
  }
  for (const val of deciousInfo.value.dev_collector_base_info_list) {
    let do_base_info_list = []
    if (val.hardware_id === 501) {
      // 代表是usp
      do_base_info_list = [
        {
          label: val.do_base_info_list[0].display_name,
          value: val.do_base_info_list[0].name
        }
      ]
    } else {
      do_base_info_list = val.do_base_info_list.map(item => {
        return {
          label: item.display_name,
          value: item.name
        }
      })
    }
    onOffDO.push({
      label: val.adapter_name,
      value: val.adapter_id,
      children: do_base_info_list
    })
  }
  deciousAll.value = onOffList.map(item => {
    const obj = {
      label: item.name,
      value: item.code
    }
    if (item.name.indexOf('NC') > -1) {
      obj.children = onOffNC
    }
    if (item.name.indexOf('DO') > -1) {
      obj.children = onOffDO
    }
    return obj
  })
  console.log(deciousAll.value)
}

const showAddressInput = ref(true) // 是否展示开关地址输入值
const handleCascaderChange = val => {
  if (val && val[0] !== 1) {
    onOffAddress.value = ''
    showAddressInput.value = false
  } else {
    showAddressInput.value = true
  }
}

const controlAddressCas = ref([]) // 控制地址
const onOffAddressCas = ref([]) // 开关地址
const onOffResourceCas = ref([]) // 开关数据源地址
const dataResourceCas = ref([]) // 数据来源
const controlAddress = ref('') // 控制地址输入值
const onOffAddress = ref('') // 开关地址输入值
const setAFRDetail = list => {
  console.log('===========list', list)
  const ctrl_addr_adapter_id = list.find(item => item.key === 'ctrl_addr_adapter_id')?.value
  const ctrl_addr_type = list.find(item => item.key === 'ctrl_addr_type')?.value
  const switch_ctrl_type = list.find(item => item.key === 'switch_ctrl_type')?.value
  const switch_addr_adapter_id = list.find(item => item.key === 'switch_addr_adapter_id')?.value
  const switch_addr_type = list.find(item => item.key === 'switch_addr_type')?.value
  const switch_source_is_nc = list.find(item => item.key === 'switch_source_is_nc')?.value
  const switch_source_adapter_id = list.find(item => item.key === 'switch_source_adapter_id')?.value
  const switch_source_sig_id = list.find(item => item.key === 'switch_source_sig_id')?.value
  const data_source_adapter_id = list.find(item => item.key === 'data_source_adapter_id')?.value
  const data_source_signal_id = list.find(item => item.key === 'data_source_signal_id')?.value
  controlAddressCas.value = getConditionList({
    is_nc: 1,
    adapter_id: +ctrl_addr_adapter_id,
    signal_id: +ctrl_addr_type
  })
  onOffAddressCas.value = [+switch_ctrl_type, +switch_addr_adapter_id, +switch_addr_type]
  onOffResourceCas.value = getAllConditionList({
    is_nc: +switch_source_is_nc,
    adapter_id: +switch_source_adapter_id,
    signal_id: +switch_source_sig_id
  })
  dataResourceCas.value = getConditionList({
    is_nc: 1,
    adapter_id: +data_source_adapter_id,
    signal_id: +data_source_signal_id
  })
  controlAddress.value = list.find(item => item.key === 'ctrl_addr')?.value
  onOffAddress.value = list.find(item => item.key === 'switch_addr')?.value
  showAddressInput.value = +switch_ctrl_type === 1 ? true : false
}

const getAllConditionList = item => {
  console.log(adapterSigList.value)
  let arr = []
  if (item.is_nc === -1) {
    return arr
  }
  if (item.is_nc === 1) {
    arr = ['nc', item.adapter_id, item.signal_id]
  } else {
    const other = adapterSigList.value.filter(d => d.value !== 'nc')
    let axis = ''
    for (const d of other) {
      if (d.children.find(k => k.value === item.adapter_id)) {
        axis = d.value
        break
      }
    }
    arr = [axis, item.adapter_id, item.signal_id]
  }
  return arr
}
// 三级菜单拼接
const getConditionList = item => {
  let arr = []
  if (item.is_nc === -1) {
    return arr
  }
  if (item.is_nc === 1) {
    arr = ['nc', item.adapter_id, item.signal_id]
  } else {
    const other = deciousNC.value.filter(d => d.value !== 'nc')
    let axis = ''
    for (const d of other) {
      if (d.children.find(k => k.value === item.adapter_id)) {
        axis = d.value
        break
      }
    }
    arr = [axis, item.adapter_id, item.signal_id]
  }
  return arr
}

defineExpose({
  detailData
})
</script>

<style scoped lang="scss">
.title {
  font-size: 24px;
  margin-bottom: 40px;
  color: white;
}

.multiplying {
  width: 213px;
  height: 44px;
}

.operate-wrap {
  position: absolute;
  right: 30px;
  margin-top: -75px;

  img {
    margin-left: 20px;
    cursor: pointer;
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

  .operate {
    position: absolute;
    right: 50px;
    margin-top: -75px;

    img {
      width: 50px;
      margin-left: 20px;
      cursor: pointer;
    }
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
      flex-wrap: wrap;
      width: 100%;
      padding-bottom: 30px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.5);
      .header-item {
        margin: 0 16px 16px 0;
        &.mr0 {
          margin-right: 0;
        }
        :deep(.UJ-input) {
          width: 180px;
        }
      }
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
        .link-type-disabled {
          color: rgb(155, 155, 155);
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
        .link-status-disabled {
          background: rgb(155, 155, 155);
        }
      }
      .magnification {
        cursor: pointer;
        div {
          height: 44px;
          line-height: 44px;
          font-size: 18px;
          background-color: rgb(59, 61, 76);
          padding: 0 16px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          span {
            margin-right: 10px;
          }
        }
      }
      .switch {
        width: 18px;
        height: 18px;
      }
    }
    .magnification {
      padding-bottom: 8px;
      div {
        font-size: 18px;
        background-color: rgb(59, 61, 76);
        padding: 3px 10px 3px 19px;
        border-radius: 10px;
        // display: flex;
        // align-items: center;
        // justify-content: center;
        span {
          margin-right: 10px;
        }
      }
    }

    .item-layout {
      margin-top: 30px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      // justify-content: space-between;
      // display: grid;
      // grid-template-columns: repeat(3, 400px);
      // grid-gap: 30px 0px;

      & > div {
        width: 33%;
      }

      :deep(.UJ-form-item) {
        .UJ-form-item__label {
          font-size: 22px;
          min-width: 150px;
        }
      }
      :deep(.UJ-form-item__content) {
        font-size: 22px;
      }

      :deep(.UJ-input__wrapper) {
        background: transparent;
        width: 20px;
      }
      :deep(.UJ-input__wrapper) {
        width: 20px;
      }
      :deep(.UJ-form-item) {
        align-items: center;
      }
      .form-constribe {
        :deep(.UJ-form-item__content) {
          display: flex;
          flex-wrap: inherit;
          .UJdecious-cascader {
            width: 250px;
            margin-right: 10px;
          }
          .UJdecious-input {
            width: 140px;
          }
        }
      }
    }
  }
}
:deep(.content-wrap .con[data-v-bd6047c2] .UJ-input) {
  width: 220px;
}
// 人为干预开关
.popover-content2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px;
  background: #1a1d2c;
  box-shadow: 0 18px 30px 0 rgba(112, 144, 176, 0.12);
  padding: 24px !important;
  font-size: 22px;
  .left {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .subtitle {
      font-size: 24px;
      color: #9b9b9b;
    }
    :deep(.UJ-radio__label) {
      font-size: 22px;
    }
  }
  .right {
    height: 68px;
    line-height: 68px;
    padding-left: 24px;
    border-left: 1px solid rgba(255, 255, 255, 0.31);
    color: #41b4cf;
    cursor: pointer;
  }
}
</style>
