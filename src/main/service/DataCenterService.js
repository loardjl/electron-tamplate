// 采集配置
const BaseService = require('./BaseService')
const Parser = require('binary-parser').Parser
const Axios = require('axios')
const { serverCfg, run, runDev } = require('../config/index')

class DataCenterService extends BaseService {
  constructor() {
    super()
    this.struct = this.STRUCT_TYPE.collectStruct
    this.realtimeData = {}
    this.wbSocket
    this.timestamp = new Date().getTime()
    this.ver = '1.0' // dc version
    // do采集器获 定时器 map集合
    this.doIntervalMap = new Map()
    this.doDataMap = new Map()
  }

  // 获取token
  getToken() {
    const buffer = Buffer.alloc(0)
    return this.getTotalBuffer(buffer, [0x00, 0x00, 0x01, 0x01])
  }

  ncSignalVal(dataBuff, msgType) {
    const result = this.struct[msgType](dataBuff.length).parse(dataBuff)
    const sig_id = result.values[0].sig_id
    result.timestamp = Number(result.timestamp)
    for (const item of result.values) {
      if (item.sig_data_type === 0) {
        // 32位整型
        const p = new Parser().array('val', { length: item.nums, type: 'uint32le' })
        item.val = p.parse(item.val).val
      } else if (item.sig_data_type === 1) {
        // 单精度浮点型
        const p = new Parser().array('val', { length: item.nums, type: 'floatle' })
        const val = p.parse(item.val).val
        const arr = []
        val.forEach(e => {
          arr.push(Number.parseFloat(e).toFixed(4))
        })
        item.val = arr
      } else if (item.sig_data_type === 3) {
        item.val = [parseInt(item.val[0], 10)]
      } else {
        // 字符串类型
        if (item.buffer_len > 0) {
          const p = new Parser().string('val', { length: item.buffer_len, stripNull: true })
          item.val = [p.parse(item.val).val]
        } else {
          item.val = ''
        }
      }
    }
    if (!this.realtimeData[result.collector_id]) {
      this.realtimeData[result.collector_id] = {
        dev_id: result.dev_id, // 机床id
        collector_id: result.collector_id, // 采集器id
        300: [], //usv-x-357
        301: [], //usv-y-357
        302: [], //usv-z-357
        303: [], // usv-x-655
        304: [], // usv-y-655
        305: [], // usv-z-655
        310: [], // afr
        57: [], // 凌顶采集卡ad模拟电压
        50: [], // usp三相电流-合项功率
        51: [], // usp三相电流-B相电流
        52: [], // usp三相电流-C相电压
        metric: {}
      }
    }

    const collector_id = result.collector_id
    if ([300, 301, 302, 303, 304, 305, 310, 57, 50, 51, 52].includes(sig_id)) {
      const tmpt = new Date().getTime()
      this.timestamp = tmpt
      result.values[0].val = result.values[0].val[0]
      this.realtimeData[collector_id][sig_id].push({
        ...result.values[0],
        timestamp: result.timestamp
      })
    } else {
      this.realtimeData[collector_id].metric[sig_id] = result.values[0]
    }
  }

  // 停止推送
  stopPushChartData() {
    this.logger.info('stopPushChartData---------')
    clearInterval(this.pushTimer)
    this.wbSocket = null
  }

  // 实时数据推送
  startPushChartData(socket) {
    if (this.pushTimer) {
      clearInterval(this.pushTimer)
      this.wbSocket = null
    }
    this.wbSocket = socket
    this.pushTimer = setInterval(() => {
      this.logger.info(JSON.stringify(this.realtimeData), '推送实时数据------')
      this.wbSocket.emit('realTimeCharData', this.realtimeData)
      this.realtimeData = {}
    }, 1000)
  }

  // 信号级联下拉项
  async adapterSigSelectList(body) {
    const { devId } = body
    const result = {
      nc: {
        value: 'nc',
        label: 'NC',
        children: []
      },
      other: {
        value: 'other',
        label: '其他',
        children: []
      }
    }
    const adapterSigMap = {} // 采集器、信号映射关系
    const url = this.dcUrl

    // 枚举机床采集器、枚举信号字典、枚举机床的预处理指标、枚举NC通道、轴、和采集器
    const [adapterRes, sigRes, preprocessRes, ncChnnelRes, sigProcRes] = await Promise.all([
      Axios.post(url, {
        version: this.ver,
        method: 'enum_adapters',
        id: '8',
        params: { dev_id: devId }
      }),
      Axios.post(url, {
        version: this.ver,
        method: 'enum_signals',
        id: '4',
        params: {}
      }),
      Axios.post(this.preUrl, {
        version: this.ver,
        method: 'enum_dev_preprocess_instance_list',
        id: '3',
        params: { dev_id: devId }
      }),
      Axios.post(url, {
        version: this.ver,
        method: 'enum_nc_channel_info',
        id: '69',
        params: { dev_id: devId }
      }),
      Axios.post(url, {
        version: this.ver,
        method: 'enum_dev_signal_proc_list',
        id: '522',
        params: { dev_id: devId }
      })
    ])
    const fixedSig = sigRes.data.result.fixed_signals // 固定信号
    const dynamicSig = sigRes.data.result.dynamic_signals // 自定义信号
    const sigAll = [...fixedSig, ...dynamicSig]
    const sigMap = {} // 信号 id 和 name 的对应关系
    for (const item of sigAll) {
      sigMap[item.sig_id] = item.display_name
    }

    // 获取nc、传感器对应的信号
    const adapterList = adapterRes.data.result.adapter_list
    const collectorSignalsReqArr = []
    for (const item of adapterList) {
      adapterSigMap[item.id] = {
        value: item.id, // 采集器id
        label: item.name, // 采集器名称
        collector_type_id: item.collector_type_id, // 采集器类型 1 nc, !1 传感器
        children: [] // 采集器对应使能信号列表
      }
      if (item.collector_type_id === 1) {
        adapterSigMap[item.id].path_num = item.path_num
        adapterSigMap[item.id].label = `通道${item.path_num}`
      }
      // 获取nc 和传感器对应的信号列表
      collectorSignalsReqArr.push(
        Axios.post(url, {
          version: this.ver,
          method: 'get_collector_signals',
          id: '17',
          params: {
            dev_id: devId,
            adapter_id: item.id
          }
        })
      )
    }
    const collectorSignalsList = await Promise.all(collectorSignalsReqArr)
    for (const item of collectorSignalsList) {
      const d = item.data.result
      const arr = [...d.fixed_signals, ...d.dynamic_signals]
      //  名称拼接
      for (const id of arr) {
        adapterSigMap[d.adapter_id].children.push({
          value: id,
          label: sigMap[id]
        })
      }
    }
    for (const item of sigProcRes.data.result.signal_proc_list) {
      console.log(item.signal_proc_signal_id)
      adapterSigMap[item.adapter_id].children.push({
        value: item.signal_proc_signal_id,
        label: item.signal_proc_name
      })
    }
    this.logger.info(adapterSigMap, '************')
    // 拼接预处理信号
    const preList = preprocessRes.data.result.preprocess_instance_conf_list
    for (const item of preList) {
      if (adapterSigMap[item.adapter_id]) {
        adapterSigMap[item.adapter_id].children.push({
          value: item.indicator_id,
          label: item.alias_name
        })
      }
    }
    // 删除没有信号的通道和传感器
    for (const k in adapterSigMap) {
      if (adapterSigMap[k].children.length <= 0) {
        delete adapterSigMap[k]
      }
    }

    // 拼接轴和采集器的对应关系
    const ncChnnelData = ncChnnelRes.data.result.channel_info_list
    this.logger.info(JSON.stringify(ncChnnelData), '************')
    for (const item of ncChnnelData) {
      const axisList = item.axis_info_list
      for (const axis of axisList) {
        result[axis.axis_info.axis_num] = {
          value: axis.axis_info.axis_num,
          label: axis.axis_info.name,
          children: []
        }
        for (const id of axis.adapter_id_list) {
          if (adapterSigMap[id]) {
            result[axis.axis_info.axis_num].children.push(adapterSigMap[id])
            delete adapterSigMap[id]
          }
        }
      }
    }

    for (const k in adapterSigMap) {
      if (adapterSigMap[k].collector_type_id === 1) {
        result.nc.children.push(adapterSigMap[k])
      } else {
        result.other.children.push(adapterSigMap[k])
      }
    }
    for (const k in result) {
      if (result[k].children.length <= 0) {
        delete result[k]
      }
    }
    return Object.values(result)
  }

  // 获取通道下信号
  async ChnnelSigSelectList(body) {
    const { devId, channel } = body
    const url = this.dcUrl
    const result = []
    // 根据通道查询NC采集器ID
    const adapterRes = await Axios.post(url, {
      version: this.dcVer,
      method: 'get_nc_adapter_id_by_channel',
      id: '73',
      params: { dev_id: devId, channel }
    })

    const adapterId = adapterRes.data.result.nc_adapter_id
    this.logger.info(adapterRes.data.result, 'adapterRes.data.result')
    let adapterName = ''
    const [adapterSigRes, sigRes, ncAdapterRes] = await Promise.all([
      Axios.post(url, {
        version: this.dcVer,
        method: 'get_collector_signals',
        id: '17',
        params: { dev_id: devId, adapter_id: adapterId }
      }),
      Axios.post(url, {
        version: this.dcVer,
        method: 'enum_signals',
        id: '4',
        params: {}
      }),
      Axios.post(url, {
        version: this.dcVer,
        method: 'enum_adapters',
        id: '8',
        params: { dev_id: devId }
      })
    ])
    // 获取所有信号id
    this.logger.info(adapterSigRes.data.result, '-------------')
    for (const item of ncAdapterRes.data.result.adapter_list) {
      if (item.id === adapterId) {
        adapterName = item.name
        break
      }
    }

    for (const id of adapterSigRes.data.result.fixed_signals) {
      for (const item of sigRes.data.result.fixed_signals) {
        if (id === item.sig_id) {
          result.push({
            adapter_id: adapterId,
            adapter_name: adapterName,
            sig_id: id,
            sig_name: item.display_name
          })
          break
        }
      }
    }

    for (const id of adapterSigRes.data.result.dynamic_signals) {
      for (const item of sigRes.data.result.dynamic_signals) {
        if (id === item.sig_id) {
          result.push({
            adapter_id: adapterId,
            adapter_name: adapterName,
            sig_id: id,
            sig_name: item.display_name
          })
          break
        }
      }
    }
    return result
  }

  async adapters(body, res) {
    const { method, params, version, id } = body
    const data = await this.dcHttp.post({
      version: version,
      // 根据采集器查询绑定信息
      method: method,
      id: id,
      params: params
    })

    const adapter_list = data.result.adapter_list
    if (adapter_list === 0) {
      res.send(data)
    } else {
      let not_nc = adapter_list.filter(v => v.collector_type_id !== 1)
      not_nc = not_nc.map(v => v.id)

      const data_p = await this.dcHttp.post({
        version: this.dcVer,
        // 根据采集器查询绑定信息
        method: 'get_channel_axis_by_adapter',
        id: '80',
        params: { dev_id: params.dev_id, adapter_id_list: not_nc }
      })

      const channel_axis_adapter_list = data_p.result.channel_axis_adapter_list

      for (const v of adapter_list) {
        for (let i = 0; i < channel_axis_adapter_list.length; i++) {
          const ad = channel_axis_adapter_list[i]
          if (v.id === ad.adapter_id) {
            //是否已经绑定
            v['bind'] = ad.is_rel
          }
        }
      }

      data.result.adapter_list = adapter_list
      res.send(data)
    }
  }

  async configGet() {
    if (process.env.NODE_ENV === 'development') {
      runDev()
    } else {
      run()
    }
    const cfg = { ...serverCfg }
    const [dcc_version, pre_version, dmc_version] = await Promise.all([
      this.getVersion('dcc'),
      this.getVersion('pre'),
      this.getVersion('dmc')
    ])
    cfg.dcc_version = dcc_version || ''
    cfg.dmc_version = dmc_version || ''
    cfg.pre_version = pre_version || ''
    const packageInfo = require('../../../package.json')
    cfg.app_version = packageInfo.app_version || packageInfo.version
    if (cfg.SOURCE) {
      delete cfg.SOURCE.packageInfo
    }
    return cfg
  }

  async getAuxStatus(data) {
    const { dev_id } = data
    const url = this.dcUrl
    const [aux, sigRes, preprocessRes] = await Promise.all([
      Axios.post(url, {
        version: this.ver,
        method: 'enum_dev_aux_status',
        id: '87',
        params: { dev_id }
      }),
      Axios.post(url, {
        version: this.ver,
        method: 'enum_signals',
        id: '4',
        params: {}
      }),
      Axios.post(this.preUrl, {
        version: this.ver,
        method: 'enum_dev_preprocess_instance_list',
        id: '3',
        params: { dev_id }
      })
    ])

    const fixedSig = sigRes.data.result.fixed_signals // 固定信号
    const dynamicSig = sigRes.data.result.dynamic_signals // 自定义信号
    const sigAll = [...fixedSig, ...dynamicSig]
    const sigMap = {} // 信号 id 和 name 的对应关系
    for (const item of sigAll) {
      sigMap[item.sig_id] = item.display_name
    }
    // 拼接预处理信号
    const preList = preprocessRes.data.result.preprocess_instance_conf_list
    for (const item of preList) {
      sigMap[item.indicator_id] = item.alias_name
    }

    const list = aux.data.result.channel_aux_status_list
    for (const item of list) {
      item.aux_status_list = item.aux_status_list || []
      for (const info of item.aux_status_list) {
        for (const con of info.condition_list) {
          con.sig_name = sigMap[con.sig_id]
        }
      }
    }
    return { list, dev_id }
  }
  //机床状态
  async getDevStatus(data) {
    const { dev_id } = data
    const url = this.dcUrl
    const [aux, sigRes, preprocessRes] = await Promise.all([
      Axios.post(url, {
        version: this.ver,
        method: 'enum_dev_status',
        id: '92',
        params: { dev_id }
      }),
      Axios.post(url, {
        version: this.ver,
        method: 'enum_signals',
        id: '4',
        params: {}
      }),
      Axios.post(this.preUrl, {
        version: this.ver,
        method: 'enum_dev_preprocess_instance_list',
        id: '3',
        params: { dev_id }
      })
    ])
    this.logger.info(aux.data.result, '459')
    const fixedSig = sigRes.data.result.fixed_signals // 固定信号
    const dynamicSig = sigRes.data.result.dynamic_signals // 自定义信号
    const sigAll = [...fixedSig, ...dynamicSig]
    const sigMap = {} // 信号 id 和 name 的对应关系
    for (const item of sigAll) {
      sigMap[item.sig_id] = item.display_name
    }
    // 拼接预处理信号
    const preList = preprocessRes.data.result.preprocess_instance_conf_list
    for (const item of preList) {
      sigMap[item.indicator_id] = item.alias_name
    }
    for (const info of aux.data.result.dev_status_info_list) {
      for (const con of info.condition_list) {
        con.sig_name = sigMap[con.sig_id]
      }
    }
    const aux_status_list = aux.data.result.dev_status_info_list
    return { aux_status_list, dev_id }
  }
  // 获取版本信息
  async getVersion(type) {
    try {
      // 获取dc版本
      if (type === 'dcc') {
        const res = await this.dcHttp.post({
          version: '1.0',
          method: 'get_dcc_version',
          id: '1',
          params: {}
        })
        return res.result.dcc_version
      } else if (type === 'pre') {
        const res = await this.preHttp.post({
          version: '1.0',
          method: 'get_preprocess_sdk_version',
          id: '1',
          params: {}
        })
        return res.result.dpp_version
      } else if (type === 'dmc') {
        const res = await this.dcDecisionHttp.post({
          version: '1.0',
          method: 'get_dmc_version',
          id: '1',
          params: {}
        })
        return res.result.dcc_version
      }
    } catch (error) {
      this.logger.error(error)
    }
    return ''
  }

  async subscribeDoData(req, ws) {
    const { dev_id, adapter_id, property_name, batch } = req
    if (!batch) {
      // 单个
      this.subscribeDoDataOne(req, ws)
    } else if (!!property_name && property_name.length > 0) {
      for (const one of property_name) {
        try {
          const data = {
            dev_id: dev_id,
            adapter_id: adapter_id,
            property_name: one
          }
          this.subscribeDoDataOne(data, ws)
        } catch (e) {
          ws.emit('receiveDoData', e)
        }
      }
    }
  }

  subscribeDoDataOne(req, ws) {
    const data = req
    // this.logger.info(data)
    const { dev_id, adapter_id, property_name } = data
    const key = dev_id + adapter_id + property_name
    if (this.doDataMap.has(key)) {
      return
    }
    const interval = setInterval(async () => {
      // this.logger.info("==========1",data)
      try {
        let res = await this.dcHttp.post({
          version: '1.0',
          method: 'get_adapter_property',
          id: '59',
          params: { dev_id: dev_id, adapter_id: adapter_id, property_name: property_name }
        })

        // this.logger.info("==========1",res.data)
        if (!res) return
        res = res['result']
        const data = this.doDataMap.get(key)
        if (data) {
          const { property_value } = data
          if (property_value !== res['property_value']) {
            ws.emit('receiveDoData', res)
            this.doDataMap.set(key, res)
          }
        } else {
          ws.emit('receiveDoData', res)
          this.doDataMap.set(key, res)
        }
        this.logger.info('====do请求成功结果', res)

        // this.logger.info('do采集器:' + key + JSON.stringify(data))
      } catch (e) {
        this.logger.info('do请求失败', e)
      }
    }, 1000)

    this.doIntervalMap.set(key, interval)
  }

  cancelDoData(req, ws) {
    const data = req
    const { dev_id, adapter_id, property_name, batch } = data
    if (batch) {
      for (const interval of this.doIntervalMap.values()) {
        clearInterval(interval)
      }
      this.doIntervalMap.clear()
      this.doDataMap.clear()
    } else {
      const key = dev_id + adapter_id + property_name
      const interval = this.doIntervalMap.get(key)
      if (interval) {
        clearInterval(interval)
        this.doIntervalMap.delete(key)
      }
      this.doDataMap.delete(key)
    }
  }

  async mapTransGet(body) {
    const { type, id, dev_id } = body
    const url = this.dcUrl
    const result = {
      signal: null, //信号
      adapter: null // 采集器
    }
    for (const type_p of type) {
      switch (type_p) {
        case 1: {
          // 信号
          const data = await this.dcHttp.post({
            method: 'enum_signals',
            id: '4',
            params: {}
          })
          // 预处理
          const data_pre = await this.dcHttp.post({
            method: 'enum_dev_preprocess_instance_list',
            id: '3',
            params: {
              dev_id: parseInt(dev_id)
            }
          })
          if (id !== null && id !== undefined) {
            for (const one of [...data.result.fixed_signals, ...data.result.dynamic_signals]) {
              if (`${one.sig_id}` === `${id}`) {
                // return  this.result.sucess(one);
                result.signal = {
                  name: one['display_name'],
                  id: one.sig_id
                }
              }
            }
            // 查找预处理
            for (const one of data_pre.result.preprocess_instance_conf_list) {
              if (`${one.indicator_id}` === `${id}`) {
                result.signal = {
                  name: one['alias_name'],
                  id: one.indicator_id
                }
              }
            }
          } else {
            result.signal = [...data.result.fixed_signals, ...data.result.dynamic_signals].map(
              v => {
                return {
                  name: v['display_name'],
                  id: v['sig_id']
                }
              }
            )
            result.signal.push(
              ...data_pre.result.preprocess_instance_conf_list.map(v => {
                return {
                  name: v['alias_name'],
                  id: v['indicator_id']
                }
              })
            )
          }
          break
        }

        case 2: {
          // 采集器
          const data = await this.dcHttp.post({
            method: 'enum_adapters',
            id: '8',
            params: {
              dev_id: parseInt(dev_id)
            }
          })
          if (id !== null && id !== undefined) {
            for (const one of data.result.adapter_list) {
              if (`${one.id}` === `${id}`) {
                result.adapter = {
                  id: one.id,
                  name: one.name
                }
              }
            }
          } else {
            result.adapter = data.result.adapter_list.map(v => {
              return {
                id: v.id,
                name: v.name
              }
            })
          }
          break
        }
      }
    }
    // 拼接完整的id与name的映射关系
    const idNameData = await Axios.post(url, {
      version: this.ver,
      method: 'enum_dev_signal_proc_list',
      id: '522',
      params: { dev_id: dev_id }
    })
    const nameArr = idNameData.data.result.signal_proc_list
    nameArr.forEach(v => {
      const obj = {
        name: v.signal_proc_name,
        id: v.signal_proc_signal_id
      }
      this.result.sucess(result).content.signal.push(obj)
    })
    return this.result.sucess(result)
  }
}

module.exports = new DataCenterService()
