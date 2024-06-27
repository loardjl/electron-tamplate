<template>
  <div>
    <input type="file" @change="handleFileChange" v-show="false" />
    <el-button @click="uploadFile">上传</el-button>
  </div>
</template>

<script setup lang="js">
import { ref } from 'vue';
import { ElMessage } from 'element-plus'
import axios from 'axios';

const selectedFile = ref(null);

const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
};

const uploadFile = async () => {
  if (!selectedFile.value) {
    alert('请选择一个文件');
    return;
  }

  const formData = new FormData();
  formData.append('file', selectedFile.value);

  try {
    const response = await axios.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    ElMessage.success(response.data)
  } catch (error) {
    ElMessage.error(error.message)
  }
}
</script>
