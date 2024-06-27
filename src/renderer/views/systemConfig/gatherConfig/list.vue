<template>
  <div
    class="list-wrap"
    v-loading.fullscreen="loading"
    :element-loading-text="'loading...'"
    element-loading-background="rgba(0,0,0,0.7)"
  >
    <div class="list-add-btn">
      <elPopover1
        :title="t('latheContent.prompt')"
        trigger="click"
        width="30%"
        placement="bottom-end"
        v-model:visible="isTipsPopover"
      >
        <div class="tooplis">
          <div class="tooplis-storage">
            <div class="tooplis-storage-left" :class="isStorageAlive ? 'active' : ''">
              <span>{{ isStorageAlive ? '原始数据缓存中' : '原始数据未缓存' }}</span>
            </div>
            <div
              @click="changeStorageStatus"
              class="tooplis-storage-right"
              :class="[isStorageAlive ? 'active' : 'inactive', isSelectStorage ? 'selected' : '']"
            >
              <span>{{ isStorageAlive ? '结束缓存' : '开始缓存' }}</span>
            </div>
          </div>
          <el-form
            ref="ruleFormRef"
            :model="tempStorageConfig"
            :rules="storageFormRules"
            class="demo-ruleForm"
            status-icon
            label-position="left"
          >
            <el-form-item label="数据同步源：" prop="conditionsele">
              <span class="storage-name" v-if="isStorageAlive">{{ storageConfig }}</span>
              <el-cascader
                v-else
                v-model="tempStorageConfig.conditionsele"
                @change="choseDataResource"
                :options="select"
              />
            </el-form-item>
          </el-form>
        </div>
        <template #reference>
          <el-button
            @click="isTipsPopover = true"
            link
            v-if="selectedMachine"
            style="padding-left: 0; padding-right: 0"
          >
            <img class="btn-storage" src="@renderer/assets/icons/svg/common/storage.svg" alt="" />
          </el-button>
        </template>
      </elPopover1>
      <el-button @click="preprocessConfig" type="primary" size="default" v-if="selectedMachine">
        {{ t('collector.preprocessConfig') }}
      </el-button>
      <el-button
        @click="changeToolDialog"
        type="primary"
        size="default"
        v-if="selectedMachine && tableData.length"
      >
        <el-icon>
          <Plus />
        </el-icon>
        {{ t('collector.addCollector') }}
      </el-button>
    </div>
    <elDialog1 :title="t('collector.addCollector')" v-model="isAddTool" center v-if="isAddTool">
      <addCollector
        @getList="getList"
        @getDevList="getDevList"
        @getSelectOptions="getSelectOptions"
        :selectedMachine="selectedMachine"
        v-model:isAddTool="isAddTool"
      ></addCollector>
    </elDialog1>

    <div class="no-data" v-if="!tableData.length">
      <img src="@renderer/assets/images/svg/table/nodata.svg" alt="" />
      <div class="explain">
        <span>{{ t('collector.noAdapter') }}</span>
        <el-button @click="changeToolDialog" type="primary" size="default">
          {{ t('collector.goAdd') }}
        </el-button>
      </div>
    </div>

    <!-- 有数据展示 -->
    <baseContaner class="table-wrap" v-else>
      <div>
        <el-table
          :data="tableData"
          :border="true"
          :empty-text="t('collector.noData')"
          style="width: 100%"
          @expand-change="expandChange"
          :row-class-name="getRowClass"
          height="39.06vw"
        >
          <el-table-column type="expand">
            <template #default="scope">
              <!-- 点击收缩展开 -->
              <tableExpand
                v-if="scope.row.connect_status"
                :realTimeList="realTimeList"
                :selectedMachine="selectedMachine"
                :row="scope.row"
                :signalsList="signalsList"
              ></tableExpand>
            </template>
          </el-table-column>
          <el-table-column :label="t('collector.adapterName')" prop="name"> </el-table-column>
          <el-table-column :label="t('collector.adapterType')">
            <template #default="scope">
              <span class="gather-type nc-type" v-if="scope.row.collector_type_id == 1"
                >{{ scope.row.collector_type_name }}
              </span>
              <span class="gather-type usv-type" v-if="scope.row.collector_type_id == 3"
                >{{ scope.row.collector_type_name }}
              </span>
              <span class="gather-type usp-type" v-if="scope.row.collector_type_id == 2"
                >{{ scope.row.collector_type_name }}
              </span>
              <span class="gather-type afr-type" v-if="scope.row.collector_type_id == 4"
                >{{ scope.row.collector_type_name }}
              </span>
              <span class="gather-type cjk-type" v-if="scope.row.collector_type_id == 5"
                >{{ scope.row.collector_type_name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="t('collector.connectStatus')" prop="name">
            <template #default="scope">
              <div class="link-wrap">
                <span :class="scope.row.connect_status ? 'link-type' : 'link-type-disabled'">{{
                  scope.row.connect_status_name
                }}</span>
                <span
                  class="link-status"
                  :class="scope.row.connect_status ? '' : 'link-status-disabled'"
                ></span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="t('collector.connectWay')" prop="ip">
            <template #default="scope">
              <div v-show="scope.row.connect_status">
                <div v-if="scope.row.collector_type_name === 'AFR'">
                  Com:Com{{ scope.row.port }}
                </div>
                <div
                  v-else-if="
                    scope.row.collector_type_name === 'USP' &&
                    scope.row.extra_param?.find(d => d.key === 'usp900_connection_type')
                      ? +scope.row.extra_param?.find(d => d.key === 'usp900_connection_type')
                          ?.value === 0
                      : false
                  "
                >
                  Com:Com{{ scope.row.port }}
                </div>
                <div v-else>IP:{{ scope.row.ip }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="t('collector.operater')">
            <template #default="scope">
              <div class="operate-wrap">
                <img
                  src="@renderer/assets/icons/svg/operator/link.svg"
                  alt=""
                  v-show="
                    scope.row.connect_status &&
                    (['NC', 'USV', '采集卡'].includes(scope.row.collector_type_name) ||
                      (['USP'].includes(scope.row.collector_type_name) &&
                        scope.row.hardware_id === 502))
                  "
                  @click="changeConnect(scope.row.id, scope.row.connect_status)"
                />
                <img
                  @click="changeConnect(scope.row.id, scope.row.connect_status)"
                  v-show="
                    !scope.row.connect_status &&
                    (['NC', 'USV', '采集卡'].includes(scope.row.collector_type_name) ||
                      (['USP'].includes(scope.row.collector_type_name) &&
                        scope.row.hardware_id === 502))
                  "
                  src="@renderer/assets/icons/svg/operator/link_green.svg"
                  alt=""
                />
                <!-- 删除 -->
                <el-popover
                  ref="popover"
                  class="popover-wrap"
                  placement="bottom"
                  :width="450"
                  trigger="click"
                  :visible="isPopoverList[scope.$index]"
                >
                  <template #reference>
                    <img
                      @click="isPopoverList[scope.$index] = true"
                      src="@renderer/assets/icons/svg/operator/delete_c.svg"
                      alt=""
                    />
                  </template>
                  <div class="popover-content">
                    <div class="title-wrap">
                      <div class="title">
                        <div></div>
                        <div>{{ t('collector.tips') }}</div>
                      </div>
                      <img
                        @click="closePopover(scope.$index)"
                        src="@renderer/assets/icons/svg/operator/close.svg"
                        alt=""
                      />
                    </div>
                    <div class="content">
                      {{ t('collector.confirmDelete', { val: scope.row.name }) }}
                    </div>
                    <div class="operate-btn">
                      <el-button
                        type="primary"
                        size="default"
                        plain
                        @click="closePopover(scope.$index)"
                        >{{ t('collector.cancel') }}</el-button
                      >
                      <el-button
                        @click="deleteAdapter(scope.row, scope.$index)"
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
                  @click="skipDetail(scope.row, scope.$index)"
                  src="@renderer/assets/icons/svg/operator/yellowView.svg"
                  alt=""
                />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </baseContaner>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import { adapterSigSelect } from '@renderer/api/system/nodeurl'
import baseContaner from '@renderer/components/common/baseContaner.vue'
import { _public } from '@renderer/utils/common'
import addCollector from './components/addCollector.vue'
import tableExpand from './components/tableExpand.vue'
import { Plus } from '@element-plus/icons-vue'
import { basicInterface } from '@renderer/api/system/system'
import { useSignalController } from '@renderer/hooks/useSignalController'
import { useI18n } from 'vue-i18n'
import { useStoreSignal } from '@renderer/store/useSignals'
import { useSysStore } from '@renderer/store/useSys'
import { storeToRefs } from 'pinia'

const { signal, _worker } = useSignalController()
const storeSignal = useStoreSignal()
const { adapterList } = storeToRefs(useSysStore())
const { t } = useI18n()

onMounted(() => {
  getCollectorList()
})

const realTimeList = ref({}) // 实时数据信息
// tcp调用接口成功回调
_worker.addEventListener(
  'message',
  res => {
    const { type, payload } = res.data
    switch (type) {
      // 实时数据回调
      case 'realTimeCharData':
        realTimeList.value = payload
        break
    }
  },
  { signal }
)
const loading = ref(false)
// 获取采集器类型
const collectorList = ref([])
let timer = null
const getCollectorList = async () => {
  loading.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    loading.value = false
  }, 6000)
  const res = await basicInterface({
    version: '1.0',
    method: 'enum_collector_type',
    id: '5',
    params: {}
  })
  collectorList.value = res.data.result.collector_type_list
  getMachineList()
}

// 获取机床列表
const selectedMachine = ref()
const machineTabList = ref([])
const getMachineList = async () => {
  const res = await basicInterface({
    version: '1.0',
    method: 'enum_dev_list',
    id: '9',
    params: {}
  })
  machineTabList.value = res.data.result.dev_list.filter(d => d.dev_type === MCM)
  if (machineTabList.value.length) {
    selectedMachine.value = machineTabList.value[0].dev_id
    getSelectOptions()
    await getList()
    await getDevList()
    loading.value = false
  } else {
    // 没有机床默认添加一个，作为采集配置的模版机床用于后续采集器的添加
    const params = {
      mch_id: MCM,
      dev_name: MCM,
      dev_brand: '',
      dev_type: MCM,
      dev_extra_param: '1',
      channel_info_list: [
        {
          nc_channel_info: {
            channel_num: 1
          },
          // NC轴信息
          nc_axis_list: [
            {
              axis_type: 0,
              axis_num: 1,
              name: '主轴'
            }
          ]
        }
      ]
    }
    const res = await basicInterface({
      version: '1.0',
      method: 'add_dev',
      id: '10',
      params
    })
    if (res.data.result) {
      selectedMachine.value = res.data.result.dev_id
    } else {
      ElMessage.error(t('collector.addMachineFail'))
    }
    loading.value = false
  }
}

// 获取机床详情列表
const machineDetailList = ref([])
const pathNumList = ref([]) // nc所有通道数据
const getDevList = async () => {
  const res = await basicInterface({
    version: '1.0',
    method: 'enum_dev_detail_info',
    id: '67',
    params: {}
  })
  machineDetailList.value = res.data.result.dev_info_list
  // 找出所有NC的通道
  pathNumList.value = []
  for (const item of machineDetailList.value) {
    if (item.dev_info.dev_id === selectedMachine.value) {
      for (const val of item.adapter_info_list) {
        // = 1 代表是nc
        if (val.adapter_info.collector_type_id === 1) {
          // 代表是 NC
          // ncPathNumList.value.push(val)
          pathNumList.value.push({
            id: val.adapter_info.id,
            path_num: val.adapter_info.path_num
          })
        }
      }
    }
  }
}

// 原始数据缓存
const isTipsPopover = ref(false) // 监控原始数据缓存popover
const isStorageAlive = ref(false) // 原始数据是否缓存状态
const isSelectStorage = ref(false) // 数据同步源是否选择
const storageConfig = ref() // 存储同步信号名称
const select = ref([])
const tempStorageConfig = reactive({
  conditionsele: []
})
//from表单节点
const ruleFormRef = ref()
// 获取数据同步源下拉列表
const getSelectOptions = () => {
  adapterSigSelect({ devId: selectedMachine.value }).then(res => {
    select.value = res.data
    getStorageConfig()
  })
}
// 三级菜单拼接
const getConditionList = item => {
  let arr = []
  if (item.is_nc === -1) {
    return arr
  }
  if (item.is_nc === 1) {
    arr = ['nc', item.adapter_id, item.sig_id]
  } else {
    const other = select.value.filter(d => d.value !== 'nc')
    let axis = ''
    for (const d of other) {
      if (d.children.find(k => k.value === item.adapter_id)) {
        axis = d.value
        break
      }
    }
    arr = [axis, item.adapter_id, item.sig_id]
  }
  return arr
}
// from表单验证规则
const storageFormRules = reactive({
  conditionsele: [{ required: true, message: t('latheContent.pleaseSelect'), trigger: 'change' }]
})
// 获取存储同步信号数据
const getStorageConfig = async () => {
  const res = await basicInterface({
    version: '1.0',
    method: 'get_dev_storage_conf',
    id: '106',
    params: {
      dev_id: selectedMachine.value
    }
  })
  const obj = res.data.result
  isStorageAlive.value = obj.is_storage_conf === 1 ? true : false
  const conditionsele = getConditionList(obj)
  if (conditionsele) {
    const a = select.value.find(obj => obj.value === conditionsele[0]) || {}
    const b = a.children?.find(obj => obj.value === conditionsele[1]) || {}
    const c = b.children?.find(obj => obj.value === conditionsele[2]) || {}
    storageConfig.value = a.label + '/' + b.label + '/' + c.label
  }
  tempStorageConfig.value = {
    conditionsele: conditionsele
  }
}
// 选择数据同步源
const choseDataResource = data => {
  if (data) {
    isSelectStorage.value = true
  }
}
const resetStorageForm = () => {
  // 重置表单
  if (ruleFormRef.value) {
    ruleFormRef.value.resetFields()
  }
  isSelectStorage.value = false
}

// 变更机床存储同步信号
const changeStorageStatus = async () => {
  if (!isStorageAlive.value && !isSelectStorage.value) {
    ruleFormRef.value.validate(() => {})
    return
  }
  let tempMethod = 'set_storage_sync_signal'
  let tempId = '26'
  let tempParams = {
    dev_id: selectedMachine.value,
    adapter_id: tempStorageConfig.conditionsele[1],
    sig_id: tempStorageConfig.conditionsele[2]
  }
  if (isStorageAlive.value) {
    // 需要结束同步
    tempMethod = 'unset_storage_sync_signal'
    tempId = '27'
    tempParams = {
      dev_id: selectedMachine.value
    }
  }
  await basicInterface({
    version: '1.0',
    method: tempMethod,
    id: tempId,
    params: tempParams
  })
  resetStorageForm()
  getStorageConfig()
}

// 获取表格数据
const tableData = ref([]) // 筛选后页面需要展示
const allTableData = ref([]) // 实际上列表返回的数据
let tempTableData = []
let tableIndex = 0
let firstNcData = null
const getList = async () => {
  await unsubscribe()
  firstNcData = null
  const res = await basicInterface({
    version: '1.0',
    method: 'enum_adapters',
    id: '8',
    params: {
      dev_id: selectedMachine.value
    }
  })
  allTableData.value = []
  tableData.value = []
  tableIndex = 0
  tempTableData = res.data.result.adapter_list
  tempTableData.length && (await getAdapterStatus(res.data.result.adapter_list[0]))
  adapterList.value = tableData.value.filter(d => d.collector_type_id !== 1 && d.connect_status)
}

// 获取采集器状态 -- 递归方法
const getAdapterStatus = async item => {
  const res = await basicInterface({
    version: '1.0',
    method: 'get_adapter_status',
    id: '46',
    params: {
      dev_id: selectedMachine.value,
      adapter_id: item.id
    }
  })

  const tempData = {
    connect_status: res.data.result.connect_status,
    connect_status_name: res.data.result.connect_status ? '已连接' : '未连接',
    collector_type_name: collectorList.value.filter(
      val => val.type_id === item.collector_type_id
    )[0].name
  }

  if (firstNcData && item.collector_type_id === 1) {
    tableData.value.find(d => d.id === firstNcData.id).ids.push(item.id)
  }

  // 过滤多通道数据
  // 需要在页面展示的数据
  // 代表是 nc, 筛选只展示第一条NC采集器的数据
  if ((!firstNcData && item.collector_type_id === 1) || item.collector_type_id !== 1) {
    if (item.collector_type_id === 1) {
      firstNcData = item
    }
    tableData.value.push({
      ...item,
      path_num: item.collector_type_id === 1 ? pathNumList.value.length : 0,
      ...tempData,
      ids: [item.id]
    })
  }

  // 接口返回的总的数据
  allTableData.value.push({
    ...item,
    ...tempData
  })

  if (tableIndex !== tempTableData.length - 1) {
    tableIndex++
    await getAdapterStatus(tempTableData[tableIndex])
  }
}

// 改变连接状态
const changeConnect = async (id, connect_status) => {
  let tempMethod = 'adapter_connect'
  let tempId = '52'
  if (connect_status) {
    // 需要断连
    tempMethod = 'adapter_disconnect'
    tempId = '53'
  }
  await basicInterface({
    version: '1.0',
    method: tempMethod,
    id: tempId,
    params: {
      dev_id: selectedMachine.value,
      adapter_id: id
    }
  })

  // 改变列表连接状态
  for (const val of tableData.value) {
    if (val.id === id) {
      val.connect_status = !connect_status
      val.connect_status_name = !connect_status ? '已连接' : '未连接'
      break
    }
  }
  adapterList.value = tableData.value.filter(d => d.collector_type_id !== 1 && d.connect_status)
}

// 获取机床物理通道列表
const getMachineChannelList = async () => {
  const res = await basicInterface({
    version: '1.0',
    method: 'enum_channel_nc_adapter_id',
    id: '76',
    params: {
      dev_id: +selectedMachine.value
    }
  })
  const { nc_channel_list } = res.data.result
  const list = nc_channel_list.map(d => d.channel)
  sessionStorage.setItem('nc_channel_list', JSON.stringify(list))
}

// 删除采集器
const deleteAdapter = async (row, index) => {
  if (row.collector_type_id === 1) {
    // 代表是 NC，需要把所有的NC采集器一并删除
    for (const val of allTableData.value) {
      if (val.collector_type_id === 1) {
        await basicInterface({
          version: '1.0',
          method: 'delete_adapter',
          id: '16',
          params: {
            dev_id: selectedMachine.value,
            adapter_id: val.id
          }
        })
        getMachineChannelList()
      }
    }
  } else {
    await basicInterface({
      version: '1.0',
      method: 'delete_adapter',
      id: '16',
      params: {
        dev_id: selectedMachine.value,
        adapter_id: row.id
      }
    })
  }
  closePopover(index)
  ElMessage.success(t('collector.deleteSuccess'))
  getSelectOptions()
  getList()
}
// ------------ popover 弹窗相关
import { ElPopover } from 'element-plus'
const popover = ref(null)
const isPopoverList = ref([])
const closePopover = index => {
  isPopoverList.value[index] = false
}

// 详情
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { MCM } from '@renderer/assets/static'
const router = useRouter()
const skipDetail = (item, index) => {
  const type_name = item.hardware_id === 1102 ? 'UGD' : item.collector_type_name // UGD采集卡判断
  switch (type_name) {
    case 'NC':
      storeSignal.changeSignalList(null)
      router.push({
        path: '/gatherConfig/NCDetail',
        query: {
          dev_id: selectedMachine.value,
          adapter_id: tempTableData.filter(d => d.collector_type_id === 1).map(val => val.id)
        }
      })
      break
    case 'USV':
      router.push({
        path: '/gatherConfig/USVDetail',
        query: {
          dev_id: selectedMachine.value,
          adapter_id: tableData.value[index].id
        }
      })
      break
    case 'USP':
      router.push({
        path: '/gatherConfig/USPDetail',
        query: {
          dev_id: selectedMachine.value,
          adapter_id: tableData.value[index].id
        }
      })
      break
    case 'AFR':
      router.push({
        path: '/gatherConfig/AFRDetail',
        query: {
          dev_id: selectedMachine.value,
          adapter_id: tableData.value[index].id
        }
      })
      break
    case 'UGD':
      router.push({
        path: '/gatherConfig/UGDDetail',
        query: {
          dev_id: selectedMachine.value,
          adapter_id: tableData.value[index].id
        }
      })
      break
    case '采集卡':
      router.push({
        path: '/gatherConfig/LDDetail',
        query: {
          dev_id: selectedMachine.value,
          adapter_id: tableData.value[index].id
        }
      })
      break
  }
}

// 新增 / 编辑机床
const isAddTool = ref(false)
const changeToolDialog = () => {
  isAddTool.value = true
}

// 监听表格是否展示行
let spreadExpendList = [] // 当前展开的表格id,也就是当前已经订阅的列表
const signalsList = ref([]) // 信号列表
const expandChange = async (row, rows) => {
  // 如果是空的，不订阅
  if (!row.connect_status) {
    return
  }

  // 判断当前行是否展开
  const isExpand = rows.some(item => item.id === row.id)
  // if (spreadExpendList.includes(row.id)) {
  if (!isExpand) {
    // 取消推送数据
    for (const adapterId of row.ids) {
      await basicInterface({
        version: '1.0',
        method: 'unsubscribe_single_signal',
        id: '33',
        params: {
          dev_id: selectedMachine.value,
          adapter_id: adapterId,
          token: sessionStorage.getItem('token')
        }
      })
    }

    const index = spreadExpendList.indexOf(row.id)
    spreadExpendList.splice(index, 1)

    if (!spreadExpendList.length) {
      _worker.postMessage({
        type: 'stopPushChartData',
        payload: {}
      })
    }
  } else {
    // 获取信号详情（包括采集方式地址等等）
    if (row.collector_type_id === 1) {
      signalsList.value = []
      const path_num = row.path_num || 1
      for (let i = 0; i < path_num; i++) {
        const resSignalDetail = await basicInterface({
          version: '1.0',
          method: 'enum_collector_detail_signal_info',
          id: '68',
          params: {
            dev_id: selectedMachine.value,
            adapter_id: row.id
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
        // 储存采集器id
        const tempId = pathNumList.value.filter(child => child.path_num === i + 1)[0]?.id

        // 格式化信号枚举（通过信号id -> 信号obj）
        for (const j in signalsList.value[i]) {
          signalsList.value[i][j] = {
            ...signalsList.value[i][j],
            id: tempId,
            ..._public.findObj(tempList, 'sig_id', signalsList.value[i][j].sig_id),
            isChecked: 1,
            // 初始化 - 为了v-model不报错
            realTimeData: {
              val: ['--']
            }
          }
        }
        // }
        storeSignal.changeSignalList(signalsList.value)
      }
    }
    for (const adapterId of row.ids) {
      // 开始订阅数据
      await basicInterface({
        version: '1.0',
        method: 'subscribe_single_signal',
        id: '32',
        params: {
          dev_id: selectedMachine.value,
          adapter_id: adapterId,
          sig_id_list: [],
          token: sessionStorage.getItem('token')
        }
      })
    }

    // 订阅实时数据
    if (!spreadExpendList.length) {
      _worker.postMessage({
        type: 'startPushChartData',
        payload: {}
      })
    }

    spreadExpendList.push(row.id)
    spreadExpendList = [...new Set(spreadExpendList)] // 去重
  }
}

// 取消订阅
const unsubscribe = async () => {
  for (const val of spreadExpendList) {
    // 取消订阅
    await basicInterface({
      version: '1.0',
      method: 'unsubscribe_single_signal',
      id: '33',
      params: {
        dev_id: selectedMachine.value,
        adapter_id: val,
        token: sessionStorage.getItem('token')
      }
    })
    // 退订实时数据
    _worker.postMessage({
      type: 'stopPushChartData',
      payload: {}
    })
  }
  spreadExpendList = []
}

onBeforeUnmount(async () => {
  unsubscribe()
})

// 判断当前行是佛与需要收缩图标
const getRowClass = row => {
  if (!row.row.connect_status) {
    return 'row-expand-cover'
  }
}

const isExpendList = ref([]) // 当前行是否需要展开
watch(
  () => tableData,
  () => {
    // 计算哪行需要展开图标
    isExpendList.value = []
  },
  { deep: true }
)

//预处理配置
const preprocessConfig = () => {
  router.push({
    path: '/gatherConfig/preprocess',
    query: { dev_id: selectedMachine.value }
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
  height: 100%;
  width: 100%;
  padding-top: 70px;

  .list-add-btn {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 10;
    .btn-storage {
      display: inline-block;
      width: 50px;
      height: auto;
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
    height: 100%;
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

    .gather-type {
      display: inline-block;
      border-radius: 20px;
      padding: 3px 15px;
    }
    .nc-type {
      color: rgb(42, 227, 4);
      background: rgba(42, 227, 4, 0.2);
    }
    .usv-type {
      color: rgb(235, 106, 2);
      background: rgba(235, 106, 2, 0.2);
    }
    .usp-type {
      color: rgb(252, 200, 3);
      background: rgba(252, 200, 3, 0.2);
    }

    .afr-type {
      color: rgba(108, 159, 255);
      background: rgba(83, 143, 255, 0.2);
    }

    .cjk-type {
      color: rgb(65, 180, 207);
      background: rgba(65, 180, 207, 0.2);
    }

    .link-wrap {
      display: flex;
      align-items: center;

      .link-type {
        color: rgb(42, 227, 4);
      }
      .link-type-disabled {
        color: rgb(155, 155, 155);
      }
      .link-status {
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

    .operate-wrap {
      & > img {
        width: 44px;
        margin-right: 16px;
        cursor: pointer;
      }
    }
  }

  .add-tool-wrap {
    padding-bottom: 60px;
    .tool-content {
      background: rgb(26, 29, 44);
      border-radius: 10px;
      padding: 10px 25px 20px 25px;
      font-size: 22px;
      line-height: 50px;

      .title {
        margin-top: 10px;
      }

      :deep(.UJ-input__wrapper) {
        background: rgb(26, 29, 44);
      }
    }

    .btn-operate {
      margin-top: 35px;
      margin-bottom: -30px;
      float: right;
    }
  }
}
.tooplis {
  background: rgb(26, 29, 44);
  border-radius: 8px;
  padding: 8px 15px;
  text-align: left;
  .tooplis-storage {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .tooplis-storage-left {
      flex: 2;
      text-align: left;
      position: relative;
      color: rgb(155, 155, 155);
      padding-left: 20px;
      span {
        &::before {
          content: '';
          display: block;
          width: 10px;
          height: 10px;
          position: absolute;
          top: 10px;
          left: 0;
          border-radius: 100%;
          background: rgb(155, 155, 155);
        }
      }
      &.active {
        color: rgb(42, 227, 4);
        span {
          &::before {
            background: rgb(42, 227, 4);
          }
        }
      }
    }
    .tooplis-storage-right {
      flex: 1;
      text-align: right;
      position: relative;
      cursor: pointer;
      color: rgb(155, 155, 155);
      &.active {
        color: rgb(252, 12, 3);
      }
      &.inactive {
        &.selected {
          color: rgb(65, 180, 207);
        }
      }
      &::before {
        content: '';
        display: block;
        position: absolute;
        top: 8px;
        width: 1px;
        height: 20px;
        background: #fff;
      }
    }
  }
  .demo-ruleForm {
    margin-top: 30px;
    .storage-name {
      font-size: var(--UJ-form-label-font-size);
    }
    :deep(.UJ-form-item) {
      align-items: center;
    }
  }
}
</style>
