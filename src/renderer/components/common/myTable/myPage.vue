<template>
  <div class="pagination-container">
    <div class="paginti">
      <el-pagination
        :background="true"
        :page-size="pageSetting.pageSize"
        :page-sizes="[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]"
        class="pagination-self"
        :layout="pageSetting.layout || 'total, sizes, prev, pager, next, jumper'"
        :total="pageSetting.total"
        :current-page="pageSetting.pageNum"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      ></el-pagination>
    </div>
    <div class="articlese">
      <span>10条/页</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const tempRef = ref(null)
const emit = defineEmits(['sizeChange', 'currentChange'])
defineProps({
  pageSetting: {
    type: Object,
    default: () => {}
  }
})
const handleCurrentChange = val => {
  emit('currentChange', val)
}
const toggleRowSelection = (row, selected) => {
  tempRef.value && tempRef.value.toggleRowSelection(row, selected)
}
</script>

<style lang="scss" scoped>
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  align-items: center;
  height: 56px;
  .paginti {
    height: 56px;
  }
  .articlese {
    width: 152px;
    height: 56px;
    background: rgb(59, 61, 76);
    font-size: 20px;
    line-height: 56px;
    color: rgb(255, 255, 255);
    text-align: center;
    border-radius: 4px;
  }
}
:deep(.UJ-pagination.is-background .UJ-pager li) {
  background-color: rgb(59, 61, 76);
  font-size: 20px;
  height: 56px;
  width: 56px;
}
:deep(.UJ-pagination.is-background .UJ-pager li.is-active) {
  background: rgb(65, 180, 207);
  color: rgb(255, 255, 255);
}
:deep(.UJ-pagination.is-background .btn-next) {
  background-color: rgb(59, 61, 76);
  height: 56px;
  width: 56px;
}
:deep(.UJ-pagination.is-background .btn-prev) {
  background-color: rgb(59, 61, 76);
  font-size: 20px;
  height: 56px;
  width: 56px;
}
:deep(.UJ-pager) {
  height: 56px;
  font-size: 18px;
}
</style>
