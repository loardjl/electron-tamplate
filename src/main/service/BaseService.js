const Parser = require('binary-parser').Parser
class BaseService {
  constructor() {
    this.result = require('../model/pojo/Result')
    this.serverCfg = require('../config/index').serverCfg
    this.STRUCT_TYPE = require('../manager/struct')
    this.logger = require('../manager/log')
    this.ENCODE_TYPE = 'utf-8'
    this.model = require('../model')
    this.logger = require('../manager/log')
    // 协议头版本号三个字节
    this.header = [0xeb, 0x90, 0x01]
    this.util = require('../manager/util')
    this.service = require('./')
    this.alternate = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
    this.dcVer = '1.0' // dc version
    this.dcUrl = this.serverCfg.DC_HTTP + this.serverCfg['SOURCE']['dc']['http']['url']
    this.preUrl = this.serverCfg.DC_HTTP + this.serverCfg['SOURCE']['dc']['http']['pre_url']
    this.eomsUrl = `http://${this.serverCfg.SOURCE.eoms.http.host}:${this.serverCfg.SOURCE.eoms.http.port}/eoms`

    this.sliceInfo = {}

    const request = require('../manager/request')
    this.dcHttp = new request({}, this.dcUrl, {
      version: '1.0'
    })
    this.preHttp = new request({}, this.preUrl, {
      version: '1.0'
    })
    this.dcDecisionHttp = new request(
      {},
      this.serverCfg.DC_HTTP + this.serverCfg['SOURCE']['dc']['http']['decision_url'],
      {
        version: '1.0'
      }
    )
  }

  // 获取完整buffer
  getTotalBuffer(buffer, order) {
    const headerBuffer = Buffer.from([...this.header, ...order, ...this.alternate])
    const lenB = Buffer.alloc(2)
    lenB.writeInt16BE(buffer.length)
    const result = Buffer.concat([headerBuffer, lenB, buffer])
    this.logger.info(
      'send buffer: ',
      Array.from(result, byte => byte.toString(16).padStart(2, '0')).join(' ')
    )
    return result
  }

  //解析结构体
  getParse(msgType, dataBuff) {
    // struct结构体解析
    const result = this.STRUCT_TYPE.collectStruct[msgType](dataBuff.length).parse(dataBuff)
    return result
  }

  // 解析空数据
  parseEmptyData(dataBuff) {
    const p = new Parser().int32le('error_code')
    return p.parse(dataBuff)
  }

  /**
   * 通用获取发送数据data
   * @param data
   * @param order
   * @returns {Buffer}
   */
  getTotalData(data, order) {
    const dataString = JSON.stringify(data)
    const dataBuff = Buffer.from(dataString)
    return this.getTotalBuffer(dataBuff, ...order)
  }

  // 解析分片数据 对于数据过长的，分次返回，先给定数据体，最后一次
  async parseSlice(dataBuff, msgType, isParseType, fun) {
    const data = this.parseSliceData(dataBuff)
    if (!this.sliceInfo[msgType]) {
      this.sliceInfo[msgType] = {}
    }
    this.sliceInfo[msgType][data.sliceId] = data.val
    let arr = []
    if (Object.keys(this.sliceInfo[msgType]).length === data.sliceCount) {
      // 收到所有分片
      this.logger.info('processEnum 收到所有分片')

      for (const k in this.sliceInfo[msgType]) {
        arr[Number(k)] = this.sliceInfo[msgType][k]
      }
      //过滤空元素
      arr = arr.filter(v => v !== undefined && v !== null)
      const totalBuff = Buffer.concat(arr)
      this.sliceInfo[msgType] = {}
      if (isParseType) {
        // 分片完还要解析结构体
        const data = this.getParse(msgType, totalBuff)
        // data =  this.getParse(msgType,data['val']);
        this.logger.info(data, '--------totalBuff.toString')
        return data
      } else if (fun) {
        const result = await this.service[fun[0]][fun[1]](totalBuff, msgType)
        this.logger.info(data, '--------totalBuff.toString')
        return result
      } else {
        this.logger.info(totalBuff.toString(), '--------totalBuff.toString')
        return JSON.parse(totalBuff.toString())
      }
    }
  }

  // 解析分片buffer
  parseSliceData(dataBuff) {
    const p = new Parser()
      .uint16le('sliceCount')
      .uint16le('sliceId')
      .uint16le('sliceSize')
      .buffer('val', { length: 'sliceSize' })
    const result = p.parse(dataBuff)
    return result
  }

  // 分片发送数据
  sendSliceBuffer(req, order, client) {
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
      const sendBuff = this.getTotalBuffer(sliceBuff, order)
      client.write(sendBuff)
    }
  }
}

module.exports = BaseService
