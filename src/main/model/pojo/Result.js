class Result {
  constructor() {}

  /**
   * 访问状态
   * @type {boolean}
   */
  status = true

  /**
   * 特定逻辑code
   * @type {number}
   */
  code = 1

  /**
   * 返回实际内容
   * @type {null}
   */
  content = null
}

function sucess(content) {
  const result = new Result()
  result.content = content
  return result
}

function sucess_code(content, code) {
  const result = new Result()
  result.content = content
  result.code = code
  return result
}

function fail(content) {
  const result = new Result()
  result.status = false
  result.code = -1
  result.content = content
  return result
}

module.exports.sucess = sucess
module.exports.fail = fail
module.exports.sucess_code = sucess_code

// export {sucess,fail,sucess_code}
