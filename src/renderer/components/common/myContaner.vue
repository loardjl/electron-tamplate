<template>
  <div class="uj-contaner">
    <div class="uj-contaner-content">
      <slot></slot>
    </div>
    <div class="uj-contaner-title" v-if="title">
      <div class="uj-contaner-title__wrap">
        {{ title }}
      </div>
    </div>
    <div class="uj-contaner-icon" v-if="title">
      <div class="uj-contaner-icon__wrap">
        <slot name="icon"></slot>
      </div>
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
  --title-height: 39px;
  --mt: calc(var(--title-height) * 0.4);
  --t: calc(var(--title-height) * -0.4);
  position: relative;
  margin: var(--mt) 0;
  background: rgb(26, 29, 44);
  height: calc(100% - 5px);
  border-radius: 20px;
  .uj-contaner-content {
    min-height: 100px;
    height: 100%;
    text-align: left;
    padding: 24px 15px;
    background: inherit;
    border-radius: inherit;
  }
  .uj-contaner-title {
    position: absolute;
    top: var(--t);
    left: 24px;
    background: $border-color;
    padding: 0 10px;
    font-size: 22px;
    font-weight: 500;
    .uj-contaner-title__wrap {
      background-color: inherit;
      height: var(--title-height);
      line-height: var(--title-height);
      &::after {
        content: '';
        width: 0;
        height: 0;
        position: absolute;
        top: 0;
        left: 100%;
        border-top-width: 0;
        border-bottom-width: var(--mt);
        border-left-width: 0;
        border-right-width: calc(var(--mt) * 0.6);
        border-style: solid;
        border-color: transparent transparent rgb(33, 99, 115) transparent;
      }
    }
  }
  .uj-contaner-icon {
    position: absolute;
    top: var(--t);
    right: 34px;
    padding: 0 10px;
    font-size: 22px;
    font-weight: 500;
    .uj-contaner-icon__wrap {
      height: var(--title-height);
      line-height: var(--title-height);
    }
  }
}
</style>
