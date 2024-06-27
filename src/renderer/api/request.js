/*
 * @Author: 何志祥
 * @Date: 2023-09-20 09:32:02
 * @LastEditors: 何志祥
 * @LastEditTime: 2023-11-02 15:30:46
 * @Description: axios 封装请求
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'

let baseURL = ''

// 获取当前的baseURL
await axios
  .request({
    url: 'http://localhost:25571/control/config/get',
    method: 'get',
    timeout: 10000
  })
  .then(function (res) {
    baseURL = res.data.DC_HTTP
    sessionStorage.setItem('versionInfo', JSON.stringify(res.data))
  })
  .catch(function (error) {
    ElMessage.error('获取baseURL失败！')
  })

const axiosBasicConfig = {
  baseURL,
  timeout: 10000
}

// axios 初始配置
const axiosInstance = axios.create(axiosBasicConfig)
// axiosInstance.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8'
// 全局请求拦截器
axiosInstance.interceptors.request.use(
  config => {
    // 不需要设置token的接口
    return config
  },
  err => {
    ElMessage.error(err)
    return Promise.reject(err)
  }
)

// 全局响应拦截器
axiosInstance.interceptors.response.use(
  config => {
    if (config.status !== 200 || config.data.error) {
      ElMessage.error(config.data.error.message)
      return Promise.reject(config)
    }
    return config
  },
  err => {
    ElMessage.error(err.message)
    return Promise.reject(err)
  }
)

export default axiosInstance