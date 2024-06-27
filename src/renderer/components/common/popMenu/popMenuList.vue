<template>
  <div class="pop-menu-list" @click="handelClick">
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
    type: [String, Number, Array],
    default: ''
  }
})
const emit = defineEmits(['command'])
const handelClick = () => {
  emit('command', props.value)
}
</script>

<style lang="scss" scoped>
.pop-menu-list {
  width: 100%;
  height: 54px;
  padding: 16px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 22px;
  line-height: 1;
  display: flex;
  justify-content: center;
  cursor: pointer;
  &:hover {
    background-color: rgba(65, 180, 207, 0.25);
    color: #fff;
  }
}
</style>
