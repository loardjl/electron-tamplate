const BaseService = require('./BaseService')
//自动边界的service

class MarginService extends BaseService {
  constructor() {
    super()
    this.struct = this.STRUCT_TYPE.collectStruct
    this.realtimeData = {}
    this.wbSocket
    this.timestamp = new Date().getTime()
    this.ver = '1.0' // dc version
    // do采集器获 定时器 map集合
    this.doIntervalMap = new Map()
    this.doDataMap = new Map()
  }

  marginGetNowModelTnData(dataBuff, msgType) {
    const data = JSON.parse(dataBuff.toString())
    const signal_data = data.signal_data
    if (!signal_data) {
      return data
    }
    const cache_data = signal_data.cache_data
    if (!cache_data || cache_data.length === 0) {
      return data
    }
    const startTime = cache_data[0]['timestamp']
    const endTime = cache_data[cache_data.length - 1]['timestamp']

    // 拿到时间平均值数据
    const average = (endTime - startTime) / cache_data.length

    const model_data = data['model_data']
    const keys = Object.keys(model_data)

    for (let index = 0; index < cache_data.length; index++) {
      //index即是索引 也是倍数(需要+1)
      const rightTime = startTime + index * average
      for (const key of keys) {
        const indexList = model_data[key]
        if (indexList.length - 1 <= index) {
          // 在大小范围内
          const indexData = indexList[index]
          indexList[index] = {
            value: indexData,
            time: rightTime
          }
        }
      }
    }

    // 长的数据继续补全
    for (const key of keys) {
      const indexList = model_data[key]
      let count = 0
      if (indexList.length > cache_data.length) {
        for (let index = cache_data.length; index < indexList.length; index++) {
          const rightTime = startTime + count * average
          const indexData = indexList[index]
          indexList[index] = {
            value: indexData,
            time: rightTime
          }
          count++
        }
      }
    }

    return data
  }

  marginSaveNowModelTnData(dataBuff, msgType) {
    // 数据类型一样
    return this.marginGetNowModelTnData(dataBuff, msgType)
  }

  marginHisotryMonitorStatus(dataBuff, msgType) {
    const data = JSON.parse(dataBuff.toString())
    return this.handleData(data)
  }

  handleData(data) {
    const ori_data = data.ori_data
    if (!ori_data) {
      return data
    }

    if (!ori_data || ori_data.length === 0) {
      return data
    }
    const startTime = ori_data[0]['time_stap']
    const endTime = ori_data[ori_data.length - 1]['time_stap']

    // 拿到时间平均值数据
    const average = (endTime - startTime) / ori_data.length

    const model_data = data['model_data']

    for (let index = 0; index < ori_data.length; index++) {
      //index即是索引 也是倍数(需要+1)
      const rightTime = startTime + index * average
      if (model_data.length - 1 < index) {
        // 在大小范围内
        const indexData = model_data[index]
        model_data[index] = {
          value: indexData,
          time: rightTime
        }
      }
    }

    // 长的数据继续补全
    if (model_data.length > ori_data.length) {
      let count = 1
      for (let index = ori_data.length; index < model_data.length; index++) {
        const indexData = model_data[index]
        const rightTime = endTime + count * average
        model_data[index] = {
          value: indexData,
          time: rightTime
        }
        count++
      }
    }

    return data
  }

  marginBoardProcedureNowData(dataBuff, msgType) {
    const data = JSON.parse(dataBuff.toString())
    const list = data.list
    if (!list || list.length === 0) {
      return data
    }

    for (let index = 0; index < list.length; index++) {
      this.handleData(list[index])
    }
    return data
  }

  marginBoardOfflineMonitorProcedureChange(dataBuff, msgType) {
    return this.marginBoardProcedureNowData(dataBuff, msgType)
  }
}

module.exports = new MarginService()
