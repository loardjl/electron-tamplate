<template>
  <div class="input-wrap">
    <span class="input-title">
      <em v-if="$attrs.showStar">*</em>
      <slot></slot>
    </span>
    <renderInput />
  </div>
</template>

<script setup lang="jsx">
import { nextTick } from 'vue'
import { ref, getCurrentInstance, watchEffect, computed } from 'vue'
const { attrs, proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  }
})
const inputValue = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})
const emit = defineEmits(['update:modelValue', 'input'])
const width = ref('')
const dpr = window.devicePixelRatio || 1
const renderInput = () => {
  nextTick(() => {
    const { $el } = proxy
    if (!$el) {
      return
    }
    const title = $el.querySelector('.input-title')
    const ctx = title.getBoundingClientRect()
    width.value = (ctx.width * dpr) / (1920 / 100) + 'vw'
  })
  return (
    <el-input
      {...attrs}
      style={{ '--width': attrs.width ?? width.value }}
      v-model={inputValue.value}
    ></el-input>
  )
}
</script>

<style lang="scss" scoped>
.input-wrap {
  position: relative;
  background-color: $base-bg-color;
  .input-title {
    position: absolute;
    top: -1em;
    left: 0.2em;
    padding: 0 0.5em;
    z-index: 1;
    background-color: inherit;
    color: #fff;
    display: flex;
    align-items: center;
    white-space: nowrap;
    em {
      color: red;
      font-size: 1.2em;
    }
  }
  &:focus-within {
    .input-title {
      color: $border-color;
    }
  }
}
:deep(.UJ-input__wrapper) {
  width: var(--width);
}
</style>
