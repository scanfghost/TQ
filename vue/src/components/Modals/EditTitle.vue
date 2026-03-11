<template>
  <div v-if="visible" class="editTitle-wrapper">
    <div class="shadow-cover" @click="close"></div>
    <div class="modalCard">
      <div class="modal-content">
        <h3>编辑题目</h3>
        <form @submit.prevent="saveEdit">
          <div class="form-group">
            <label>题目内容</label>
            <textarea v-model="title" placeholder="输入题目内容"></textarea>
          </div>
          <div class="form-group">
            <label>题目解释</label>
            <textarea v-model="explanation" placeholder="输入题目解释"></textarea>
          </div>
          <div class="actions">
            <button type="button" class="cancel-btn" @click="close">取消</button>
            <button type="submit" class="confirm-btn">保存编辑</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '../../utils/api.js'

export default {
  name: 'EditTitle',
  setup() {
    const visible = ref(false)
    const questionId = ref('')
    const title = ref('')
    const explanation = ref('')

    const open = () => {
      visible.value = true
      loadTitleData()
    }

    const close = () => {
      visible.value = false
    }

    const loadTitleData = async () => {
      try {
        const response = await api.fetchProcessSerial()
        if (response.data.data && response.data.data.serial) {
          const qidResponse = await api.fetchQidBySerial(response.data.data.serial)
          if (qidResponse.data.data && qidResponse.data.data.currentQuestionId) {
            questionId.value = qidResponse.data.data.currentQuestionId
            const titleResponse = await api.fetchTitle(questionId.value)
            if (titleResponse.data.data.questionDto) {
              const questionDto = titleResponse.data.data.questionDto
              title.value = questionDto.title
              explanation.value = questionDto.explanation
            }
          }
        }
      } catch (error) {
      }
    }

    const saveEdit = async () => {
      try {
        await api.editTitle(questionId.value, title.value, explanation.value)
        const event = new CustomEvent('show-response-tip', {
          detail: {
            message: '题目编辑保存成功',
            duration: 2000
          }
        })
        window.dispatchEvent(event)
        
        // 触发题目刷新事件
        const refreshEvent = new CustomEvent('question-refresh')
        window.dispatchEvent(refreshEvent)
        
        close()
      } catch (error) {
      }
    }

    onMounted(() => {
      window.addEventListener('open-edit-title', open)
    })

    onUnmounted(() => {
      window.removeEventListener('open-edit-title', open)
    })

    return {
      visible,
      title,
      explanation,
      close,
      saveEdit
    }
  }
}
</script>

<style scoped>
.editTitle-wrapper {
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
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #666;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
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
