import { _public } from '@renderer/utils/common'
export const useCascaderData = dataBuff => {
  const data = _public.deepCopy(dataBuff)
  const result_list = []
  // 通道List
  const channel_list = data['channel_info_list']
  if (channel_list) {
    const channel = {
      value: 'nc',
      label: 'NC',
      children: []
    }
    for (const data of channel_list) {
      const data_p = {
        value: data['adapter_id'],
        label: '通道' + data['channel_num'],
        children: []
      }
      const signal_list = data['signal_list']
      if (signal_list) {
        for (const signal of signal_list) {
          data_p.children.push({
            value: signal['sig_id'],
            label: signal['sig_name']
          })
        }
      }
      channel.children.push(data_p)
    }
    if (channel.children.length > 0) {
      result_list.push(channel)
    }
  }

  //轴list
  const axis_default_info = data['axis_default_info']
  if (axis_default_info) {
    for (const data of axis_default_info) {
      const data_p = {
        value: data['axis_num'],
        label: data['axis_name'],
        children: []
      }
      const axis_list = data['axis_default_signals']
      if (axis_list) {
        for (const axis of axis_list) {
          const data_p_p = {
            value: axis['adapter_id'],
            label: axis['adapter_name'],
            children: []
          }
          const signal_list = axis['signal_list']
          if (signal_list) {
            for (const sign of signal_list) {
              data_p_p.children.push({
                value: sign['sig_id'],
                label: sign['sig_name']
              })
            }
          }
          data_p.children.push(data_p_p)
        }
      }
      result_list.push(data_p)
    }
    //
  }

  // 其他
  const other_signal_info = data['other_signal_info']
  if (other_signal_info) {
    const other = {
      value: 'other',
      label: '其他',
      children: []
    }
    for (const data of other_signal_info) {
      const data_p = {
        value: data['adapter_id'],
        label: data['adapter_name'],
        children: []
      }
      const signal_list = data['signal_list']
      if (signal_list) {
        for (const signal of signal_list) {
          data_p.children.push({
            value: signal['sig_id'],
            label: signal['sig_name']
          })
        }
      }
      other.children.push(data_p)
    }
    if (other.children.length > 0) {
      result_list.push(other)
    }
  }
  return result_list
}
