<template>
  <div class="uj-contaner">
    <div class="uj-contaner-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
.uj-contaner {
  position: relative;
  background: $base-bg-color-light;
  height: calc(100% - 5px);
  border-radius: 20px;
  & + .uj-contaner {
    margin: 16px 0;
  }
  .uj-contaner-content {
    min-height: 100px;
    height: 100%;
    text-align: left;
    padding: 24px;
  }
}
</style>
