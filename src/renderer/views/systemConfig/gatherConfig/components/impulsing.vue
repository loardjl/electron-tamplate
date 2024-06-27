<template>
  <div class="send-back">
    <div class="send-wrap">
      <el-form :model="form">
        <el-form-item :label="t('collector.selectDO') + ':'">
          <el-select style="width: 100%" v-model="DoType">
            <el-option
              v-for="item in props.doList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="t('collector.pulseStatus') + ':'">
          <div class="begin-status">
            <div @click="impulsingStatus = 0" :class="impulsingStatus == 0 ? 'active' : ''">0</div>
            <div @click="impulsingStatus = 1" :class="impulsingStatus == 1 ? 'active' : ''">1</div>
          </div>
        </el-form-item>
        <el-form-item :label="t('collector.pulseTime') + ':'">
          <el-input v-model="impulsingTime" oninput="value = value.replace(/[^\d]/g,'')"></el-input>
          <div class="tips">{{ t('collector.set0') }}</div>
        </el-form-item>
      </el-form>
    </div>
    <div class="btn-operate">
      <el-button type="primary" size="default" plain @click="cancel">{{
        t('collector.cancel')
      }}</el-button>
      <el-button type="primary" @click="submit">{{ t('collector.confirm') }}</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { basicInterface } from '@renderer/api/system/system'
import { useRoute } from 'vue-router'
const route = useRoute()
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps({
  // DO 下拉选项列表
  doList: {
    type: Array
  }
})

// 确定
const DoType = ref(props.doList[0].value)
const impulsingStatus = ref(0) // 初始脉冲状态
const impulsingTime = ref(1000) // 脉冲时间
const submit = async () => {
  if (!impulsingTime.value || impulsingTime.value > 60000 || impulsingTime.value < 0) {
    ElMessage.error(t('collector.pulseTimeLimit'))
    return
  }
  const value = impulsingStatus.value.toString() === 0 ? '1' : '0'
  await basicInterface({
    version: '1.0',
    method: 'adapter_dev_ctrl',
    id: '38',
    params: {
      dev_id: parseInt(route.query.dev_id),
      collector_id: parseInt(route.query.adapter_id),
      ctrl_type: 0,
      ctrl_addr_type: 2,
      addr: DoType.value,
      data_type: 0,
      value: value
    }
  })
  ElMessage.success(t('collector.operateSuccess'))
  emit('update:isAddTool', false)
  if (impulsingTime.value > 0) {
    emit('sendImpulsing', impulsingStatus.value, impulsingTime.value, DoType.value)
  }
}

const emit = defineEmits(['update:isAddTool', 'sendImpulsing'])
const cancel = () => {
  emit('update:isAddTool', false)
}
</script>

<style lang="scss" scoped>
.send-back {
  padding-bottom: 60px;

  .send-wrap {
    background: rgb(26, 29, 44);
    border-radius: 20px;
    padding: 25px 30px;

    :deep(.UJ-form-item) {
      flex-direction: column;

      .UJ-input__wrapper {
        background: rgb(26, 29, 44);
      }

      .UJ-form-item__label {
        align-items: flex-start;
        justify-content: flex-start;
        margin-bottom: 15px;
      }
    }

    .begin-status {
      width: 100%;
      height: 57px;
      line-height: 57px;
      font-size: 22px;
      display: flex;
      text-align: center;

      & > div {
        cursor: pointer;
        flex: 1;
        border: 1px solid rgb(65, 180, 207);
      }
      & > div:first-child {
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
        border-right: none;
      }
      & > div:last-child {
        border-top-right-radius: 6px;
        border-bottom-right-radius: 6px;
      }

      .active {
        background: rgb(65, 180, 207);
      }
    }
  }
  .tips {
    color: red;
    font-size: 22px;
    margin-top: 5px;
  }
  .btn-operate {
    margin-top: 35px;
    margin-bottom: -30px;
    float: right;
  }
}
</style>
