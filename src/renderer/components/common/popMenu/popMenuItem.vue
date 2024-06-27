<template>
  <div class="pop-menu-item" @click="handelClick">
    {{ label }}
  </div>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  value: {
    type: [String, Number],
    default: ''
  }
})
const emit = defineEmits(['command'])
const handelClick = () => {
  emit('command', props.value)
}
</script>

<style lang="scss" scoped>
.pop-menu-item {
  width: 100%;
  height: 54px;
  padding: 16px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  &:hover {
    background-color: $border-color;
    color: #fff;
  }
}
</style>
