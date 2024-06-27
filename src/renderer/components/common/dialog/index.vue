<template>
  <ElDialog
    v-bind="$attrs"
    v-model="addTargetDialog"
    :show-close="false"
    :close-on-click-modal="false"
  >
    <template #header>
      <div class="myDialog-header" v-if="!$slots.header">
        <div class="myDialog-header__title">
          <div
            :class="`myDialog-header__title__div ${
              $attrs.error ? 'error' : $attrs.warning ? 'warning' : ''
            }`"
          ></div>
          {{ $attrs.title }}
        </div>
        <em
          class="myDialog-header__close"
          @click="closeDialog"
          v-if="$attrs.showCloseBtn ?? true"
        ></em>
      </div>
      <slot name="header" v-else></slot>
    </template>
    <slot></slot>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </ElDialog>
</template>

<script setup>
import { computed } from 'vue'
import { ElDialog } from 'element-plus'
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:modelValue'])
const addTargetDialog = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})
const closeDialog = () => {
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
.myDialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .myDialog-header__title {
    font-size: 24px;
    color: #fff;
    display: flex;
    align-items: center;
    .myDialog-header__title__div {
      height: 1em;
      width: 6px;
      background-color: $border-color;
      margin-right: 10px;
      &.error {
        background-color: $base-error-color;
      }
      &.warning {
        background-color: getColor('yellow');
      }
    }
  }
  .myDialog-header__close {
    width: 24px;
    height: 24px;
    background: url('@renderer/assets/icons/svg/operator/close.svg') no-repeat center center;
    background-size: 100% 100%;
    cursor: pointer;
  }
}
</style>
