const mqttRouter = require('../config/mqttRouter')
const path = require('path')
const mqtt = require('mqtt')
const axios = require('axios')
const list_util = require('../manager/list')
const BaseService = require('./BaseService')
const fs = require('fs')
const { app } = require('electron')
const { exec, spawn } = require('child_process')
const { DB } = require('../conn/db')
const { now } = require('lodash')

class MqttTaskService extends BaseService {
  // 缓存key
  cacheKeys = {
    // token
    token: '',
    // 所有机床 以对象（机床id，机床）的格式来写。
    lathes: {},
    // 上一次查询到的机床id数组
    lastMids: [],
    // 设备信息
    dev_ino: {},
    // 设备是否注册成功
    dev_login_status: 'dev_login_status',
    // mqtt 客户端id
    mqtt_client_id: 'mqtt_client_id_test',
    // 最新蓝屏日志文件
    win_log: [],
    // 设备云id
    dev_cloud_id: 'dev_cloud_id',
    // 终端
    pty: {},
    // 云端token
    cloud_token: null,
    sigMap: {}
  }

  // 日志数据库
  log_db = {
    db: null,
    date: new Date().getDay(),
    status: false
  }

  constructor() {
    super()
    this.mqttStatus = 0
    // 主程序执行
    if (this.serverCfg.SOURCE.monitor.enable == true) {
      this.main()
      this.logger.info('mqtt服务启动')
    }
    // 机床告警状态 1、有报警 2、无报警
    this.alarmStatus = 2
  }

  async main() {
    try {
      await this.getAllLathe() //  获取所有机床状态， 先不注册，只是拿到
      await this.getSigMap()

      // 组装设备上报信息
      await this.getDevInfo()
      this.initMqtt(this.serverCfg.SOURCE.monitor.mqtt.host, this.cacheKeys.mqtt_client_id)

      const t = setInterval(() => {
        if (this.mqttStatus === 1) {
          this.login_dev()
          clearInterval(t)
        }
      }, 5000)
    } catch (error) {
      this.logger.error(error)
      this.logger.error('初始化错误')
    }
  }

  async getSigMap() {
    const res = await axios.post(this.dcUrl, {
      version: '1.0',
      method: 'enum_signals',
      id: '4',
      params: {}
    })
    const { fixed_signals, dynamic_signals } = res.data.result
    for (const item of fixed_signals) {
      this.cacheKeys.sigMap[item.sig_id] = item.sig_name
    }
    for (const item of dynamic_signals) {
      this.cacheKeys.sigMap[item.sig_id] = item.sig_name
    }
  }

  // 初始化mqtt client
  initMqtt(host, clinet_id, config) {
    this.clientId = clinet_id

    this.client = mqtt.connect(`mqtt://${host}`, {
      protocolVersion: 5, // 设置协议版本为 MQTT 5
      clientId: clinet_id
    })
    // 收到消息时的处理
    this.client.on('message', async (topic, message) => {
      try {
        message = JSON.parse(message.toString())
        await this.routerInfo(topic, message)
      } catch (e) {
        this.logger.error(e)
      }
    })
    this.client.on('connect', message => {
      this.mqttStatus = 1
      this.logger.info('mqtt连接成功')
    })
    this.client.on('close', message => {
      this.logger.info('mqtt关闭', message)
      // this.initMqtt(this.serverCfg.SOURCE.monitor.mqtt.host, this.cacheKeys.mqtt_client_id)
    })
    // 处理错误
    this.client.on('error', error => {
      this.logger.error('mqtt连接错误', error)
    })

    this.subscribe()
  }

  /**
   * 订阅所有topic
   */
  subscribe() {
    // 订阅客户端id主题
    this.client.subscribe(this.clientId, err => {
      if (err) {
        this.logger.error('订阅失败')
      }
    })

    const pre = mqttRouter.pre
    for (const k in pre) {
      const topic = pre[k].topic + this.clientId
      this.client.subscribe(topic, err => {
        if (err) {
          this.logger.error('订阅失败')
        }
      })
    }
  }

  oncePty(data, token) {
    const { order, socketId } = data
    const child = spawn('powershell.exe', [order])
    try {
      this.logger.info('接受到powershell命令：', order)

      const timeout = setTimeout(() => {
        // 十分钟后如果还在
        child.kill()
      }, 1000 * 60 * 10)
      const this_p = this
      child.stdout.on('data', function (data) {
        this_p.logger.info('powershell执行结果：', data.toString())
        this_p.send(
          mqttRouter.device_powershell.topic,
          {
            id: this_p.cacheKeys.dev_cloud_id,
            code: 1,
            context: data.toString(),
            socketId: socketId
          },
          { token }
        )
        child.kill()
        clearTimeout(timeout)
      })
      child.stderr.on('data', function (data) {
        this_p.send(
          mqttRouter.device_powershell.topic,
          {
            id: this_p.cacheKeys.dev_cloud_id,
            code: 0,
            context: data.toString(),
            socketId: socketId
          },
          { token }
        )
      })
    } catch (e) {
      this.logger.error('powershell执行出错：', e.toString())
      this.send(mqttRouter.device_powershell.topic, {
        id: this.cacheKeys.dev_cloud_id,
        code: 0,
        context: e.toString()
      })
      child.kill()
    }
  }

  async getDevInfo() {
    const tidRes = await axios.post(this.dcUrl, {
      version: '1.0',
      method: 'get_edge_device_info',
      id: '84',
      params: {}
    })
    const { device_name, TID } = tidRes.data.result
    const vpnIpMacs = this.service.EmosService.getVirtualIPAndMac()
    const memUsage = await this.service.EmosService.getSysUsage()
    const { list, serviceStatus } = await this.service.EmosService.getModuleList()
    const { status, isOpenAlarm } = await this.service.EmosService.getMStatusAndAlarm()

    const obj = {
      tid: TID,
      name: device_name || '未命名',
      ip: vpnIpMacs.vpn.length > 0 ? vpnIpMacs.vpn[0]['address'] : null,
      wifi_ip: vpnIpMacs.wifi.length > 0 ? vpnIpMacs.wifi[0]['address'] : null,
      navtie_ip: vpnIpMacs.native.length > 0 ? vpnIpMacs.native[0]['address'] : null,
      status: this.alarmStatus === 1 ? this.alarmStatus : status, //判断alarmStatus是否正在告警  1 报警中 2离线 3 监控中 4 非监控中
      isOpenAlarm, //全局报警总开关开启状态，true打开 false关闭
      mac: vpnIpMacs.vpn.length > 0 ? vpnIpMacs.vpn[0]['mac'] : null,
      serviceStatus, // -1 错误 ，1 正常，只有所有服务都正常才是正常
      useCPU: memUsage.cpu,
      useRAM: memUsage.mem_usage,
      cDisk: memUsage.C,
      dDisk: memUsage.D,
      module: list
    }

    // let mqtt_client_id = `${dev['tid']}_mqtt_${Math.random().toString(16).slice(3)}`
    const mqtt_client_id = TID
    this.cacheKeys.mqtt_client_id = mqtt_client_id
    this.cacheKeys.dev_ino = obj
    return obj
  }

  // 机床告警总开关设置
  async device_alarm_switch(data) {
    const { alarm_switch, mid } = data
    if (this.cacheKeys.lathes[mid]) {
      const res = await axios.post(this.eomsUrl, {
        version: '1.0',
        method: 'set_alarm_switch',
        id: '1',
        params: {
          dev_id: mid,
          alarm_switch: alarm_switch
        }
      })
      this.logger.info(res.data, 'set_alarm_switch')
    }
  }

  // 模块重启
  moudle_restart(data) {
    const { id, socketId, module } = data
    if (module === 1 || module === '1') {
      // 重启自身
      // 重启应用程序
      app.relaunch()
      app.exit(0) // 关闭当前应用程序进程
    }
    this.send(mqttRouter.moudle_restart.topic, {
      id: id,
      socketId: socketId,
      code: 1
    })
  }

  /**
   * 系统重启 接收处理
   */
  sys_reboot() {
    this.send(mqttRouter.device_restart.topic, {})
    this.logger.info('五秒后重啟')
    setTimeout(() => {
      // 在 Windows 上重启系统 命令的方式
      exec('shutdown /r /t 0', (err, stdout, stderr) => {
        if (err) {
          this.logger.error('重启失败:', err)
        } else {
          this.logger.info('系统正在重启...')
        }
      })
    }, 1000 * 5)
  }

  /**
   *  定时上报数据任务
   */
  intervalPushData() {
    // 定时任务
    const config = this.serverCfg.SOURCE
    try {
      this.device_interval = setInterval(async () => {
        if (!this.cacheKeys.cloud_token) {
          clearInterval(this.device_interval)
        } else {
          this.device_upload()
        }
        // 五分钟
      }, parseInt(config.monitor.interval.device))

      this.lathe_interval = setInterval(async () => {
        if (!this.cacheKeys.cloud_token) {
          clearInterval(this.lathe_interval)
        } else {
          this.lathe_task()
        }
      }, parseInt(config.monitor.interval.all_lathe))
      // 机床报警信息上报任务 五分钟
      // this.alarm_interval = setInterval(async () => {
      //     if (!this.cacheKeys.cloud_token) {
      //         clearInterval(this.alarm_interval)
      //     } else {
      //         await this.alarmInfo();
      //     }
      // }, parseInt(config.monitor.interval.alarm));

      this.services_interval = setInterval(async () => {
        if (!this.cacheKeys.cloud_token) {
          clearInterval(this.services_interval)
        } else {
          // 各个服务运行情况上报任务
          const { list } = await this.service.EmosService.getModuleList()
          this.send(mqttRouter.service_upload.topic, {
            id: this.cacheKeys.dev_cloud_id,
            module: list
          })
        }
      }, parseInt(config.monitor.interval.services))

      this.win_interval = setInterval(() => {
        if (!this.cacheKeys.cloud_token) {
          clearInterval(this.win_interval)
        } else {
          // 蓝屏任务上报任务
          this.win_file_upload()
        }
      }, parseInt(config.monitor.interval.win_orrer))

      this.run_interval = setInterval(() => {
        if (!this.cacheKeys.cloud_token) {
          clearInterval(this.run_interval)
        } else {
          // 运行日志上报任务
          this.upload_run_log()
        }
      }, parseInt(10000))
    } catch (e) {
      this.logger.info('定时任务: 监控平台上报失败', e)
    }
  }

  async alarmInfo() {
    try {
      const lathe = this.cacheKeys.lathes
      if (!lathe) {
        return
      }
      const arr = []
      for (const k in lathe) {
        arr.push(
          axios.post(this.eomsUrl, {
            version: '1.0',
            method: 'get_alarm_status_result',
            id: '1',
            params: {
              dev_id: parseInt(k) //机床ID
            }
          })
        )
      }
      if (arr.length > 0) {
        const data = await Promise.all(arr)
        this.logger.info(data.length, 'alarmInfo*******')
        for (const item of data) {
          const { dev_id, alarm_status_result_list } = item.data.result
          if (alarm_status_result_list.length) {
            for (const alarm of alarm_status_result_list) {
              this.logger.info(dev_id, alarm, 'alarmInfo***&&&&***')
              const obj = {
                dev_id: this.cacheKeys.dev_cloud_id,
                code: alarm.code,
                is_wrong: alarm.isWrong ? true : false,
                adapter_id: alarm.adapter_id,
                module: alarm.module_id,
                channel_no: alarm.channel_no,
                knife_no: alarm.tool_num,
                process_index_no: alarm.process_order_num,
                program_num: alarm.program_num,
                unit_no: alarm.batch_num,
                sign: this.cacheKeys.sigMap[alarm.signal_id],
                signal_id: alarm.signal_id,
                feed_override: alarm.feed_override,
                alarm_time: alarm.alarm_time,
                alarm_type: alarm.alarm_type,
                alarm_result: alarm.alarm_result,
                cmid: this.cacheKeys.lathes[dev_id].cloud_id
              }
              this.send(mqttRouter.device_alarm_upload.topic, obj)
            }
          }
        }
      }
    } catch (e) {
      this.logger.error(e)
    }
  }
  //上报告警信息
  async sendAlarmInfo(data) {
    try {
      if (this.serverCfg.SOURCE.monitor.enable == false) {
        return
      }
      const lathe = this.cacheKeys.lathes
      if (!lathe) {
        return
      }
      if (data.length > 0) {
        for (const alarm of data) {
          const {
            dev_id,
            code,
            is_wrong: is_wrong,
            adapter_id,
            module_id: module,
            channel_no,
            tool_num: knife_no,
            process_order_num: process_index_no,
            program_num,
            batch_num: unit_no,
            sig_name: sign,
            signal_id,
            feed_override,
            alarm_time,
            alarm_type,
            alarm_result
          } = alarm
          const obj = {
            dev_id: this.cacheKeys.dev_cloud_id,
            code,
            is_wrong: is_wrong === 0 ? false : true,
            adapter_id,
            module,
            channel_no,
            knife_no,
            process_index_no,
            program_num,
            unit_no,
            sign,
            signal_id,
            feed_override,
            alarm_time,
            alarm_type,
            alarm_result,
            cmid: this.cacheKeys.lathes[dev_id]?.cloud_id
          }
          this.send(mqttRouter.device_alarm_upload.topic, obj)
        }
      }
    } catch (e) {
      this.logger.error(e)
    }
  }

  //上报运行日志信息
  async upRunLog(data) {
    try {
      if (this.serverCfg.SOURCE.monitor.enable == false) {
        return
      }
      if (data.length > 0) {
        for (const log of data) {
          console.log(log)
          const logInfo = typeof log === 'string' ? JSON.parse(log) : log
          logInfo.devid = this.cacheKeys.dev_cloud_id
          this.send(mqttRouter.device_runlog_upload.topic, logInfo)
        }
      }
    } catch (e) {
      this.logger.error(e)
    }
  }

  //初始化数据库
  async initLogDB() {
    if (!this.cacheKeys.cloud_token) {
      return
    }
    const res = await axios.post(this.eomsUrl, {
      version: '1.0',
      method: 'get_log_storage_dir_path',
      id: '1',
      params: {}
    })
    //获取存储路径
    const { log_path } = res.data.result
    // let log_path = 'D:\\$RECYCLE\\logdb'
    //拼装完整路径
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
    // const formattedMonth = month < 10 ? '0' + month : month.toString()
    const day = (new Date().getDate() + 0).toString().padStart(2, '0')
    // const formattedDay = day < 10 ? '0' + day : day.toString()

    const time = new Date().getFullYear() + '-' + month + '-' + day
    const dir = path.win32.normalize(log_path + 'eoms\\eoms_log_' + time + '.db')

    //初始化数据库
    if (await fs.existsSync(dir)) {
      this.log_db.db = new DB(dir)
      this.log_db.status = true
      this.log_db.date = new Date().getDay()

      const res = this.log_db.db.findBySql(`SELECT * FROM loginfo `)

      const loginfo = []
      for (const a of res) {
        loginfo.push(a.info)
      }
      if (loginfo.length > 0) {
        this.upRunLog(loginfo)
      }
    } else {
      this.log_db.status = false
      this.log_db.db = null
    }
  }
  // 定时上报日志
  async upload_run_log() {
    //判断是否是当天
    if (new Date().getDay() !== this.log_db.date) {
      this.initLogDB()
    }
    if (!this.log_db.status) {
      this.initLogDB()
      return
    }

    const time = new Date().getTime() - 1000 * 10
    const res = this.log_db.db.findBySql(`SELECT * FROM loginfo  where timestamp > ${time}`)

    const loginfo = []
    for (const a of res) {
      loginfo.push(a.info)
    }

    if (loginfo.length > 0) {
      this.upRunLog(loginfo)
    }
  }

  //设备状态上报
  async device_upload() {
    // 设备状态定时上报任务
    const dev = await this.getDevInfo()
    const body = { ...dev, id: this.cacheKeys.dev_cloud_id }
    this.send(mqttRouter.device_update.topic, body)
  }

  // 机床上报任务
  async lathe_task() {
    await this.getAllLathe()
    // 获取所有机床报警开关信息
    await this.push_all_lathe()

    // 机床状态任务上报
    // let all_lathe = this.cacheKeys.lathes
    // if (all_lathe) {
    //     for (let key in all_lathe) {
    //         let lathe = all_lathe[key]
    //         let status = await this.getLatheStatus(lathe['id'])
    //         this.send(
    //             mqttRouter.lathe_upload.topic,
    //             {
    //                 id: lathe.cloud_id,
    //                 status: status
    //             },
    //         )
    //     }
    // }
  }

  // 获取机床状态
  async getLatheStatus(lathe_dev_id) {
    // -1 设备报警  其它依靠https://ujoin.yuque.com/mw8efh/hw4p6h/fooatqado8cbr1nm
    let status = 0
    const nc_list = await this.getNcByLatheDevId(lathe_dev_id)
    if (nc_list.length === 0) {
      return status
    }
    for (const nc of nc_list) {
      if (nc['collector_type_id'] === 1) {
        if (nc['alarm_status'] !== 0) {
          status = -1
          break
        } else if (nc['connect_status'] === 0) {
          status = -2
          break
        } else if (nc['channel_num'] === 1) {
          status = nc['check_run']
        }
      }
    }
    return status
  }

  // 获取机床运行状态
  async getNcByLatheDevId(lathe_dev_id) {
    // 多个采集器通道
    let adapter_status = []
    try {
      const res = await axios.post(this.dcUrl, {
        version: '1.0',
        method: 'get_dev_run_status',
        id: '86',
        params: { dev_id: lathe_dev_id }
      })
      adapter_status = res.data.result['adapter_status']
    } catch (e) {
      this.logger.error('机床状态获取失败', e)
    }

    return adapter_status
  }

  // 获取上次文件同步时间
  async getLastFileTime() {
    const obj = {
      devid: this.cacheKeys.dev_cloud_id,
      ftype: 1 // 1 蓝屏日志
    }
    this.send(mqttRouter.file_time, obj)
  }

  // 上传蓝屏日志到mqtt服务器
  async win_file_upload() {
    try {
      const url = `http://${this.serverCfg.SOURCE.cloud_url}/logfile/lasttime`
      const upUrl = `http://${this.serverCfg.SOURCE.cloud_url}/logfile/upload`
      const timeres = await axios.post(
        url,
        {
          devid: this.cacheKeys.dev_cloud_id,
          ftype: 1
        },
        {
          headers: {
            authorization: this.cacheKeys.cloud_token
          }
        }
      )
      const { created_at } = timeres.data

      // let win_dir = 'C:\\Windows\\Minidump';
      const win_dir = this.serverCfg['SOURCE']['monitor']['dir']['win_error']
      console.log(fs.existsSync(win_dir), 'fs.existsSync(win_dir)')
      if (!fs.existsSync(win_dir)) {
        // 目录不存在
        return
      }
      const filesAndDirs = fs.readdirSync(win_dir)

      // 过滤出所有文件
      const files = filesAndDirs.filter(fileOrDir =>
        fs.statSync(path.join(win_dir, fileOrDir)).isFile()
      )
      if (!files || files.length === 0) {
        return
      }
      // 包括每个文件状态的数组
      const status_files = []
      for (const file of files) {
        const file_path = path.join(win_dir, file)
        const stats = fs.statSync(file_path)
        status_files.push({
          file_path: file_path,
          stats: stats,
          mtime: stats.mtime,
          name: file
        })
      }
      // 降序排序
      status_files.sort((a, b) => b.mtime - a.mtime)
      const filter_files = []
      if (created_at) {
        const t2 = new Date(created_at).getTime()

        // 再次过滤文件
        for (const file of status_files) {
          const t1 = new Date(file.mtime).getTime()
          if (t1 > t2) {
            filter_files.push(file)
          } else {
            // 因为是降序排序，只要前面有一个小于了后面的肯定都小于
            break
          }
        }
      } else {
        filter_files.push(...status_files)
      }

      for (const item of filter_files) {
        await axios.post(
          upUrl,
          {
            fname: item.name,
            ftype: 1, // 蓝屏
            devid: this.cacheKeys.dev_cloud_id,
            createdAt: new Date(item.mtime).getTime(),
            size: item.stats.size,
            file: fs.createReadStream(item.file_path)
          },
          {
            headers: {
              authorization: this.cacheKeys.cloud_token,
              'Content-Type': 'multipart/form-data'
            }
          }
        )
      }
    } catch (e) {
      this.logger.error('蓝屏日志上传失败', e)
    }
  }

  // 将文件分成特定字节大小的多个Buffer
  get_file_splice_list(bytes_size, count, file) {
    const buffer_file_list = []
    const data = fs.readFileSync(file)
    for (let index = 0; index < count; index++) {
      const chunk = data.subarray(index, (index + 1) * bytes_size)
      buffer_file_list.push(chunk)
    }
    return buffer_file_list
  }

  // 注册所有的机床信息
  async push_all_lathe() {
    this.logger.info('注册机床------')
    const lathes = this.cacheKeys.lathes

    if (Object.keys(lathes).length === 0) {
      const data = {
        id: this.cacheKeys.dev_cloud_id,
        mids: []
      }
      //删除机床 上报数据是现存在的mid 不存在的mid清理掉
      await this.send(mqttRouter.lathe_del.topic, data)
    }

    this.logger.info(lathes, '*********')
    const lastMids = this.cacheKeys.lastMids

    //获取lathes中的每个对象的机床mid同步云上数据
    const nowMids = Object.keys(lathes).map(lathe => lathe)
    const diffMids = lastMids.filter(mid => !nowMids.includes(mid))
    //上次机床数量大于等于本次的机床数量，机床可能有删除
    if (diffMids > 0) {
      const data = {
        id: this.cacheKeys.dev_cloud_id,
        mids: nowMids
      }
      //删除机床 上报数据是现存在的mid 不存在的mid清理掉
      await this.send(mqttRouter.lathe_del.topic, data)
    }
    this.cacheKeys.lastMids = nowMids

    for (const key of Object.keys(lathes)) {
      const data = lathes[key]
      data.devId = this.cacheKeys.dev_cloud_id
      await this.send(mqttRouter.lathe_create.topic, data)
    }
  }

  // 检查机床

  /**
   * 获取并缓存所有机床
   */
  async getAllLathe() {
    const res = await axios.post(this.dcUrl, {
      version: '1.0',
      method: 'enum_dev_list',
      id: '9',
      params: {}
    })
    const list = res.data.result.dev_list
    const alarmArr = []
    this.cacheKeys.lathes = {}
    for (const data of list) {
      // 所有的机床遍历
      const status = await this.getLatheStatus(data['dev_id'])
      const hardware_id = await this.service.EmosService.getNcHardWareId(data['dev_id'])
      const hardware_name = await this.service.EmosService.getHardwareName(hardware_id)

      alarmArr.push(
        axios.post(this.eomsUrl, {
          version: '1.0',
          method: 'get_alarm_switch',
          id: '1',
          params: {
            dev_id: data.dev_id
          }
        })
      )

      // let status = -1;
      // let hardware_name = '123';
      const lathe = {
        // 设备的云端id
        devId: null,
        id: data['dev_id'],
        name: data['dev_name'],
        type: data['dev_type'],
        status: status,
        ncType: hardware_name,
        dev_extra_param: data['dev_extra_param']
      }
      // 缓存一下
      this.cacheKeys.lathes[lathe.id] = lathe
    }

    const alarmRes = await Promise.all(alarmArr)
    for (const item of alarmRes) {
      const data = item.data.result
      this.cacheKeys.lathes[data.dev_id].alarm_switch = data.alarm_switch
    }
  }

  /**
   * 设备注册
   */
  async login_dev() {
    const dev = this.cacheKeys.dev_ino
    await this.send(mqttRouter.device_create.topic, dev)
  }

  async routerInfo(topic, message) {
    try {
      let data = message.data
      if (typeof message.data === 'string') {
        data = JSON.parse(message.data)
      }

      this.logger.info(topic, data, typeof data, '收到的路由信息********')
      if (topic == this.clientId) {
        const info = data.topic
        if (info === 'device/create') {
          if (data.result.data.isAuth) {
            this.cacheKeys.cloud_token = `Bearer ${data.result.data.token}`
            this.cacheKeys.dev_cloud_id = data.result.data.id
            await this.authedAction()
          }
          this.cacheKeys.dev_cloud_id = data.result.data.id
        } else if (info == 'machine/create') {
          const key = data.result.data.native_id
          this.cacheKeys.lathes[key].cloud_id = data.result.data.id
        } else if (info == 'file/time') {
          await this.sysFile(data)
        }
      } else if (topic == `device/restart/${this.clientId}`) {
        this.sys_reboot()
      } else if (topic == `device/powershell/${this.clientId}`) {
        this.oncePty(data, this.cacheKeys.cloud_token)
      } else if (topic === `divice/log/${this.clientId}`) {
        // TODO
      } else if (topic == `iedp/restart/${this.clientId}`) {
        // TODO
      } else if (topic == `device/auth/${this.clientId}`) {
        const isAuth = data.isAuth
        this.logger.info(data.isAuth, 'device/auth/')
        if (isAuth) {
          await this.getDevInfo()
          await this.login_dev() // 注册设备
        } else {
          this.logger.info('设备取消授权')
          delete this.cacheKeys.cloud_token
        }
      } else if (topic == `device/alarm_switch/${this.clientId}`) {
        await this.device_alarm_switch(data)
      } else if (topic === `module/restart/${this.clientId}`) {
        this.moudle_restart(data)
      }
    } catch (error) {
      this.logger.error(error)
    }
  }

  async authedAction() {
    this.logger.info('开始注册机床和启动定时任务 同步日志')
    await this.push_all_lathe() // 注册所有机床
    this.intervalPushData() // 定时上报任务开启
    await this.alarmInfo() // 机床告警信息上报
    await this.initLogDB() // 初始化运行日志数据库，并上传当天日志
  }

  send(topic, jsonDict, userProperties) {
    try {
      // 发布消息到一个主题
      let body = null
      if (jsonDict instanceof Buffer) {
        body = jsonDict
      } else {
        body = JSON.stringify(jsonDict)
      }
      const properties = {
        responseTopic: this.clientId, // 设置 responseTopic
        userProperties: {
          env: this.serverCfg.SOURCE.monitor.env //用于和多个服务器中的一个做对应，正式环境要使用
        }
      }
      if (this.cacheKeys.cloud_token) {
        properties.userProperties.token = this.cacheKeys.cloud_token
      }
      if (userProperties) {
        // 遍历对象的属性
        for (const key in userProperties) {
          // 判断条件，这里假设要删除包含 'is' 字符串的属性
          const data = userProperties[key]
          if (data === undefined || data === null) {
            delete userProperties[key]
          }
        }
      }

      this.logger.info('mqtt 发送主题 : ', topic, properties.userProperties)
      this.client.publish(
        topic,
        body,
        { qos: 2, properties },
        err => {
          if (err) {
            this.logger.error('发送失败', topic, body, err)
          }
        }
        /**
         * 除了它本身的重试机制外还有
         * 1. 失败重试
         * 2. 回调确认，否则重试
         * 3. 消费方确认回调函数，否则重试
         */
      )
    } catch (error) {
      this.logger.error(error)
    }
  }

  async getLogDir() {
    const res = await axios.post(this.dcUrl, {
      version: '1.0',
      method: 'get_log_storage_dir_path',
      id: '1',
      params: {}
    })
    const list = res.data.result.dev_list
    const alarmArr = []
    this.cacheKeys.lathes = {}
    for (const data of list) {
      // 所有的机床遍历
      const status = await this.getLatheStatus(data['dev_id'])
      const hardware_id = await this.service.EmosService.getNcHardWareId(data['dev_id'])
      const hardware_name = await this.service.EmosService.getHardwareName(hardware_id)

      alarmArr.push(
        axios.post(this.eomsUrl, {
          version: '1.0',
          method: 'get_alarm_switch',
          id: '1',
          params: {
            dev_id: data.dev_id
          }
        })
      )

      // let status = -1;
      // let hardware_name = '123';
      const lathe = {
        // 设备的云端id
        devId: null,
        id: data['dev_id'],
        name: data['dev_name'],
        type: data['dev_type'],
        status: status,
        ncType: hardware_name,
        dev_extra_param: data['dev_extra_param']
      }
      // 缓存一下
      this.cacheKeys.lathes[lathe.id] = lathe
    }

    const alarmRes = await Promise.all(alarmArr)
    for (const item of alarmRes) {
      const data = item.data.result
      this.cacheKeys.lathes[data.dev_id].alarm_switch = data.alarm_switch
    }
  }
}

module.exports = new MqttTaskService()
