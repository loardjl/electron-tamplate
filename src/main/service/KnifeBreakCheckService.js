const BaseService = require('./BaseService')

class KnifeBreakCheckService extends BaseService {
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

  // knifeBreakCheckAdd(data) {
  //   let dataString = JSON.stringify(data)
  //   let dataBuff = Buffer.from(dataString)
  //   return this.getTotalBuffer(dataBuff, [0x00, 0x05, 0x00, 0x07])
  // }
}

module.exports = new KnifeBreakCheckService()
