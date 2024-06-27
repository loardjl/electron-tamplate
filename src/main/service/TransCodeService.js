const BaseService = require('./BaseService')
const msgRouter = require('../config/msgRouter')
const reqStruct = require('@main/manager/struct/reqStruct')

class TransCodeService extends BaseService {
  constructor() {
    super()
    this.pHeaderLen = 15 // header总长
    this.pFormat = {
      // 协议传输格式定义
      pHeader: 2,
      pVer: 1,
      order: 2,
      order2: 2,
      extra: 4,
      state: 1,
      xor: 1,
      data: 2
    }
  }

  /**
   * 解包
   * @param {Buffer} buffer 完整数据包buffer
   *
   * @returns infoType: 1成功有内容 2成功无内容 2错误响应
   */
  async decode(buffer) {
    let result = {}

    // 根据一级指令和二级指令 判断message type，获取处理函数
    const routerObject = this.getRoute(buffer)
    if (routerObject) {
      const { msgType, fun, parseType, isResSlice, postFun } = routerObject
      // 判断是否报错
      if (buffer[7] === 1) {
        // state 字段响应不为0而是1就报错
        return { result, infoType: -1, msgType }
      }
      const dataBuff = buffer.subarray(this.pHeaderLen, buffer.length)
      const rescode = buffer.subarray(7, 8)

      if (rescode.equals(Buffer.from([0x00]))) {
        if (parseType !== 1 && dataBuff.toString() * 1 === 0 && !fun) {
          // 数据体为空 空包
          return { result, infoType: 1, msgType }
        }
        const bodyLen = dataBuff.length
        if (parseType === 1 && bodyLen === 4) {
          // 结构体解析，数据体长度为4，数据体为空
          result = this.parseEmptyData(dataBuff)
          return { result, infoType: 1, msgType }
        }
        // 校验位没有被修改，数据体直接返回。
        if (isResSlice) {
          //分片json字符串解析
          // 使用分片解析
          result = await this.parseSlice(dataBuff, msgType, parseType === 1, fun)
          if (!result) {
            return { result, infoType: 2 }
          }
        } else {
          if (fun) {
            result = await this.service[fun[0]][fun[1]](dataBuff, msgType)
            if (!result) {
              return { result, infoType: 2 }
            }
          } else if (parseType === 1) {
            // 结构体解析
            if (this.STRUCT_TYPE.collectStruct[msgType]) {
              result = this.getParse(msgType, dataBuff)
              if (postFun) {
                result = await this.service[postFun[0]][postFun[1]](result)
              }
            } else {
              return { result, msgType }
            }
          } else {
            // 普通json字符串解析
            this.logger.info(msgType, 'json解析:', dataBuff.toString())
            result = JSON.parse(dataBuff.toString())
          }
        }
        return { result, msgType, infoType: 1 }
      }
      return { result, msgType }
    } else {
      // 无匹配路由，脏数据丢弃
      return { result }
    }
  }

  // 数据切割，获取完成数据包 buffer
  getPackagebuff(buffer) {
    if (!buffer || buffer.length < this.pHeaderLen) {
      return
    }
    // 获取数据长度 从0字节开始，获取两位字节长度
    const datalen = +buffer.subarray(13, 15).readUint16BE(0).toString(10)
    //  获取完整数据包长度
    const packageLen = this.pHeaderLen + datalen
    // 判断缓冲区是否有完整数据包
    if (packageLen > buffer.length) {
      return
    }
    const packageBuffer = buffer.subarray(0, packageLen)
    return packageBuffer
  }

  // 返回路由对象整体
  getRoute(buffer) {
    let result
    for (const k in msgRouter) {
      const resO1Buff = Buffer.from(msgRouter[k].resO1)
      const o1Buff = Buffer.from(msgRouter[k].o1)
      if (o1Buff.equals(buffer.subarray(3, 5)) || resO1Buff.equals(buffer.subarray(3, 5))) {
        const totalOrder = [...msgRouter[k].pushOrder, ...msgRouter[k].reqOrder]
        for (const item of totalOrder) {
          const o2Buff = Buffer.from(item.value)
          if (o2Buff.equals(buffer.subarray(5, 7))) {
            result = { ...item }
            result.msgType = item.type
            if (item.fun) {
              result.fun = item.fun.split('.')
            }
            if (item.postFun) {
              result.postFun = item.postFun.split('.')
            }
            break
          }
        }
        break
      }
    }
    return result
  }

  sendBuffer(data, o1, routerCfg) {
    this.logger.info(data, routerCfg, '发送数据')
    const { isReqSlice } = routerCfg
    try {
      const client = this.service.ConService.mServer.client
      if (isReqSlice) {
        // 使用使用分片
        this.sendSliceBuffer(data, [...o1, ...routerCfg.value], client)
      } else {
        const dataString = JSON.stringify(data)
        const dataBuff = Buffer.from(dataString)
        const buff = this.getTotalBuffer(dataBuff, [...o1, ...routerCfg.value])
        client.write(buff)
      }
    } catch (e) {
      this.logger.error(e.message)
    }
  }

  sendVcsBuffer(data, o1, routerCfg) {
    this.logger.info(data, routerCfg, '发送数据')
    try {
      const client = this.service.ConService.vcsServer.client
      const { type, value, reqFun } = routerCfg
      const fnBody = reqStruct[type]
      let dataBuff = Buffer.alloc(0)
      let req = null
      let fields = {}
      if (fnBody) {
        if (reqFun) {
          const fun = reqFun.split('.')
          dataBuff = this.service[fun[0]][fun[1]](fnBody, data, type)
        } else {
          req = fnBody()
          dataBuff = req.allocate().buffer()
          fields = req.fields
          for (const key in data) {
            fields[key] = data[key]
          }
        }
      }
      const buff = this.getTotalBuffer(dataBuff, [...o1, ...value])
      client.write(buff)
    } catch (e) {
      this.logger.error(e.message, '发送卡屑数据错误')
    }
  }
}

module.exports = new TransCodeService()
