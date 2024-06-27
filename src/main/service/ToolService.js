// 监控分段
const BaseService = require('./BaseService')
const Axios = require('axios')

class ToolService extends BaseService {
  constructor() {
    super()
    this.client = this.service.ConService.mServer.client
    this.axisEventSliceBuff = {}
    this.updateChnnelEventBuff = {}
  }

  async parseRemodelList(dataBuff, msgType) {
    const tcpData = JSON.parse(dataBuff.toString())
    console.log(tcpData, '----------')
    // 请求数据中心进行数据格式化
    const adapterIdList = []
    for (const item of tcpData.list) {
      if (item.adapter_id) {
        adapterIdList.push(item.adapter_id)
      }
    }

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
    for (const item of tcpData.list) {
      for (const a of adapterArr) {
        if (a[1] === item.adapter_id) {
          item.conditionsele = [...a, item.signal_id]
          break
        }
      }
    }
    return tcpData
  }
}

module.exports = new ToolService()
