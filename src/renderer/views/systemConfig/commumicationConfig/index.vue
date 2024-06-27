<template>
  <div class="communication-main">
    <div class="communication-main-action">
      <el-button @click="handleEdit" type="primary" size="default" :plain="isEdit">
        {{ isEdit ? '取 消' : '编 辑' }}
      </el-button>
      <el-button @click="handleSave" type="primary" size="default" v-if="isEdit">保 存</el-button>
    </div>
    <myContaner title="UJ-MCM连接" class="gray-bg">
      <myContaner class="info">
        <div class="info-content">
          <div class="item">
            <span>服务地址：</span>
            <el-input v-model="comForm.address" style="width: 240px" v-if="isEdit"></el-input>
            <span v-else>{{ comForm.address }}</span>
          </div>
          <div
            class="item"
            :style="{
              '--status': `${comForm.status === '1' ? 'rgb(42, 227, 4)' : 'rgb(155, 155, 155)'}`
            }"
          >
            <span>连接状态：</span>
            <span>{{ comForm.status === '1' ? '已连接' : '未连接' }}</span>
            <em></em>
          </div>
          <div class="item">
            <span>终端类型：</span>
            <span>{{ comForm.type }}</span>
          </div>
          <div class="item">
            <span>功能开关：</span>
            <el-switch
              active-value="1"
              inactive-value="0"
              v-model="comForm.enable"
              :disabled="!isEdit"
            ></el-switch>
          </div>
        </div>
      </myContaner>
    </myContaner>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import myContaner from '@renderer/components/common/myContaner.vue'
const isEdit = ref(false) // 编辑状态
// 表单信息
const comForm = reactive({
  address: 'www.ujoin-tech.com:8080',
  status: '1',
  type: '巡检终端',
  enable: '1'
})
onMounted(() => {})
const handleEdit = () => {
  isEdit.value = !isEdit.value
}
const handleSave = () => {
  // TODO
  isEdit.value = false
}
</script>

<style lang="scss" scoped>
.communication-main {
  .communication-main-action {
    margin: 12px 0;
    text-align: right;
  }
  .gray-bg {
    background-color: $base-bg-color-light;
    margin-bottom: 20px;
    .info {
      padding: 24px;
      %base {
        color: #fff;
        font-size: 20px;
        display: grid;
        row-gap: 36px;
      }
      %base-item {
        --status: rgb(155, 155, 155);
        display: flex;
        align-items: center;
        .el-input {
          width: 240px;
        }
        em {
          display: inline-block;
          margin-left: 8px;
          border-radius: 50%;
          background-color: var(--status);
          width: 12px;
          height: 12px;
        }
      }
      .info-content {
        @extend %base;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        .item {
          @extend %base-item;
        }
      }
    }
  }
}
</style>
