const BaseController = require('./BaseController')

class IEDPController extends BaseController {
  constructor() {
    super()
    this.client = this.service.MqttTaskService.client
  }

  async sendAlarmInfo(req, res) {
    try {
      await this.service.MqttTaskService.sendAlarmInfo(req.body.data)
      res.send('success')
    } catch (e) {
      this.logger.error(e)
      res.send(this.result.fail(e.toString()))
    }
  }

  async updateAlarmStatus(req, res) {
    try {
      if (req.body?.status != this.service.MqttTaskService.alarmStatus) {
        this.service.MqttTaskService.device_upload()
      }
      this.service.MqttTaskService.alarmStatus = req.body?.status
      res.send('success')
    } catch (e) {
      this.logger.error(e)
      res.send(this.result.fail(e.toString()))
    }
  }

  async uploadRunLog(req, res) {
    try {
      const logInfo = req.body.param.log_info
      await this.service.MqttTaskService.upRunLog(logInfo)
      res.send()
    } catch (e) {
      this.logger.error(e)
      res.send(this.result.fail(e.toString()))
    }
  }
}

module.exports = new IEDPController()
