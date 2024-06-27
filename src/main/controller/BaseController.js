class BaseController {
  constructor() {
    this.STRUCT_TYPE = require('../manager/struct')
    this.service = require('../service')
    this.ENCODE_TYPE = 'utf-8'
    this.logger = require('../manager/log')
    this.result = require('../model/pojo/Result')
  }
}

module.exports = BaseController
