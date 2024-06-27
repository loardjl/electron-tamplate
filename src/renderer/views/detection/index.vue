<template>
  <div class="detection-page">
    <baseContaner>
      <toolOperation></toolOperation>
    </baseContaner>
    <baseContaner style="overflow-y: auto">
      <adapterConfig></adapterConfig>
    </baseContaner>
  </div>
</template>

<script setup>
import baseContaner from '@renderer/components/common/baseContaner.vue'
import toolOperation from './components/toolOperation.vue'
import adapterConfig from './components/adapterConfig.vue'
</script>

<style lang="scss" scoped>
.detection-page {
  height: 100%;
  display: grid;
  grid-template-columns: 410px 1fr;
  gap: 16px;
  .uj-contaner + .uj-contaner {
    margin: 0;
  }
}
</style>
