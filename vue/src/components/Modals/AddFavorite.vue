<template>
  <div v-if="visible" class="addFavoriteTitle-content modalCard">
    <div class="shadow-cover" @click="close"></div>
    <div class="modal-content">
      <h3>加入收藏</h3>
      <form @submit.prevent="addFavorite">
        <div class="form-group">
          <label>收藏关键词</label>
          <input type="text" v-model="keywords" placeholder="添加收藏关键词(多个关键词请用逗号分隔)" required>
        </div>
        <div class="form-group">
          <label>收藏备注</label>
          <textarea v-model="comment" placeholder="添加收藏备注(可选)"></textarea>
        </div>
        <small>提示：关键词和备注用于搜索收藏的题目</small>
        <div class="actions">
          <button type="button" class="cancel-btn" @click="close">取消</button>
          <button type="submit" class="confirm-btn">加入收藏</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '../../utils/api.js'

export default {
  name: 'AddFavorite',
  setup() {
    const visible = ref(false)
    const keywords = ref('')
    const comment = ref('')

    const open = () => {
      visible.value = true
      resetForm()
    }

    const close = () => {
      visible.value = false
      resetForm()
    }

    const resetForm = () => {
      keywords.value = ''
      comment.value = ''
    }

    const addFavorite = async () => {
      try {
        // 假设当前题目ID为1
        const questionId = 1
        const response = await api.addFavorite(questionId, keywords.value, comment.value)
        if (response.data.data) {
          // 触发添加收藏成功提示
          const event = new CustomEvent('show-response-tip', {
            detail: {
              message: '添加收藏成功',
              duration: 2000
            }
          })
          window.dispatchEvent(event)
          close()
        }
      } catch (error) {
        console.error('添加收藏失败:', error)
        // 触发添加收藏失败提示
        const event = new CustomEvent('show-response-tip', {
          detail: {
            message: '添加收藏失败',
            duration: 2000
          }
        })
        window.dispatchEvent(event)
      }
    }

    onMounted(() => {
      window.addEventListener('open-add-favorite', open)
    })

    onUnmounted(() => {
      window.removeEventListener('open-add-favorite', open)
    })

    return {
      visible,
      keywords,
      comment,
      close,
      addFavorite
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
.form-group textarea {
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

small {
  display: block;
  margin-bottom: 1.5rem;
  color: #999;
  font-size: 0.8rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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
