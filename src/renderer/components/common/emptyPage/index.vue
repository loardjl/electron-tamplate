<template>
  <baseContaner v-if="showContaner">
    <div class="empty-content">
      <img src="@renderer/assets/images/svg/table/nodata.svg" class="empty-img" />
      <div class="empty-text">
        <span>{{ text }}</span>
        <slot></slot>
      </div>
    </div>
  </baseContaner>
  <div class="empty-content" v-else>
    <img src="@renderer/assets/images/svg/table/nodata.svg" class="empty-img" />
    <div class="empty-text">
      <span>{{ text }}</span>
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import baseContaner from '@renderer/components/common/baseContaner.vue'
defineProps({
  text: {
    type: String,
    default: ''
  },
  showContaner: {
    type: Boolean,
    default: true
  }
})
</script>

<style lang="scss" scoped>
.empty-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .empty-img {
    width: 270px;
    height: 180px;
    object-fit: contain;
  }
  .empty-text {
    display: flex;
    gap: 16px;
    align-items: center;
    color: #fff;
    font-size: 20px;
    font-weight: 400;
  }
}
</style>
