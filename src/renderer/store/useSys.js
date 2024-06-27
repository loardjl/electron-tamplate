import { defineStore } from 'pinia'
import piniaPersistConfig from '@renderer/common/piniaPersist'
export const useSysStore = defineStore('sysStore', {
  state: () => ({
    showLogo: true,
    adapterList: []
  }),
  actions: {
    toggleLogo() {
      this.showLogo = !this.showLogo
    },
    setAdapterList(adapterList) {
      this.adapterList = adapterList
    }
  },
  persist: piniaPersistConfig('sysStore')
})
