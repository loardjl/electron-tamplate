/*
 * @Author: 何志祥
 * @Date: 2023-09-13 15:54:55
 * @LastEditors: 何志祥
 * @LastEditTime: 2023-10-11 16:36:21
 * @Description:
 */
import { useSysStore } from '@renderer/store/useSys'
import { storeToRefs } from 'pinia'

/**系统信息 */
export const useSysInfo = () => {
  const store = useSysStore()
  const { isDebug } = storeToRefs(store)
  return {
    isDebug
  }
}
