/**
 * type string 对应socketio 响应前端的URI
 * value buffer 用于tcp匹配 就是 四个字节的命令
 * parseType 解析方式 1-按照struct方式解析，2-按照json string 方式解析 (默认)
 * fun 指定使用函数解析
 * isResSlice 返回tcp是否使用分片
 * isReqSlice 请求tcp是否使用分片
 * reqType 请求事件uri ，不设置则默认使用type作为请求事件uri
 *
 * *****
 *  默认请求和接受的二级命令相同。
 */
module.exports = {
  DC: {
    // 数据中心
    o1: [0x00, 0x00], // 请求一级命令
    resO1: [0x80, 0x00], // 响应1级命令
    reqOrder: [
      // 请求响应配置
      {
        type: 'getTokenRes', // token信息返回
        value: [0x01, 0x01],
        parseType: 1,
        isResSlice: true
      },
      {
        type: 'heartBeat', // 心跳
        value: [0x00, 0x02]
      }
    ],
    pushOrder: [
      // 主动推送的命令
      {
        type: 'ncSignalVal', // 单信号回调数据
        value: [0x01, 0x03],
        parseType: 1,
        fun: 'DataCenterService.ncSignalVal'
      }
    ]
  },
  MS: {
    // 监控分段
    o1: [0x00, 0x04], // 请求一级命令
    resO1: [0x80, 0x04], // 响应1级命令
    reqOrder: [
      // 请求响应配置
      {
        type: 'updateConfig', // 加工事件保存配置
        value: [0x00, 0x01],
        isReqSlice: true
      },
      {
        type: 'delChnnel', // 删除监控通道
        value: [0x00, 0x03]
      },
      {
        type: 'switchMonitor', // 开关监控事件
        value: [0x00, 0x04]
      },
      {
        reqType: 'getProcessEnum',
        type: 'processEnum', // 响应枚举轴下面的监控事件
        value: [0x00, 0x05],
        isResSlice: true
        // fun: 'MonitorSegmentService.processEnumChenal'
      },
      {
        type: 'chnnelEventDetail', // 获取事件详情
        value: [0x00, 0x06],
        fun: 'MonitorSegmentService.parseUpdateChnnelEvent'
      },
      {
        type: 'getNameRule', // 获取命名规则
        value: [0x00, 0x0d]
      },
      {
        // 当前刀位管理模式列表
        type: 'msNowKnifePlaceControllerModelList',
        value: [0x00, 0x07]
      },
      {
        // 刀位管理模式列表
        type: 'msKnifePlaceControllerModelList',
        value: [0x00, 0x08]
      },
      {
        // 刀位管理模式调整
        type: 'msNowKnifePlaceControllerModelUpdate',
        value: [0x00, 0x09]
      },
      {
        // 刀位管理模式详情调整
        type: 'msNowKnifePlaceControllerModelDetailUpdate',
        value: [0x00, 0x0a]
      },
      {
        // 获取刀具类型数据字典
        type: 'msNowKnifeTypeDict',
        value: [0x00, 0x0b]
      },
      {
        // 刀具类型数据字典修改
        type: 'msNowKnifeTypeDictUpdate',
        value: [0x00, 0x0c]
      },
      {
        // 获取监控通道列表
        type: 'msMonitorChannelList',
        value: [0x00, 0x0e]
      },
      {
        // 获取监控通道下MMID列表
        type: 'msMonitorChanneMMIDlList',
        value: [0x00, 0x0f]
      },
      {
        // 2.17 机床报警总开关
        type: 'msBoardAlarmTotalSwitch',
        value: [0x00, 0x10]
      },
      {
        // 2.18 获取机床报警总开关
        type: 'msGetBoardAlarmTotalSwitch',
        value: [0x00, 0x11]
      },
      {
        // 2.19 获取机床报警总开关
        type: 'msMonitorSetting',
        value: [0x00, 0x12]
      },
      {
        // 2.20 获取下一个过程的标注状态
        type: 'msGetNextProcessMarkStatus',
        value: [0x00, 0x13]
      },
      {
        // 获取监控分段版本
        type: 'msVersion',
        value: [0x00, 0x14]
      },
      {
        // 查询过程配置的功能开启开关
        type: 'msGetProcessConfigSwitch',
        value: [0x00, 0x15]
      },
      {
        // 设置过程配置的功能开启开关
        type: 'msSetProcessConfigSwitch',
        value: [0x00, 0x16]
      },
      {
        // 获取轴状态
        type: 'msGetAxisStatus',
        value: [0x00, 0x19]
      },
      {
        // 保存轴状态
        type: 'msSetAxisStatus',
        value: [0x00, 0x1a]
      },
      {
        //设置通道运行条件
        type: 'msSetChannelCondition',
        value: [0x00, 0x1c]
      },
      {
        //查询机床的NC系统信息
        type: 'msGetSystemConfig',
        value: [0x00, 0x1e]
      },
      {
        //查询可绑定的采集器与信号
        type: 'msGetCollectorAndSignal',
        value: [0x00, 0x1f]
      },
      {
        //查询已绑定默认信号的轴列表
        type: 'msGetMonitorAxisList',
        value: [0x00, 0x20],
        isResSlice: true
      },
      {
        //2.34 查询机床下的可订阅信号列表
        type: 'msQueryEnableSignList',
        value: [0x00, 0x21],
        isResSlice: true,
        fun: 'MonitorSegmentService.msQueryEnableSignList'
      },
      {
        //2.35.1 获取优化方式列表
        type: 'msGetGradeList',
        value: [0x00, 0x30]
      },
      {
        //2.35.2 刀位-查看-获取刀位下过程的监控信号列表及其默认配置
        type: 'msSetTooLogicalSignallList',
        value: [0x00, 0x31]
      },
      {
        //2.35.3 新增信号查询列表
        type: 'msAddSignalSetlList',
        value: [0x00, 0x32]
      },
      {
        //2.35.4 修改信号的优化方式
        type: 'msSetSignalGrade',
        value: [0x00, 0x33]
      },
      {
        //2.35.5 批量删除信号
        type: 'msDelAllSignal',
        value: [0x00, 0x34]
      },
      {
        //2.35.6 新增信号
        type: 'msAddSignal',
        value: [0x00, 0x42]
      },
      {
        //2.36.1 查询所有优化方式配置列表
        type: 'msSetAllSignalConfigureList',
        value: [0x00, 0x35]
      },
      {
        //2.36.2 新增优化方式配置
        type: 'msAddConfigureList',
        value: [0x00, 0x36]
      },
      {
        //2.36.3 删除优化方式配置
        type: 'msDelConfigureList',
        value: [0x00, 0x37]
      },
      {
        //2.36.4 修改优化方式配置
        type: 'msSetConfigureList',
        value: [0x00, 0x38]
      },
      {
        //2.36.5 新增关联条件
        type: 'msAddCorrelation',
        value: [0x00, 0x45]
      },
      {
        //2.36.6 修改关联条件
        type: 'msSetCorrelation',
        value: [0x00, 0x46]
      },
      {
        //2.36.7 查询关联条件
        type: 'msGetCorrelation',
        value: [0x00, 0x47]
      },
      {
        //2.36.8 删除关联条件
        type: 'msDelCorrelation',
        value: [0x00, 0x48]
      },
      {
        //2.37.1 mmid列表查询
        type: 'msQueryMMIDList',
        value: [0x00, 0x39]
      },
      {
        //2.37.2 新增自定义配置
        type: 'msAddCustomConfig',
        value: [0x00, 0x3a]
      },
      {
        //2.37.3 修改自定义配置
        type: 'msEditCustomConfig',
        value: [0x00, 0x3b]
      },
      {
        //2.37.4 查询自定义配置
        type: 'msQueryCustomConfig',
        value: [0x00, 0x3c]
      },
      {
        //2.37.5 工件序号查询
        type: 'msWorkpieceList',
        value: [0x00, 0x3d]
      },
      {
        //2.37.6 历史监控状态查询
        type: 'msQueryWorkpieceHistory',
        value: [0x00, 0x3e]
      },
      {
        //2.37.7 特征标注
        type: 'msMark',
        value: [0x00, 0x3f]
      },
      {
        //2.37.8 查询刀具号，程序号列表
        type: 'msQueryToolProgramList',
        value: [0x00, 0x41]
      },
      {
        //2.38.1 监控设定
        type: 'msUnifiedMonitorSettings',
        value: [0x00, 0x40]
      },
      {
        //2.38.2获取下一个过程的标注状态
        type: 'msGetNextMarkStatus',
        value: [0x00, 0x43]
      },
      {
        //2.38.3 通知前端监控过程开始，获取信号
        type: 'msGetMarkStatusSignal',
        value: [0x00, 0x49]
      },
      {
        //2.40.1获取当前机床监控状态
        type: 'msGetMonitorStatus',
        value: [0x00, 0x90]
      },
      {
        //2.40.2开启单件调试
        type: 'msOpenSingleDebug',
        value: [0x00, 0x91]
      },
      {
        //2.40.3关闭单件调试
        type: 'msCloseSingleDebug',
        value: [0x00, 0x92]
      },
      {
        //2.40.4开启连续调试,
        type: 'msOpenContinuousDebug',
        value: [0x00, 0x93]
      },
      {
        //2.40.5关闭连续调试
        type: 'msCloseContinuousDebug',
        value: [0x00, 0x94]
      },
      {
        //2.40.6连续调试延长
        type: 'msContinuousDebugDelay',
        value: [0x00, 0x95]
      },
      {
        //2.40.7调试模式结束通知前端
        type: 'msDebugEnd',
        value: [0x00, 0x96]
      },
      {
        // 2.37.9 获取mmid的优化方式
        type: 'msGetMmidGrade',
        value: [0x00, 0x44]
      }
    ],
    pushOrder: [
      // 主动推送的命令
      {
        type: 'ncSignalVal', // 单信号回调数据
        value: [0x01, 0x03],
        fun: 'DataCenterService.ncSignalVal'
      }
    ]
  },
  ATB: {
    // 自动断刀监控
    o1: [0x00, 0x05], // 请求一级命令
    resO1: [0x80, 0x05], // 响应1级命令
    reqOrder: [
      // 请求响应配置
      {
        type: 'atbSettingAdd', // 新增配置
        value: [0x00, 0x01]
      },
      {
        type: 'atbSettingUpdate', // 更新配置
        value: [0x00, 0x03]
      },
      {
        type: 'atbSettingDel', // 删除配置
        value: [0x00, 0x04]
      },
      {
        type: 'atbSettingList', // 查询全部配置
        value: [0x00, 0x05]
      },
      {
        type: 'atbSettingDetail', // 查询单个配置
        value: [0x00, 0x06]
      },
      {
        type: 'adapteList', // 查询传感器列表
        value: [0x00, 0x07]
      },
      {
        type: 'atbWarningRes', // 报警反馈
        value: [0x00, 0x10]
      },
      {
        type: 'atbAlarmList', // 查询历史告警列表
        value: [0x00, 0x11],
        isResSlice: true
      },
      {
        type: 'atbAlarmDetail', // 历史告警详情
        value: [0x00, 0x12],
        isResSlice: true
      },
      {
        type: 'atbPieceNumDetail', // 过程分析-工件序号查询
        value: [0x00, 0x17]
      },
      {
        type: 'atbPieceAttributeUpdate', // 过程分析-工件特征标注
        value: [0x00, 0x18]
      },
      {
        type: 'atbHisMonitorDetail', // 过程分析-历史监控状态
        value: [0x00, 0x13],
        isResSlice: true
      },
      {
        type: 'atbLearnUpdate', // 过程分析-过程监控配置
        value: [0x00, 0x25]
      },
      {
        type: 'atbDisableUpdate', // 自动断刀功能启用开关
        value: [0x00, 0x14]
      },
      {
        type: 'atbDisableInfo', // 查询自动断刀功能启用开关
        value: [0x00, 0x15]
      },
      {
        type: 'atbProcessReLean', // 某个过程重新学习
        value: [0x00, 0x16]
      },
      {
        type: 'atbSub', // 过程数据订阅
        value: [0x00, 0x19]
      },
      {
        type: 'atbUnSub', // 过程数据退订
        value: [0x00, 0x20]
      },
      {
        type: 'atbMonitorOnline', // 机床看板-在线监控
        value: [0x00, 0x21],
        isResSlice: true
      },
      {
        type: 'atbMonitorHistroySwitch', // 机床看板-离线监控-过程切换
        value: [0x00, 0x22],
        isResSlice: true
      },
      {
        type: 'atbMonitorHistroy', // 机床看板-监控设定
        value: [0x00, 0x24]
      },
      {
        type: 'atbProcessMonitorLook', // 过程监控查看
        value: [0x00, 0x26]
      },
      {
        type: 'atbProcessMonitorModelDataLook', // 过程监控模型数据查询
        value: [0x00, 0x27],
        isResSlice: true
      },
      {
        type: 'atbBoardOffLineDataQuery', // 9.5机床看板-离线监控-刀具列表和程序号列表查询
        value: [0x00, 0x29]
      },
      {
        type: 'atbGetNextProcessMarkSatus', // 9.6 下一个过程标注状态
        value: [0x00, 0x30]
      },
      {
        type: 'atbVersion', // 获取断刀版本号
        value: [0x00, 0x31]
      },
      {
        type: 'atbProcessUnitSave', // 6.7过程监控/工件序号保存
        value: [0x00, 0x28],
        isResSlice: true
      },
      {
        type: 'getTacticsList', // 查询策略列表
        value: [0x00, 0x35]
      },
      {
        type: 'setTactics', // 修改策略列表
        value: [0x00, 0x36]
      },
      {
        type: 'getSignalList', // 查询信号列表信息
        value: [0x00, 0x37]
      },
      {
        type: 'getSignalDisposition', // 查询信号对应的配置
        value: [0x00, 0x39]
      },
      {
        type: 'detSignalList', // 删除信号对应的配置
        value: [0x00, 0x40]
      },
      {
        type: 'atbProcessCostomSetting', // 按信号查询过程自定义配置
        value: [0x00, 0x41]
      },
      {
        type: 'atbQueryProglist', // 查询程序号列表
        value: [0x00, 0x32]
      },
      {
        type: 'atbQueryToollist', // 查询刀具号列表
        value: [0x00, 0x33]
      },
      {
        type: 'atbQueryMmidlist', // 查询刀具号/程序号对应新的监控过程信息
        value: [0x00, 0x34]
      },
      {
        type: 'addDefaultConfig', // 新增过程监控默认配置
        value: [0x00, 0x42]
      },
      {
        type: 'atbSignalList', // 获取信号列表
        value: [0x00, 0x43]
      },
      {
        type: 'atbModelquery', // 过程监控手动模型获取
        value: [0x00, 0x44]
      },
      {
        type: 'atbModelChange', // 过程监控手动模型修改
        value: [0x00, 0x45]
      },
      {
        type: 'signalCode', // 获取业务信号列表
        value: [0x00, 0x48]
      }
    ],
    pushOrder: [
      // 主动推送的命令
      {
        type: 'atbProcess', // 过程数据推送
        value: [0x00, 0x08],
        isResSlice: true
      },
      {
        type: 'atbWarningData', // 报警数据推送
        value: [0x00, 0x09],
        isResSlice: true
      }
    ]
  },
  MARGINCHECK: {
    // 自动边界检测
    o1: [0x00, 0x06], // 请求一级命令
    resO1: [0x80, 0x06], // 响应1级命令
    reqOrder: [
      // 工件序号查询
      {
        type: 'marginWorkPieceQuery',
        value: [0x00, 0x01]
      },
      {
        // 特征标注
        type: 'marginFeatureMark',
        value: [0x00, 0x03]
      },
      {
        // 历史监控状态
        type: 'marginHisotryMonitorStatus',
        value: [0x00, 0x04],
        // fun: 'MarginService.marginHisotryMonitorStatus',
        isResSlice: true
      },
      {
        // 过程配置新增
        type: 'marginProceduceConfigAdd',
        value: [0x00, 0x05]
      },
      {
        // 默认过程配置信号列表
        type: 'marginDefaultProceduceConfigSignList',
        value: [0x00, 0x06]
      },
      {
        // 功能启用开关
        type: 'marginFunctionSwitch',
        value: [0x00, 0x07]
      },
      {
        // 过程配置批量删除
        type: 'marginProceduceDel',
        value: [0x00, 0x08]
      },
      {
        // 机床看板在线监控
        type: 'marginBoardOnlineMonitor',
        value: [0x00, 0x09],
        isResSlice: true
      },
      {
        // 机床看板离线监控过程切换
        type: 'marginBoardOfflineMonitorProcedureChange',
        value: [0x00, 0x0a],
        // fun: 'MarginService.marginBoardOfflineMonitorProcedureChange',
        isResSlice: true
      },
      {
        // 机床看板监控设定
        type: 'marginBoardMonitorSetting',
        value: [0x00, 0x0d]
      },
      {
        // 真错误报警弹框
        type: 'marginTrueOrFalseAlarmInfo',
        value: [0x00, 0x0e]
      },
      {
        // 真错误报警弹框反馈
        type: 'marginTrueOrFalseAlarmInfoFeedback',
        value: [0x00, 0x0f]
      },
      {
        // 告警日志
        type: 'marginAlarmLog',
        value: [0x00, 0x10],
        isResSlice: true
      },
      {
        // 告警事件查看
        type: 'marginAlarmRecord',
        value: [0x00, 0x11],
        isResSlice: true
      },
      {
        // 订阅实时过程数据-机床看板
        type: 'marginSubcribeBoardProcedureNowData',
        value: [0x00, 0x12]
      },
      {
        // 取消订阅过程数据-机床看板
        type: 'marginCancelBoardProcedureNowData',
        value: [0x00, 0x14]
      },
      {
        // 过程监控查看
        type: 'marginProcedureMonitorLook',
        value: [0x00, 0x15]
      },
      {
        // 过程监控配置
        type: 'marginProcedureMonitorConfig',
        value: [0x00, 0x16]
      },
      {
        // 更新过程监控配置
        type: 'marginProcedureMonitorConfigUpdate',
        value: [0x00, 0x17]
      },
      {
        // 查看过程监控配置
        type: 'marginProcedureMonitorConfigLook',
        value: [0x00, 0x18]
      },
      {
        //机床看板 过程监控总开关
        type: 'marginBoardMonitorSwitch',
        value: [0x00, 0x19]
      },
      {
        //获取版本信息
        type: 'marginBoardVersion',
        value: [0x00, 0x20]
      },
      {
        //机床看板 过程监控总开关查询
        type: 'marginBoardMonitorSwitchQuery',
        value: [0x00, 0x1a]
      },
      {
        //获取当前模型样本工件序号
        type: 'marginGetNowModelTnData',
        value: [0x00, 0x1b],
        // fun: 'MarginService.marginGetNowModelTnData'
        isResSlice: true
      },
      {
        //模型样本工件序号保存
        type: 'marginSaveNowModelTnData',
        value: [0x00, 0x1c],
        // fun: 'MarginService.marginSaveNowModelTnData'
        isResSlice: true
      },
      {
        //获取下一个过程的标注状态
        type: 'marginGetNextProcessMarkStatus',
        value: [0x00, 0x1d]
      },
      {
        //2.30 机床看板-离线监控-刀具列表和程序号列表查询
        type: 'marginBoardOnlineDataQuery',
        value: [0x00, 0x1e]
      },
      {
        //2.31 机床看板-离线监控-刀具列表和程序号列表查询
        type: 'marginQueryOpenSwitch',
        value: [0x00, 0x1f]
      }
    ],
    pushOrder: [
      // 主动推送的命令
      {
        // 实时过程数据-机床看板
        type: 'marginBoardProcedureNowData',
        value: [0x00, 0x13],
        isResSlice: true
        // fun: 'MarginService.marginBoardProcedureNowData'
      }
    ]
  },
  IPS_LARGE: {
    // ips大批量
    //文档 https://ujoin.yuque.com/mw8efh/hw4p6h/bymv8l81hywtrfgy#nUeaH
    o1: [0x00, 0x0d], // 请求一级命令
    resO1: [0x80, 0x0d], // 响应1级命令
    reqOrder: [
      // 请求响应配置
      {
        type: 'ipslKnifePlaceConfigAdd', // 2.1 刀位新增配置 4.9新增自定义优化方式（同2-1）
        value: [0x00, 0x01]
      },
      {
        type: 'ipslKnifePlaceConfigQuery', // 2.2查询配置 刀位查询
        value: [0x00, 0x02]
      },
      {
        type: 'ipslKnifePlaceConfigUpdate', // 2.3更新配置 刀位更新
        value: [0x00, 0x03]
      },
      {
        type: 'ipslKnifePlaceConfigDel', // 2.4删除配置 刀位删除
        value: [0x00, 0x19]
      },
      {
        type: 'ipslStudyCount', // 2.5查询学习次数（暂不启用）新增刀位信号配置
        value: [0x00, 0x04]
      },
      {
        type: 'ipslStudyCountUpdate', // 2.6修改学习次数（暂不启用）查询刀位信号配置
        value: [0x00, 0x05]
      },
      {
        type: 'ipslCommonConfigModelGet', // 2.7获取通用配置模板
        value: [0x00, 0x06]
      },
      {
        type: 'ipslKinfePlaceSignConfigDel', // 2.8删除刀位信号配置
        value: [0x00, 0x07]
      },
      {
        type: 'ipslKinfePlaceSignUpgradeMethod', // 2.9修改刀位或信号优化方式
        value: [0x00, 0x13]
      },
      {
        type: 'ipslSignList', // 2.10获取信号列表
        value: [0x00, 0x1c]
      },
      {
        type: 'ipslAppConfigQuery', // 3.1查询应用配置
        value: [0x00, 0x08]
      },
      {
        type: 'ipslAppConfigUpdate', // 3.1修改应用配置
        value: [0x00, 0x09]
      },
      {
        type: 'ipslMonitorProcessListQuery', // 4.1 监控列表查询
        value: [0x00, 0x1b]
      },
      {
        type: 'ipslUnitNoListQuery', // 4.2工件序号列表查询
        value: [0x00, 0x0a]
      },
      {
        type: 'ipslMonitorHistoryStatus', // 4.3历史监控状态查询
        value: [0x00, 0x0b],
        isResSlice: true
      },
      {
        type: 'ipslSignConfigAndRotateSpeedList', // 配置信号和转速列表查询 4.4
        value: [0x00, 0x0c],
        isResSlice: true
      },
      {
        type: 'ipslSignConfigAndRotateSpeedDetail', // 配置信号和转速列表详情查询 4.5
        value: [0x00, 0x0d],
        isResSlice: true
      },
      {
        type: 'ipslEvolveMethodUpdate', // 4.6修改优化方式
        value: [0x00, 0x1a]
      },
      {
        type: 'ipslRotateSpeedConfigSave', // 4.7转速配置保存（三条线）
        value: [0x00, 0x0e]
      },
      {
        type: 'ipslRestudyMmid', // 4.8重新学习（mmid级别）
        value: [0x00, 0x0f]
      },
      {
        type: 'ipslBoardSubcribe', // 5.1订阅 机床看板
        value: [0x00, 0x10]
      },
      {
        type: 'ipslBoardUnSubcribe', // 5.2去订阅
        value: [0x00, 0x11],
        fun: 'IpsService.clearSigQueue'
      },
      {
        type: 'ipslBoardOfflineMonitorKnifeNoProcess', // 5.7离线监控刀具号程序号获取
        value: [0x00, 0x16]
      },
      {
        type: 'ipslBoardOfflineMonitorBoard', // 5.8离线监控看板
        value: [0x00, 0x17],
        isResSlice: true
      },
      {
        type: 'ipslBoardAllRestudy', // 5.9全部重新学习
        value: [0x00, 0x18]
      },
      {
        type: 'ipsLogicalOnline', // 5.10 获取正在监控的监控通道（在线看板）
        value: [0x00, 0x1d]
      },
      {
        type: 'ipsLogicalOffline', // 5.11 获取触发过的监控通道（离线看板）
        value: [0x00, 0x1f]
      }
    ],
    pushOrder: [
      // 主动推送的命令
      {
        type: 'ipslBoardWorkingInfo', // 5.5加工信息推送 5.1订阅
        value: [0x00, 0x14]
      },
      {
        type: 'ipslBoardActualData', // 5.6实时数据推送 5.1订阅
        value: [0x00, 0x15],
        fun: 'IpsService.signalFormate'
      }
    ]
  },
  KNIFE_TOOL_M_2: {
    // 刀位管理2.0  https://ujoin.yuque.com/mw8efh/hw4p6h/rkv9rrt50woe2v0e#zTNOJ
    o1: [0x00, 0x0e], // 请求一级命令
    resO1: [0x80, 0x0e], // 响应1级命令
    reqOrder: [
      {
        type: 'ktm2SysDict', // 2.3.1
        value: [0x00, 0x03]
      },
      {
        type: 'ktm2ModuleUpdateSysDict', //2.3.2 模块控制优化方式字典
        value: [0x00, 0x04]
      },
      {
        type: 'ktm2MachineInfo', //2.3.3 机床信息
        value: [0x00, 0x05]
      },
      {
        type: 'ktm2DataDictAxisList', //2.4.1 查询数据字典-轴列表
        value: [0x00, 0x06]
      },
      {
        type: 'ktm2DataDictAxisInfo', //2.4.2 查询数据字典-轴信息
        value: [0x00, 0x07]
      },
      {
        type: 'ktm2DataDictAxisTypeAdd', //2.4.3 新增轴类型
        value: [0x00, 0x08]
      },
      {
        type: 'ktm2DataDictAxisTypeUpdate', //2.4.4 修改轴类型
        value: [0x00, 0x09]
      },
      {
        type: 'ktm2DataDictAxisTypeDel', //2.4.5 删除轴类型
        value: [0x00, 0x0a]
      },
      {
        type: 'ktm2KnifeTypeAndMethodAdd', //2.4.6 新增刀具类型+加工方法
        value: [0x00, 0x0b]
      },
      {
        type: 'ktm2KnifeTypeUpdate', //2.4.7 修改刀具类型
        value: [0x00, 0x0c]
      },
      {
        type: 'ktm2KnifeTypeDel', //2.4.8 删除刀具类型
        value: [0x00, 0x0d]
      },
      {
        type: 'ktm2KnifeMethodUpdate', //2.4.9 修改加工方法
        value: [0x00, 0x0e]
      },
      {
        type: 'ktm2KnifeMethodDel', //2.4.10 删除加工方法
        value: [0x00, 0x0f]
      },
      {
        type: 'ktm2CommonConfigUpdate', //2.5.1 修改通用配置
        value: [0x00, 0x10]
      },
      {
        type: 'ktm2TypeNoList', //2.6.1 查询型号列表
        value: [0x00, 0x11]
      },
      {
        type: 'ktm2TypeNoAdd', //2.6.2 新增信号类
        value: [0x00, 0x12]
      },
      {
        type: 'ktm2TypeNoDel', //2.6.3 删除型号
        value: [0x00, 0x13]
      },
      {
        type: 'ktm2TypeNoUpdate', //2.6.4 修改型号
        value: [0x00, 0x14]
      },
      {
        type: 'ktm2EfficiUpgradeSwitchUpdate', //2.6.5 效率优化总开关修改
        value: [0x00, 0x15]
      },
      {
        type: 'ktm2AlarmSwitchUpdate', //2.6.6 报警总开关修改
        value: [0x00, 0x16]
      },
      {
        type: 'ktm2KnifePlaceTypeNowInfo', //2.7.1 当前型号信息
        value: [0x00, 0x17]
      },
      {
        type: 'ktm2KnifePlaceTypeChnnelInfoList', //2.7.2 型号-通道信息（刀位列表）
        value: [0x00, 0x18]
      },
      {
        type: 'ktm2KnifePlaceTypeChnnelInfoProcessList', //2.7.3 型号-通道-刀位信息（过程列表）
        value: [0x00, 0x19]
      },
      {
        type: 'ktm2KnifePlaceTypeChnnelInfoProcessSignList', //2.7.4 型号-通道-刀位-过程信息（过程信号列表）
        value: [0x00, 0x1a]
      },
      {
        type: 'ktm2KnifePlaceTypeChnnelManualAdd', //2.7.5 型号-监控通道-刀位手动新增
        value: [0x00, 0x1b]
      },
      {
        type: 'ktm2KnifePlaceTypeChnnelAutoAdd', //2.7.6 型号-通道-刀位自动新增
        value: [0x00, 0x1c]
      },
      {
        type: 'ktm2KnifePlaceTypeChnnelProcessAdd', //2.7.7 型号-通道-刀位-过程新增
        value: [0x00, 0x3b]
      },
      {
        type: 'ktm2KnifePlaceTypeChnnelProcessSignAdd', //2.7.8 型号-通道-刀位-过程-信号新增
        value: [0x00, 0x1d]
      },
      {
        type: 'ktm2KnifePlaceControllerMethodUpgradeUpdate', //2.7.9 控制优化方式修改
        value: [0x00, 0x1e]
      },
      {
        type: 'ktm2KnifePlaceTypeEfficiUpgradeUpdate', //2.7.10 控制优化方式修改
        value: [0x00, 0x1f]
      },
      {
        type: 'ktm2KnifePlaceTypeAlarmUpgradeUpdate', //2.7.11 型号-报警总开关修改
        value: [0x00, 0x20]
      },
      {
        type: 'ktm2KnifePlaceLookStudyCount', //2.7.12 操作-查看学习次数
        value: [0x00, 0x21]
      },
      {
        type: 'ktm2KnifePlaceTypeEdit', //2.7.14 刀位（刀具类型、加工方法）修改
        value: [0x00, 0x3c]
      },
      {
        type: 'ktm2KnifePlaceBatchDelete', //2.7.15 刀位批量删除
        value: [0x00, 0x3d]
      },
      {
        type: 'ktm2KnifePhysicsList', //2.7.16 查询物理通道下刀位列表
        value: [0x00, 0x41]
      },
      {
        type: 'ktm2KnifeReloadList', //2.7.17 业务新增过程或信号时通知给前端刷新页面
        value: [0x00, 0x41]
      },
      {
        type: 'ktm2KnifePlaceSetStudyCount', //2.7.12 操作-修改学习次数
        value: [0x00, 0x22]
      },
      {
        type: 'ktm2ModelConfigList', //2.8.1 模板配置列表查询
        value: [0x00, 0x23]
      },
      {
        type: 'ktm2ModelConfigAdd', //2.8.2 模板配置新增
        value: [0x00, 0x24]
      },
      {
        type: 'ktm2ModelConfigUpdate', //2.8.3 模板配置修改
        value: [0x00, 0x25]
      },
      {
        type: 'ktm2ModelConfigDel', //2.8.4 模板配置删除
        value: [0x00, 0x26]
      },
      {
        type: 'ktm2ModelConfigImport', //2.8.5 模板配置导入
        value: [0x00, 0x27]
      },
      {
        type: 'ktm2ModelConfigExport', //2.8.6 模板配置导出
        value: [0x00, 0x28]
      },
      {
        type: 'ktm2ModelConfigStudyCount', //2.8.7 模板配置/配置-查询学习次数
        value: [0x00, 0x29]
      },
      {
        type: 'ktm2ModelConfigStudySaveCount', //2.8.8 模板配置/配置-保存学习次数
        value: [0x00, 0x3a]
      },
      {
        type: 'ktm2ModelConfigBatchList', //2.8.9 模板配置-获取大小批量列表
        value: [0x00, 0x3e]
      },
      {
        type: 'ktm2ModelAllList', // 查询机床下的所有换型方式下的所有型号列表下的所有监控通道列表
        value: [0x00, 0x40]
      },
      {
        type: 'remodelList', //2.5.2 应用配置-查询换型方式列表
        value: [0x00, 0x3f]
        // fun: 'ToolService.parseRemodelList'
      }
    ],
    pushOrder: []
  },
  OVERLOAD: {
    // 过载监测
    o1: [0x00, 0x10], // 请求一级命令
    resO1: [0x80, 0x10], // 响应1级命令
    reqOrder: [
      // 请求响应配置
      {
        type: 'overloadSettingAdd', // 新增配置
        value: [0x00, 0x01]
      },
      {
        type: 'overloadSettingUpdate', // 更新配置
        value: [0x00, 0x03]
      },
      {
        type: 'overloadSettingDel', // 删除配置
        value: [0x00, 0x04]
      },
      {
        type: 'overloadSettingList', // 查询全部配置
        value: [0x00, 0x05]
      },
      {
        type: 'overloadSettingDetail', // 查询单个配置
        value: [0x00, 0x06]
      },
      {
        type: 'overloadWarningRes', // 报警反馈
        value: [0x00, 0x10]
      },
      {
        type: 'overloadAlarmList', // 查询历史告警列表
        value: [0x00, 0x11],
        isResSlice: true
      },
      {
        type: 'overloadAlarmDetail', // 历史告警详情
        value: [0x00, 0x12],
        isResSlice: true
      },
      {
        type: 'overloadPieceNumDetail', // 过程分析-工件序号查询
        value: [0x00, 0x17]
      },
      {
        type: 'overloadPieceAttributeUpdate', // 过程分析-工件特征标注
        value: [0x00, 0x18]
      },
      {
        type: 'overloadHisMonitorDetail', // 过程分析-历史监控状态
        value: [0x00, 0x13],
        isResSlice: true
      },
      {
        type: 'overloadLearnUpdate', // 过程分析-过程监控配置
        value: [0x00, 0x25]
      },
      {
        type: 'overloadProcessReLean', // 某个过程重新学习
        value: [0x00, 0x16]
      },
      {
        type: 'overloadSub', // 过程数据订阅
        value: [0x00, 0x19]
      },
      {
        type: 'overloadUnSub', // 过程数据退订
        value: [0x00, 0x20],
        fun: 'OverloadService.clearSigQueue'
      },
      {
        type: 'overloadMonitorOnline', // 机床看板-在线监控
        value: [0x00, 0x21],
        isResSlice: true
      },
      {
        type: 'overloadMonitorHistroySwitch', // 机床看板-离线监控-过程切换
        value: [0x00, 0x22],
        isResSlice: true
      },
      {
        type: 'overloadMonitorHistroy', // 机床看板-监控设定
        value: [0x00, 0x24]
      },
      {
        type: 'overloadProcessMonitorLook', // 过程监控查看
        value: [0x00, 0x26]
      },
      {
        type: 'overloadProcessMonitorModelDataLook', // 过程监控模型数据查询
        value: [0x00, 0x27],
        isResSlice: true
      },
      {
        type: 'overloadBoardOffLineDataQuery', // 9.5机床看板-离线监控-刀具列表和程序号列表查询
        value: [0x00, 0x29]
      },
      {
        type: 'overloadGetNextProcessMarkSatus', // 9.6 下一个过程标注状态
        value: [0x00, 0x30]
      },
      {
        type: 'overloadVersion', // 获取过载版本号
        value: [0x00, 0x31]
      },
      {
        type: 'overloadProcessUnitSave', // 6.7过程监控/工件序号保存
        value: [0x00, 0x28],
        isResSlice: true
      },
      {
        type: 'getOverloadTacticsList', // 查询策略列表
        value: [0x00, 0x35]
      },
      {
        type: 'setOverloadTactics', // 修改策略列表
        value: [0x00, 0x36]
      },
      {
        type: 'getOverloadSignalList', // 查询信号列表信息
        value: [0x00, 0x37]
      },
      {
        type: 'getOverloadSignalDisposition', // 查询信号对应的配置
        value: [0x00, 0x39]
      },
      {
        type: 'detOverloadSignalList', // 删除信号对应的配置
        value: [0x00, 0x40]
      },
      {
        type: 'overloadProcessCostomSetting', // 按信号查询过程自定义配置
        value: [0x00, 0x41]
      },
      {
        type: 'overloadQueryProglist', // 查询程序号列表
        value: [0x00, 0x32]
      },
      {
        type: 'overloadQueryToollist', // 查询刀具号列表
        value: [0x00, 0x33]
      },
      {
        type: 'overloadQueryMmidlist', // 查询刀具号/程序号对应新的监控过程信息
        value: [0x00, 0x34]
      },
      {
        type: 'addOverloadDefaultConfig', // 新增过程监控默认配置
        value: [0x00, 0x42]
      },
      {
        type: 'overloadSignalList', // 获取信号列表
        value: [0x00, 0x43]
      },
      {
        type: 'overloadModelquery', // 过程监控手动模型获取
        value: [0x00, 0x44]
      },
      {
        type: 'overloadModelChange', // 过程监控手动模型修改
        value: [0x00, 0x45]
      },
      {
        type: 'overloadGetModel', // 机床看板实时推送数据，查询当前过程模型
        value: [0x00, 0x46]
      },
      {
        type: 'overloadRealtimeData', // 机床看板过载实时推送数据
        value: [0x00, 0x47],
        fun: 'OverloadService.signalFormate'
      }
    ],
    pushOrder: [
      // 主动推送的命令
      {
        type: 'overloadProcess', // 过程数据推送
        value: [0x00, 0x08],
        isResSlice: true
      },
      {
        type: 'overloadWarningData', // 报警数据推送
        value: [0x00, 0x09],
        isResSlice: true
      }
    ]
  },
  TECHNOLOGY: {
    // 工艺
    o1: [0x00, 0x13], // 请求一级命令
    resO1: [0x80, 0x13], // 响应1级命令
    reqOrder: [
      // 请求响应配置
      {
        type: 'technologyModel', // 工艺模型
        value: [0x00, 0x01],
        isResSlice: true
      },
      {
        type: 'technologyAdd', // 工艺关联新增
        value: [0x00, 0x03],
        isResSlice: true
      },
      {
        type: 'technologyUpdate', // 工艺关联更改
        value: [0x00, 0x04],
        isResSlice: true
      },
      {
        type: 'technologyDel', // 工艺关联删除
        value: [0x00, 0x05],
        isResSlice: true
      },
      {
        type: 'technologyList', // 工艺关联查询
        value: [0x00, 0x06],
        isResSlice: true
      },
      {
        type: 'hotEngineOpenClose', // 开启、关闭热机
        value: [0x00, 0x07],
        isResSlice: true
      },
      {
        type: 'hotEngineStatus', // 查询热机状态
        value: [0x00, 0x08],
        isResSlice: true
      },
      {
        type: 'technologySelectOpts', // 工艺关联顺序下拉项
        value: [0x00, 0x09],
        isResSlice: true
      },
      {
        type: 'warningInfo', // 查询告警
        value: [0x00, 0x0a],
        isResSlice: true
      },
      {
        type: 'warningInfoPop', // 告警弹窗
        value: [0x00, 0x0b],
        isResSlice: true
      },
      {
        type: 'reworkStatus', // 获取返工状态-查询和主动推送
        value: [0x00, 0x0c],
        isResSlice: true
      },
      {
        type: 'cancelRework', // 取消返工
        value: [0x00, 0x0d],
        isResSlice: true
      }
    ],
    pushOrder: []
  },
  VCS: {
    // 卡屑
    o1: [0x00, 0x03], // 请求一级命令
    resO1: [0x80, 0x03], // 响应1级命令
    reqOrder: [
      {
        type: 'vcsEnumMachine', // 枚举机床
        value: [0x00, 0x04],
        postFun: 'VcsService.enumMachine',
        parseType: 1
      },
      {
        type: 'vcsMachineColloctor', // 获取机床配置信息
        value: [0x00, 0x05],
        postFun: 'VcsService.getMachineColloctor',
        parseType: 1
      },
      {
        type: 'vcsSetMachineColloctor', // 设置机床配置信息
        value: [0x00, 0x06],
        reqFun: 'VcsService.setMachineColloctor',
        parseType: 1
      },
      {
        type: 'vcsAddMachineColloctor', // 添加机床采集卡
        value: [0x00, 0x0a],
        parseType: 1
      },
      {
        type: 'vcsDelMachineColloctor', // 删除机床采集卡
        value: [0x00, 0x0b],
        parseType: 1
      },
      {
        type: 'vcsConnectMachineColloctor', // 连接机床采集卡
        value: [0x00, 0x0c],
        parseType: 1
      },
      {
        type: 'vcsDisConnectMachineColloctor', // 断开机床采集卡
        value: [0x00, 0x0d],
        parseType: 1
      },
      {
        type: 'vcsGetColloctorList', // 获取采集卡列表
        value: [0x00, 0x0e],
        postFun: 'VcsService.getColloctorList',
        parseType: 1
      },
      {
        type: 'vcsStartMonitor', //  开始监控
        value: [0x00, 0x10],
        parseType: 1
      },
      {
        type: 'vcsStopMonitor', // 停止监控
        value: [0x00, 0x11],
        parseType: 1
      },
      {
        type: 'vcsMonitorGlobalData', //监控全局数据通知S
        value: [0x00, 0x12],
        parseType: 1,
        postFun: 'VcsService.monitorGlobalData'
      },
      {
        type: 'vcsMonitoringStart', //触发监控运算（DI触发）开始通知
        value: [0x00, 0x13],
        parseType: 1
      },
      {
        type: 'vcsCalibrationStart', //标定开始通知
        value: [0x00, 0x14],
        parseType: 1
      },
      {
        type: 'vcsMonitoringResult', //监控结果通知
        value: [0x00, 0x15],
        parseType: 1,
        postFun: 'VcsService.monitoringResult'
      },
      {
        type: 'vcsMonitoringEnd', //  监控运算结束通知
        value: [0x00, 0x16],
        parseType: 1
      },
      {
        type: 'vcsMonitoringReset', //  监控复位
        value: [0x00, 0x17],
        parseType: 1
      },
      {
        type: 'vcsGetAlarmAssociatedKeys', //获取告警关联的key值
        value: [0x00, 0x18],
        parseType: 1
      },
      {
        type: 'vcsGetAlarmHistory',
        value: [0x00, 0x19],
        postFun: 'VcsService.getAlarmHistory',
        parseType: 1
      },
      {
        type: 'vcsGetCalibratedToolPrograms', //获取标定过的刀具程序
        value: [0x00, 0x1a],
        parseType: 1,
        postFun: 'VcsService.getCalibratedToolPrograms'
      },
      {
        type: 'vcsQueryCalibrationStandardInfo', //  查询标定基准
        value: [0x00, 0x1b],
        parseType: 1,
        postFun: 'VcsService.queryCalibrationStandardInfo'
      },
      {
        type: 'vcsViewProtoModifyCSItem', // 修改标定基准
        value: [0x00, 0x1c],
        parseType: 1,
        reqFun: 'VcsService.viewProtoModifyCSItem'
      },
      {
        type: 'vcsClearCalibrationStandard', //  清除标定基准
        value: [0x00, 0x1d],
        parseType: 1,
        reqFun: 'VcsService.clearCalibrationStandard'
      },
      {
        type: 'vcsEnumDecisions', //获取决策列表
        value: [0x00, 0x22],
        postFun: 'VcsService.enumDecisions',
        parseType: 1
      },
      {
        type: 'vcsGetRotateSpeed', // 获取转速列表
        value: [0x00, 0x24],
        parseType: 1
      },
      {
        type: 'vcsGetCollectorInfo', //获取采集器信息
        value: [0x00, 0x25],
        postFun: 'VcsService.getCollectorInfo',
        parseType: 1
      },
      {
        type: 'vcsGetRecheckSwitch', //  拉取复检开关
        value: [0x00, 0x1f],
        parseType: 1
        // postFun: 'VcsService.vscSCGetRecheckSwitch'
      },
      {
        type: 'vcsSetRecheckSwitch', //  设置复检开关
        value: [0x00, 0x20],
        parseType: 1
        // postFun: 'VcsService.vscSCGetRecheckSwitch'
      }
    ],
    pushOrder: []
  }
}
