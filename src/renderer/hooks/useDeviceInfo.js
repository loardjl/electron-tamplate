import { computed, ref } from 'vue'
import { basicGetNameMap } from '@renderer/api/system/nodeurl'
import { INTELLIGENT_ADAPTIVE_CONTROL } from '@renderer/assets/static'
/**
 * @description: 获取设备信息
 */
export const useDeviceInfo = () => {
  const dev_id = +sessionStorage.getItem('dev_id')
  const deviceInfo = JSON.parse(sessionStorage.getItem('deviceInfo')) || []
  const curInfo = computed(() => {
    return deviceInfo.find(item => item.dev_id === dev_id) || {}
  })
  // 是否有智适应模块
  const hasIps = computed(() =>
    curInfo.value.authModule.some(d => d.id === INTELLIGENT_ADAPTIVE_CONTROL)
  )
  const nameList = ref([])
  /**
   * @description: 获取信号名称列表
   */
  const getSignalName = async data => {
    try {
      data.type = Array.isArray(data.type) ? data.type : [data.type]
      await basicGetNameMap(data).then(res => {
        nameList.value = res.data.content
      })
    } catch (error) {
      console.log(error)
    }
  }
  return {
    curInfo,
    dev_id,
    deviceInfo,
    getSignalName,
    nameList,
    hasIps
  }
}
