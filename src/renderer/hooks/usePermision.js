import { useSysStore } from '@renderer/store/useSys'
export const usePermission = () => {
  const { rules } = useSysStore()
  const hasPermission = permission => rules.includes(permission)
  return {
    hasPermission
  }
}
