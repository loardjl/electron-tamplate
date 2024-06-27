import { onUnmounted, inject } from 'vue'
export const useSignalController = destoryFn => {
  const controller = new AbortController()
  const { signal } = controller
  const _worker = inject('_worker')
  onUnmounted(() => {
    controller.abort()
    destoryFn && destoryFn()
  })
  return { signal, _worker }
}
