const BaseController = require('./BaseController')
const { app } = require('electron')

class DataCenterController extends BaseController {
  constructor() {
    super()
    this.client = this.service.ConService.dcServer.client
  }

  getToken(req, ws) {
    try {
      const buff = this.service.DataCenterService.getToken()
      this.client.write(buff)
    } catch (e) {
      this.logger.error(e)
      ws.emit('error', {
        type: 'getTokenError',
        msg: e.message
      })
    }
  }

  getDcStatus(req, ws) {
    this.logger.info('getDcStatus---------')

    try {
      const status = this.service.ConService.dcServer.status
      ws.emit('dcStatus', {
        status
      })
    } catch (e) {
      this.logger.error(e)
      ws.emit('error', {
        type: 'addCollectionCardError',
        msg: e.message
      })
    }
  }

  getMStatus(req, ws) {
    try {
      const status = this.service.ConService.mServer.status
      ws.emit('mStatus', {
        status
      })
    } catch (e) {
      this.logger.error(e)
      ws.emit('error', {
        type: 'getMStatus',
        msg: e.message
      })
    }
  }

  startPushChartData(req, ws) {
    this.logger.info('订阅推送数据---------')
    try {
      this.service.DataCenterService.startPushChartData(ws)
    } catch (e) {
      this.logger.error(e)
      ws.emit('error', {
        type: 'startPushChartDataError',
        msg: e.message
      })
    }
  }

  stopPushChartData(req, ws) {
    try {
      this.service.DataCenterService.stopPushChartData(ws)
    } catch (e) {
      this.logger.error(e)
      ws.emit('error', {
        type: 'stopPushChartDataError',
        msg: e.message
      })
    }
  }

  async adapterSigSelectList(req, res) {
    try {
      const data = await this.service.DataCenterService.adapterSigSelectList(req.body)
      res.send(data)
    } catch (e) {
      this.logger.error(e)
      res.send({
        msg: e.message
      })
    }
  }

  async ChnnelSigSelectList(req, res) {
    try {
      const data = await this.service.DataCenterService.ChnnelSigSelectList(req.body)
      res.send(data)
    } catch (e) {
      this.logger.error(e)
      res.send({
        msg: e.message
      })
    }
  }

  async adapters(req, res) {
    try {
      await this.service.DataCenterService.adapters(req.body, res)
      // 1/0;
    } catch (e) {
      this.logger.error(e)
      res.send(e)
    }
  }

  getQueueData(req, res) {
    try {
      const data = this.service.IpsService.getQueueData(req.body)
      res.send({
        code: 1,
        data
      })
    } catch (e) {
      this.logger.error(e)
      res.send({
        msg: e.message,
        code: 0
      })
    }
  }

  getOverLoadQueueData(req, res) {
    try {
      const data = this.service.OverloadService.getQueueData(req.body)
      res.send({
        code: 1,
        data
      })
    } catch (e) {
      this.logger.error(e)
      res.send({
        msg: e.message,
        code: 0
      })
    }
  }

  // 订阅或退订过载数据
  subOverloadData(req, res) {
    try {
      this.service.OverloadService.subscribe(req.body)
      res.send({ code: 1 })
    } catch (e) {
      this.logger.error(e)
      res.send({
        msg: e.message,
        code: 0
      })
    }
  }

  getSigKeys(req, res) {
    try {
      const data = this.service.IpsService.getSigKeys()
      res.send({
        code: 1,
        data
      })
    } catch (e) {
      this.logger.error(e)
      res.send({
        msg: e.message,
        code: 0
      })
    }
  }

  async configGet(req, res) {
    try {
      const data = await this.service.DataCenterService.configGet(req.body, res)
      res.send(data)
    } catch (e) {
      this.logger.error(e)
      res.send({
        msg: e.message
      })
    }
  }

  async getAuxStatus(req, res) {
    try {
      const data = await this.service.DataCenterService.getAuxStatus(req.body, res)
      res.send(data)
    } catch (e) {
      this.logger.error(e)
      res.send({
        msg: e.message
      })
    }
  }
  async getDevStatus(req, res) {
    try {
      const data = await this.service.DataCenterService.getDevStatus(req.body, res)
      res.send(data)
    } catch (e) {
      this.logger.error(e)
      res.send({
        msg: e.message
      })
    }
  }

  async mapTransGet(req, res) {
    try {
      const data = await this.service.DataCenterService.mapTransGet(req.body)
      res.send(data)
    } catch (e) {
      this.logger.error(e)
      res.send(this.result.fail(e.toString()))
    }
  }

  // 删除信号
  deleteSigData(req, res) {
    const { type } = req.body
    try {
      if (type === 0) {
        // ips
        this.service.IpsService.deleteIpsSigData(req.body)
      } else if (type === 1) {
        // overload
        this.service.OverloadService.deleteOverloadSigData(req.body)
      }
      res.send({ code: 1 })
    } catch (e) {
      this.logger.error(e)
      res.send({
        msg: e.message,
        code: 0
      })
    }
  }
}

module.exports = new DataCenterController()
