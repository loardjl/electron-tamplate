import { defineStore } from 'pinia'
export const usePreprocessStore = defineStore('preprocessStore', {
  state: () => ({
    curSelectedRow: null,
    signalCurSelectedRow: null
  }),
  actions: {
    setCurSelectedRow(row) {
      this.curSelectedRow = row
    },
    setSignalCurSelectedRow(row) {
      this.signalCurSelectedRow = row
    }
  }
})
