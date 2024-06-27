const axios = require('axios')
const os = require('os')
const osu = require('node-os-utils')
const si = require('systeminformation')
const pidusage = require('pidusage')
const BaseService = require('./BaseService')
const tasklist = require('tasklist')

class EmosService extends BaseService {
  async getModuleList() {
    const [moduleRes, verRes] = await Promise.all([
      axios.post(this.eomsUrl, {
        version: '1.0',
        method: 'get_serv_module_status',
        id: '1',
        params: {}
      }),
      axios.post(this.eomsUrl, {
        version: '1.0',
        method: 'get_serv_module_version',
        id: '1',
        params: {}
      })
    ])
    const verList = verRes.data.result.module_list
    const verMap = {}
    for (const item of verList) {
      verMap[item.app_name] = item
    }
    const moduleList = moduleRes.data.result.module_status_list
    const moduleMap = {}
    let serviceStatus = 1 //  -1 错误 ，1 正常，只有所有服务都正常才是正常
    for (const item of moduleList) {
      if (item.run_status === 1 && serviceStatus == 1) {
        serviceStatus = -1
      }
      moduleMap[item.app_name] = {
        id: item.app_name,
        name: verMap[item.app_name] ? verMap[item.app_name].name : item.app_name,
        process_name: item.app_name, // 进程名
        version: verMap[item.app_name] ? verMap[item.app_name].version : '',
        status: item.run_status == 1 ? -1 : 1 //1 运行 -1停止
      }
    }
    // 获取cpu ram信息
    await this.getModuleCpuArm(moduleMap)
    return { list: Object.values(moduleMap), serviceStatus }
  }

  /**
   *  获取系统的虚拟vpn Ip
   *  如果有多个就只拿一个
   * @returns {*[]}
   */
  getVirtualIPAndMac() {
    const ifaces = os.networkInterfaces()
    const virtualInterfaces = []
    const wifi = []
    const navite = []
    for (const key of Object.keys(ifaces)) {
      const netlist = ifaces[key]
      for (const data of netlist) {
        if (data['family'] === 'IPv4' && data['internal'] === false) {
          // vpn
          if (key.indexOf('VPN') !== -1 || key.indexOf('vpn') !== -1) {
            virtualInterfaces.push(data)
          } else if (key.indexOf('WLAN') !== -1 || key.indexOf('lan') !== -1) {
            // 是wifi
            wifi.push(data)
          } else if (key.indexOf('以太') !== -1) {
            // 本地以太网
            navite.push(data)
          }
        }
      }
    }
    const result = {
      vpn: virtualInterfaces,
      wifi: wifi,
      native: navite
    }
    return result
  }

  // 获取系统内存，磁盘相关信息
  async getSysUsage() {
    const cpu = osu.cpu
    const memData = await si.mem()
    const disks = await si.fsSize()
    const result = {
      mem_usage: (memData.used / memData.total) * 100,
      cpu: await cpu.usage()
    }
    for (const disk of disks) {
      const mount = disk.mount
      const use = disk.use
      if (mount.indexOf('C') !== -1) {
        result['C'] = use
      } else if (mount.indexOf('D') !== -1) {
        result['D'] = use
      }
    }
    return result
  }

  // 获取机床状态
  async getMStatusAndAlarm() {
    this.logger.error('获取机床状态')
    const mRes = await axios.post(this.dcUrl, {
      version: '1.0',
      method: 'enum_dev_list',
      id: '9',
      params: {}
    })
    const arr = []
    const alarmArr = []
    for (const item of mRes.data.result.dev_list) {
      arr.push(
        axios.post(this.eomsUrl, {
          version: '1.0',
          method: 'get_dev_monitor_status',
          id: '1',
          params: {
            dev_id: item.dev_id //机床ID
          }
        })
      )
      alarmArr.push(
        axios.post(this.eomsUrl, {
          version: '1.0',
          method: 'get_alarm_switch',
          id: '1',
          params: {
            dev_id: item.dev_id
          }
        })
      )
    }

    const info = await Promise.all(arr)
    const alarmRes = await Promise.all(alarmArr)
    let status // 1 报警中 2离线 3 监控中 4 非监控中
    for (const item of info) {
      const data = item.data.result
      this.logger.error(JSON.stringify(data), '获取设备监控状态')
      if (!status) {
        status = data.status
      } else {
        if (data.status === 1) {
          status = 1
          break
        } else if (data.status === 3) {
          status = 3
          continue
        }
      }
    }

    let isOpenAlarm = 0 // 0关闭 1:部分关闭 2全开
    let openCount = 0
    const alarmap = {}
    for (const item of alarmRes) {
      const data = item.data.result
      this.logger.error(JSON.stringify(data), '获取报警总开关状态')
      if (data.alarm_switch === 1) {
        openCount += 1
      }
      alarmap[item.dev_id] = data.alarm_switch
    }
    if (openCount === alarmRes.length) {
      isOpenAlarm = 2
    } else if (openCount === 0) {
      isOpenAlarm = 0
    } else {
      isOpenAlarm = 1
    }
    return { status, isOpenAlarm, alarmap }
  }

  async getModuleCpuArm(moduleMap) {
    // let list = await psList();
    const list = await tasklist()
    const pidMap = {}
    for (const item of list) {
      if (moduleMap[item.imageName]) {
        pidMap[item.pid] = item.imageName
      }
    }
    const pids = Object.keys(pidMap)
    if (pids.length == 0) {
      return
    }
    const pidObj = await pidusage(Object.keys(pidMap))
    for (const pid in pidObj) {
      const name = pidMap[pid]
      moduleMap[name].cpu = pidObj[pid].cpu
      moduleMap[name].ram = pidObj[pid].memory / 1024 / 1024
    }
  }

  // 获取机床的，nc采集器的类型id
  async getNcHardWareId(dev_id) {
    let hardware_id = null
    const adp_list = await axios.post(this.dcUrl, {
      version: '1.0',
      method: 'enum_adapters',
      id: '8',
      params: {
        // 机床ID
        dev_id: dev_id
      }
    })
    for (const data of adp_list.data.result.adapter_list) {
      if (data['collector_type_id'] === 1) {
        hardware_id = data['hardware_id']
        break
      }
    }
    return hardware_id
  }

  // 获取nc型号
  async getHardwareName(hardware_id) {
    if (!hardware_id) {
      return null
    }
    const res = await axios.post(this.dcUrl, {
      version: '1.0',
      method: 'get_hardware_info',
      id: '51',
      params: {
        hardware_id: hardware_id
      }
    })
    return res.data.result.hardware_info.display_name
  }
}

module.exports = new EmosService()
