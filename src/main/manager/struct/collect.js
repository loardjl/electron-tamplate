const Parser = require('binary-parser').Parser

const machineConfig = new Parser()
  .string('collector_name', { length: 32, stripNull: true })
  .int32le('frequency')
  .doublele('collect_duration')
  .int32le('groove_num')
  .int8('clear_calibration_switch')
  .uint8('collect_card_type')
  .int32le('learn_num')
  .int32le('turns_num')
  .int32le('init_delay_time')

const decisionConfig = new Parser()
  .int32le('id')
  .string('alias', { length: 32, stripNull: true })
  .string('function', { length: 64, stripNull: true })
  .int8('enabled')

const aiConfig = new Parser()
  .int32le('id')
  .string('alias', { length: 32, stripNull: true })
  .int8('enabled')
  .int32le('usv_id')
  .int32le('usv_count')
  .array('usv_list', {
    type: new Parser().int32le('usv_id').string('usv_name', { length: 32, stripNull: true }),
    length: 'usv_count'
  })
const diConfig = new Parser()
  .int32le('id')
  .string('alias', { length: 32, stripNull: true })
  .string('function', { length: 64, stripNull: true })
  .int8('enabled')
  .uint8('mode')
  .int32le('usp_id')
  .int32le('usp_count')
  .array('usp_list', {
    type: new Parser()
      .int32le('usp_id')
      .string('usp_name', { length: 32, stripNull: true })
      .int32le('di_count')
      .array('di_list', {
        type: new Parser().int32le('di_id').string('di_name', { length: 32, stripNull: true }),
        length: 'di_count'
      }),
    length: 'usp_count'
  })
const monitorGlobalDataConfig = new Parser()
  .int32le('tool_number')
  .string('program_name', { length: 32, stripNull: true })
  .int8('has_calibration')
  .int8('nc_connected')
  .int8('usp_connected')
  .int8('usv_connected')
  .int8('is_monitoring')
const monitorResultDataConfig = new Parser()
  .int64le('monitor_time')
  .doublele('distance')
  .doublele('actual_seppd')
  .doublele('rotate_speed')
  .doublele('pendulum')
  .int32le('standard_anomalous')
  .int32le('actual_anomalous')
  .int8('enable_resetbtn')
  .int32le('errcode')
const viewProto_AlarmKeys = new Parser()
  .int32le('machine_id')
  .string('program_name', { length: 32, stripNull: true })
const getAlarmAssociatedKeys = new Parser()
  .int32le('machine_id')
  .int32le('keys_count')
  .array('keys', {
    type: viewProto_AlarmKeys,
    length: 'keys_count'
  })
const overrunAlarmReordConfig = new Parser()
  .int32le('id')
  .int64le('time')
  .int32le('tool_number')
  .string('program_name', { length: 32, stripNull: true })
  .doublele('distance')
  .doublele('actual_speed')
  .doublele('rotate_speed')
  .doublele('pendulum')
  .int32le('actual_anomalous')
  .int32le('standard_anomalous')
  .int32le('result')
  .int64le('halt_duration')
  .int32le('feedback_result')
const adapterInfo = new Parser()
  .int32le('adapter_id')
  .string('adapter_name', { length: 32, stripNull: true })
const colloctorCard = new Parser()
  .int32le('machine_id')
  .int32le('adapter_id')
  .int32le('usv_adapter_id')
  .string('machine_name', { length: 32, stripNull: true })
  .string('adapter_name', { length: 32, stripNull: true })
  .string('usv_adapter_name', { length: 32, stripNull: true })
  .int32le('module_id')
const viewProtoCSRecord = new Parser()
  .doublele('actual_speed')
  .doublele('rotate_speed')
  .int32le('learned_number')
  .int32le('learn_number')
  .int32le('anomalous_ratio')
  .int64le('time')
const viewProtoToolProgram = new Parser()
  .int32le('tool_number')
  .string('program_name', { length: 32, stripNull: true })
module.exports = {
  getTokenRes: () => {
    return new Parser().int32le('len').string('token', { length: 'len', stripNull: true })
  },
  ncSignalVal: () => {
    return new Parser()
      .uint16le('slice_count') // 分片总个数
      .uint16le('slice_id') // 分片id
      .uint16le('slice_size') // 分片数据大小
      .uint32le('dev_id') // 机床id
      .uint64le('timestamp')
      .uint32le('collector_id') // 采集器id
      .uint32le('sig_num')
      .array('values', {
        type: new Parser()
          .uint32le('sig_id')
          .uint32le('sig_type')
          .uint32le('sig_freq_type')
          .uint32le('sig_data_type')
          .uint32le('nums')
          .uint32le('buffer_len')
          .buffer('val', { length: 'buffer_len' }),
        length: function () {
          return this.sig_num
        }
      })
  },
  vcsEnumMachine: () => {
    return new Parser().int32le('count').array('list', {
      type: new Parser()
        .int32le('machine_id')
        .string('machine_name', { length: 32, stripNull: true }),
      length: 'count'
    })
  },
  vcsMachineColloctor: () => {
    return new Parser()
      .int32le('machine_id')
      .nest('machine_global', { type: machineConfig })
      .array('decision_list', {
        type: decisionConfig,
        length: 4
      })
      .nest('ai', { type: aiConfig })
      .nest('di', { type: diConfig })
  },
  vcsMonitorGlobalData: () => {
    return new Parser()
      .int32le('machine_id')
      .nest('monitor_global', { type: monitorGlobalDataConfig })
  },
  vcsMonitoringStart: () => {
    return new Parser().int32le('machine_id')
  },
  vcsCalibrationStart: () => {
    return new Parser().int32le('machine_id')
  },
  vcsMonitoringResult: () => {
    return new Parser()
      .int32le('machine_id')
      .nest('monitor_result', { type: monitorResultDataConfig })
  },
  vcsMonitoringEnd: () => {
    return new Parser().int32le('machine_id')
  },
  vcsMonitoringReset: () => {
    return new Parser().int32le('machine_id').int32le('err_code')
  },
  vcsGetAlarmAssociatedKeys: () => {
    return new Parser().nest('SC_GetAlarmAssociatedKeys', { type: getAlarmAssociatedKeys })
  },
  vcsGetAlarmHistory: () => {
    return new Parser().int32le('start').int32le('total_count').int32le('count').array('records', {
      type: overrunAlarmReordConfig,
      length: 'count'
    })
  },
  vcsGetCollectorInfo: () => {
    return new Parser()
      .int32le('usp_count')
      .array('uspinformations', { type: adapterInfo, length: 'usp_count' })
      .int32le('usv_count')
      .array('usvinformations', { type: adapterInfo, length: 'usv_count' })
  },
  vcsGetColloctorList: () => {
    return new Parser()
      .int32le('count')
      .array('machine_list', { type: colloctorCard, length: 'count' })
  },
  vcsDelMachineColloctor: () => {
    return new Parser().int32le('machine_id').int32le('error_code')
  },
  vcsQueryCalibrationStandardInfo: () => {
    return new Parser()
      .int32le('start')
      .int32le('total_count')
      .int32le('records_count')
      .array('records', {
        type: viewProtoCSRecord,
        length: 'records_count'
      })
  },
  vcsGetCalibratedToolPrograms: () => {
    return new Parser()
      .int32le('machine_id')
      .int32le('tool_programs_count')
      .array('tool_programs', {
        type: viewProtoToolProgram,
        length: 'tool_programs_count'
      })
  },
  vcsEnumDecisions: () => {
    return new Parser()
      .int32le('machine_id')
      .int32le('count')
      .array('decisions', {
        length: 'count',
        type: new Parser().int32le('id').string('name', { length: 32, stripNull: true })
      })
  },
  vcsGetRotateSpeed: () => {
    return new Parser()
      .int32le('count')
      .array('rotate_speed', { length: 'count', type: 'doublele' })
  },
  vcsGetRecheckSwitch: () => {
    return new Parser().int32le('machine_id').int8('recheck_switch').int32le('error_code')
  },
  vcsSetRecheckSwitch: () => {
    return new Parser().int32le('machine_id').int8('recheck_switch').int32le('error_code')
  }
}
