<template>
  <div class="back-btn" @click="back" v-if="matcheds.length > 1"></div>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: item.path }" v-for="item in matcheds" :key="item.path">{{
      t(item.meta.title)
    }}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import routes from '@renderer/router/router'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
const route = useRoute()
const router = useRouter()
const matcheds = ref([])
const { t } = useI18n()
watch(
  () => route,
  () => {
    getRouterMap()
  },
  {
    deep: true
  }
)

onMounted(() => {
  getRouterMap()
})

const back = () => {
  const path = matcheds.value[matcheds.value.length - 2].path
  router.push(path)
}

const getRouterMap = () => {
  const routesMap = routes.find(d => d.name === 'home').children
  const path = route.path
  deep(path, routesMap, [])
  matcheds.value = matcheds.value.filter(item => item.level !== 0)
}

const deep = (path, arr, barr) => {
  arr.forEach(item => {
    if (item.children) {
      deep(path, item.children, barr)
    } else if (path.includes(item.path)) {
      barr.push(item)
      matcheds.value = barr
    }
  })
}
</script>

<style lang="scss" scoped>
.back-btn {
  width: 51px;
  height: 40px;
  background-image: url('@renderer/assets/icons/svg/breadcrumb/back.svg');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
}
</style>
