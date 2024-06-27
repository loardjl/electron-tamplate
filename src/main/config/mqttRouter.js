module.exports = {
  device_create: {
    // 设备上报
    topic: 'device/create'
  },
  device_update: {
    //设备更新
    topic: 'device/update'
  },
  device_alarm_upload: {
    // 设备报警上传
    topic: 'alarm/signal'
  },
  device_runlog_upload: {
    // 设备运行日志上传
    topic: 'device/runlog'
  },
  lathe_create: {
    // 机床注册上报
    topic: 'machine/create'
  },
  lathe_del: {
    // 机床删除
    topic: 'machine/del'
  },
  lathe_upload: {
    // 机床状态更新
    topic: 'machine/status'
  },
  services_create: {
    // 服务版本信息上报
    topic: 'device/version'
  },
  service_upload: {
    // 服务状态上传
    topic: 'device/service'
  },
  file_start: {
    // 蓝屏日志文件上传
    topic: 'file/start'
  },
  file_upload: {
    // 蓝屏文件上传
    topic: 'file/upload',
    context_type: 2
  },
  device_powershell: {
    // posershell 命令结果返回
    topic: 'device/powershell'
  },
  device_auth_push: {
    // 授权推送返回
    topic: 'device/authask'
  },
  device_restart: {
    // 设备系统重启
    topic: 'device/restart'
  },
  moudle_restart: {
    // 模块重启回复
    topic: 'module/restart'
  },
  // 需要预处理的
  pre: {
    sys_restart: {
      //系统重启
      topic: 'device/restart/'
    },
    powershell: {
      // 命令执行
      topic: 'device/powershell/'
    },
    winlog_file: {
      // win蓝屏日志文件接收
      topic: 'divice/log/'
    },
    service_restart: {
      // 服务重启
      topic: 'iedp/restart/'
    },
    device_auth: {
      // 授权接收
      topic: 'device/auth/'
    },
    services_create: {
      // 服务版本信息上报
      topic: 'device/version'
    },
    service_upload: {
      // 服务状态上传
      topic: 'device/service'
    },
    file_start: {
      // 蓝屏日志文件上传
      topic: 'file/start'
    },
    file_upload: {
      // 蓝屏文件上传
      topic: 'file/upload',
      context_type: 2
    },
    device_powershell: {
      // posershell 命令结果返回
      topic: 'device/powershell'
    },
    device_auth_push: {
      // 授权推送返回
      topic: 'device/authask'
    },
    device_restart: {
      // 设备系统重启
      topic: 'device/restart'
    },
    device_alarm_switch: {
      // 报警总开关设置
      topic: 'device/alarm_switch/'
    },
    moudle_restart: {
      // 模块重启
      topic: 'module/restart/'
    }
  }
}
