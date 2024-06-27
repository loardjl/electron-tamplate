const BaseController = require('./BaseController')

class MonitorSegmentController extends BaseController {
  constructor() {
    super()
    this.client = this.service.ConService.mServer.client
  }

  updateConfig(req, ws) {
    try {
      this.service.MonitorSegmentService.updateConfig(req)
    } catch (e) {
      this.logger.error(e)
      ws.emit('error', {
        type: 'updateConfigError',
        msg: e.message
      })
    }
  }

  delChnnel(req, ws) {
    try {
      const buff = this.service.MonitorSegmentService.delChnnel(req)
      this.client.write(buff)
    } catch (e) {
      this.logger.error(e)
      ws.emit('error', {
        type: 'delChnnelError',
        msg: e.message
      })
    }
  }

  switchMonitor(req, ws) {
    try {
      const buff = this.service.MonitorSegmentService.switchMonitor(req)
      this.client.write(buff)
    } catch (e) {
      this.logger.error(e)
      ws.emit('error', {
        type: 'switchMonitorError',
        msg: e.message
      })
    }
  }

  updateChnnelEvent(req, ws) {
    try {
      const buff = this.service.MonitorSegmentService.updateChnnelEvent(req)
      this.client.write(buff)
    } catch (e) {
      this.logger.error(e)
      ws.emit('error', {
        type: 'switchMonitorError',
        msg: e.message
      })
    }
  }

  getNameRule(req, ws) {
    try {
      // this.logger.info('测试')
      const buff = this.service.MonitorSegmentService.getNameRule(req)
      this.client.write(buff)
    } catch (e) {
      this.logger.error(e)
      ws.emit('error', {
        type: 'getNameRule',
        msg: e.message
      })
    }
  }

  getProcessEnum(req, ws) {
    try {
      const buff = this.service.MonitorSegmentService.getProcessEnum(req)
      this.client.write(buff)
    } catch (e) {
      this.logger.error(e)
      ws.emit('error', {
        type: 'getProcessDataError',
        msg: e.message
      })
    }
  }

  subscribeDoData(req, ws) {
    try {
      this.service.DataCenterService.subscribeDoData(req, ws)
    } catch (e) {
      ws.emit('error', {
        type: 'subscribeDoData',
        msg: e.message
      })
    }
  }

  cancelDoData(req, ws) {
    try {
      this.service.DataCenterService.cancelDoData(req, ws)
    } catch (e) {
      ws.emit('error', {
        type: 'subscribeDoData',
        msg: e.message
      })
    }
  }
}

module.exports = new MonitorSegmentController()
