<template>
  <div v-if="visible" class="uploadPicture-wrapper">
    <div class="shadow-cover" @click="close"></div>
    <div class="modalCard">
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
            <div v-if="existingImages.length > 0" class="existing-images">
              <p class="queue-label">已有图片（点击选择）：</p>
              <div class="image-list">
                <div 
                  v-for="(img, index) in existingImages" 
                  :key="index"
                  class="image-queue-item"
                  :class="{ selected: selectedImages.includes(img.fileName) }"
                  @click="toggleImageSelection(img.fileName)"
                >
                  <img :src="baseUrl + '/assets/img/' + img.fileName" :alt="'图片 ' + (index + 1)">
                </div>
              </div>
            </div>
            
            <div v-if="selectedFile" class="file-preview">
              <p class="queue-label">新选择的图片：</p>
              <img :src="selectedFileUrl" alt="预览" class="preview-img">
              <button type="button" class="remove-file" @click="removeFile">移除</button>
            </div>
            
            <div class="upload-section">
              <p class="queue-label">上传新图片：</p>
              <input type="file" name="picture" id="inputPicture" @change="onFileChange" accept="image/*">
            </div>
          </div>
          
          <div class="actions">
            <button type="button" class="cancel-btn" @click="close">取消</button>
            <button type="submit" class="confirm-btn" :disabled="!canSubmit">确认</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '../../utils/api.js'

export default {
  name: 'UploadPicture',
  setup() {
    const baseUrl = import.meta.env.VITE_SERVER_URL
    const visible = ref(false)
    const type = ref('title')
    const serialType = ref('append')
    const selectedFile = ref(null)
    const selectedFileUrl = ref('')
    const existingImages = ref([])
    const selectedImages = ref([])
    const currentQuestionId = ref('')
    const currentQuestion = ref(null)

    const title = computed(() => {
      return type.value === 'title' ? '设置题干图片' : '设置解释图片'
    })

    const canSubmit = computed(() => {
      if (serialType.value === 'append') {
        return selectedFile.value !== null
      } else if (serialType.value === 'remove') {
        return selectedImages.value.length > 0
      } else {
        return (selectedImages.value.length === 1 || (serialType.value === 'append' && selectedFile.value))
      }
    })

    const open = async (event) => {
      type.value = event.detail?.type || 'title'
      visible.value = true
      resetForm()
      await loadExistingImages()
    }

    const close = () => {
      visible.value = false
      resetForm()
    }

    const resetForm = () => {
      serialType.value = 'append'
      selectedFile.value = null
      selectedFileUrl.value = ''
      existingImages.value = []
      selectedImages.value = []
    }

    const loadExistingImages = async () => {
      try {
        const questionId = await getCurrentQuestionId()
        if (!questionId) return
        
        currentQuestionId.value = questionId
        const imgType = type.value === 'title' ? 'title' : 'explanation'
        const response = await api.fetchAllTypeImage(questionId, imgType)
        
        if (response.data.data && response.data.data.imageDtoList) {
          existingImages.value = response.data.data.imageDtoList
        }
      } catch (error) {
        console.error('加载已有图片失败:', error)
      }
    }

    const getCurrentQuestionId = async () => {
      try {
        const response = await api.fetchProcessSerial()
        if (response.data.data && response.data.data.serial) {
          const qidResponse = await api.fetchQidBySerial(response.data.data.serial)
          if (qidResponse.data.data && qidResponse.data.data.currentQuestionId) {
            return qidResponse.data.data.currentQuestionId
          }
        }
      } catch (error) {
        console.error('getCurrentQuestionId:', error)
      }
    }

    const toggleImageSelection = (fileName) => {
      const index = selectedImages.value.indexOf(fileName)
      if (index === -1) {
        if (serialType.value === 'replace' || serialType.value === 'priorInsert') {
          selectedImages.value = [fileName]
        } else {
          selectedImages.value.push(fileName)
        }
      } else {
        selectedImages.value.splice(index, 1)
      }
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

    const upload = async () => {
      const formData = new FormData()
      formData.append('_id', currentQuestionId.value)
      formData.append('type', type.value)
      formData.append('serialType', serialType.value)

      if (serialType.value === 'replace' || serialType.value === 'priorInsert') {
        if (selectedImages.value.length > 0) {
          formData.append('imageAnchorName', selectedImages.value[0])
        }
      } else if (serialType.value === 'remove') {
        selectedImages.value.forEach(fileName => {
          formData.append('fileNameList', fileName)
        })
      }

      if (selectedFile.value) {
        formData.append('picture', selectedFile.value)
      }

      try {
        const response = await api.editImage(formData)
        
        const event = new CustomEvent('show-response-tip', {
          detail: {
            message: '操作成功, 即将刷新',
            duration: 2000
          }
        })
        window.dispatchEvent(event)
        
        setTimeout(() => {
          window.location.reload()
        }, 2500)
        
        close()
      } catch (error) {
        console.error('上传图片失败:', error)
        const event = new CustomEvent('show-response-tip', {
          detail: {
            message: '操作失败: ' + (error.response?.data?.errMsg || error.message),
            duration: 4000
          }
        })
        window.dispatchEvent(event)
      }
    }

    onMounted(() => {
      window.addEventListener('open-upload-picture', open)
    })

    onUnmounted(() => {
      window.removeEventListener('open-upload-picture', open)
    })

    return {
      baseUrl,
      visible,
      title,
      serialType,
      selectedFile,
      selectedFileUrl,
      existingImages,
      selectedImages,
      canSubmit,
      close,
      toggleImageSelection,
      onFileChange,
      removeFile,
      upload
    }
  }
}
</script>

<style scoped>
.uploadPicture-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

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
  min-width: 500px;
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
  display: inline-block;
  margin-right: 1rem;
  cursor: pointer;
}

.imageQueue {
  margin-bottom: 1.5rem;
}

.queue-label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #666;
}

.existing-images {
  margin-bottom: 1.5rem;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.image-queue-item {
  position: relative;
  width: 100px;
  height: 100px;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s ease;
}

.image-queue-item:hover {
  border-color: #4CAF50;
}

.image-queue-item.selected {
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px #4CAF50;
}

.image-queue-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.file-preview {
  position: relative;
  margin-bottom: 1rem;
  display: inline-block;
}

.preview-img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
}

.remove-file {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
}

.upload-section {
  margin-top: 1rem;
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

.confirm-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
