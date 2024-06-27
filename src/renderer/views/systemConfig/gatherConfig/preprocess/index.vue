<template>
  <div class="preprocess-tool">
    <el-tabs
      v-model="selectedProcess"
      class="list-sensor-tabs"
      tab-position="top"
      @tab-change="tabChange"
      :before-leave="beforeLeave"
    >
      <el-tab-pane
        v-for="item in processTabList"
        :key="item.id"
        :label="item.label"
        :name="item.id"
      >
      </el-tab-pane>
    </el-tabs>
    <div class="btn-group" v-if="selectedProcess === 0">
      <template v-if="showSave">
        <el-button type="primary" size="default" @click="cancel" plain>{{
          t('prepro.cancel')
        }}</el-button>
        <el-button type="primary" size="default" @click="save">{{ t('prepro.save') }}</el-button>
      </template>
      <template v-else-if="operator === 'del'">
        <el-button type="primary" size="default" @click="cancelSelect" plain>{{
          t('prepro.cancel')
        }}</el-button>
        <el-button type="primary" size="default" @click="confirmDel" plain>{{
          t('prepro.confirmDeletion')
        }}</el-button>
      </template>
      <template v-else>
        <el-button type="primary" size="default" @click="editPre" plain v-if="tableData.length">{{
          t('prepro.edit')
        }}</el-button>
        <el-button type="primary" size="default" @click="delPre" plain v-if="tableData.length">{{
          t('prepro.delete')
        }}</el-button>
        <el-button type="primary" size="default" @click="addPre">
          <el-icon><Plus /></el-icon>
          {{ t('prepro.add') }}
        </el-button>
      </template>
    </div>
    <div class="btn-group" v-if="selectedProcess === 1">
      <template v-if="showSave">
        <el-button type="primary" size="default" @click="cancelSignal" plain>{{
          t('prepro.cancel')
        }}</el-button>
        <el-button type="primary" size="default" @click="saveSignal">{{
          t('prepro.save')
        }}</el-button>
      </template>
      <template v-else-if="operator === 'del'">
        <el-button type="primary" size="default" @click="cancelSelectSignal" plain>{{
          t('prepro.cancel')
        }}</el-button>
        <el-button type="primary" size="default" @click="confirmDelSignal" plain>{{
          t('prepro.confirmDeletion')
        }}</el-button>
      </template>
      <template v-else>
        <el-button
          type="primary"
          size="default"
          @click="editPreSignal"
          plain
          v-if="signalTableData.length"
          >{{ t('prepro.edit') }}</el-button
        >
        <el-button
          type="primary"
          size="default"
          @click="delPre"
          plain
          v-if="signalTableData.length"
          >{{ t('prepro.delete') }}</el-button
        >
        <el-button type="primary" size="default" @click="addPreSignal">
          <el-icon><Plus /></el-icon>
          {{ t('prepro.add') }}
        </el-button>
      </template>
    </div>
  </div>
  <div class="preprocess-content" v-if="selectedProcess === 0">
    <baseContaner class="content_left">
      <myTable
        :columns="columns"
        :table-setting="tableSetting"
        :table-data="tableData"
        @currentRowChange="selectRow"
        ref="preprocessTable"
      ></myTable>
    </baseContaner>
    <baseContaner class="content_right" v-if="tableData.length || operator === 'add'">
      <myForm :form-data="formData" :rules="rules" ref="editFormRef" />
    </baseContaner>
  </div>
  <div class="preprocess-content" v-if="selectedProcess === 1">
    <baseContaner class="content_left">
      <myTable
        :columns="columnsSignal"
        :table-setting="tableSetting"
        :table-data="signalTableData"
        @currentRowChange="selectRowSignal"
        ref="signalPreprocessTable"
      ></myTable>
    </baseContaner>
    <baseContaner class="content_right" v-if="signalTableData.length || operator === 'add'">
      <el-form :model="signalFormData" ref="editFormSignalRef">
        <el-form-item
          prop="signal_proc_name"
          :label="t('prepro.signalName') + ':'"
          :rules="[
            {
              required: true,
              message: t('prepro.pleaseEnterSignalName'),
              trigger: 'change'
            },
            {
              max: 20,
              message: '信号名称在20字以内',
              trigger: 'change'
            }
          ]"
        >
          <el-input
            v-model="signalFormData.signal_proc_name"
            v-if="signalEditType.includes(operator)"
          ></el-input>
          <el-tooltip
            :content="signalFormData.signal_proc_name"
            placement="top"
            effect="dark"
            v-else
          >
            <div class="form-text text-highlight">
              {{ signalFormData.signal_proc_name }}
            </div>
          </el-tooltip>
        </el-form-item>
        <el-form-item
          prop="signal_proc_type"
          :label="t('prepro.signalAlgorithm') + ':'"
          :rules="[
            {
              required: true,
              message: t('prepro.pleaseSelectSignalAlgorithm'),
              trigger: 'change'
            }
          ]"
        >
          <el-select
            v-model="signalFormData.signal_proc_type"
            v-if="signalEditType.includes(operator)"
            style="width: 100%"
          >
            <el-option
              v-for="item in signalAlgoList"
              :key="item.type_id"
              :label="item.type_name"
              :value="item.type_id"
            />
          </el-select>
          <el-tooltip
            :content="
              signalAlgoList.find(d => d.type_id === signalFormData.signal_proc_type)?.type_name ||
              ''
            "
            placement="top"
            effect="dark"
            v-else
          >
            <div class="form-text text-highlight">
              {{
                signalAlgoList.find(d => d.type_id === signalFormData.signal_proc_type)
                  ?.type_name || ''
              }}
            </div>
          </el-tooltip>
        </el-form-item>
        <el-form-item
          prop="output_rate"
          :label="t('prepro.signalOutputRate') + ':'"
          :rules="[
            {
              required: true,
              message: t('prepro.pleaseEnterSignalOutputRate'),
              trigger: 'change'
            },
            {
              validator: validateNumTwoPoint,
              trigger: 'change'
            }
          ]"
        >
          <el-input
            v-model="signalFormData.output_rate"
            v-if="signalEditType.includes(operator)"
          ></el-input>
          <el-tooltip
            :content="signalFormData.output_rate + ''"
            placement="top"
            effect="dark"
            v-else
          >
            <div class="form-text text-highlight">
              {{ signalFormData.output_rate }}
            </div>
          </el-tooltip>
        </el-form-item>
        <el-divider
          class="extra-form-divider"
          style="border: 1px solid rgba(255, 255, 255, 0.31)"
        ></el-divider>
        <template v-if="signalFormData.signal_proc_type">
          <el-form-item
            class="extra-form-item"
            prop="signalResource"
            :label="t('prepro.signalResource')"
          >
            <div class="signal-list">
              <span></span>
              <el-button
                v-if="signalEditType.includes(operator)"
                @click="addSignal"
                circle
                style="width: 1.6vw; height: 1.6vw"
                type="primary"
              >
                <el-icon>
                  <Plus />
                </el-icon>
              </el-button>
            </div>
          </el-form-item>
          <el-form-item
            class="extra-form-item"
            v-for="(signal, index) in signalFormData.signals"
            :label="'信号' + (index + 1) + ':'"
            :key="'signal' + index"
            :prop="'signals.' + index + '.value'"
            :rules="[
              {
                required: true,
                message: t('prepro.pleaseSelectSignal'),
                trigger: 'change'
              }
            ]"
          >
            <el-cascader
              v-model="signal.value"
              v-if="signalEditType.includes(operator)"
              :options="select"
              style="width: 100%"
            />
            <el-tooltip :content="signal.label" placement="top" effect="dark" v-else>
              <div class="form-text">
                {{ signal.label }}
              </div>
            </el-tooltip>
            <!-- <el-input v-model="signal.value"></el-input> -->
            <!-- <el-button @click.prevent="removeDomain(domain)">删除</el-button> -->
          </el-form-item>
        </template>
        <el-form-item>
          <!-- <el-button type="primary" @click="submitForm('dynamicValidateForm')"
            >提交</el-button
          > -->
        </el-form-item>
      </el-form>
    </baseContaner>
  </div>
  <el-dialog1 :title="t('prepro.delete')" v-model="delVisible" width="30%" :error="true">
    <myContaner>
      <p style="font-size: 24px">{{ t('prepro.confirmDelete') }}</p>
    </myContaner>
    <template #footer>
      <span>
        <el-button type="primary" @click="cancelDel" plain>{{ t('prepro.cancel') }}</el-button>
        <el-button type="danger" @click="delPreConfirm">{{ t('prepro.confirm') }}</el-button>
      </span>
    </template>
  </el-dialog1>
</template>

<script setup lang="jsx">
import { reactive, ref, onMounted, computed, watch, getCurrentInstance, nextTick } from 'vue'
import baseContaner from '@renderer/components/common/baseContaner.vue'
import myContaner from '@renderer/components/common/myContaner.vue'
import myTable from '@renderer/components/common/myTable/myTable.vue'
import myForm from '@renderer/components/common/myForm.vue'
import { useFormData } from './useFormData.js'
import { useCascaderData } from './useCascaderData.js'
import { Plus } from '@element-plus/icons-vue'
import { usePreprocessStore } from '@renderer/store/usePreprocess'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  preprocessList,
  queryAdapters,
  preprocessOperator,
  addPreprocess,
  deletePreprocess,
  queryAdaptersByDevId,
  modifyPreprocess,
  signalProcTypeList,
  signalProcList,
  addSignalProc,
  updateSignalProc,
  batchDeleteSignalProc,
  queryDevAdapterSignalList
} from '@renderer/api/preprocess/index'
import { encode, decode } from 'js-base64'
import { _public } from '@renderer/utils/common'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const store = usePreprocessStore()
const { curSelectedRow, signalCurSelectedRow } = storeToRefs(store)
const route = useRoute()
const { proxy } = getCurrentInstance()
// 编辑之前的表单数据，用于比较是否修改
const oldFormData = ref(null)
const oldFileCfg = ref(null)
const editPre = () => {
  operator.value = 'edit'
  setCurRowInfo()
  oldFormData.value = _public.deepCopy(editFormRef.value.searchForm)
  oldFileCfg.value = _public.deepCopy(fileCfg.value)
  aliasNameList.value = aliasNameListCopy.value.filter(item => item !== curRow.value.alias)
}
const delVisible = ref(false)
const confirmDel = () => {
  const { selectedList } = preprocessTable.value
  if (!selectedList.length) {
    ElMessage.error(t('prepro.pleaseSelectDeleteContent'))
    return
  }
  delVisible.value = true
}
const delPreConfirm = async () => {
  try {
    if (selectedProcess.value === 0) {
      await deleteAllFn()
    } else {
      await deleteAllFnSignal()
    }
    ElMessage.success(t('prepro.deleteSuccess'))
    delVisible.value = false
    operator.value = ''
    getTableData()
    getSignalTableData()
  } catch (error) {
    console.log(error)
  }
}
const deleteAllFn = async () => {
  const { selectedList } = preprocessTable.value
  const promiseArr = selectedList.map(item => {
    return deletePreprocess({
      dev_id: dev_id.value,
      adapter_id: item.adapterCode,
      preprocess_instance_id: item.id
    })
  })
  const res = await Promise.all(promiseArr)
  return res
}
const delPre = () => {
  operator.value = 'del'
}
const cancelDel = () => {
  delVisible.value = false
}
const cancelSelect = () => {
  operator.value = ''
  preprocessTable.value.clearCheck()
}

const addPre = () => {
  operator.value = 'add'
  editFormRef.value && editFormRef.value.resetForm()
  preprocessTable.value.celarCurrentRow()
  selectedAlgo.value = 0
  fileCfg.value = []
  aliasNameList.value = aliasNameListCopy.value
}
const dev_id = ref(1)
onMounted(async () => {
  dev_id.value = +route.query.dev_id
  await getAdapterList()
  await getAlgoList()
  await getTableData()
  await getSelectOptions()
  await getSignalProcTypeList()
  await getSignalTableData()
  queryNcAdapterId()
})
// 左侧列表
const columns = reactive([
  {
    type: 'selection',
    width: 50,
    show: computed(() => operator.value === 'del')
  },
  {
    type: 'index',
    label: t('prepro.serialNumber'),
    width: 100
  },
  {
    label: t('prepro.sensorName'),
    prop: 'adapterCode',
    width: 234,
    render: scope => {
      const label = adapterList.value.find(d => d.value === scope.row.adapterCode)?.label || ''
      scope.row.name = label
      return (
        <>
          <span>{label}</span>
        </>
      )
    }
  },
  {
    label: t('prepro.operatorName'),
    prop: 'operator',
    width: 234,
    render: scope => {
      const label = algoList.value.find(d => d.value === scope.row.operator)?.label || ''
      scope.row.operatorName = label
      return (
        <>
          <span>{label}</span>
        </>
      )
    }
  },
  {
    label: t('prepro.metricAliases'),
    prop: 'alias',
    width: 234
  }
])
const highlight = ref(true)
const tableSetting = reactive({
  isPager: false,
  border: true,
  height: '41vw',
  highlightCurrentRow: highlight
})
const tableData = ref([])
// 设置编辑信息
const setCurRowInfo = () => {
  if (!editFormRef.value) return
  const { searchForm } = editFormRef.value
  const { save_data, adapterCode, operator, alias } = curRow.value
  selectedAlgo.value = operator
  selectedAdapter.value = adapterCode
  nextTick(() => {
    fileCfg.value.forEach(({ name, desc }) => {
      searchForm[name] =
        desc.type === 'list'
          ? name === 'PreprocessUsingTunnels' // 输入通道多选设置
            ? save_data[name]
                .split(',')
                .filter(d => channelList.value.find(c => c.value === +d))
                .map(Number)
            : save_data[name].toString().split(',').map(Number)
          : save_data[name]
    })
    Object.assign(searchForm, { adapterCode, operator, alias })
  })
}

const preprocessTable = ref(null)
// 选中行显示详情
const curRow = ref({})
// 页面选择行，设置行信息
const selectRow = row => {
  if (operator.value === 'add') {
    highlight.value = false
    return
  }
  if (!row) {
    curSelectedRow.value = null
    highlight.value = false
    return
  }
  highlight.value = true
  curRow.value = row
  curSelectedRow.value = row
  setCurRowInfo()
}
const aliasNameList = ref([])
const aliasNameListCopy = ref([])
// 获取预处理列表
const getTableData = async () => {
  try {
    const params = {
      dev_id: dev_id.value,
      has_save_data: 1
    }
    const res = await preprocessList(params)
    const list = convertTableData(res.data.result.preprocess_instance_conf_list || [])
    tableData.value = list
    aliasNameList.value = list.map(item => item.alias)
    aliasNameListCopy.value = _public.deepCopy(aliasNameList.value)
    nextTick(() => {
      preprocessTable.value.setCurrentRow(tableData.value[0])
    })
    console.log('tableData.value', tableData.value)
  } catch (error) {
    console.log(error)
  }
}
const convertTableData = list => {
  return list.map(item => {
    const {
      adapter_id: adapterCode,
      algo_id: operator,
      alias_name: alias,
      save_data,
      ...reset
    } = item
    return {
      adapterCode,
      operator,
      alias,
      save_data: Object.values(JSON.parse(decode(save_data)))[0],
      ...reset
    }
  })
}
// 根据通道查询NC采集器ID
const ncAdapterChannel = ref([])
const queryNcAdapterId = async () => {
  try {
    const params = {
      dev_id: dev_id.value
    }
    const res = await queryAdaptersByDevId(params)
    ncAdapterChannel.value = res.data.result.nc_channel_list
  } catch (error) {
    console.log(error)
  }
}
// 获取传感器列表
const getAdapterList = async () => {
  try {
    const res = await queryAdapters({ dev_id: dev_id.value })
    const list = res.data.result.adapter_list || []
    adapterList.value = list.map(item => {
      return {
        label: item.name,
        value: item.id,
        hardware_id: item.hardware_id
      }
    })
  } catch (error) {
    console.log(error)
  }
}
// 当前选中的算子
const selectedAlgo = ref(0)
const channelNameList = ref([])
// 获取算子列表
const getAlgoList = async () => {
  try {
    const res = await preprocessOperator()
    const list = res.data.result.preprocess_baseconf_list || []
    channelNameList.value = res.data.result.channel_adapter_list || []
    algoList.value = list.map(item => {
      return {
        label: item.name,
        value: item.id,
        config: JSON.parse(decode(item.conf))
      }
    })
    const adapter = adapterList.value.find(d => d.value === selectedAdapter.value)
    let nameList = []
    adapter &&
      channelNameList.value.forEach(channel => {
        if (adapter.hardware_id === channel.adapter_type_id) {
          nameList = channel.input_channel_list
        }
      })
    adapterList.value = adapterList.value.filter(item =>
      channelNameList.value.find(channel => item.hardware_id === channel.adapter_type_id)
    )
    channelList.value = nameList.map((item, index) => {
      return {
        name: item,
        value: index + 1
      }
    })
    console.log('algoList.value', algoList.value)
    console.log('channelList.value', channelList.value)
  } catch (error) {
    console.log(error)
  }
}
watch(
  () => selectedAlgo.value,
  () => {
    if (!editFormRef.value) return
    const { searchForm } = editFormRef.value
    const { config } = algoList.value.find(d => d.value === selectedAlgo.value) || {}
    fileCfg.value = config?.array || []
    fileCfgCopy.value = _public.deepCopy(fileCfg.value)
    fileCfg.value.forEach(({ name, desc }) => {
      if (name === 'PreprocessUsingTunnels' && !channelList.value.length) {
        searchForm[name] = []
      } else if (name === 'PreprocessSpSpeedSource' && !ncAdapterChannel.value.length) {
        searchForm[name] = []
      } else if (desc.type === 'list') {
        searchForm[name] = desc.specs.default.split(',').map(Number)
      } else {
        searchForm[name] = desc.specs.default
      }
    })
  }
)
// 右侧表单
const editFormRef = ref(null) // 表单ref
const operator = ref('') // 操作类型
const adapterList = ref([]) // 传感器列表
const algoList = ref([]) // 算子列表
const fileCfg = ref([]) // 当前选中算子的配置项
const fileCfgCopy = ref([]) // 当前选中算子的配置项
const selectedAdapter = ref(0) // 当前选中的传感器
const channelList = ref([])
const { formData, rules } = useFormData(
  operator,
  curRow,
  fileCfg,
  adapterList,
  algoList,
  selectedAlgo,
  selectedAdapter,
  channelList,
  ncAdapterChannel,
  aliasNameList,
  t
)

watch(
  () => selectedAdapter.value,
  () => {
    const adapter = adapterList.value.find(d => d.value === selectedAdapter.value)
    let nameList = []
    channelNameList.value.forEach(channel => {
      if (adapter.hardware_id === channel.adapter_type_id) {
        nameList = channel.input_channel_list
      }
    })
    adapterList.value = adapterList.value.filter(item =>
      channelNameList.value.find(channel => item.hardware_id === channel.adapter_type_id)
    )
    channelList.value = nameList.map((item, index) => {
      return {
        name: item,
        value: index + 1
      }
    })
    const { searchForm } = editFormRef.value
    const { config } = algoList.value.find(d => d.value === selectedAlgo.value) || {}
    fileCfg.value = config?.array || []
    fileCfgCopy.value = _public.deepCopy(fileCfg.value)
    fileCfg.value.forEach(({ name, desc }) => {
      if (name === 'PreprocessUsingTunnels' && !channelList.value.length) {
        searchForm[name] = []
      } else if (name === 'PreprocessSpSpeedSource' && !ncAdapterChannel.value.length) {
        searchForm[name] = []
      } else if (desc.type === 'list') {
        searchForm[name] = desc.specs.default.split(',').map(Number)
      } else {
        searchForm[name] = desc.specs.default
      }
    })
  }
)
watch(
  () => {
    if (editFormRef.value) {
      return editFormRef.value.searchForm
    }
  },
  () => {
    if (!editFormRef.value) {
      return
    }
    const { PreprocessWindowType } = editFormRef.value.searchForm
    if (PreprocessWindowType === 0) {
      fileCfg.value = fileCfgCopy.value.filter(d => d.name !== 'PreprocessWindowCircles')
    } else if (PreprocessWindowType === 1) {
      fileCfg.value = fileCfgCopy.value.filter(d => d.name !== 'PreprocessWindowDuration')
    }
  },
  {
    deep: true
  }
)

// 编辑，新增相关
const showSave = computed(() => {
  return operator.value === 'edit' || operator.value === 'add'
})
const cancel = () => {
  const { searchForm } = editFormRef.value
  const isEdit = _public._equals(oldFormData.value, searchForm)
  if (!isEdit) {
    proxy
      .$confirm1(t('prepro.cancelEditText'), t('prepro.tips'), {
        confirmButtonText: t('prepro.confirm'),
        cancelButtonText: t('prepro.cancel'),
        type: 'warning'
      })
      .then(() => {
        operator.value = ''
        fileCfg.value = oldFileCfg.value
        preprocessTable.value.setCurrentRow(curSelectedRow.value)
      })
      .catch(() => {
        return
      })
  } else {
    operator.value = ''
  }
}
// 新增，编辑预处理
const save = async () => {
  try {
    await editFormRef.value.validate()
    const searchForm = _public.deepCopy(editFormRef.value.searchForm)
    for (const key in searchForm) {
      if (Array.isArray(searchForm[key])) {
        searchForm[key] = searchForm[key].join(',')
      }
    }
    if (searchForm.PreprocessWindowType === 0) {
      delete searchForm.PreprocessWindowCircles
    } else if (searchForm.PreprocessWindowType === 1) {
      delete searchForm.PreprocessWindowDuration
    }
    const { operator: algo_id, adapterCode: adapter_id, alias: alias_name, ...rest } = searchForm
    rest.PreprocessMetricsIndex = algo_id
    const algo = algoList.value.find(d => d.value === selectedAlgo.value)
    const arr = algo.config.array
    arr.forEach(item => {
      const { type } = item.desc
      const name = item.name
      if (type !== 'list' && type !== 'string') {
        rest[name] = Number(rest[name])
      } else {
        rest[name] = rest[name].toString()
      }
    })
    const preprocess_instance_conf = {
      dev_id: dev_id.value,
      adapter_id,
      algo_id,
      alias_name,
      nc_adapter_id:
        ncAdapterChannel.value.find(d => d.channel === searchForm.PreprocessSpSpeedSource)
          ?.nc_adapter_id || 0,
      save_data: encode(JSON.stringify(rest))
    }
    if (operator.value === 'add') {
      await addPreprocess(preprocess_instance_conf)
      ElMessage.success(t('prepro.addSuccess'))
    } else if (operator.value === 'edit') {
      preprocess_instance_conf.preprocess_id = curRow.value.id
      preprocess_instance_conf.save_data = encode(
        JSON.stringify({ [curRow.value.indicator_id]: { ...rest } })
      )
      await modifyPreprocess(preprocess_instance_conf)
      ElMessage.success(t('prepro.editSuccess'))
    }
    operator.value = ''
    getTableData()
  } catch (error) {
    console.log(error)
  }
}

// ------ 预处理配置添加tab栏，信号处理表格及相应表单及增删改
// tab菜单
const selectedProcess = ref(0)
const processTabList = ref([
  {
    id: 0,
    label: '指标预设'
  },
  {
    id: 1,
    label: '信号处理'
  }
])

// 切换菜单
const beforeLeave = () => {
  if (operator.value === 'edit' || operator.value === 'add') {
    ElMessage.error('请先保存指标或信号')
    return false
  }
  return true
}
const tabChange = pane => {
  console.log(pane)
  nextTick(() => {
    operator.value = ''
    if (pane === 0) {
      getTableData()
    } else {
      getSignalTableData()
    }
  })
}

// 左侧列表-信号处理
const columnsSignal = reactive([
  {
    type: 'selection',
    width: 50,
    show: computed(() => operator.value === 'del')
  },
  {
    type: 'index',
    label: t('prepro.serialNumber'),
    width: 100
  },
  {
    label: t('prepro.signalName'),
    prop: 'signal_proc_name',
    width: 234
  },
  {
    label: t('prepro.signalResource'),
    prop: 'signalResource',
    width: 234
  },
  {
    label: t('prepro.signalAlgorithm'),
    prop: 'signal_proc_type',
    width: 234,
    render: scope => {
      const label =
        signalAlgoList.value.find(d => d.type_id === scope.row.signal_proc_type)?.type_name || ''
      scope.row.signalTypeName = label
      return (
        <>
          <span>{label}</span>
        </>
      )
    }
  },
  {
    label: t('prepro.signalOutputRate'),
    prop: 'output_rate',
    width: 234
  }
])

// 信号处理-表格数据
const signalTableData = ref([])
const signalProcNameList = ref([]) // 已有的信号处理名称数组
// 信号处理-旧表单数据
const oldSignalFormData = ref({}) // 之前的表单数据
// 右侧表单-信号处理
const defaultSignalFormData = ref({
  signal_proc_name: '',
  signal_proc_type: '',
  output_rate: '',
  signalResource: '',
  signals: [{ value: '' }]
})
const signalFormData = ref({
  signal_proc_name: '',
  signal_proc_type: '',
  output_rate: '',
  signalResource: '',
  signals: [{ value: '' }]
})
// 信号处理表单
const editFormSignalRef = ref(null) // 表单ref
const signalAlgoList = ref([]) // 算法列表
const signalPreprocessTable = ref(null)
const signalEditType = ref(['edit', 'add'])

// 信号处理-获取信号算法列表
const getSignalProcTypeList = async () => {
  try {
    const res = await signalProcTypeList()
    signalAlgoList.value = res.data.result.signal_proc_type
    defaultSignalFormData.value.signal_proc_type = signalAlgoList.value[0]?.type_id
    signalFormData.value.signal_proc_type = signalAlgoList.value[0]?.type_id
  } catch (e) {
    console.log(e)
  }
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
    const other = select.value.filter(d => d.value !== 'nc')
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

// 信号处理-获取表格数据
const getSignalTableData = async () => {
  try {
    const params = {
      dev_id: dev_id.value
    }
    const res = await signalProcList(params)
    signalTableData.value = res.data.result.signal_proc_list?.map(item => {
      let conditionseleString = ''
      const conditionsele = getConditionList(item)
      if (conditionsele) {
        const a = select.value.find(obj => obj.value === conditionsele[0]) || {}
        const b = a.children?.find(obj => obj.value === conditionsele[1]) || {}
        const c = b.children?.find(obj => obj.value === conditionsele[2]) || {}
        conditionseleString = a.label + '/' + b.label + '/' + c.label
      }
      item.signalResource = conditionseleString
      item.signals = [{ value: conditionsele, label: conditionseleString }]
      return item
    })
    signalProcNameList.value = signalTableData.value.map(item => item.signal_proc_name)
    signalCurRow.value =
      signalTableData.value.length > 0 ? signalTableData.value[0] : signalFormData.value
    setCurRowInfoSignal()
  } catch (e) {
    console.log(e)
  }
}
// 信号处理-取消保存
const cancelSignal = () => {
  const isEdit = _public._equals(oldSignalFormData.value, signalFormData.value)
  if (!isEdit) {
    proxy
      .$confirm1(t('prepro.cancelEditText'), t('prepro.tips'), {
        confirmButtonText: t('prepro.confirm'),
        cancelButtonText: t('prepro.cancel'),
        type: 'warning'
      })
      .then(() => {
        operator.value = ''
        setCurRowInfoSignal()
      })
      .catch(() => {
        return
      })
  } else {
    operator.value = ''
  }
}

// 信号处理-新增，编辑预处理
const saveSignal = () => {
  editFormSignalRef.value.validate(async valid => {
    if (valid) {
      try {
        const params = {
          dev_id: dev_id.value,
          signal_proc_name: signalFormData.value.signal_proc_name,
          signal_proc_type: signalFormData.value.signal_proc_type,
          output_rate: +signalFormData.value.output_rate,
          // FEATURE 暂时固定只有一个信号，后续有新算法及多信号时需变更
          adapter_id: signalFormData.value.signals[0].value[1],
          signal_id: signalFormData.value.signals[0].value[2]
        }
        // TODO 新增，编辑保存接口
        if (operator.value === 'add') {
          await addSignalProc(params)
          ElMessage.success(t('prepro.addSuccess'))
        } else if (operator.value === 'edit') {
          params.id = signalFormData.value.id
          await updateSignalProc(params)
          ElMessage.success(t('prepro.editSuccess'))
        }
        operator.value = ''
        getSignalTableData()
      } catch (e) {
        console.log(e)
      }
    }
  })
}

// 信号处理-取消删除选择
const cancelSelectSignal = () => {
  operator.value = ''
  signalPreprocessTable.value.clearCheck()
}

// 信号处理-确认删除选择
// const signalDelVisible = ref(false)
const confirmDelSignal = () => {
  const { selectedList } = signalPreprocessTable.value
  if (!selectedList.length) {
    ElMessage.error(t('prepro.pleaseSelectDeleteContent'))
    return
  }
  delVisible.value = true
}

// 信号处理-编辑
const editPreSignal = () => {
  operator.value = 'edit'
  setCurRowInfoSignal()
  oldSignalFormData.value = _public.deepCopy(signalFormData.value)
}
// 信号处理-新增
const addPreSignal = () => {
  operator.value = 'add'
  signalFormData.value = _public.deepCopy(defaultSignalFormData.value)
  // editFormSignalRef.value && editFormSignalRef.value.resetForm()
  signalPreprocessTable.value.celarCurrentRow()
}

// 信号处理-删除确认
const deleteAllFnSignal = async () => {
  const { selectedList } = signalPreprocessTable.value
  const ids = selectedList.map(item => item.id)
  const params = {
    dev_id: dev_id.value,
    signal_proc_id_list: ids
  }
  // TODO 删除接口
  const res = await batchDeleteSignalProc(params)
  return res
}

// 信号处理-选择行
const signalCurRow = ref({})
// 页面选择行，设置行信息
const selectRowSignal = row => {
  if (operator.value === 'add') {
    highlight.value = false
    return
  }
  if (!row) {
    signalCurSelectedRow.value = null
    highlight.value = false
    return
  }
  highlight.value = true
  signalCurRow.value = row
  signalCurSelectedRow.value = row
  setCurRowInfoSignal()
}

// 设置编辑信息
const setCurRowInfoSignal = () => {
  // TODO 表格中当前行的信息展示到form表单中
  signalFormData.value = _public.deepCopy(signalCurRow.value)
}

// 信号处理-信号来源添加信号
const addSignal = () => {
  if (signalFormData.value.signal_proc_type === 1 && signalFormData.value.signals.length > 0) {
    ElMessage.warning('导数仅支持添加单个信号源！')
    return
  }
  signalFormData.value.signals.push({
    value: '',
    key: Date.now()
  })
}

// 获取信号下拉列表
const select = ref([])
const getSelectOptions = async () => {
  const params = {
    dev_id: dev_id.value
  }
  // await adapterSigSelect({devId: dev_id.value}).then(res => {
  //   select.value = res.data
  // })
  const res = await queryDevAdapterSignalList(params)
  select.value = useCascaderData(res.data.result)
}

// 两位小数校验
const numtwoPoint = /^(\d+([.]\d{0,2})?([eE][+-]?\d+)?)$/
const validateNumTwoPoint = (rule, value, callback) => {
  if (!numtwoPoint.test(value)) {
    callback(new Error('只能输入非负数,最多保留两位小数'))
  } else {
    callback()
  }
}
</script>

<style lang="scss" scoped>
.preprocess-tool {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.preprocess-content {
  display: grid;
  grid-template-columns: 838px 838px;
  gap: 24px;
  margin-top: 17px;
  .content_left {
    width: 851px;
    height: 100%;
  }
  .content_right {
    width: 697px;
    height: 100%;
  }
  .uj-contaner + .uj-contaner {
    margin: 0;
  }
  .UJ-form {
    .UJ-form-item {
      align-items: center;
      margin-bottom: 24px;
    }
  }
}
:deep(.search-form-container[data-v-5fcaf548] .UJ-form-item .UJ-form-item__label) {
  width: auto;
}
.signal-list {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.form-text {
  font-size: 24px;
  font-weight: 400;
  height: 100%;
  line-height: 1.6em;
  align-items: center;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &.text-highlight {
    color: var(--UJ-color-primary);
  }
}
.extra-form-divider {
  margin: 32px 0;
}
.extra-form-item {
  height: 50px;
  margin: 50px 0;
}
</style>
