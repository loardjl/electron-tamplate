const BaseService = require('./BaseService')
const EMPTY_STR = '\u0000'

class VcsService extends BaseService {
  constructor() {
    super()
  }

  // 枚举机床
  enumMachine(data) {
    this.logger.info('enumMachine', data)
    const result = data
    result.list = result.list.map(d => ({
      ...d,
      machine_name: d.machine_name.split(EMPTY_STR)[0]
    }))
    return result
  }

  // 获取机床配置信息
  getMachineColloctor(data) {
    this.logger.info('getMachineColloctor', data)
    data.machine_global.collector_name = data.machine_global.collector_name.split(EMPTY_STR)[0]
    return data
  }

  // 设置机床配置信息
  setMachineColloctor(fnBody, req, msgType) {
    this.logger.info('setMachineColloctor', fnBody, req, msgType)
    if (typeof fnBody !== 'function') {
      this.logger.error('fnBody is not a function')
      throw new Error('fnBody is not a function')
    }
    const { ai, di } = req
    let dataBuff = Buffer.alloc(0)
    let fields = {}
    let struct = null
    let usvLen = 0
    let uspLen = 0
    let dilen = 0
    usvLen = ai.usv_list.length
    ai.usv_count = usvLen
    uspLen = di.usp_list.length
    di.usp_count = uspLen
    if (uspLen) {
      for (let i = 0; i < uspLen; i++) {
        dilen = Math.max(dilen, di.usp_list[i].di_list.length)
      }
    }
    struct = fnBody(usvLen, uspLen, dilen)
    dataBuff = struct.allocate().buffer()
    fields = struct.fields
    fields.machine_id = req.machine_id
    for (const key in req.machine_global) {
      fields.machine_global[key] = req.machine_global[key]
    }
    for (let i = 0; i < 4; i++) {
      for (const key in req.decision_list[i]) {
        fields.decision_list[i][key] = req.decision_list[i][key]
      }
    }
    for (const key in ai) {
      if (key === 'usv_list') {
        for (let i = 0; i < usvLen; i++) {
          for (const keyi in ai.usv_list[i]) {
            fields.ai.usv_list[i][keyi] = ai.usv_list[i][keyi]
          }
        }
      } else {
        fields.ai[key] = ai[key]
      }
    }
    for (const key in di) {
      if (key === 'usp_list') {
        for (let i = 0; i < uspLen; i++) {
          fields.di.usp_list[i].usp_id = di.usp_list[i].usp_id
          fields.di.usp_list[i].usp_name = di.usp_list[i].usp_name
          dilen = di.usp_list[i].di_list.length
          fields.di.usp_list[i].di_count = dilen
          for (let j = 0; j < dilen; j++) {
            fields.di.usp_list[i].di_list[j].di_id = di.usp_list[i].di_list[j].di_id
            fields.di.usp_list[i].di_list[j].di_name = di.usp_list[i].di_list[j].di_name
          }
        }
      } else {
        fields.di[key] = di[key]
      }
    }
    return dataBuff
  }
  monitorGlobalData(data) {
    this.logger.info('monitorGlobalData', data)
    const result = data
    result.monitor_global.program_name = result.monitor_global.program_name.split('\u0000')[0]
    return result
  }
  monitoringResult(data) {
    this.logger.info('monitoringResult', data)
    const result = data
    result.monitor_result.monitor_time = Number(result.monitor_result.monitor_time)
    return result
  }
  // 获取采集器信息
  getCollectorInfo(data) {
    this.logger.info('getCollectorInfo', data)
    data.uspinformations = data.uspinformations.map(d => ({
      ...d,
      adapter_name: d.adapter_name.split(EMPTY_STR)[0]
    }))
    data.usvinformations = data.usvinformations.map(d => ({
      ...d,
      adapter_name: d.adapter_name.split(EMPTY_STR)[0]
    }))
    return data
  }
  // 获取采集卡列表
  getColloctorList(data) {
    this.logger.info('getColloctorList', data)
    data.machine_list = data.machine_list.map(d => ({
      ...d,
      machine_name: d.machine_name.split(EMPTY_STR)[0],
      adapter_name: d.adapter_name.split(EMPTY_STR)[0],
      usv_adapter_name: d.usv_adapter_name.split(EMPTY_STR)[0]
    }))
    return data
  }
  //清除标定基准
  clearCalibrationStandard(fnBody, req, msgType) {
    this.logger.info('clearCalibrationStandard', fnBody, req, msgType)
    if (typeof fnBody !== 'function') {
      this.logger.error('fnBody is not a function')
      throw new Error('fnBody is not a function')
    }
    let struct = null
    const len = req.index.length
    let dataBuff = Buffer.alloc(0)
    struct = fnBody(len)
    dataBuff = struct.allocate().buffer()
    const fields = struct.fields
    fields.clear_mode = req.clear_mode
    fields.machine_id = req.machine_id
    fields.tool_number = req.tool_number
    fields.program_name = req.program_name
    fields.index_count = len
    fields.index = req.index

    return dataBuff
  }
  //  修改标定基准
  viewProtoModifyCSItem(fnBody, req, msgType) {
    this.logger.info('viewProtoModifyCSItem', fnBody, req, msgType)
    if (typeof fnBody !== 'function') {
      this.logger.error('fnBody is not a function')
      throw new Error('fnBody is not a function')
    }
    let struct = null
    const len = req.moidfy_items.length
    let dataBuff = Buffer.alloc(0)
    struct = fnBody(len)
    dataBuff = struct.allocate().buffer()
    const fields = struct.fields
    fields.machine_id = req.machine_id
    fields.tool_number = req.tool_number
    fields.program_name = req.program_name
    fields.moidfy_items_count = len
    for (let i = 0; i < len; i++) {
      fields.moidfy_items[i].index = req.moidfy_items[i].index
      fields.moidfy_items[i].value = req.moidfy_items[i].value
    }
    return dataBuff
  }
  getCalibratedToolPrograms(data) {
    this.logger.info('monitorGlobalData', data)
    const result = data
    result.tool_programs = result.tool_programs.map(item => {
      item.program_name = item.program_name.split(EMPTY_STR)[0]
      return item
    })
    return result
  }
  queryCalibrationStandardInfo(data) {
    this.logger.info('monitorGlobalData', data)
    const result = data
    result.records.map(item => {
      item.time = Number(item.time)
      return item
    })
    return result
  }
  // 枚举机床决策
  enumDecisions(data) {
    this.logger.info('enumDecisions', data)
    data.decisions = data.decisions.map(d => ({
      ...d,
      name: d.name.split(EMPTY_STR)[0]
    }))
    return data
  }
  // 查询告警日志
  getAlarmHistory(data) {
    this.logger.info('getAlarmHistory', data)
    data.records = data.records.map(d => ({
      ...d,
      program_name: d.program_name.split(EMPTY_STR)[0],
      time: Number(d.time),
      halt_duration: Number(d.halt_duration)
    }))
    return data
  }
  //复检开关【请求】修改的标定基准列表
  // vscSCGetRecheckSwitch(data) => {
  // return new Parser().int32le('machine_id').int8('recheck_switch').int32le('error_code')
  // }
}
module.exports = new VcsService()
