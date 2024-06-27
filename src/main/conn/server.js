// ws服务器

const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
import logger from '../manager/log'

const app = express()
const eapp = app
const socketApp = express()
const server = http.createServer(socketApp)
const httpServer = http.createServer(app)
const bodyParser = require('body-parser')
const io = socketIO(server)
import { ConService, TransCodeService } from '../service'
import msgRouter from '../config/msgRouter'
import {
  DataCenterController,
  KnifeBreakCheckrController,
  MonitorSegmentController,
  IEDPController
} from '../controller'

app.use(bodyParser.json())

// 允许跨域
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  // res.header("Access-Control-Allow-Origin", '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type,Content-Length, Authorization, Accept,X-Requested-With'
  )
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('X-Powered-By', ' 3.2.1')
  if (req.method === 'OPTIONS') res.send(200) /*让options请求快速返回*/
  else next()
})

// 信号级联下拉项
app.post('/control/adapterSigSelectList', (req, res) =>
  DataCenterController.adapterSigSelectList(req, res)
)

// 获取通道下信号
app.post('/control/ChnnelSigSelectList', (req, res) =>
  DataCenterController.ChnnelSigSelectList(req, res)
)

// 机床获取传感器
app.post('/control/lathe/adapters', (req, res) => {
  DataCenterController.adapters(req, res)
})

// 获取ips两分钟累计数据
app.post('/sigdata/queue', (req, res) => {
  DataCenterController.getQueueData(req, res)
})

// 获取过载两分钟累计数据
app.post('/overload/queue', (req, res) => {
  DataCenterController.getOverLoadQueueData(req, res)
})

// 删除信号
app.post('/sigdata/delete', (req, res) => {
  DataCenterController.deleteSigData(req, res)
})

// 订阅/退订过载实时数据
app.post('/overload/sub', (req, res) => {
  DataCenterController.subOverloadData(req, res)
})

// 获取两分钟累计数据
app.post('/ips/sigkeys', (req, res) => {
  DataCenterController.getSigKeys(req, res)
})

// 获取ip配置信息
app.get('/control/config/get', (req, res) => {
  DataCenterController.configGet(req, res)
})

// 获取通道信息
app.post('/control/aux/status', (req, res) => {
  DataCenterController.getAuxStatus(req, res)
})
// 获取机床信息
app.post('/control/aux/devstatus', (req, res) => {
  DataCenterController.getDevStatus(req, res)
})

// 分业务类型，根据id获取名称
app.post('/map/trans/get', (req, res) => {
  DataCenterController.mapTransGet(req, res)
})

// 发送报警结果
app.post('/iedp/alarm/info', (req, res) => {
  IEDPController.sendAlarmInfo(req, res)
})

// 更新报警状态
app.post('/iedp/alarm/status', (req, res) => {
  IEDPController.updateAlarmStatus(req, res)
})

// 接收崩溃日志
app.post('/iedp/runlog', (req, res) => {
  IEDPController.uploadRunLog(req, res)
})

io.use((socket, next) => {
  logger.info(socket.data)
  next()
})

// 监听客户端连接事件
io.on('connection', ws => {
  logger.info('新客户端已连接')
  ConService.dcServer.emitter.on('conStatus', data => {
    // 数据中心连接状态推送
    ws.emit('dcStatus', data)
  })

  ConService.mServer.emitter.on('conStatus', data => {
    // 数据中心连接状态推送
    ws.emit('mStatus', data)
  })

  ConService.vcsServer.emitter.on('conStatus', data => {
    // 卡屑连接状态推送
    ws.emit('vcsStatus', data)
  })

  /**
   * tcp通信接受下发服务器接受到的数据
   */
  ConService.dcServer.emitter.on('msgType', data => {
    const { msgType, result, infoType } = data
    if (infoType === 1) {
      ws.emit(`${msgType}`, result)
    }
  })

  ConService.mServer.emitter.on('msgType', data => {
    const { msgType, result, infoType } = data
    if (infoType === 1) {
      // infoType 是1是成功的返回
      ws.emit(`${msgType}`, result)
    } else if (infoType === -1) {
      logger.error('state 字段响应不为0而是1就报错', msgType)
      result['error_message'] = 'c++后端接口报错'
      ws.emit(`${msgType}`, result)
    } else {
      result['error_message'] = 'tcp请求错误'
      ws.emit(`${msgType}`, result)
    }
  })
  ConService.vcsServer.emitter.on('msgType', data => {
    const { msgType, result, infoType } = data
    if (infoType === 1) {
      // infoType 是1是成功的返回
      logger.info('卡屑返回数据', msgType, JSON.stringify(result))
      ws.emit(`${msgType}`, result)
    } else if (infoType === -1) {
      logger.error('卡屑state字段响应不为0而是1就报错', msgType)
      result['error_message'] = '卡屑后端接口报错'
      ws.emit(`${msgType}`, result)
    } else {
      result['error_message'] = 'tcp请求错误'
      ws.emit(`${msgType}`, result)
    }
  })

  ws.on('getToken', data => DataCenterController.getToken(data, ws))
  ws.on('getDcStatus', data => DataCenterController.getDcStatus(data, ws))
  ws.on('getMStatus', data => DataCenterController.getMStatus(data, ws))
  // 订阅折线图推送
  ws.on('startPushChartData', data => DataCenterController.startPushChartData(data, ws))
  // 退订折线图推送
  ws.on('stopPushChartData', data => DataCenterController.stopPushChartData(data, ws))

  // do 采集器数据订阅
  ws.on('subscribeDoData', data => {
    MonitorSegmentController.subscribeDoData(data, ws)
  })
  ws.on('cancelDoData', data => {
    MonitorSegmentController.cancelDoData(data, ws)
  })

  // 是否启动假数据功能
  const open_fake_data = false
  // socket路由转发
  // 自动断刀、监控分段
  for (const k in msgRouter) {
    if (k === 'DC') {
      continue
    }
    // 请求响应router路由
    const reqOrder = msgRouter[k].reqOrder
    // 获取buffer
    for (const item of reqOrder) {
      const msgType = item.reqType || item.type
      if (!item.parseType || item.parseType === 2) {
        // json形式传输
        if (!!item.fakeDataFun && open_fake_data) {
          //含有启动假数据 返回结果和请求路由必须一样
          ws.on(msgType, data => ws.emit(msgType, item.fakeDataFun()))
        } else {
          // 正常数据处理
          ws.on(msgType, data => TransCodeService.sendBuffer(data, msgRouter[k].o1, item))
        }
      } else {
        // struct 形式传输
        ws.on(msgType, data => TransCodeService.sendVcsBuffer(data, msgRouter[k].o1, item))
      }
    }
  }
})

function run() {
  server.listen(25570, () => {
    logger.info('Socket.IO 服务器已启动')
    // const packageJson = require('../../../package.json')
    // const appVersion = packageJson.app_version || packageJson.version
    // logger.info(`app version ${appVersion}`)
  })

  server.on('error', error => {
    logger.error(error)
  })

  httpServer.listen(25571, () => {
    logger.info('express server 已启动')
  })

  httpServer.on('error', error => {
    logger.error(error)
  })
}
function close(params) {
  httpServer.close()
  server.close()
}

export { io, run, close, eapp }
