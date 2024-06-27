const Axios = require('axios')

class request {
  constructor(headers, url, preBody) {
    this.headers = headers ? headers : {}
    this.url = url
    this.body = preBody ? preBody : {}
  }

  async post(body, url) {
    const assignBody = {}
    Object.assign(assignBody, this.body)
    Object.assign(assignBody, body)
    const respone = await this.result(url ? url : this.url, {
      headers: this.headers,
      body: assignBody,
      method: 'POST'
    })
    return respone
  }

  async get(url) {
    const respone = this.result(url ? url : this.url, {
      headers: this.headers,
      method: 'GET',
      timeout: 500000
    })
    return respone
  }

  async result(url, data) {
    try {
      const { method, body } = data
      // let respone = await fetch(url, data)
      let respone = null
      if (method === 'GET') {
        respone = await Axios.get(url)
      } else if (method === 'POST') {
        respone = await Axios.post(url, body)
      }

      const res = respone.data
      if (res['error']) {
        throw {
          error: res,
          message: 'http请求错误'
        }
      }
      return res
    } catch (e) {
      throw {
        sourcce_error: e,
        error: 'json格式不正确'
      }
    }
  }
}

// async  function test() {
//
//     try {
//         let re = new request({},"http://192.168.0.89:10133/control",null);
//         let s = await re.post({
//             "version": "1.0",
//             "method": "enum_adapters",
//             "id": "74",
//             "params": {
//                 "dev_id": 21
//             }
//         })
//         console.log(s)
//     } catch (e) {
//         console.log(e)
//     }
//
// }
//
// test()

module.exports = request
