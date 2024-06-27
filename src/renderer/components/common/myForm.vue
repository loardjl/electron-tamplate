<template>
  <el-form
    :label-position="formData.labelPosition || 'left'"
    :inline="formData.inline ? true : false"
    :model="searchForm"
    :ref="el => setRef(el)"
    class="search-form-container"
    :rules="rules"
    :label-suffix="formData.labelSuffix || ''"
  >
    <el-form-item
      v-for="item in formData.arr.filter(i => i !== '')"
      :key="item.key"
      :label="item.label"
      :prop="item.key"
      :style="{
        '--label-minwidth': item.width || 'max-content',
        ...item.lineStyle
      }"
    >
      <div :style="{ ...item.style }" v-if="item.type == 'checkbox'">
        <el-checkbox :size="item.size || 'default'" v-model="searchForm[item.key]">{{
          item.label1
        }}</el-checkbox>
      </div>
      <div :style="{ ...item.style }" v-if="item.type == 'switch'">
        <el-switch
          :size="item.size || 'default'"
          :inactive-value="item.iac || 1"
          :active-value="item.ac || 0"
          v-model="searchForm[item.key]"
          @change="item.fn"
          :placeholder="item.placeholder || t('pleaseEnter')"
        ></el-switch>
      </div>
      <div v-if="item.type == 'input'" style="width: 100%">
        <el-input
          :size="item.size || 'default'"
          v-model.trim="searchForm[item.key]"
          :placeholder="item.placeholder || t('pleaseEnter')"
          class="input-width"
          clearable
          :style="{ width: item.inputWidth || '130px' }"
          :suffix-icon="item.suffixIcon || ''"
        ></el-input
        ><span
          v-if="item.suffix"
          style="display: inline-block; font-size: 1.04vw; padding-left: 0.26vw; color: #fff"
          >{{ item.suffix }}</span
        >
      </div>
      <el-date-picker
        :size="item.size || 'default'"
        v-else-if="item.type == 'date-picker'"
        v-model="searchForm[item.key]"
        class="input-width"
        :style="{
          width: item.inputWidth || '291px'
        }"
        :type="item.dataType || 'date'"
        :placeholder="item.placeholder || t('pleaseSelectStartDate')"
      ></el-date-picker>
      <el-date-picker
        v-else-if="item.type == 'daterange-picker'"
        v-model="searchForm[item.key]"
        class="input-width"
        type="daterange"
        :style="{ width: item.inputWidth || '130px' }"
        :clearable="item.clearable !== undefined ? item.clearable : true"
        :range-separator="item.rangeSeparator || '-'"
        :start-placeholder="item.startPlaceholder || t('pleaseSelectStartDate')"
        :end-placeholder="item.endPlaceholder || t('pleaseSelectEndDate')"
        :size="item.size || 'default'"
        @blur="item.blur() || null"
      ></el-date-picker>
      <el-date-picker
        v-else-if="item.type == 'datetimerange'"
        v-model="searchForm[item.key]"
        class="input-width"
        type="datetimerange"
        :range-separator="item.rangeSeparator || '-'"
        :start-placeholder="item.startPlaceholder || t('pleaseSelectStartTime')"
        :end-placeholder="item.endPlaceholder || t('pleaseSelectEndTime')"
        :size="item.size || 'default'"
        :format="item.valueFormat || 'yyyy-MM-dd HH:mm:SS'"
        :value-format="item.valueFormat || 'yyyy-MM-dd HH:mm:SS'"
      ></el-date-picker>
      <el-date-picker
        :size="item.size || 'default'"
        v-else-if="item.type == 'monthrange'"
        value-format="yyyy-MM"
        v-model="searchForm[item.key]"
        class="input-width"
        type="monthrange"
        :start-placeholder="item.startPlaceholder || t('pleaseSelectStartTime')"
        :end-placeholder="item.endPlaceholder || t('pleaseSelectEndTime')"
      ></el-date-picker>
      <template v-if="item.type == 'year-picker'">
        <el-date-picker
          v-if="item.size == 2"
          v-model="searchForm[item.key]"
          type="daterange"
          range-separator="-"
          :start-placeholder="item.startPlaceholder || t('pleaseSelectStartTime')"
          :end-placeholder="item.endPlaceholder || t('pleaseSelectEndTime')"
        ></el-date-picker>
        <el-date-picker
          v-if="item.size == 3"
          v-model="searchForm[item.key]"
          type="monthrange"
          range-separator="-"
          :start-placeholder="item.startPlaceholder || t('pleaseSelectStartTime')"
          :end-placeholder="item.endPlaceholder || t('pleaseSelectEndTime')"
        ></el-date-picker>
        <el-date-picker
          :style="{
            width: item.inputWidth || '291px'
          }"
          v-model="searchForm[item.key]"
          :type="item.range || 'year'"
          v-if="item.year == 'byear'"
          :disabled-date="item.disabledFn || null"
          @change="item.changeFn && item.changeFn(searchForm[item.key])"
          :placeholder="item.placeholder || t('pleaseSelectStartDate')"
        ></el-date-picker>
        <span class="form-text ml-16" v-if="item.year == 'byear'">{{ t('to') }}</span>
        <el-date-picker
          :style="{
            width: item.inputWidth || '291px'
          }"
          v-model="searchForm[item.key]"
          :type="item.range || 'year'"
          v-if="item.year == 'eyear'"
          :disabled-date="item.disabledFn || null"
          @change="item.changeFn && item.changeFn(searchForm[item.key])"
          :placeholder="item.placeholder || t('pleaseSelectEndTime')"
        ></el-date-picker>
      </template>
      <el-select
        :size="item.size || 'default'"
        clearable
        v-else-if="item.type == 'select'"
        class="input-width"
        v-model="searchForm[item.key]"
        :multiple="item.multiple || false"
        :collapse-tags="true"
        :placeholder="item.placeholder || t('pleaseSelect')"
        :style="{ width: item.inputWidth || '130px' }"
      >
        <el-option
          v-for="opItem in item.option"
          :key="item.opValue ? opItem[item.opValue] : opItem.value"
          :label="item.opLabel ? opItem[item.opLabel] : opItem.label"
          :value="item.opValue ? opItem[item.opValue] : opItem.value"
        ></el-option>
      </el-select>
      <el-select
        :size="item.size || 'default'"
        :clearable="item.clearable ?? true"
        v-else-if="item.type == 'selectFn' && item.show !== false"
        class="input-width"
        v-model="searchForm[item.key]"
        :placeholder="item.placeholder || t('pleaseSelect')"
        :style="{ width: item.inputWidth || '130px' }"
        :multiple="item.multiple || false"
        :collapse-tags="true"
        @change="item.fn"
      >
        <el-option
          v-for="opItem in item.option"
          :key="item.opValue ? opItem[item.opValue] : opItem.value"
          :label="item.opLabel ? opItem[item.opLabel] : opItem.label"
          :value="item.opValue ? opItem[item.opValue] : opItem.value"
        ></el-option>
      </el-select>
      <el-select
        :size="item.size || 'default'"
        clearable
        v-else-if="item.type == 'selectRemote'"
        :class="`input-width ${item.clazz}`"
        v-model="searchForm[item.key]"
        :placeholder="item.placeholder || t('pleaseSelect')"
        :style="{ width: item.inputWidth || '130px' }"
        :value-key="item.valueKey || 'value'"
        :suffix-icon="item.suffix || 'ArrowDown'"
        :remote-method="item.remoteMethod"
        @change="item.fn(item)"
      >
        <el-option
          v-for="opItem in item.option"
          :key="opItem[item.opValue] || opItem.value"
          :label="opItem[item.opLabel] || opItem.label"
          :value="item.valueKey ? opItem : opItem[item.opValue] || opItem.value"
        ></el-option>
      </el-select>
      <el-cascader
        :size="item.size || 'default'"
        clearable
        v-else-if="item.type == 'cascader'"
        :style="{ width: item.inputWidth || '130px' }"
        class="input-width"
        v-model="searchForm[item.key]"
        :show-all-levels="item.showAllLevels || false"
        :options="item.option"
        :collapse-tags="true"
        :props="item.props"
        :placeholder="item.placeholder || t('pleaseSelect')"
      ></el-cascader>
      <template v-else-if="item.type == 'button'">
        <template v-for="(btn, index) in item.handles">
          <el-button
            v-if="!btn.rules && btn.show(formData.id)"
            :size="btn.size || 'default'"
            :key="index"
            :type="btn.type"
            :icon="btn.icon"
            :plain="btn.plain || false"
            :style="btn.style"
            @click="btnFn(btn)"
          >
            {{ btn.text }}
          </el-button>
          <el-button
            v-if="btn.rules && btn.show(formData.id)"
            :size="btn.size || 'default'"
            :key="index + 1"
            :type="btn.type"
            :icon="btn.icon"
            :plain="btn.plain || false"
            @click="btnFn(btn)"
          >
            {{ btn.text }}
          </el-button>
        </template>
      </template>
      <template v-else-if="showText(item.value)">
        <span
          class="form-text"
          :style="{ color: colors[index + 1], marginRight: '1.82vw' }"
          v-for="(val, index) in item.value"
          :key="index"
        >
          {{ index !== item.value.length - 1 ? val.toFixed(3) + ',' : val.toFixed(3) }}
        </span>
      </template>
      <el-tooltip
        :content="item.value"
        placement="top"
        effect="dark"
        v-else-if="item.type === undefined"
      >
        <div class="form-text" :style="{ ...item.style }">
          {{ item.value }}
          <span
            v-if="item.suffix"
            style="display: inline-block; font-size: 1.04vw; padding-left: 0.26vw; color: #fff"
            >{{ item.suffix }}</span
          >
        </div>
      </el-tooltip>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = defineProps({
  formData: {
    type: Object,
    default: () => {
      return {
        id: 'demo',
        arr: []
      }
    }
  },
  rules: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
let formRef = {}
const setRef = el => {
  if (el) {
    formRef = el
  }
}
const validate = () => {
  return new Promise((resolve, reject) => {
    formRef.validate(valid => {
      if (valid) {
        resolve()
      } else {
        reject()
      }
    })
  })
}

const colors = {
  1: '#f56c6c',
  2: '#e6a23c',
  3: '#409eff',
  4: '#67c23a',
  5: '#909399'
}

const showText = value => {
  return value instanceof Array
}

const clearValidate = () => {
  formRef.clearValidate()
}
const searchForm = reactive({})
onMounted(() => {
  props.formData.arr &&
    props.formData.arr.map(item => {
      if (item.key) {
        if (item.default) {
          searchForm[item.key] = item.default
        } else {
          searchForm[item.key] = ''
        }
      }
    })
})
const btnFn = btn => {
  const form = {}
  if (btn.event === 'reset') {
    props.formData.arr.map(item => {
      if (item.key) {
        searchForm[item.key] = ''
      }
    })
    btn.fn(searchForm)
  } else {
    props.formData.arr.map(item => {
      if (item.key) {
        form[item.key] = item.format ? item.format(searchForm[item.key]) : searchForm[item.key]
      }
    })
    btn.fn(form, props.formData.id)
  }
}
defineExpose({
  searchForm,
  validate,
  clearValidate,
  resetForm: () => {
    props.formData.arr.map(item => {
      if (item.key) {
        searchForm[item.key] = ''
      }
    })
  }
})
</script>

<style lang="scss" scoped>
.search-form-container {
  background-color: transparent;
  :deep(.UJ-form-item__label) {
    min-width: auto;
    font-size: 24px;
    font-weight: 400;
    color: #fff;
  }
  :deep(.UJ-form-item__content) {
    line-height: normal;
    .UJ-input--default + span {
      margin-left: 0 !important;
    }
  }
  :deep(.UJ-checkbox__label) {
    font-size: 24px;
  }
  :deep(.UJ-form-item__error) {
    word-break: break-word;
  }
  :deep(.UJ-form-item) {
    margin-bottom: 16px;
    align-items: center;
    margin-right: 28px;
    .UJ-form-item__label {
      height: 40px;
      line-height: 40px;
      width: var(--label-minwidth);
    }
  }
  :deep(.UJ-checkbox__inner) {
    width: 20px !important;
    height: 20px;
  }
  :deep(.UJ-checkbox__inner::after) {
    border: 2px solid #fff;
    border-left: 0;
    border-top: 0;
    left: 5px;
    top: 5px;
  }
  :deep(.UJ-checkbox__input.is-checked .UJ-checkbox__inner::after) {
    transform: rotate(50deg) scaleY(1.3);
  }
  :deep(.UJ-date-editor) {
    --UJ-input-height: 56px;
    display: flex;
    align-items: center;
    margin-right: 16px;
    .UJ-range__icon {
      font-size: 21px;
    }
    .UJ-range-separator {
      font-size: 20px;
    }
  }
}
.input-width {
  box-sizing: border-box;
  width: 100%;
}
.transition {
  :deep(.UJ-select__caret) {
    transform: rotateZ(0deg) !important;
  }
}
.form-text {
  font-size: 24px;
  font-weight: 400;
  height: 100%;
  line-height: 1.6em;
  align-items: center;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ml-16 {
  margin-left: 30px;
}
</style>
