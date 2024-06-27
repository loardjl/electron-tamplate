<template>
  <div class="my-table-container">
    <!-- ref="tempRef" -->
    <el-table
      :height="tableSetting.height || 'auto'"
      :data="tableData"
      :border="tableSetting.border || false"
      :rowkey="tableSetting.rowkey || 'id'"
      :highlight-current-row="
        tableSetting.highlightCurrentRow !== undefined ? tableSetting.highlightCurrentRow : true
      "
      @selection-change="selectionChange"
      @current-change="handleCurrentRowChange"
      ref="tempRef"
    >
      <template v-for="item in columns" :key="item">
        <el-table-column
          :prop="item.prop"
          :label="item.label"
          :type="item.type"
          :selectable="item.selectableFn || (() => true)"
          :width="item.width"
          min-width="500px"
          :align="item.align || 'center'"
          v-if="(item.type === 'index' || item.type === 'selection') && item.show !== false"
        />
        <el-table-column
          v-else-if="item.type === 'expand'"
          v-bind="item"
          v-slot="scope"
          :align="item.align || 'center'"
          :width="item.width"
        >
          <component :is="item.render" v-if="item.render" v-bind="scope"></component>
          <slot v-bind="scope" v-else></slot>
        </el-table-column>
        <tableColumn v-if="!item.type && item.prop" :column="item">
          <template v-for="slot in Object.keys($slots)" #[slot]="scope">
            <slot :name="slot" v-bind="scope"></slot>
          </template>
        </tableColumn>
      </template>
      <!-- 插入表格最后一行之后的插槽 -->
      <template #append>
        <slot name="append"> </slot>
      </template>
      <!-- 表格无数据情况 -->
      <template #empty>
        <div
          class="table-empty"
          v-if="tableSetting.customeEmpty !== undefined ? tableSetting.customeEmpty : true"
        >
          <slot name="empty">
            <emptyPage :text="t('noData')" :showContaner="false"></emptyPage>
          </slot>
        </div>
      </template>
    </el-table>
    <div v-if="tableSetting.isPager ?? true" class="pagination-container">
      <el-pagination
        :background="tableSetting.background || true"
        :page-size="pageSetting.pageSize"
        :page-sizes="pageSetting.pageSizes || [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]"
        class="pagination-self"
        :layout="pageSetting.layout || 'total, sizes, prev, pager, next, jumper'"
        :total="pageSetting.total"
        :current-page="pageSetting.pageNum"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      ></el-pagination>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import tableColumn from './tableColumn.vue'
import emptyPage from '@renderer/components/common/emptyPage/index.vue'
import { useSelection } from '@renderer/hooks/useSelection'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = defineProps({
  columns: {
    type: Array,
    default: () => []
  },
  tableSetting: {
    type: Object,
    default: () => {}
  },
  tableData: {
    type: Object,
    default: () => {}
  },
  pageSetting: {
    type: Object,
    default: () => {}
  },
  height: {
    type: Number
  }
})
const { selectionChange, selectedList, isSelected, selectedListIds } = useSelection()
const emit = defineEmits(['sizeChange', 'currentChange', 'currentRowChange'])
/**
 * @description 每页条数改变
 * @param {Number} val 当前条数
 * @return void
 * */
const handleSizeChange = val => {
  emit('sizeChange', val)
}

/**
 * @description 当前选中行改变
 * @param {*} currentRow
 * @param {*} oldRow
 */
const handleCurrentRowChange = (currentRow, oldRow) => {
  emit('currentRowChange', currentRow, oldRow)
}

/**
 * @description 当前页改变
 * @param {Number} val 当前页
 * @return void
 * */

const tempRef = ref(null)

const clearCheck = () => {
  tempRef.value.clearSelection()
}

const handleCurrentChange = val => {
  emit('currentChange', val)
}
const toggleRowSelection = (row, selected) => {
  tempRef.value && tempRef.value.toggleRowSelection(row, selected)
}
/**
 * @description 设置当前选中行
 * @param {*} row
 */
const setCurrentRow = row => {
  tempRef.value && tempRef.value.setCurrentRow(row)
}
/**
 * @description 清楚当前选中行
 */
const celarCurrentRow = () => {
  tempRef.value.setCurrentRow()
}
defineExpose({
  selectedList,
  isSelected,
  selectedListIds,
  clearCheck,
  toggleRowSelection,
  setCurrentRow,
  celarCurrentRow
})
</script>

<style lang="scss" scoped>
.my-table-container {
  position: relative;
  .pagination-container {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
    :deep(.UJ-pagination) {
      --UJ-pagination-font-size: 20px;
      --UJ-pagination-button-width: 56px;
      --UJ-pagination-button-height: 56px;
      --UJ-pagination-button-bg-color: rgb(40, 45, 67);
      .btn-prev,
      .btn-next {
        color: #fff;
        background: rgb(40, 45, 67) !important;
      }
      .UJ-icon {
        height: 2em;
      }
      .UJ-icon svg {
        width: 2em;
        height: 2em;
      }
    }
  }
  .table-empty {
    font-size: 24px;
    height: 100%;
  }
  :deep(.UJ-table__header) {
    th {
      height: 63px;
      background: rgb(26, 29, 44);
      // box-shadow: inset -2px -2px 0px rgb(101, 120, 134);
      font-size: 22px;
      font-weight: 500;
      color: rgb(65, 180, 207);
    }
  }
  :deep(.current-row) {
    color: #fff;
  }
  :deep(.UJ-table--enable-row-hover .UJ-table__body tr:hover > td.UJ-table__cell) {
    color: #fff;
  }
  :deep(.UJ-table) {
    --UJ-table-border-color: rgba(59, 61, 76);
    --UJ-table-current-row-bg-color: rgb(40, 45, 67);
    --UJ-table-row-hover-bg-color: rgb(61, 66, 89);
    tr {
      background-color: rgb(40, 45, 67);
    }
    .UJ-table__header-wrapper tr td.UJ-table-fixed-column--left,
    .UJ-table__header-wrapper tr td.UJ-table-fixed-column--right,
    .UJ-table__body-wrapper tr td.UJ-table-fixed-column--left,
    .UJ-table__body-wrapper tr td.UJ-table-fixed-column--right,
    .UJ-table__footer-wrapper tr td.UJ-table-fixed-column--left,
    .UJ-table__footer-wrapper tr td.UJ-table-fixed-column--right,
    .UJ-table__footer-wrapper tr th.UJ-table-fixed-column--left,
    .UJ-table__footer-wrapper tr th.UJ-table-fixed-column--right {
      background: inherit;
    }
    .cell {
      word-break: break-word;
    }
    .UJ-table__cell {
      padding: 10px 0;
    }
  }
  :deep(.UJ-table__row) {
    font-size: 20px;
    font-weight: 400;
  }
  :deep(.UJ-checkbox) {
    $border-color: rgb(65, 180, 207);
    .UJ-checkbox__inner {
      border-color: #fff;
      background-color: rgb(40, 45, 67);
      height: 23px;
    }
    &.is-checked {
      .UJ-checkbox__inner {
        border-color: $border-color;
        background-color: $border-color;
      }
    }
    .is-in-determinate {
      .UJ-checkbox__inner {
        border-color: $border-color;
        background-color: $border-color;
      }
    }
  }
  :deep(.UJ-table-column--selection) {
    .cell {
      display: flex;
      justify-content: center;
    }
  }
}
</style>
