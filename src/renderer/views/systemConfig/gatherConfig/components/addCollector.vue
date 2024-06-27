<template>
  <div class="add-collector-wrap">
    <div class="collect-back">
      <el-form :model="ruleForm" ref="addRuleForm" :rules="rules">
        <el-form-item :label="t('collector.adapterType') + '：'">
          <div class="tab-wrap">
            <div
              v-for="item in collectorList"
              :key="item.type_id"
              @click="tabChange(item.name, item.type_id)"
              :class="tabName == item.name ? 'tab-active' : ''"
            >
              {{ item.name }}
            </div>
          </div>
        </el-form-item>
        <div class="item-layout">
          <el-form-item :label="t('collector.adapterName') + '：'" prop="name">
            <el-input :maxlength="20" v-model="ruleForm.name"></el-input>
          </el-form-item>
          <el-form-item :label="t('collector.deviceManufacturer') + '：'" prop="maker_id">
            <el-select
              @change="getHardwareList"
              v-model="ruleForm.maker_id"
              placeholder=" "
              :disabled="['USP', 'USV', 'AFR'].includes(tabName)"
            >
              <el-option
                v-for="item in makerList"
                :key="item.maker_id"
                :label="item.display_name"
                :value="item.maker_id"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="t('collector.model') + '：'" prop="hardware_id">
            <el-select
              v-model="ruleForm.hardware_id"
              placeholder=" "
              @change="handleHardwareIdChange"
            >
              <el-option
                v-for="item in hardwareList"
                :key="item.id"
                :label="item.display_name"
                :value="item.id"
              />
              <!-- 先测试用，后续删除 -->
              <!-- <el-option key="afrvir" label="虚拟AFR" :value="505" v-if="['AFR'].includes(tabName)" /> -->
            </el-select>
          </el-form-item>
          <el-form-item
            :label="t('collector.ipAdress') + '：'"
            prop="ip"
            v-if="['NC', 'USV', '采集卡'].includes(tabName) && ruleForm.maker_id !== 10"
          >
            <el-input v-model="ruleForm.ip"></el-input>
          </el-form-item>
          <el-form-item
            :label="t('collector.port') + '：'"
            prop="port"
            v-if="['NC', 'USV', '采集卡'].includes(tabName) && ruleForm.maker_id !== 10"
          >
            <el-input v-model="ruleForm.port"></el-input>
          </el-form-item>
          <el-form-item
            :label="t('collector.protocol')"
            prop="protocol"
            v-if="fieldsCanShow([2, 3, 4])"
          >
            <el-select v-model="ruleForm.protocol" @change="changeProtocol">
              <el-option
                v-for="item in protocolOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="machine_id" prop="rpc_machine_id" v-if="fieldsCanShow(2, 'rpc')">
            <el-input v-model="ruleForm.rpc_machine_id"></el-input>
          </el-form-item>
          <el-form-item label="machine_port" prop="rpc_machine_port" v-if="fieldsCanShow(2, 'rpc')">
            <el-input v-model="ruleForm.rpc_machine_port"></el-input>
          </el-form-item>
          <el-form-item label="host_id" prop="rpc_host_id" v-if="fieldsCanShow(2, 'rpc')">
            <el-input v-model="ruleForm.rpc_host_id"></el-input>
          </el-form-item>
          <el-form-item label="host_port" prop="rpc_host_port" v-if="fieldsCanShow(2, 'rpc')">
            <el-input v-model="ruleForm.rpc_host_port"></el-input>
          </el-form-item>
          <el-form-item
            :label="t('collector.userName')"
            prop="opcua_user_name"
            v-if="fieldsCanShow(2, 'opc-ua')"
          >
            <el-input v-model="ruleForm.opcua_user_name"></el-input>
          </el-form-item>
          <el-form-item
            :label="t('collector.password')"
            prop="opcua_password"
            v-if="fieldsCanShow(2, 'opc-ua')"
          >
            <el-input v-model="ruleForm.opcua_password" type="password"></el-input>
          </el-form-item>
          <el-form-item
            :label="t('collector.serverName')"
            prop="opcda_server_name"
            v-if="fieldsCanShow(2, 'opc-da')"
          >
            <el-input v-model="ruleForm.opcda_server_name"></el-input>
          </el-form-item>
          <el-form-item
            :label="t('collector.pmcControlType')"
            prop="s7_ctrl_type"
            v-if="fieldsCanShow(2, 's7')"
          >
            <el-select v-model="ruleForm.s7_ctrl_type">
              <el-option
                v-for="item in pmcTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            :label="t('collector.ezSocketOpenDeviceType')"
            prop="mitsubishi_machine_id"
            v-if="fieldsCanShow(3, 'ezsocket')"
          >
            <el-input v-model="ruleForm.mitsubishi_machine_id"></el-input>
          </el-form-item>
          <el-form-item
            :label="t('collector.channelNum') + '：'"
            prop="path_num"
            v-if="['NC'].includes(tabName)"
          >
            <el-input v-model="ruleForm.path_num"></el-input>
          </el-form-item>
          <!-- prop="name === 'NC' ? 'freq' : ''" -->
          <el-form-item
            :label="t('collector.sampleFrequency') + '：'"
            prop="freq"
            v-if="['NC'].includes(tabName)"
          >
            <el-input
              oninput="value = value.replace(/[^\d]/g,'')"
              v-model="ruleForm.freq"
            ></el-input>
          </el-form-item>
          <el-form-item
            :label="t('collector.connectionMethod') + '：'"
            prop="port"
            v-if="['USP'].includes(tabName) && ruleForm.hardware_id === 501"
          >
            <el-select v-model="usp900_connection_type" placeholder=" ">
              <el-option :label="t('collector.serialConnection')" :value="0" />
              <el-option :label="t('collector.networkPortConnection')" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item
            label="Com Port："
            prop="port"
            v-if="
              ['USP'].includes(tabName) &&
              ruleForm.hardware_id === 501 &&
              usp900_connection_type === 0
            "
          >
            <el-select v-model="ruleForm.port">
              <el-option
                v-for="item in comList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            :label="t('collector.ipAdress') + '：'"
            prop="ip"
            v-if="
              (['USP'].includes(tabName) &&
                ruleForm.hardware_id === 501 &&
                usp900_connection_type === 1) ||
              (['USP'].includes(tabName) && ruleForm.hardware_id === 502)
            "
          >
            <el-input v-model="ruleForm.ip"></el-input>
          </el-form-item>
          <el-form-item
            :label="t('collector.port') + '：'"
            prop="port"
            v-if="
              (['USP'].includes(tabName) &&
                ruleForm.hardware_id === 501 &&
                usp900_connection_type === 1) ||
              (['USP'].includes(tabName) && ruleForm.hardware_id === 502)
            "
          >
            <el-input v-model="ruleForm.port"></el-input>
          </el-form-item>
          <el-form-item
            label="Com Port："
            prop="port"
            v-if="['AFR'].includes(tabName) && ruleForm.hardware_id !== 505"
          >
            <el-select v-model="ruleForm.port" placeholder=" ">
              <el-option label="Com1" value="1" />
              <el-option label="Com2" value="2" />
              <el-option label="Com3" value="3" />
            </el-select>
          </el-form-item>
          <!-- 0614 -->
          <el-form-item
            :label="t('collector.dataResource') + '：'"
            prop="conditionsele"
            v-if="['AFR'].includes(tabName) && ruleForm.hardware_id === 505"
          >
            <el-cascader v-model="ruleForm.conditionsele" :options="ncSigList" />
          </el-form-item>
          <el-form-item
            :label="t('collector.controlAddress') + '：'"
            prop="ctrl_addr"
            class="form-constribe"
            v-if="['AFR'].includes(tabName) && ruleForm.hardware_id === 505"
          >
            <el-cascader
              :options="deciousNC"
              :placeholder="t('latheContent.pleaseSelect')"
              v-model="ruleForm.ctrl_addr_type"
              class="UJdecious-cascader"
            >
            </el-cascader>
            <el-input
              :placeholder="t('latheContent.pleaseEnter')"
              v-model="ruleForm.ctrl_addr"
              class="UJdecious-input"
            ></el-input>
          </el-form-item>
          <el-form-item
            :label="t('collector.onOffAddress') + '：'"
            prop="switch_addr"
            class="form-constribe"
            v-if="['AFR'].includes(tabName) && ruleForm.hardware_id === 505 && showAddressInput"
          >
            <el-cascader
              :options="deciousAll"
              :placeholder="t('latheContent.pleaseSelect')"
              v-model="ruleForm.switch_addr_type"
              class="UJdecious-cascader"
              @change="handleCascaderChange"
            >
            </el-cascader>
            <el-input
              :placeholder="t('latheContent.pleaseEnter')"
              v-model="ruleForm.switch_addr"
              class="UJdecious-input"
            ></el-input>
          </el-form-item>
          <el-form-item
            :label="t('collector.onOffAddress') + '：'"
            prop="switch_addr_type"
            v-if="['AFR'].includes(tabName) && ruleForm.hardware_id === 505 && !showAddressInput"
          >
            <el-cascader
              :options="deciousAll"
              :placeholder="t('latheContent.pleaseSelect')"
              v-model="ruleForm.switch_addr_type"
              @change="handleCascaderChange"
            >
            </el-cascader>
          </el-form-item>
          <el-form-item
            :label="t('collector.onOffDataResource') + '：'"
            prop="conditionsele"
            v-if="['AFR'].includes(tabName) && ruleForm.hardware_id === 505"
          >
            <el-cascader v-model="ruleForm.conditionsele2" :options="adapterSigList" />
          </el-form-item>
          <el-form-item
            :label="t('collector.bindChannel') + '：'"
            prop="path_num2"
            v-if="['AFR'].includes(tabName)"
          >
            <el-select v-model="ruleForm.path_num2" placeholder=" ">
              <el-option
                v-for="item in channelList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            :label="t('collector.gatherType') + '：'"
            prop="collect_type"
            v-if="['AFR'].includes(tabName)"
          >
            <el-select
              v-model="ruleForm.collect_type"
              placeholder=" "
              :disabled="ruleForm.hardware_id === 505"
            >
              <el-option :label="t('collector.speedRate')" value="0" />
              <el-option :label="t('collector.FeedRate')" value="1" />
            </el-select>
          </el-form-item>
          <el-form-item
            :label="t('collector.collectionFrequency') + '：'"
            prop="collect_frequency"
            v-if="['采集卡'].includes(tabName) && ruleForm.hardware_id != 1102"
          >
            <el-input
              oninput="value = value.replace(/[^\d]/g,'')"
              v-model="ruleForm.collect_frequency"
            ></el-input>
          </el-form-item>
          <el-form-item
            :label="t('collector.acquisitionRange') + '：'"
            prop="full_scale"
            v-if="['采集卡'].includes(tabName) && ruleForm.hardware_id != 1102"
          >
            <el-select v-model="ruleForm.full_scale" placeholder=" ">
              <el-option label="-5 ~ +5" value="1" />
              <el-option label="-10 ~ +10" value="0" />
            </el-select>
          </el-form-item>
          <el-form-item
            :label="t('collector.tcMachineId')"
            prop="tcmachineid"
            v-if="ruleForm.maker_id === 30"
          >
            <el-input v-model="ruleForm.tcmachineid"></el-input>
          </el-form-item>
        </div>
      </el-form>
    </div>
    <div class="btn-operate">
      <el-button type="primary" size="default" plain @click="resetForm(addRuleForm, true)">{{
        t('collector.cancel')
      }}</el-button>
      <el-button type="primary" @click="submitForm(addRuleForm)">{{
        t('collector.confirm')
      }}</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import { basicInterface } from '@renderer/api/system/system'
import { useStoreSignal } from '@renderer/store/useSignals'
import { useI18n } from 'vue-i18n'
import { adapterSigSelect } from '@renderer/api/system/nodeurl'
import { basicDecision } from '@renderer/api/system/decision'
const { t } = useI18n()
const storeSignal = useStoreSignal()

const props = defineProps({
  selectedMachine: {
    type: Number
  }
})

onMounted(async () => {
  getCollectorList()
  await eumComList()
  getAdapterSigList()
  await getEnum()
  await getListInfo()
})

const usp900_connection_type = ref(0) // 连接方式

// 获取采集器类型
const collectorList = ref([])
const getCollectorList = async () => {
  const res = await basicInterface({
    version: '1.0',
    method: 'enum_collector_type',
    id: '5',
    params: {}
  })
  collectorList.value = res.data.result.collector_type_list
  tabName.value = collectorList.value[0]?.name
  tabId.value = collectorList.value[0]?.type_id
  getMakerList(collectorList.value[0]?.type_id)
}

// 获取厂商
const makerList = ref([])
const getMakerList = async type_id => {
  const res = await basicInterface({
    version: '1.0',
    method: 'enum_maker',
    id: '6',
    params: {
      // 采集器类型ID
      collector_type_id: type_id
    }
  })
  makerList.value = res.data.result.maker_list
  ruleForm.value.maker_id = makerList.value[0].maker_id
  setProtocolList()
  getHardwareList()
}
const pmcTypeOptions = ref([
  {
    label: 'bool',
    value: '0'
  },
  {
    label: 'byte',
    value: '1'
  }
])
const setProtocolList = () => {
  rules.path_num[0].required = true
  rules.freq[0].required = true
  if (ruleForm.value.maker_id === 2) {
    protocolOptions.value = [
      {
        label: 'RPC',
        value: 'rpc'
      },
      {
        label: 'OPC-UA',
        value: 'opc-ua'
      },
      {
        label: 'OPC-DA',
        value: 'opc-da'
      },
      {
        label: 'S7',
        value: 's7'
      }
    ]
    ruleForm.value.protocol = 'rpc'
  } else if (ruleForm.value.maker_id === 6) {
    protocolOptions.value = [
      {
        label: 'MATRIX',
        value: 'matrix'
      }
    ]
    ruleForm.value.protocol = 'matrix'
  } else if (ruleForm.value.maker_id === 4) {
    protocolOptions.value = [
      {
        label: '530',
        value: '530'
      },
      {
        label: '640',
        value: '640'
      }
    ]
    ruleForm.value.protocol = '530'
  } else if (ruleForm.value.maker_id === 3) {
    protocolOptions.value = [
      {
        label: 'TCP',
        value: 'tcp'
      },
      {
        label: 'EZSOCKET',
        value: 'ezsocket'
      }
    ]
    ruleForm.value.protocol = 'tcp'
  } else if (ruleForm.value.maker_id === 10) {
    rules.path_num[0].required = false
    rules.freq[0].required = false
    ruleForm.value.freq = 100
  }
}
// 获取型号
const hardwareList = ref([])
const getHardwareList = async () => {
  const res = await basicInterface({
    version: '1.0',
    method: 'enum_hardware',
    id: '7',
    params: {
      // 采集器类型ID
      collector_type_id: tabId.value,
      // 厂商ID
      maker_id: ruleForm.value.maker_id
    }
  })
  hardwareList.value = res.data.result.hardware_list
  ruleForm.value.hardware_id = hardwareList.value[0].id
  setProtocolList()
}
// 不同厂商显示不同的协议
const protocolOptions = ref([])
const changeProtocol = () => {
  ruleForm.value.opcda_server_name = ''
  ruleForm.value.s7_ctrl_type = ''
  ruleForm.value.mitsubishi_machine_id = ''
  if (ruleForm.value.protocol === 'opc-da') {
    ruleForm.value.opcda_server_name = 'OPC.SINUMERIK.Machineswitch'
  } else if (ruleForm.value.protocol === 's7') {
    ruleForm.value.s7_ctrl_type = '0'
  } else if (ruleForm.value.protocol === 'ezsocket') {
    ruleForm.value.mitsubishi_machine_id = '6'
  }
}

// 获取当前厂商显示的字段
const fieldsCanShow = (type, protocol) => {
  if (tabName.value !== 'NC') {
    return false
  }
  //1: fanuc 2: siemens 3: mitsubishi 4: haidehan
  if (Array.isArray(type)) {
    return type.includes(ruleForm.value.maker_id)
  }
  return type === ruleForm.value.maker_id && ruleForm.value.protocol === protocol
}

// ------------ tab相关
let tabName = ref(1)
let tabId = ref()
const tabChange = (name, type_id) => {
  resetForm(addRuleForm.value)
  tabName.value = name
  tabId.value = type_id
  getMakerList(type_id)
}

// ------------ 表单相关
let ruleForm = ref({
  path_num: 1,
  collect_type: '1',
  full_scale: '0'
})
const rules = reactive({
  collector_type_id: [
    { required: true, message: t('collector.selectAdapterName'), trigger: 'change' }
  ],
  name: [
    { required: true, message: t('collector.inputAdapterName'), trigger: 'blur' },
    {
      pattern: /^[\w\d\s\S]{1,20}$/,
      message: t('collector.adapterNameLimit20'),
      trigger: 'blur'
    }
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
  collect_type: [
    {
      required: true,
      message: t('collector.inputGatherType'),
      trigger: 'change'
    }
  ],
  s7_ctrl_type: [
    {
      required: true,
      message: t('collector.inputControlType'),
      trigger: 'change'
    }
  ],
  mitsubishi_machine_id: [
    {
      required: true,
      message: t('collector.inputEzSocketOpenDeviceType'),
      trigger: 'blur'
    }
  ],
  collect_frequency: [
    {
      required: true,
      message: t('collector.inputCollectionFrequency'),
      trigger: 'blur'
    },
    {
      pattern: /^(?:[1-9]\d{0,4}|0|100000)$/,
      message: t('collector.collectionFrequencyLimt'),
      trigger: 'blur'
    }
  ],
  full_scale: [
    {
      required: true,
      message: t('collector.selectAcquisitionRange'),
      trigger: 'change'
    }
  ],
  rpc_machine_id: [
    {
      required: true,
      message: t('collector.selectAcquisitionRange'),
      trigger: 'blur'
    }
  ],
  rpc_machine_port: [
    {
      required: true,
      message: t('collector.inputMachineId'),
      trigger: 'blur'
    },
    {
      pattern: /^[1-9]\d*$/,
      message: t('collector.inputPositiveInt'),
      trigger: 'blur'
    }
  ],
  rpc_host_id: [
    {
      required: true,
      message: t('collector.inputHostId'),
      trigger: 'blur'
    }
  ],
  rpc_host_port: [
    {
      required: true,
      message: t('collector.inputHostPort'),
      trigger: 'blur'
    },
    {
      pattern: /^[1-9]\d*$/,
      message: t('collector.inputPositiveInt'),
      trigger: 'blur'
    }
  ],
  opcua_user_name: [
    {
      required: true,
      message: t('collector.inputAccount'),
      trigger: 'blur'
    }
  ],
  opcua_password: [
    {
      required: true,
      message: t('collector.inputPassword'),
      trigger: 'blur'
    }
  ],
  opcda_server_name: [
    {
      required: true,
      message: t('collector.inputPeriod'),
      trigger: 'blur'
    }
  ],
  protocol: [
    {
      required: true,
      message: t('collector.inputProtocolType'),
      trigger: 'blur'
    }
  ],
  tcmachineid: [
    {
      required: true,
      message: t('collector.inputTcMachineId'),
      trigger: 'blur'
    }
  ],
  ctrl_addr: [
    {
      required: true,
      message: t('collector.inputControlAddress'),
      trigger: 'blur'
    }
  ],
  switch_addr: [
    {
      required: true,
      message: t('collector.inputOnOffAddress'),
      trigger: 'blur'
    }
  ]
})

const protocolTypeList = [
  {
    type: 'rpc',
    value: '0'
  },
  {
    type: 'opc-ua',
    value: '1'
  },
  {
    type: 'opc-da',
    value: '2'
  },
  {
    type: 's7',
    value: '3'
  },
  {
    type: '530',
    value: '0'
  },
  {
    type: '640',
    value: '1'
  },
  {
    type: 'tcp',
    value: '0'
  },
  {
    type: 'ezsocket',
    value: '1'
  }
]
const protocolKeyList = [
  {
    type: 2,
    value: 'siemens_protocol'
  },
  {
    type: 3,
    value: 'mitsubishi_protocol'
  },
  {
    type: 4,
    value: 'haidehan_protocol'
  }
]

// 表单提交
const addRuleForm = ref()
const submitForm = async formEl => {
  if (!formEl) return

  // 判断采集器名称有没有重复
  const res = await basicInterface({
    version: '1.0',
    method: 'enum_adapters',
    id: '8',
    params: {
      dev_id: props.selectedMachine
    }
  })
  for (const val of res.data.result.adapter_list) {
    if (val.name === ruleForm.value.name) {
      ElMessage.error(t('collector.NameLimit'))
      return
    }

    // 判断只能添加一个NC
    if (tabName.value === 'NC' && val.collector_type_id === 1) {
      ElMessage.error(t('collector.NCAddTips'))
      return
    }
  }

  await formEl.validate(async valid => {
    if (!valid) {
      return
    }
    const times = parseInt(ruleForm.value.path_num) > 0 ? parseInt(ruleForm.value.path_num) : 1
    let isConnect = false
    const tempAddId = [] // 新增成功的id

    // 处理额外的扩展参数
    let temp_extra_params = []
    if (tabName.value === 'AFR') {
      temp_extra_params = isAfr(temp_extra_params)
    } else if (tabName.value === '采集卡') {
      if (ruleForm.value.hardware_id !== 1102) {
        temp_extra_params = [
          {
            key: 'full_scale',
            value: ruleForm.value.full_scale
          },
          {
            key: 'collect_frequency',
            value: ruleForm.value.collect_frequency
          }
        ]
      }
    } else if (tabName.value === 'NC' && [2, 3, 4].includes(ruleForm.value.maker_id)) {
      temp_extra_params = [
        {
          key: protocolKeyList.find(item => item.type === ruleForm.value.maker_id).value,
          value: protocolTypeList.find(item => item.type === ruleForm.value.protocol).value
        }
      ]
      isNcAndSepical(temp_extra_params)
    } else if (tabName.value === 'NC' && ruleForm.value.maker_id === 30) {
      temp_extra_params = [
        {
          key: 'tcmachineid',
          value: ruleForm.value.tcmachineid
        }
      ]
    } else if (tabName.value === 'USP' && ruleForm.value.hardware_id === 501) {
      temp_extra_params = [
        {
          key: 'usp900_connection_type',
          value: usp900_connection_type.value + ''
        }
      ]
    }
    doAddColloctor(times, temp_extra_params).then(res => {
      isConnect = res.isConnect
      tempAddId.push(...res.tempAddId)
      if (isConnect) {
        ElMessage.success(t('collector.operateSuccess'))
        storeSignal.changeSignalList(null)
        resetForm(addRuleForm.value, true)
        getMachineChannelList()
        emit('getSelectOptions')
        emit('getList')
        emit('getDevList')
      }
    })
  })
}
const isAfr = () => {
  let temp_extra_params = []
  if (ruleForm.value.hardware_id !== 505) {
    temp_extra_params = [
      {
        key: 'collect_type',
        value: ruleForm.value.collect_type
      }
    ]
  } else {
    if (!ruleForm.value.ctrl_addr_type) {
      ElMessage.error('请选择控制地址！')
      return
    }
    if (!ruleForm.value.switch_addr_type) {
      ElMessage.error('请选择开关地址！')
      return
    }
    temp_extra_params = [
      {
        key: 'collect_type',
        value: ruleForm.value.collect_type + ''
      },
      {
        key: 'ctrl_addr_adapter_id',
        value: ruleForm.value.ctrl_addr_type[1] + ''
      },
      {
        key: 'ctrl_addr_type',
        value: ruleForm.value.ctrl_addr_type[2] + ''
      },
      {
        key: 'ctrl_addr',
        value: ruleForm.value.ctrl_addr + ''
      },
      {
        key: 'switch_ctrl_type',
        value: ruleForm.value.switch_addr_type[0] + ''
      },
      {
        key: 'switch_addr_adapter_id',
        value: ruleForm.value.switch_addr_type[1] + ''
      },
      {
        key: 'switch_addr_type',
        value: ruleForm.value.switch_addr_type[2] + ''
      },
      {
        key: 'switch_addr',
        value: ruleForm.value.switch_addr + ''
      },
      {
        key: 'data_source_adapter_id',
        value: ruleForm.value.conditionsele ? ruleForm.value.conditionsele[1] + '' : '0'
      },
      {
        key: 'data_source_signal_id',
        value: ruleForm.value.conditionsele ? ruleForm.value.conditionsele[2] + '' : '0'
      },
      {
        key: 'switch_source_is_nc',
        value: !ruleForm.value.conditionsele2
          ? '-1'
          : ruleForm.value.conditionsele2[0] === 'nc'
          ? '1'
          : '0'
      },
      {
        key: 'switch_source_adapter_id',
        value: ruleForm.value.conditionsele2 ? ruleForm.value.conditionsele2[1] + '' : '0'
      },
      {
        key: 'switch_source_sig_id',
        value: ruleForm.value.conditionsele2 ? ruleForm.value.conditionsele2[2] + '' : '0'
      },
      {
        key: 'switch_enable',
        value: '1'
      },
      {
        key: 'mannual_switch',
        value: '0'
      }
    ]
  }
  return temp_extra_params
}
const isNcAndSepical = temp_extra_params => {
  if (ruleForm.value.protocol === 'rpc') {
    temp_extra_params.push(
      {
        key: 'rpc_machine_id',
        value: ruleForm.value.rpc_machine_id
      },
      {
        key: 'rpc_machine_port',
        value: ruleForm.value.rpc_machine_port
      },
      {
        key: 'rpc_host_id',
        value: ruleForm.value.rpc_host_id
      },
      {
        key: 'rpc_host_port',
        value: ruleForm.value.rpc_host_port
      }
    )
  } else if (ruleForm.value.protocol === 'opc-ua') {
    temp_extra_params.push(
      {
        key: 'opcua_user_name',
        value: ruleForm.value.opcua_user_name
      },
      {
        key: 'opcua_password',
        value: ruleForm.value.opcua_password
      }
    )
  } else if (ruleForm.value.protocol === 'opc-da') {
    temp_extra_params.push({
      key: 'opcda_server_name',
      value: ruleForm.value.opcda_server_name
    })
  } else if (ruleForm.value.protocol === 's7') {
    temp_extra_params.push({
      key: 's7_ctrl_type',
      value: ruleForm.value.s7_ctrl_type
    })
  } else if (ruleForm.value.protocol === 'ezsocket') {
    temp_extra_params.push({
      key: 'mitsubishi_machine_id',
      value: ruleForm.value.mitsubishi_machine_id
    })
  }
}

const doAddColloctor = async (times, temp_extra_params) => {
  const tempAddId = []
  let isConnect = false
  for (let i = 1; i <= times; i++) {
    const res = await basicInterface({
      version: '1.0',
      method: 'add_adapter',
      id: '14',
      params: {
        dev_id: props.selectedMachine,
        collector_type_id: tabId.value,
        collect_freq: tabName.value === 'USV' ? 4000 : 1000,
        maker_id: parseInt(ruleForm.value.maker_id) || 0,
        hardware_id: parseInt(ruleForm.value.hardware_id) || 0,
        path_num: tabName.value === 'AFR' ? ruleForm.value.path_num2 : i,
        name: ruleForm.value.name || '',
        ip: ruleForm.value.ip || '',
        port: parseInt(ruleForm.value.port) || 0,
        freq: parseInt(ruleForm.value.freq) || 100,
        collect_type: undefined,
        collect_frequency: undefined,
        full_scale: undefined,
        extra_params: temp_extra_params
      }
    })
    tempAddId.push(res.data.result.adapter_info.id)

    const loading = ElLoading.service({
      lock: true,
      text: t('collector.connectStatusList'),
      background: 'rgba(0, 0, 0, 0.7)'
    })

    // 连接采集器
    try {
      await basicInterface({
        version: '1.0',
        method: 'adapter_connect',
        id: '52',
        params: {
          dev_id: props.selectedMachine,
          adapter_id: res.data.result.adapter_info.id
        }
      })
      isConnect = true
    } catch {
      isConnect = false
      loading.close()
      // 没连接成功的需要全部删除
      for (const child of tempAddId) {
        await basicInterface({
          version: '1.0',
          method: 'delete_adapter',
          id: '16',
          params: {
            dev_id: props.selectedMachine,
            adapter_id: child
          }
        })
        // ElMessage.error('连接失败！')
      }
      emit('update:isAddTool', false)
      break
    }
    loading.close()
  }
  return {
    isConnect,
    tempAddId
  }
}

// 获取机床物理通道列表
const getMachineChannelList = async () => {
  const res = await basicInterface({
    version: '1.0',
    method: 'enum_channel_nc_adapter_id',
    id: '76',
    params: {
      dev_id: +props.selectedMachine
    }
  })
  const { nc_channel_list } = res.data.result
  const list = nc_channel_list.map(d => d.channel)
  sessionStorage.setItem('nc_channel_list', JSON.stringify(list))
}
// 清空表单
const emit = defineEmits(['update:isAddTool', 'getDevList', 'getList', 'getSelectOptions'])
const resetForm = async (formEl, isCloseDialog = false) => {
  if (!formEl) return
  formEl.resetFields()
  if (isCloseDialog) {
    emit('update:isAddTool', false)
  }
}

// 获取串口列表
const comList = ref([])
const eumComList = async () => {
  try {
    const res = await basicInterface({
      version: '1.0',
      method: 'enum_comm_list',
      id: '107',
      params: {}
    })
    if (res.data.error) {
      ElMessage.error(res.data.error)
      return
    }
    comList.value = res.data.result.comm_list
      .map(item => ({
        label: `Com${item}`,
        value: item
      }))
      .sort((a, b) => a.value - b.value)
  } catch (error) {
    console.log(error)
  }
}

// 获取信号三级下拉列表
const adapterSigList = ref([]) // 所有信号列表
const ncSigList = ref([]) // NC信号列表
const getAdapterSigList = () => {
  adapterSigSelect({ devId: props.selectedMachine }).then(res => {
    adapterSigList.value = res.data
    ncSigList.value = res.data?.filter(item => item.value === 'nc')
  })
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
      dev_id: props.selectedMachine
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
  // eslint-disable-next-line no-unsafe-optional-chaining
  for (const val of deciousInfo.value?.dev_nc_decision_base_info_list) {
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
  // eslint-disable-next-line no-unsafe-optional-chaining
  for (const val of deciousInfo.value?.dev_collector_base_info_list) {
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

const showAddressInput = ref(true)
const handleCascaderChange = val => {
  if (val && val[0] !== 1) {
    ruleForm.value.switch_addr = ''
    showAddressInput.value = false
  } else {
    showAddressInput.value = true
  }
}
const handleHardwareIdChange = val => {
  if (val === 505) {
    ruleForm.value.collect_type = '0'
  }
}
</script>

<style lang="scss" scoped>
.add-collector-wrap {
  padding-bottom: 60px;

  .collect-back {
    border-radius: 20px;
    background: rgb(26, 29, 44);
    padding: 24px;

    .tab-wrap {
      display: flex;
      width: 100%;
      cursor: pointer;

      .tab-active {
        background: rgb(65, 180, 207);
      }

      & > div {
        border: 1px solid rgb(65, 180, 207);
        border-right: none;
        line-height: 56px;
        flex: 1;
        text-align: center;
      }
      & > div:first-child {
        border-top-left-radius: 8px;
        border-bottom-left-radius: 8px;
      }
      & > div:last-child {
        border-right: 1px solid rgb(65, 180, 207);
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
      }
    }

    .item-layout {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;

      :deep(.UJ-form-item__content) {
        width: 400px;
      }
      :deep(.UJ-input__wrapper) {
        background: transparent;
        width: 400px;
      }
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
    :deep(.UJ-form-item) {
      flex-direction: column;

      .UJ-form-item__label {
        font-size: 22px;
        justify-content: left;
        margin-bottom: 10px;
      }

      .UJ-form-item__content {
        font-size: 22px;
      }

      .UJ-form-item__error {
        font-size: 20px;
      }
    }
  }

  .btn-operate {
    margin-top: 35px;
    margin-bottom: -30px;
    float: right;
  }
}
</style>
