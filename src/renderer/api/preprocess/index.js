import request from '../request'
const CONTROL_URL = JSON.parse(sessionStorage.getItem('versionInfo')).SOURCE.dc.http.url
const PREPROCESS_URL = JSON.parse(sessionStorage.getItem('versionInfo')).SOURCE.dc.http.pre_url

// 创建预处理请求数据
function createRequestData(method, id, data) {
  return {
    url: PREPROCESS_URL,
    method: 'post',
    data: {
      version: '1.0',
      method,
      id,
      params: { ...data }
    }
  }
}

// 创建数据中心控制请求数据
export function createControlRequestData(method, id, data) {
  return {
    url: CONTROL_URL,
    method: 'post',
    data: {
      version: '1.0',
      method,
      id,
      params: { ...data }
    }
  }
}

// 获取预处理配置列表
export function preprocessList(data) {
  return request(createRequestData('enum_dev_preprocess_instance_list', '3', data))
}

// 新增预处理配置
export function addPreprocess(data) {
  return request(createRequestData('add_preprocess_instace', '4', data))
}

// 修改预处理配置
export function modifyPreprocess(data) {
  return request(createRequestData('update_preprocess_instance', '5', data))
}

// 删除预处理配置
export function deletePreprocess(data) {
  return request(createRequestData('delete_preprocess_instance', '6', data))
}

// 获取预处理算子
export function preprocessOperator(data) {
  return request(createRequestData('enum_preprocess_template_list', '2', data))
}

// 查询传感器
export function queryAdapters(data) {
  return request(createControlRequestData('enum_adapters', '8', data))
}

// 根据机床id获取通道号和nc采集器id
export function queryAdaptersByDevId(data) {
  return request(createControlRequestData('enum_channel_nc_adapter_id', '76', data))
}

// 枚举信号处理方式
export function signalProcTypeList(data) {
  return request(createRequestData('enum_signal_proc_type', '521', data))
}

// 枚举信号处理配置列表
export function signalProcList(data) {
  return request(createRequestData('enum_dev_signal_proc_list', '522', data))
}

// 新增信号处理配置
export function addSignalProc(data) {
  return request(createRequestData('add_signal_proc', '523', data))
}

// 更新信号处理配置
export function updateSignalProc(data) {
  return request(createRequestData('update_signal_proc', '524', data))
}

// 删除信号处理配置
export function deleteSignalProc(data) {
  return request(createRequestData('delete_signal_proc', '525', data))
}

// 批量删除信号处理配置
export function batchDeleteSignalProc(data) {
  return request(createRequestData('batch_delete_signal_proc', '526', data))
}

// 获取可订阅信号处理的信号列表
export function queryDevAdapterSignalList(data) {
  return request(createRequestData('query_dev_adapter_signal_list', '527', data))
}
