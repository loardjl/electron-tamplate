/**
 * @description 获取对应模块下的优化方式
 */
export const useGetOptimization = (ids, params = {}) => {
  const moduleList = [
    // 模块，6是智适应控制，目前1和2都是过程监控
    {
      id: 1,
      name: '自动边界',
      type: 'process'
    },
    {
      id: 2,
      name: '自动断刀',
      type: 'process',
      msgRouter: 'getTacticsList', // 后端路由
      payload: () => {
        // 发送的参数
        return {
          dev_id: params.dev_id, //设备ID
          remodel_id: params.remodel_id, //换型ID
          mode_id: params.mode_id, //模块ID
          channel_id: 0 //通道ID
        }
      },
      callback: (payload, needFilter = true) => {
        // 放回数据的处理方法
        if (needFilter) {
          return payload.data
            .filter(d => d.template_type !== 2)
            .map(d => ({
              ...d,
              name: d.template_name
            }))
        } else {
          return payload.data.map(d => ({
            ...d,
            name: d.template_name
          }))
        }
      }
    },
    {
      id: 3,
      name: '异常监控'
    },
    {
      id: 4,
      name: 'IPS'
    },
    {
      id: 5,
      name: '手动边界'
    },
    {
      id: 6,
      name: '智适应控制',
      type: 'ips',
      msgRouter: 'ipslKnifePlaceConfigQuery', // 后端路由
      payload: dev_id => {
        // 发送的参数
        return {
          dev_id,
          id: -1
        }
      },
      callback: (payload, needFilter = true) => {
        // 放回数据的处理方法
        if (needFilter) {
          return payload
            .filter(d => d.template_type !== 2)
            .map(d => ({
              ...d,
              name: d.template_name
            }))
        } else {
          return payload.map(d => ({
            ...d,
            name: d.template_name
          }))
        }
      }
    },
    {
      id: 7,
      name: '过载监测',
      type: 'overload',
      msgRouter: 'getOverloadTacticsList', // 后端路由
      payload: () => {
        // 发送的参数
        return {
          dev_id: params.dev_id, //设备ID
          remodel_id: params.remodel_id, //换型ID
          mode_id: params.mode_id, //模块ID
          channel_id: 0 //通道ID
        }
      },
      callback: (payload, needFilter = true) => {
        // 放回数据的处理方法
        if (needFilter) {
          return payload.data
            .filter(d => d.template_type !== 2)
            .map(d => ({
              ...d,
              name: d.template_name
            }))
        } else {
          return payload.data.map(d => ({
            ...d,
            name: d.template_name
          }))
        }
      }
    }
  ]
  const optimization = moduleList.filter(item => ids.includes(item.id))
  return {
    optimization
  }
}
