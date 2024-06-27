<template>
  <renderPopover />
</template>

<script setup lang="jsx">
import { onMounted, getCurrentInstance } from 'vue'
const { attrs, slots, proxy } = getCurrentInstance()
onMounted(() => {
  document.querySelector('.UJ-popper').setAttribute(proxy.$options.__scopeId, '')
  document.querySelector('.my-popover').setAttribute(proxy.$options.__scopeId, '')
  document.querySelector('.my-popover-header').setAttribute(proxy.$options.__scopeId, '')
  document.querySelector('.my-popover-header__title').setAttribute(proxy.$options.__scopeId, '')
  document.querySelector('.my-popover-header__close').setAttribute(proxy.$options.__scopeId, '')
  document.querySelector('.pop-content').setAttribute(proxy.$options.__scopeId, '')
  document.querySelector('.UJ-popper').style.setProperty('--UJ-popper-height', attrs.height)
})
const emit = defineEmits(['update:visible'])
const popoverClose = () => {
  emit('update:visible', false)
}
const popoverTitle = () => {
  return (
    <>
      <div class="my-popover">
        <div class="my-popover-header">
          <div class="my-popover-header__title">
            {attrs.title !== undefined ? (
              <>
                <div
                  style={{
                    height: '1em',
                    width: '.31vw',
                    backgroundColor:
                      attrs.error !== undefined
                        ? 'rgb(252, 12, 3)'
                        : attrs.warning !== undefined
                        ? 'rgb(252, 200, 3)'
                        : 'rgb(65, 180, 207)',
                    marginRight: '.52vw'
                  }}
                ></div>
                {attrs.title}
              </>
            ) : (
              ''
            )}
          </div>
          <em class="my-popover-header__close" onClick={() => popoverClose()}></em>
        </div>
      </div>
    </>
  )
}
const renderPopover = () => {
  return (
    <>
      <el-popover {...attrs} title="">
        {{
          reference: (...args) => {
            return slots.reference(args)
          },
          default: (...args) => {
            return (
              <>
                {popoverTitle()}
                <div class="pop-content">{slots.default(args)}</div>
              </>
            )
          }
        }}
      </el-popover>
    </>
  )
}
</script>

<style lang="scss">
.my-popover {
  display: flex;
  .my-popover-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    height: 34px;
    background-color: inherit;
    width: 100%;
    .my-popover-header__title {
      font-size: 24px;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .my-popover-header__close {
      width: 21px;
      height: 21px;
      background: url('@renderer/assets/icons/svg/operator/close.svg') no-repeat center center;
      background-size: 100% 100%;
      cursor: pointer;
    }
  }
}
.pop-content {
  flex: 1;
  width: 100%;
  text-align: center;
  margin-top: 18px;
  & + .UJ-popper__arrow::before {
    background-color: $base-bg-color-light !important;
  }
}
.UJ-popper {
  height: var(--UJ-popper-height);
  display: flex;
  flex-direction: column;
}
</style>
