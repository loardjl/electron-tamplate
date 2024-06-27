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
import { getCurrentInstance, computed, nextTick, ref } from 'vue'
const { attrs, proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  list: {
    type: Array,
    default: () => []
  }
})
const selectValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
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
    <el-select
      {...attrs}
      v-model={selectValue.value}
      style={{ '--width': attrs.width ?? width.value }}
    >
      {props.list.map(item => {
        return <el-option label={item.label} value={item.value} key={item.value} />
      })}
    </el-select>
  )
}
</script>

<style lang="scss" scoped>
.input-wrap {
  position: relative;
  background-color: $base-bg-color;
  & + .input-wrap {
    margin-left: 24px;
  }
  .input-title {
    position: absolute;
    top: -1.2em;
    left: 0.2em;
    padding: 0 0.5em;
    z-index: 1;
    background-color: rgb(26, 29, 44);
    color: #fff;
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
  background-color: rgb(26, 29, 44);
  width: var(--width);
}
</style>
