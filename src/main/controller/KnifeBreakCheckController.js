const BaseController = require('./BaseController')

class KnifeBreakCheckController extends BaseController {
  constructor() {
    super()
    this.client = this.service.ConService.mServer.client
  }
}

module.exports = new KnifeBreakCheckController()
