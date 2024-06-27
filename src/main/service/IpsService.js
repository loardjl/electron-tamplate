const BaseService = require('./BaseService')

class IpsService extends BaseService {
  constructor() {
    super()
    this.sigMap = {}
  }

  clearSigQueue() {
    this.sigMap = {}
    this.logger.info('清空IPS信号队列')
    return { code: 1, msg: 'IPS退订成功' }
  }

  signalFormate(dataBuff, msgType) {
    const data = JSON.parse(dataBuff.toString())
    const { signal_data, frequency } = data
    if (!frequency) {
      // 没有传递步长，不进行数据推送
      return
    }
    this.sigQueue(data)
    const tmpsig = data.signal_data
    const rpm_id = signal_data[0].rpm_id
    const obj = {
      rpm_id,
      cache_timestamp: [],
      cache_data: [],
      learning_data: [],
      feed_override: [],
      ...data
    }
    for (const item of tmpsig) {
      obj.cache_timestamp.push(item.cache_timestamp)
      obj.cache_data.push([item.cache_timestamp, item.cache_data])
      obj.learning_data.push([
        item.cache_timestamp,
        item.learning_data == -100000 ? null : item.learning_data
      ])
      obj.feed_override.push([item.cache_timestamp, item.feed_override])
    }
    return obj
  }

  // 缓存两分钟
  sigQueue(data) {
    const t1 = Date.now() - 120000

    // 数据降频
    const { adapter_id, signal_code, signal_data, frequency } = data
    const id = `${adapter_id}.${signal_code}`
    if (frequency != 10) {
      const step = parseInt(frequency / 10)
      const tmpsig = []
      for (let i = 0; i < signal_data.length; i += step) {
        const maxNum = Number.MIN_SAFE_INTEGER
        let obj
        for (let j = 0; j < step; j++) {
          if (i + j >= signal_data.length) {
            break
          }
          if (signal_data[i + j].cache_data > maxNum) {
            obj = signal_data[i + j]
          }
        }
        tmpsig.push(obj)
      }
      data.signal_data = tmpsig
    }

    if (!this.sigMap[id]) {
      this.sigMap[id] = []
    } else if (this.sigMap[id].length > 0) {
      const len = this.sigMap[id].length
      const signal_data = this.sigMap[id][len - 1].signal_data
      const endT = signal_data[signal_data.length - 1].cache_timestamp
      if (data.signal_data[0].cache_timestamp - endT > 1000) {
        this.logger.info(`${data.signal_data[0].cache_timestamp - endT} ips 超1s`)
        this.sigMap[id] = []
      }
    }
    this.sigMap[id].push(data)

    // 删除超时的数据包 2min队列
    const arr = this.sigMap[id]
    for (const item of arr) {
      const len = item.signal_data.length
      if (item.signal_data[len - 1].cache_timestamp < t1) {
        this.sigMap[id].shift()
      } else {
        break
      }
    }
  }

  getSigKeys() {
    const arr = Object.keys(this.sigMap)
    const result = []
    for (const item of arr) {
      const info = item.split('.')
      result.push({
        adapter_id: Number(info[0]),
        signal_code: Number(info[1])
      })
    }
    return result
  }

  // 获取两分钟的数据
  getQueueData(req) {
    const { adapter_id, signal_code } = req
    const t1 = Date.now() - 120000
    const id = `${adapter_id}.${signal_code}`
    const data = this.sigMap[id] || []

    const result = []
    for (const info of data) {
      const signal_data = info.signal_data
      const rpm_id = signal_data[0].rpm_id
      const obj = {
        rpm_id,
        cache_timestamp: [],
        cache_data: [],
        learning_data: [],
        feed_override: [],
        ...info
      }
      for (const item of signal_data) {
        if (item.cache_timestamp < t1) {
          continue
        }
        obj.cache_timestamp.push(item.cache_timestamp)
        obj.cache_data.push([item.cache_timestamp, item.cache_data])
        obj.learning_data.push([
          item.cache_timestamp,
          item.learning_data == -100000 ? null : item.learning_data
        ])
        obj.feed_override.push([item.cache_timestamp, item.feed_override])
      }
      if (obj.cache_timestamp.length > 0) {
        result.push(obj)
      }
    }
    return result
  }

  // 删除ips信号
  deleteIpsSigData(req) {
    const { deleteData } = req
    deleteData?.forEach(item => {
      const id = `${item.adapter_id}.${item.signal_code}`
      delete this.sigMap[id]
    })
  }
}

module.exports = new IpsService()
