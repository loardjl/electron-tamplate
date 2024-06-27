import { inject } from 'vue'
import { useDeviceInfo } from '@renderer/hooks/useDeviceInfo'
/**
 * @description 获取对应模块下的优化方式
 */
export const useCommon = () => {
  const _worker = inject('_worker')
  const { dev_id, curInfo } = useDeviceInfo()
  const getOptimization = (params, isTemp = false) => {
    _worker.postMessage({
      type: 'msGetGradeList',
      payload: {
        dev_id, //设备ID
        remodel_id: isTemp ? 0 : curInfo.value.current_remodel.id, //换型ID
        model_id: isTemp ? 0 : curInfo.value.mode_id, //型号ID
        monitor_channel_id: isTemp ? 0 : params.monitor_channel_id, //监控通道ID
        tool_id: isTemp ? 0 : params.tool_id,
        mmid: isTemp ? '' : params.mmid,
        adapter_id: isTemp ? 0 : params.adapter_id, //adapter_id=-1，说明是查刀位或过程的优化方式列表，adapter_id>0并且signal_id>0，说明是查信号的优化方式列表
        signal_id: isTemp ? 0 : params.signal_id,
        business_type: params.business_type,
        tool_number: params.tool_number || '',
        physical_channel_id: params.physical_channel_id || 0
      }
    })
  }
  return {
    getOptimization
  }
}
