const Struct = require('struct')

const ENCODE_TYPE = 'utf-8'

const machineConfig = Struct()
  .chars('collector_name', 32, ENCODE_TYPE)
  .word32Sle('frequency')
  .doublele('collect_duration')
  .word32Sle('groove_num')
  .word8('clear_calibration_switch')
  .word8Sle('collect_card_type')
  .word32Sle('learn_num')
  .word32Sle('turns_num')
  .word32Sle('init_delay_time')

const decisionConfig = Struct()
  .word32Sle('id')
  .chars('alias', 32, ENCODE_TYPE)
  .chars('function', 64, ENCODE_TYPE)
  .word8('enabled')

const aiConfig = len => {
  return Struct()
    .word32Sle('id')
    .chars('alias', 32, ENCODE_TYPE)
    .word8('enabled')
    .word32Sle('usv_id')
    .word32Sle('usv_count')
    .array('usv_list', len, Struct().word32Sle('usv_id').chars('usv_name', 32, ENCODE_TYPE))
}
const uspList = di_count => {
  return Struct()
    .word32Sle('usp_id')
    .chars('usp_name', 32, ENCODE_TYPE)
    .word32Sle('di_count')
    .array('di_list', di_count, Struct().word32Sle('di_id').chars('di_name', 32, ENCODE_TYPE))
}
const diConfig = (uspLen, dilen) => {
  return Struct()
    .word32Sle('id')
    .chars('alias', 32, ENCODE_TYPE)
    .chars('function', 64, ENCODE_TYPE)
    .word8('enabled')
    .word8('mode')
    .word32Sle('usp_id')
    .word32Sle('usp_count')
    .array('usp_list', uspLen, uspList(dilen))
}

const machineId = Struct().word32Sle('machine_id')

const moidfy_itemss = Struct().word32Sle('index').word32Sle('value')

module.exports = {
  vcsMachineColloctor: () => {
    return Struct().word32Sle('machine_id')
  },
  vcsSetMachineColloctor: (usvLen, uspLen, dilen) => {
    return Struct()
      .word32Sle('machine_id')
      .struct('machine_global', machineConfig)
      .array('decision_list', 4, decisionConfig)
      .struct('ai', aiConfig(usvLen))
      .struct('di', diConfig(uspLen, dilen))
  },
  vcsStartMonitor: () => {
    return machineId
  },
  vcsStopMonitor: () => {
    return machineId
  },
  vcsMonitoringEnd: () => {
    return machineId
  },
  vcsMonitoringReset: () => {
    return machineId
  },
  vcsGetAlarmAssociatedKeys: () => {
    return Struct().word32Sle('machine_id').word64Sle('time_start').word64Sle('time_end')
  },
  vcsGetAlarmHistory: () => {
    return Struct()
      .word64Sle('time_start')
      .word64Sle('time_end')
      .word32Sle('machine_id')
      .word32Sle('tool_number')
      .chars('program_name', 32, ENCODE_TYPE)
      .doublele('rotate_speed')
      .word32Sle('start')
      .word32Sle('count')
      .word8('get_total_count')
      .word32Sle('feedback_result')
  },
  vcsClearCalibrationStandard: len => {
    return Struct()
      .word32Sle('clear_mode')
      .word32Sle('machine_id')
      .word32Sle('tool_number')
      .chars('program_name', 32, ENCODE_TYPE)
      .word32Sle('index_count')
      .array('index', len, 'word32Sle')
  },
  vcsGetCollectorInfo: () => {
    return machineId
  },
  vcsAddMachineColloctor: () => {
    return Struct()
      .word32Sle('machine_id')
      .word32Sle('adapter_id')
      .word32Sle('usv_adapter_id')
      .word32Sle('module_id')
  },
  vcsDelMachineColloctor: () => machineId,
  vcsConnectMachineColloctor: () => machineId,
  vcsDisConnectMachineColloctor: () => machineId,
  vcsQueryCalibrationStandardInfo: () => {
    return Struct()
      .word32Sle('machine_id')
      .word32Sle('tool_number')
      .chars('program_name', 32, ENCODE_TYPE)
      .word32Sle('start')
      .word32Sle('count')
      .word8('get_total_count')
  },
  vcsGetCalibratedToolPrograms: () => machineId,
  vcsViewProtoModifyCSItem: len => {
    return Struct()
      .word32Sle('machine_id')
      .word32Sle('tool_number')
      .chars('program_name', 32, ENCODE_TYPE)
      .word32Sle('moidfy_items_count')
      .array('moidfy_items', len, moidfy_itemss)
  },
  vcsEnumDecisions: () => machineId,
  vcsGetRotateSpeed: () => {
    return Struct()
      .word32Sle('machine_id')
      .word64Sle('time_start')
      .word64Sle('time_end')
      .word32Sle('tool_number')
      .chars('program_name', 32, ENCODE_TYPE)
  },
  vcsGetRecheckSwitch: () => machineId,
  vcsSetRecheckSwitch: () => Struct().word32Sle('machine_id').word8('recheck_switch')
}
//请求
