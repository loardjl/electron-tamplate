import request from '../nodeIp'

export function basicInterface(data) {
  return request({
    url: '/control/ChnnelSigSelectList',
    method: 'POST',
    data: data
  })
}
export function adapterSigSelect(data) {
  return request({
    url: '/control/adapterSigSelectList',
    method: 'POST',
    data: data
  })
}
export function enumAdapters(data) {
  return request({
    url: '/control/lathe/adapters',
    method: 'POST',
    data: data
  })
}

export function enumData(data) {
  return request({
    url: '/control/aux/status',
    method: 'POST',
    data: data
  })
}
export function enumDev(data) {
  return request({
    url: '/control/aux/devstatus',
    method: 'POST',
    data: data
  })
}
// 获取信号，采集器名称等设备信息
export function basicGetNameMap(data) {
  return request({
    url: '/map/trans/get',
    method: 'post',
    data
  })
}
// 软件跳转
export function goSystem(data) {
  return request({
    url: '/goto',
    method: 'POST',
    data
  })
}
// 获取过载累计2分钟数据
export function getOverloadSigdata(data) {
  return request({
    url: '/overload/queue',
    method: 'POST',
    data
  })
}
// 订阅/退订过载数据
export function postOverloadSub(data) {
  return request({
    url: '/overload/sub',
    method: 'POST',
    data
  })
}
// 获取累计2分钟数据
export function getAccumulateData(data) {
  return request({
    url: '/sigdata/queue',
    method: 'POST',
    data
  })
}
// 删除信号
export function delSignalNode(data) {
  return request({
    url: '/sigdata/delete',
    method: 'POST',
    data
  })
}
// 获取信号列表
export function getSignalList(data) {
  return request({
    url: '/ips/sigkeys',
    method: 'POST',
    data
  })
}
// 发送报警结果
export function postAlarmInfo(data) {
  return request({
    url: '/iedp/alarm/info',
    method: 'POST',
    data
  })
}
// 更新报警状态
export function postAlarmStatus(data) {
  return request({
    url: '/iedp/alarm/status',
    method: 'POST',
    data
  })
}
