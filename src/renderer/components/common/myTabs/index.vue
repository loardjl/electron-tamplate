<template>
  <div class="tab-wrap">
    <div
      v-for="item in tabList"
      :key="item.value"
      @click="onChange(item.value)"
      class="tab-item"
      :class="active == item.value ? 'tab-active' : ''"
    >
      {{ item.label }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
    required: true
  },
  tabList: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['update:modelValue', 'change'])
const active = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})
const onChange = val => {
  emit('update:modelValue', val)
  emit('change', val)
}
</script>

<style lang="scss" scoped>
.tab-wrap {
  height: 56px;
  display: flex;
  color: rgb(65, 180, 207);
  font-size: 20px;
  font-weight: 500;
  cursor: pointer;
  .tab-active {
    background: rgb(65, 180, 207);
    color: #fff;
  }

  .tab-item {
    border: 1px solid rgb(65, 180, 207);
    border-right: none;
    line-height: 56px;
    flex: 1;
    text-align: center;
    padding: 0 14px;
    white-space: nowrap;
    &:last-child {
      border-right: 1px solid rgb(65, 180, 207);
    }
  }
}
</style>
