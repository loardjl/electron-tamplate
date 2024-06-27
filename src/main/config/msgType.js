/**
 * type string 对应socketio 响应前端的URI
 * value buffer 用于tcp匹配 就是 四个字节的命令
 * parseType 解析方式 1-按照struct方式解析，2-按照json string 方式解析 (默认)
 * fun 指定使用函数解析
 */
module.exports = [
  {
    type: 'getTokenRes', // token信息返回
    value: Buffer.from([0x80, 0x00, 0x01, 0x01]),
    parseType: 1
  },
  {
    type: 'ncSignalVal', // 单信号回调数据
    value: Buffer.from([0x00, 0x00, 0x01, 0x03]),
    parseType: 1,
    fun: 'DataCenterService.ncSignalVal'
  },
  {
    type: 'updateConfig', // 加工事件保存配置
    value: Buffer.from([0x80, 0x04, 0x00, 0x01])
  },
  {
    type: 'delChnnel', // 删除监控通道
    value: Buffer.from([0x80, 0x04, 0x00, 0x03])
  },
  {
    type: 'switchMonitor', // 开关监控事件
    value: Buffer.from([0x80, 0x04, 0x00, 0x04])
  },
  {
    type: 'processEnum', // 响应枚举轴下面的监控事件
    value: Buffer.from([0x80, 0x04, 0x00, 0x05]),
    fun: 'MonitorSegmentService.processEnum'
  },
  {
    type: 'chnnelEventDetail', // 获取事件详情
    value: Buffer.from([0x80, 0x04, 0x00, 0x06]),
    fun: 'MonitorSegmentService.parseUpdateChnnelEvent'
  },
  {
    type: 'getNameRule', // 获取命名规则
    value: Buffer.from([0x80, 0x04, 0x00, 0x0d])
  },
  {
    type: 'knifeBreakCheckAdd', // 断刀检测添加响应
    value: Buffer.from([0x80, 0x05, 0x00, 0x01])
  },
  {
    type: 'knifeBreakCheckUpdate',
    value: Buffer.from([0x80, 0x05, 0x00, 0x03])
  },
  {
    type: 'knifeBreakCheckDel',
    value: Buffer.from([0x80, 0x05, 0x00, 0x04])
  },
  {
    type: 'knifeBreakCheckQuery',
    value: Buffer.from([0x80, 0x05, 0x00, 0x05])
  },
  {
    type: 'knifeBreakCheckGet',
    value: Buffer.from([0x80, 0x05, 0x00, 0x06])
  },
  {
    type: 'sensorList',
    value: Buffer.from([0x80, 0x05, 0x00, 0x07])
  },
  //过程推送 主动推送
  {
    type: 'procedureData',
    value: Buffer.from([0x80, 0x05, 0x00, 0x08])
  },
  //报警信息 主动推送
  {
    type: 'alarmInfo',
    value: Buffer.from([0x80, 0x05, 0x00, 0x09])
  },
  {
    type: 'alarmInfnHistroyQuery',
    value: Buffer.from([0x80, 0x05, 0x00, 0x11])
  },
  {
    type: 'alarmInfoFeedbackQuery',
    value: Buffer.from([0x80, 0x05, 0x00, 0x12])
  },
  {
    type: 'workPiceNumberQuery',
    value: Buffer.from([0x80, 0x05, 0x00, 0x17])
  },
  {
    type: 'featureMark',
    value: Buffer.from([0x80, 0x05, 0x00, 0x18])
  },
  {
    type: 'historyMonitorStatus',
    value: Buffer.from([0x80, 0x05, 0x00, 0x13])
  },
  {
    type: 'procedureMonitor',
    value: Buffer.from([0x80, 0x05, 0x00, 0x25])
  },
  {
    type: 'settingKnifeCheckStatus',
    value: Buffer.from([0x80, 0x05, 0x00, 0x14])
  },
  {
    type: 'settingKnifeCheckStatusQuery',
    value: Buffer.from([0x80, 0x05, 0x00, 0x15])
  },
  {
    type: 'procedureDataSubscirbe',
    value: Buffer.from([0x80, 0x05, 0x00, 0x19])
  },
  {
    type: 'procedureDataCancel',
    value: Buffer.from([0x80, 0x05, 0x00, 0x20])
  },
  {
    type: 'boardOnlineMonitor',
    value: Buffer.from([0x80, 0x05, 0x00, 0x21])
  },
  {
    type: 'boardOfflineMonitor',
    value: Buffer.from([0x80, 0x05, 0x00, 0x22])
  },
  {
    type: 'boardOfflineMonitorProcedureChange',
    value: Buffer.from([0x80, 0x05, 0x00, 0x23])
  },
  {
    type: 'monitorSetting',
    value: Buffer.from([0x80, 0x05, 0x00, 0x24])
  },
  {
    type: 'nowKnifeControllerModelList',
    value: Buffer.from([0x80, 0x04, 0x00, 0x07])
  },
  {
    type: 'knifeControllerModelList',
    value: Buffer.from([0x80, 0x04, 0x00, 0x08])
  },
  {
    type: 'knifeControllerModelUpdate',
    value: Buffer.from([0x80, 0x04, 0x00, 0x09])
  },
  {
    type: 'knifeControllerModelDetailUpdate',
    value: Buffer.from([0x80, 0x04, 0x00, 0x0a])
  },
  {
    type: 'knifeTypeDataDict',
    value: Buffer.from([0x80, 0x04, 0x00, 0x0b])
  },
  {
    type: 'knifeTypeDataDictUpdate',
    value: Buffer.from([0x80, 0x04, 0x00, 0x0c])
  },
  {
    type: 'nameRuleList',
    value: Buffer.from([0x80, 0x04, 0x00, 0x0d])
  },
  {
    type: 'monitorChannelList',
    value: Buffer.from([0x80, 0x04, 0x00, 0x0e])
  },
  {
    type: 'monitorChanneMMIDlList',
    value: Buffer.from([0x80, 0x04, 0x00, 0x0f])
  }
]
