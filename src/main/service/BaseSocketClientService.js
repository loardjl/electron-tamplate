const net = require('net')
const BaseService = require('./BaseService')
const EventEmitter = require('events')

const TransCodeService = require('./TransCodeService')

class BaseSocketClientService extends BaseService {
  constructor(host, port, options) {
    super()
    this.host = host
    this.port = port
    this.monitorHeart = options.monitorHeart
    this.emitter = new EventEmitter()
    this.createCon(host, port, options)

    // 连接状态 0 连接中 1连接成功 2断线 3连接失败
    this.status = 0
  }

  createCon(host, port) {
    this.logger.info(`start create con to cc ${host}:${port}`)
    const client = new net.Socket()
    this.client = client
    let buffer = Buffer.alloc(0) // 缓冲区，用于处理粘包、半包
    client.connect(port, host)

    client.on('connect', () => {
      try {
        this.status = 1
        // 心跳检测
        this.heartbeatTimerFun()
        this.emitter.emit('conStatus', { status: this.status })
        this.logger.info(`cc cinnect, host:${host}, port:${port}`)
      } catch (e) {
        this.logger.error(e)
      }
    })

    // tcp 接收到数据
    client.on('data', async data => {
      buffer = Buffer.concat([buffer, data]) // 将接收到的数据存储到缓冲区中
      while (buffer.length >= TransCodeService.pHeaderLen) {
        try {
          //如果存在完整数据包就拿出来
          const packageBuffer = TransCodeService.getPackagebuff(buffer)
          if (packageBuffer) {
            // this.logger.info(
            //   'read buffer',
            //   Array.from(packageBuffer, byte => byte.toString(16).padStart(2, '0')).join(' ')
            // )
            // 数据包是合法没有错误的
            const info = await TransCodeService.decode(packageBuffer)

            if (info && info.infoType === 1) {
              this.emitter.emit('msgType', info)
              buffer = buffer.subarray(packageBuffer.length) // 更新缓冲区
            } else if (info && info.infoType === 2) {
              buffer = buffer.subarray(packageBuffer.length) // 更新缓冲区
            } else if (info && info.infoType === -1) {
              this.emitter.emit('msgType', info)
              buffer = buffer.subarray(packageBuffer.length) // 更新缓冲区
            } else {
              buffer = buffer.subarray(packageBuffer.length)
              // buffer = Buffer.alloc(0) // 更新缓冲区
              // break
            }
          } else {
            buffer =
              buffer.subarray(buffer.indexOf(0xeb90) - 1) !== -1
                ? buffer.subarray(buffer.indexOf(0xeb90) - 1)
                : Buffer.alloc(0)
            break
          }
        } catch (error) {
          console.log('123412341')
          buffer = Buffer.alloc(0)
          this.logger.error(error)
        }
      }
    })

    client.on('error', error => {
      try {
        this.logger.error(`cc con error  ${this.host} ${this.port} ${error}`)
      } catch (e) {
        this.logger.info(e)
      }
    })

    client.on('close', error => {
      try {
        if (!error) {
          this.logger.error(`be closed  ${this.host} ${this.port}`)
          this.status = 2
          this.emitter.emit('conStatus', { status: this.status })
        } else {
          // 停止心跳
          this.logger.error('cc con close error', error)
          this.status = 0
          this.emitter.emit('conStatus', { status: this.status })
        }
        this.stopHeartbeat()
        this.timer && clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.logger.warn(`重连中 ${this.host}`)
          this.client.connect(this.port, this.host)
          // this.createCon(this.host, this.port)
        }, 5000)
      } catch (err) {
        this.logger.info(err)
      }
    })
  }

  // 心跳
  heartbeatTimerFun() {
    this.heartbeatTimer = setInterval(() => {
      // this.logger.info(this.monitorHeart, 'heart')
      this.client.write(this.monitorHeart)
    }, 10000) // 每隔 10 秒发送一次心跳包
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatTimer)
  }

  closeCon() {
    // 停止心跳
    this.client.destroy()
    clearInterval(this.heartbeatTimer)
    this.timer && clearTimeout(this.timer)
  }

  isBlankBuffer(buffer) {}
}

module.exports = BaseSocketClientService
