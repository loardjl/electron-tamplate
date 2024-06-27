/*
 * @Author: 何志祥
 * @Date: 2023-09-20 09:47:17
 * @LastEditors: 何志祥
 * @LastEditTime: 2023-11-06 09:38:24
 * @Description: 采集配置接口api
 */
import request from '../request'

// 基础接口定义
export function basicInterface(data) {
  return request({
    url: JSON.parse(sessionStorage.getItem('versionInfo')).SOURCE.dc.http.url,
    method: 'post',
    data: data
  })
}

// 获取token
export function basicGetToken() {
  return request({
    url: '/getToken',
    method: 'get'
  })
}

// 获取导入导出监控运维
export function basicUpgradation(data) {
  return request({
    url: '/upgradation',
    method: 'post',
    data: data
  })
}
// 刀具寿命
export function toolLifeApi(data) {
  return request({
    url: JSON.parse(sessionStorage.getItem('versionInfo')).SOURCE.dc.http.url,
    method: 'post',
    timeout: 120000,
    data: data
  })
}
