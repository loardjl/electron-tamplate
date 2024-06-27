<template>
  <el-container class="page-container">
    <el-aside :width="isPickUp ? '3.13vw' : '15.63vw'">
      <!-- Aside content -->
      <myMenu></myMenu>
    </el-aside>
    <el-container direction="vertical" class="page-main">
      <el-header class="page-header">
        <!-- Header content -->
        <myHeader></myHeader>
      </el-header>
      <el-main>
        <!-- Main content -->
        <router-view v-slot="{ Component }">
          <div class="page-view">
            <template v-if="route.meta.KeepAlive">
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </template>
            <component v-else :is="Component" />
          </div>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import myMenu from './menu.vue'
import myHeader from './header.vue'
import { useRoute } from 'vue-router'
import { useLayoutStore } from '@renderer/store/useLayout'
import { storeToRefs } from 'pinia'
const route = useRoute()
const { isPickUp } = storeToRefs(useLayoutStore())
</script>

<style lang="scss" scoped>
.page-container {
  height: 100%;
  overflow: hidden;
  .page-main {
    margin-top: 24px;
  }
  .page-header {
    display: flex;
    gap: 40px;
    align-items: center;
    background: rgb(59, 61, 76);
    backdrop-filter: blur(120px);
    border-radius: 12px;
    margin: 0 24px;
    :deep(.UJ-breadcrumb) {
      font-size: 20px;
      .UJ-breadcrumb__inner {
        color: #fff;
      }
    }
  }
  .page-view {
    padding: 0;
    overflow: auto;
    height: 100%;
    border-radius: 12px;
  }
}
</style>
