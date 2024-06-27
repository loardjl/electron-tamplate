<template>
  <div class="radio-group">
    <div
      v-for="item in list"
      :key="item.value"
      class="item"
      :class="
        disable && active === item.value
          ? 'active disable'
          : disable && active !== item.value
          ? 'disable'
          : active === item.value
          ? 'active'
          : ''
      "
      @click="change(item.value)"
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
  activeColor: {
    type: String,
    default: 'rgb(65, 180, 207)'
  },
  inActiveColor: {
    type: String,
    default: 'transparent'
  },
  list: {
    type: Array,
    default: () => [],
    required: true
  },
  disable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])
const active = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const change = val => {
  if (props.disable) return
  emit('update:modelValue', val)
  emit('change', val)
}
</script>

<style lang="scss" scoped>
.radio-group {
  --activeBgColor: v-bind('activeColor');
  --inActiveBgColor: v-bind('inActiveColor');
  height: 56px;
  width: max-content;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 10px;
  border-radius: 50px;
  background-color: rgb(26, 29, 44);
  .item {
    height: 41px;
    padding: 4px 16px;
    font-size: 24px;
    text-align: center;
    border-radius: 34px;
    color: rgb(129, 137, 146);
    background-color: var(--inActiveBgColor);
    cursor: pointer;
    &.active {
      background-color: var(--activeBgColor);
      color: #fff;
      &.disable {
        background-color: rgb(198, 199, 203);
        color: rgba(0, 0, 0, 0.2);
        cursor: not-allowed;
      }
    }
    &.disable {
      cursor: not-allowed;
    }
  }
}
</style>
