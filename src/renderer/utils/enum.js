/*
 * @Description: 枚举
 */
export const sig_data_type = new Map([
  [0, 'int'],
  [1, 'float'],
  [2, 'string'],
  [3, 'boolean']
])
/**
 * @Description: 采集方式
 */
export const enumAddrType = new Map([
  [0, 'CNC'],
  [1, 'PMC'],
  [2, '宏变量']
])

/**
 * 设备运行状态枚举
 */
export const dccDevNcCheckRun = [
  {
    id: 0,
    label: '未定义'
  },
  {
    id: 1,
    label: '连接出错'
  },
  {
    id: 2,
    label: '自动运行开始'
  },
  {
    id: 3,
    label: '自动运行停止'
  },
  {
    id: 4,
    label: '自动运行待机状态'
  },
  {
    id: 5,
    label: '自动运行保持状态'
  }
]
