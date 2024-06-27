import { defineStore } from 'pinia'
import piniaPersistConfig from '@renderer/common/piniaPersist'

export const useLayoutStore = defineStore('useLayout', {
  state: () => ({
    isPickUp: false
  }),
  actions: {
    togglePickUp() {
      this.isPickUp = !this.isPickUp
    }
  },
  persist: piniaPersistConfig('useLayout')
})
