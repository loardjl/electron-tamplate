<template>
  <div class="toolLife">
    <myContaner>
      <span class="channel">{{ t('collector.channel') }}：{{ ch + 1 }}</span>
    </myContaner>
    <myTable
      :table-data="toolLifeData"
      :columns="toolLifeCloumn"
      :table-setting="tableSetting"
    ></myTable>
    <div class="footer">
      <el-button type="primary" @click="close">{{ t('button.close') }}</el-button>
    </div>
  </div>
</template>

<script setup>
import myTable from '@renderer/components/common/myTable/myTable.vue'
import { _public } from '@renderer/utils/common'
import { useI18n } from 'vue-i18n'
import myContaner from '@renderer/components/common/myContaner.vue'
const { t } = useI18n()
defineProps({
  toolLifeData: {
    type: Array,
    default: () => [],
    required: true
  },
  toolLifeCloumn: {
    type: Array,
    default: () => [],
    required: true
  },
  ch: {
    type: Number,
    default: 0,
    required: true
  }
})
const emit = defineEmits(['close'])
const tableSetting = {
  border: true,
  isPager: false,
  height: _public.screenPx(650)
}
const close = () => {
  emit('close')
}
</script>

<style lang="scss" scoped>
.toolLife {
  padding: 24px;
  :deep(.uj-contaner-content) {
    min-height: unset;
    .channel {
      font-size: 22px;
      color: #fff;
    }
  }
  .footer {
    position: absolute;
    bottom: 24px;
    right: 24px;
  }
}
</style>
