// 监控分段
const BaseService = require('./BaseService')
const Axios = require('axios')

class MonitorSegmentService extends BaseService {
  constructor() {
    super()
    this.client = this.service.ConService.mServer.client
    this.axisEventSliceBuff = {}
    this.updateChnnelEventBuff = {}
  }

  // 加工事件保存配置
  updateConfig(req) {
    this.logger.info(req, '*******')
    const dataString = JSON.stringify(req)
    const dataBuff = Buffer.from(dataString)
    const size = 65529 // 数据最大分片大小
    const count = Math.ceil(dataBuff.length / size)
    for (let i = 0; i < count; i++) {
      const start = i * size
      let end = start + size
      if (i === count - 1) {
        // 最后一片
        end = dataBuff.length
      }
      const sliceCount = Buffer.alloc(2)
      sliceCount.writeInt16LE(count)
      const sliceId = Buffer.alloc(2)
      sliceId.writeInt16LE(i)
      const sliceSize = Buffer.alloc(2)
      sliceSize.writeInt16LE(end - start)
      const buff = dataBuff.subarray(start, end)
      const sliceBuff = Buffer.concat([sliceCount, sliceId, sliceSize, buff])
      const sendBuff = this.getTotalBuffer(sliceBuff, [0x00, 0x04, 0x00, 0x01])
      this.logger.info(sendBuff.length, sendBuff, '****')
      this.client.write(sendBuff)
    }
  }

  // 删除监控通道
  delChnnel(req) {
    this.logger.info(req)
    const dataString = JSON.stringify(req)
    const dataBuff = Buffer.from(dataString)
    return this.getTotalBuffer(dataBuff, [0x00, 0x04, 0x00, 0x03])
  }

  // 开关监控事件
  switchMonitor(req) {
    const dataString = JSON.stringify(req)
    const dataBuff = Buffer.from(dataString)
    return this.getTotalBuffer(dataBuff, [0x00, 0x04, 0x00, 0x04])
  }

  // 响应枚举轴下面的监控事件
  processEnum(dataBuff, msgType) {
    const data = this.parseSliceData(dataBuff)
    this.axisEventSliceBuff[data.sliceId] = data.val
    const arr = []
    if (Object.keys(this.axisEventSliceBuff).length === data.sliceCount) {
      // 收到所有分片
      this.logger.info('processEnum 收到所有分片')
      for (const k in this.axisEventSliceBuff) {
        arr[Number(k)] = this.axisEventSliceBuff[k]
      }
      const totalBuff = Buffer.concat(arr)
      this.axisEventSliceBuff = {}
      this.logger.info(JSON.parse(totalBuff.toString()))
      return JSON.parse(totalBuff.toString())
    }
  }

  async processEnumChenal(dataBuff, msgType) {
    const data = this.parseSliceData(dataBuff)
    this.axisEventSliceBuff[data.sliceId] = data.val
    const arr = []
    if (Object.keys(this.axisEventSliceBuff).length === data.sliceCount) {
      // 收到所有分片
      this.logger.info('processEnum 收到所有分片')
      for (const k in this.axisEventSliceBuff) {
        arr[Number(k)] = this.axisEventSliceBuff[k]
      }
      const totalBuff = Buffer.concat(arr)
      this.axisEventSliceBuff = {}
      const tcpData = JSON.parse(totalBuff.toString())
      // 请求数据中心进行数据格式化
      const adapterIdList = []
      for (const item of tcpData.channel_run_condition.conditions) {
        adapterIdList.push(item.adapter_id)
      }
      for (const item of tcpData.enum_process) {
        adapterIdList.push(item.properties.sync_source.adapter_id)
        for (const info of item.event_condition.condition_list) {
          adapterIdList.push(info.adapter_id)
        }
      }

      // for (let item of tcpData.mmid_form) {
      //   adapterIdList.push(item.adapter_id)
      // }

      // 根据采集器ID查询NC通道和轴信息
      const adapterArr = []
      const adapterAxisData = await Axios.post(this.dcUrl, {
        version: this.dcVer,
        method: 'get_channel_axis_by_adapter',
        id: '80',
        params: { dev_id: tcpData.dev_id, adapter_id_list: [...new Set(adapterIdList)] }
      })
      for (const item of adapterAxisData.data.result.channel_axis_adapter_list) {
        if (item.collector_type_id === 1) {
          // nc
          adapterArr.push(['nc', item.adapter_id])
        } else if (item.is_rel === 0) {
          // 其他
          adapterArr.push(['other', item.adapter_id])
        } else {
          // 轴号
          adapterArr.push([item.axis_num, item.adapter_id])
        }
      }
      // 拼接下拉项对应关系
      for (const item of tcpData.channel_run_condition.conditions) {
        for (const a of adapterArr) {
          if (a[1] === item.adapter_id) {
            item.conditionsele = [...a, item.sig_id]
            break
          }
        }
      }
      for (const item of tcpData.enum_process) {
        for (const a of adapterArr) {
          const sync_source = item.properties.sync_source
          if (a[1] === sync_source.adapter_id) {
            item.conditionsele = [...a, sync_source.sig_id]
          }
          for (const info of item.event_condition.condition_list) {
            if (a[1] === info.adapter_id) {
              info.conditionsele = [...a, info.sig_id]
            }
          }
        }
      }

      // for (let item of tcpData.mmid_form) {
      //   for (let a of adapterArr) {
      //     if (a[1] === item.adapter_id) {
      //       item.conditionsele = [...a, item.sig_id]
      //       break
      //     }
      //   }
      // }

      this.logger.info(JSON.stringify(tcpData), '---------&&&&&&')
      return tcpData
    }
  }

  // 编辑监控事件
  updateChnnelEvent(req) {
    const dataString = JSON.stringify(req)
    const dataBuff = Buffer.from(dataString)
    return this.getTotalBuffer(dataBuff, [0x00, 0x04, 0x00, 0x06])
  }

  getNameRule(req) {
    const dataString = JSON.stringify(req)
    const dataBuff = Buffer.from(dataString)
    return this.getTotalBuffer(dataBuff, [0x00, 0x04, 0x00, 0x0d])
  }

  // 获取事件详情
  async parseUpdateChnnelEvent(dataBuff, msgType) {
    const data = this.parseSliceData(dataBuff)
    this.updateChnnelEventBuff[data.sliceId] = data.val
    const arr = []
    if (Object.keys(this.updateChnnelEventBuff).length === data.sliceCount) {
      // 收到所有分片
      this.logger.info('processEnum 收到所有分片')
      for (const k in this.updateChnnelEventBuff) {
        arr[Number(k)] = this.updateChnnelEventBuff[k]
      }
      const totalBuff = Buffer.concat(arr)
      this.updateChnnelEventBuff = {}
      const tcpData = JSON.parse(totalBuff.toString())
      // 请求数据中心进行数据格式化
      const adapterIdList = []
      for (const item of tcpData.channel_run_list) {
        adapterIdList.push(item.adapter_id)
      }
      for (const item of tcpData.monitor_run_list) {
        adapterIdList.push(item.adapter_id)
      }

      adapterIdList.push(tcpData.sync_adp_id)
      // for (let item of tcpData.mmid_list) {
      //   adapterIdList.push(item.adapter_id)
      // }
      // 根据采集器ID查询NC通道和轴信息
      const adapterArr = []
      const adapterAxisData = await Axios.post(this.dcUrl, {
        version: this.dcVer,
        method: 'get_channel_axis_by_adapter',
        id: '80',
        params: { dev_id: tcpData.dev_id, adapter_id_list: [...new Set(adapterIdList)] }
      })
      for (const item of adapterAxisData.data.result.channel_axis_adapter_list) {
        if (item.collector_type_id === 1) {
          // nc
          adapterArr.push(['nc', item.adapter_id])
        } else if (item.is_rel === 0) {
          // 其他
          adapterArr.push(['other', item.adapter_id])
        } else {
          // 轴号
          adapterArr.push([item.axis_num, item.adapter_id])
        }
      }
      // 拼接下拉项对应关系
      for (const item of tcpData.channel_run_list) {
        for (const a of adapterArr) {
          if (a[1] === item.adapter_id) {
            item.conditionsele = [...a, item.sig_id]
            break
          }
        }
      }
      for (const item of tcpData.monitor_run_list) {
        for (const a of adapterArr) {
          if (a[1] === item.adapter_id) {
            item.conditionsele = [...a, item.sig_id]
            break
          }
        }
      }
      for (const a of adapterArr) {
        if (a[1] === tcpData.sync_adp_id) {
          tcpData.conditionsele = [...a, tcpData.sync_sig_id]
          break
        }
      }
      // for (let item of tcpData.mmid_list) {
      //   adapterMap[item.adapter_id][3] = item.sig_id
      //   item.conditionsele = adapterMap[item.adapter_id]
      // }

      this.logger.info(JSON.stringify(tcpData), '---------&&&&&&')
      return tcpData
    }
  }

  // 枚举轴下面的监控事件
  getProcessEnum(req) {
    const dataString = JSON.stringify(req)
    const dataBuff = Buffer.from(dataString)
    return this.getTotalBuffer(dataBuff, [0x00, 0x04, 0x00, 0x05])
  }

  msQueryEnableSignList(dataBuff, msgType) {
    const data = JSON.parse(dataBuff.toString())
    const result_list = []
    // 通道List
    const channel_list = data['channel_info_list']
    if (channel_list) {
      const channel = {
        value: 'nc',
        label: 'NC',
        children: []
      }
      for (const data of channel_list) {
        const data_p = {
          value: data['adapter_id'],
          label: '通道' + data['channel_num'],
          children: []
        }
        const signal_list = data['signal_list']
        if (signal_list) {
          for (const signal of signal_list) {
            data_p.children.push({
              value: signal['sig_id'],
              label: signal['sig_name']
            })
          }
        }
        channel.children.push(data_p)
      }
      if (channel.children.length > 0) {
        result_list.push(channel)
      }
    }

    //轴list
    const axis_default_info = data['axis_default_info']
    if (axis_default_info) {
      // let axis = {
      //   value: 'axis',
      //   label: 'axis',
      //   children: []
      // }
      for (const data of axis_default_info) {
        const data_p = {
          value: data['axis_num'],
          label: data['axis_name'],
          children: []
        }
        const axis_list = data['axis_default_signals']
        if (axis_list) {
          for (const axis of axis_list) {
            const data_p_p = {
              value: axis['adapter_id'],
              label: axis['adapter_name'],
              children: []
            }
            const signal_list = axis['signal_list']
            if (signal_list) {
              for (const sign of signal_list) {
                data_p_p.children.push({
                  value: sign['sig_id'],
                  label: sign['sig_name']
                })
              }
            }
            data_p.children.push(data_p_p)
          }
        }
        result_list.push(data_p)
        // axis.children.push(data_p)
      }
      //
    }

    // 其他
    const other_signal_info = data['other_signal_info']
    if (other_signal_info) {
      const other = {
        value: 'other',
        label: '其他',
        children: []
      }
      for (const data of other_signal_info) {
        const data_p = {
          value: data['adapter_id'],
          label: data['adapter_name'],
          children: []
        }
        const signal_list = data['signal_list']
        if (signal_list) {
          for (const signal of signal_list) {
            data_p.children.push({
              value: signal['sig_id'],
              label: signal['sig_name']
            })
          }
        }
        other.children.push(data_p)
      }
      if (other.children.length > 0) {
        result_list.push(other)
      }
    }

    return result_list
  }
}

module.exports = new MonitorSegmentService()
