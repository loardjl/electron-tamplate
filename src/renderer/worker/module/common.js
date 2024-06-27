// 没有额外处理的
const normal = [
  'mStatus', // 后端服务重启推送，前端重新订阅
  'getTokenRes', // 获取token
  'dcStatus' // 数据中心服务连接状态推送
]
// 需要转换的
const convertList = []

export const commonMsg = [...normal, ...convertList]
