<template>
  <el-popover v-bind="$attrs" popper-class="pop-menu-main" :show-arrow="false" :offset="-2">
    <template #default>
      <slot></slot>
    </template>
    <template #reference>
      <slot name="reference"></slot>
    </template>
  </el-popover>
</template>

<script setup></script>

<style lang="scss">
.pop-menu-main {
  border-radius: 0 !important;
  background: rgb(26, 29, 44) !important;
  border: none !important;
  padding: 0 !important;
  min-width: 84px !important;
  width: max-content;
  font-size: 22px;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .UJ-tooltip__trigger {
    height: 54px;
    padding: 16px 20px;
    color: #fff;
    font-size: 22px;
    line-height: 1;
    text-align: center;
    cursor: pointer;
  }
}
</style>
