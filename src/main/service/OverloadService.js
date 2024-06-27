const BaseService = require('./BaseService')

class OverloadService extends BaseService {
  constructor() {
    super()
    this.sigMap = {}
    this.subFlag = false // 是否订阅
  }

  clearSigQueue() {
    this.sigMap = {}
    this.logger.info('清空过载信号队列')
    return { code: 1, msg: '过载退订成功' }
  }

  // 数据退订
  subscribe(req) {
    const { isSub } = req
    this.subFlag = isSub
    if (isSub == false) {
      this.sigMap = {}
    }
  }

  signalFormate(dataBuff, msgType) {
    // if (!this.subFlag) {
    //   return
    // }
    const info = JSON.parse(dataBuff.toString())
    const { data, frequency } = info
    if (!frequency) {
      // 没有传递步长，不进行数据推送
      return
    }
    this.sigQueue(info)
    return info
  }

  // 缓存两分钟
  sigQueue(info) {
    const t1 = Date.now() - 120000

    // 数据降频
    const { data, signal_code, frequency, logical_channel_id, adapter_id } = info
    const id = `${logical_channel_id}.${signal_code}.${adapter_id}`
    const tmpsig = []
    if (frequency != 10) {
      const step = parseInt(frequency / 10)
      for (let i = 0; i < data.length; i += step) {
        const maxNum = Number.MIN_SAFE_INTEGER
        let obj
        for (let j = 0; j < step; j++) {
          if (i + j >= data.length) {
            break
          }
          if (data[i + j].cache_data > maxNum) {
            obj = data[i + j]
          }
        }
        tmpsig.push(obj)
      }
      info.data = tmpsig
    }

    if (!this.sigMap[id]) {
      this.sigMap[id] = { data: [] }
    } else if (this.sigMap[id].data.length > 0) {
      const len = this.sigMap[id].data.length
      const endT = this.sigMap[id].data[len - 1].cache_timestamp
      // 两包数据时差 超过1秒清空缓存队列
      if (info.data[0].cache_timestamp - endT > 1000) {
        this.logger.info(info.data[0].cache_timestamp, endT, 'sigQueue time error')
        this.sigMap[id] = { data: [] }
      }
    }
    this.sigMap[id] = {
      ...info,
      data: [...this.sigMap[id].data, ...tmpsig]
    }

    // 删除超时的数据包 2min队列
    const arr = this.sigMap[id]
    for (const item of arr.data) {
      if (item.cache_timestamp < t1) {
        this.sigMap[id].data.shift()
      } else {
        break
      }
    }
  }

  // 获取两分钟的数据
  getQueueData(req) {
    const { logical_channel_id, signal_code, adapter_id } = req
    const id = `${logical_channel_id}.${signal_code}.${adapter_id}`
    const result = this.sigMap[id] || {}
    // 删除超时的数据包 2min队列
    let t = Date.now()
    if (result.data) {
      const end = result.data[result.data.length - 1].cache_timestamp
      if (end > t) {
        t = end
      }
    }
    const t1 = t - 120000

    if (result.data) {
      result.data = result.data.filter(item => item.cache_timestamp > t1)
    }

    return result
  }

  // 删除overload信号
  deleteOverloadSigData(req) {
    const { deleteData } = req
    deleteData?.forEach(item => {
      const id = `${item.logical_channel_id}.${item.signal_code}.${item.adapter_id}`
      delete this.sigMap[id]
    })
  }
}

module.exports = new OverloadService()
