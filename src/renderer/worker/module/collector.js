// 没有额外处理的
const normal = [
  'startPushChartData', // 订阅折线图数组推送
  'stopPushChartData', // 退订实时数据折线图数据推送
  'realTimeCharData', // 获取采集配置的实时信息推送
  'receiveDoData' // 接收Do的值
]
// 需要转换的
const convertList = []

export const collectorMsg = [...normal, ...convertList]
