<template>
  <RenderTableColumn v-bind="column"></RenderTableColumn>
</template>

<script setup lang="jsx">
import { useSlots } from 'vue'
defineProps({
  column: {
    type: Object,
    default: () => {}
  }
})
const slots = useSlots()
const RenderTableColumn = item => {
  return (
    <>
      {(item.show !== undefined ? item.show : true) && (
        <el-table-column
          {...item}
          align={item.align ?? 'center'}
          showOverflowTooltip={item.tip || false}
        >
          {{
            default: scope => {
              if (item._children) return item._children.map(child => RenderTableColumn(child))
              if (item.render) return item.render(scope, item)
              if (slots[item.prop]) return slots[item.prop](scope)
              return scope.row[item.prop]
            },
            header: () => {
              if (item.headerRender) return item.headerRender(item)
              if (slots[`${item.prop}Header`]) return slots[`${item.prop}Header`]({ row: item })
              return item.label
            }
          }}
        </el-table-column>
      )}
    </>
  )
}
</script>

<style lang="scss" scoped></style>
