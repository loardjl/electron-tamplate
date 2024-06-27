<!--
 * @Author: chunlaizhang chunlai.zhang@ujoin-tech.com
 * @Date: 2024-06-04 17:18:11
 * @LastEditors: chunlaizhang
 * @LastEditTime: 2024-06-07 10:57:31
 * @FilePath: \kws\src\renderer\components\common\alertMsg\alert\index.vue
-->
<template>
  <div class="alert-warp">
    <div class="alert-mask">
      <ElAlert
        :title="$attrs.title"
        :type="$attrs.type"
        :description="$attrs.content"
        v-bind="$attrs"
        v-model="visible"
        :closable="false"
        :showIcon="$attrs.showIcon ?? true"
      />
      <div class="close-icon" @click="handleClose" v-if="$attrs.showClose ?? true"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, useAttrs, ref } from 'vue'
import { ElAlert } from 'element-plus'
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})
const attrs = useAttrs()
const emit = defineEmits(['update:modelValue'])
const visible = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})
const handleClose = () => {
  emit('update:modelValue', false)
}
const color = ref(
  attrs.type === 'error'
    ? 'rgb(252, 12, 3)'
    : attrs.type === 'success'
    ? 'rgb(43, 193, 85)'
    : attrs.type === 'warning'
    ? '#e6a23c'
    : '#909399'
)
</script>

<style lang="scss" scoped>
$step: 6;
$y: 100px;
.alert-warp {
  position: absolute;
  top: 10px;
  left: 50%;
  min-width: 25vw;
  --el-color-error: rgb(252, 12, 3);
  --el-color-success: rgb(43, 193, 85);
  --el-border-radius-base: 8px;
  border-radius: 8px;
  animation: fadeIn 0.3s forwards;
  transition: all;
  .alert-mask {
    position: relative;
    :deep(.el-alert) {
      min-height: 49px;
      padding-top: 10px;
      align-items: flex-start;
      --el-alert-icon-size: 21px;
      --el-alert-icon-large-size: 21px;
      outline: 1px solid v-bind('color');
      box-shadow: inset 1px 1px 1px 0px v-bind('color'), inset -1px -1px 1px 0px v-bind('color'),
        inset -1px 1px 1px 0px v-bind('color'), inset 1px -1px 1px 0px v-bind('color');
      .el-alert__title {
        font-size: 22px;
        font-weight: 500;
      }
      .el-alert__content {
        padding-top: 0.15em;
      }
      .el-alert__description {
        margin: 0.45em 0 0 -1.5em;
        font-size: 20px;
        font-weight: 400;
        color: rgb(188, 188, 188);
      }
    }
    .close-icon {
      width: 21.5px;
      height: 21.5px;
      color: v-bind('color');
      border: 1px solid;
      border-radius: 50%;
      position: absolute;
      right: 20px;
      top: 0.65em;
      cursor: pointer;
      &:before {
        content: '×';
        font-size: 18.5px;
        line-height: 18.5px;
        position: absolute;
        left: 25%;
      }
    }
  }
}
@keyframes fadeIn {
  // 根据$step的值，将动画分为$step份
  @for $i from 0 through $step {
    #{calc($i * 100% / $step)} {
      opacity: calc($i * 100% / $step);
      transform: translate(-50%, -(calc($y - $i * $y / $step)));
    }
  }
}
</style>
