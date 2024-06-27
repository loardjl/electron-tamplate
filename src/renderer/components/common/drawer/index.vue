<template>
  <div class="myDrawer">
    <el-drawer v-bind="$attrs" v-model="addTargetDialog" :show-close="false">
      <template #header>
        <div class="myDrawer-header" v-if="!$slots.header">
          <div class="myDrawer-header__title">
            <div
              :class="`myDrawer-header__title__div ${
                $attrs.error ? 'error' : $attrs.warning ? 'warning' : ''
              }`"
            ></div>
            {{ $attrs.headerTitle }}
          </div>
          <em
            class="myDrawer-header__close"
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
    </el-drawer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
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
.myDrawer {
  :deep(.UJ-drawer) {
    border-radius: 20px;
    .UJ-drawer__header {
      margin-bottom: 0;
    }
    .UJ-drawer__body {
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
  .myDrawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .myDrawer-header__title {
      font-size: 24px;
      color: #fff;
      display: flex;
      align-items: center;
      .myDrawer-header__title__div {
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
    .myDrawer-header__close {
      width: 24px;
      height: 24px;
      background: url('@renderer/assets/icons/svg/operator/close.svg') no-repeat center center;
      background-size: 100% 100%;
      cursor: pointer;
    }
  }
}
</style>
