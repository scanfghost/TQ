<template>
  <div v-if="visible" class="uploadPictureOfTitle-content modalCard">
    <div class="shadow-cover" @click="close"></div>
    <div class="modal-content">
      <h3>{{ title }}</h3>
      <form @submit.prevent="upload">
        <div class="selectSerialType">
          <label><input type="radio" name="serialType" value="append" v-model="serialType" required> <span>末尾追加</span></label>
          <label><input type="radio" name="serialType" value="replace" v-model="serialType" required> <span>替换</span></label>
          <label><input type="radio" name="serialType" value="priorInsert" v-model="serialType" required> <span>前插</span></label>
          <label><input type="radio" name="serialType" value="remove" v-model="serialType" required> <span>删除(可多选)</span></label>
        </div>
        <div class="imageQueue">
          <div v-if="selectedFile" class="file-preview">
            <img :src="selectedFileUrl" alt="预览" class="preview-img">
            <button type="button" class="remove-file" @click="removeFile">移除</button>
          </div>
          <input type="file" name="picture" id="inputPicture" @change="onFileChange" required>
        </div>
        <div class="actions">
          <button type="button" class="cancel-btn" @click="close">取消</button>
          <button type="submit" class="confirm-btn">确认</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'UploadPicture',
  setup() {
    const visible = ref(false)
    const type = ref('title')
    const serialType = ref('append')
    const selectedFile = ref(null)
    const selectedFileUrl = ref('')

    const title = computed(() => {
      return type.value === 'title' ? '设置题干图片' : '设置解释图片'
    })

    const open = (event) => {
      type.value = event.detail?.type || 'title'
      visible.value = true
      resetForm()
    }

    const close = () => {
      visible.value = false
      resetForm()
    }

    const resetForm = () => {
      serialType.value = 'append'
      selectedFile.value = null
      selectedFileUrl.value = ''
    }

    const onFileChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        selectedFile.value = file
        selectedFileUrl.value = URL.createObjectURL(file)
      }
    }

    const removeFile = () => {
      selectedFile.value = null
      selectedFileUrl.value = ''
      document.getElementById('inputPicture').value = ''
    }

    const upload = () => {
      // 这里可以实现文件上传逻辑
      console.log('上传图片:', {
        type: type.value,
        serialType: serialType.value,
        file: selectedFile.value
      })
      // 触发上传成功提示
      const event = new CustomEvent('show-response-tip', {
        detail: {
          message: '图片上传成功',
          duration: 2000
        }
      })
      window.dispatchEvent(event)
      close()
    }

    onMounted(() => {
      window.addEventListener('open-upload-picture', open)
    })

    onUnmounted(() => {
      window.removeEventListener('open-upload-picture', open)
    })

    return {
      visible,
      title,
      serialType,
      selectedFile,
      selectedFileUrl,
      close,
      onFileChange,
      removeFile,
      upload
    }
  }
}
</script>

<style scoped>
.modalCard {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.shadow-cover {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 400px;
  max-width: 90vw;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
}

.selectSerialType {
  margin-bottom: 1.5rem;
}

.selectSerialType label {
  display: block;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.imageQueue {
  margin-bottom: 1.5rem;
}

.file-preview {
  position: relative;
  margin-bottom: 1rem;
}

.preview-img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
}

.remove-file {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
}

input[type="file"] {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn, .confirm-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #333;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.confirm-btn {
  background-color: #4CAF50;
  color: white;
}

.confirm-btn:hover {
  background-color: #45a049;
}
</style>
