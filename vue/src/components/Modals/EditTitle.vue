<template>
  <div v-if="visible" class="editTitle-content modalCard">
    <div class="shadow-cover" @click="close"></div>
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
        <div class="form-group">
          <label>选项</label>
          <div v-for="(option, index) in options" :key="index" class="option-input">
            <input type="text" v-model="options[index]" placeholder="选项 {{ String.fromCharCode(65 + index) }}">
            <button type="button" class="remove-option" @click="removeOption(index)" v-if="options.length > 2">-</button>
          </div>
          <button type="button" class="add-option" @click="addOption">+ 添加选项</button>
        </div>
        <div class="form-group">
          <label>正确答案</label>
          <select v-model="correctAnswer">
            <option v-for="(option, index) in options" :key="index" :value="index">
              {{ String.fromCharCode(65 + index) }}
            </option>
          </select>
        </div>
        <div class="actions">
          <button type="button" class="cancel-btn" @click="close">取消</button>
          <button type="submit" class="confirm-btn">保存编辑</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'EditTitle',
  setup() {
    const visible = ref(false)
    const title = ref('')
    const explanation = ref('')
    const options = ref(['选项A', '选项B', '选项C', '选项D'])
    const correctAnswer = ref(0)

    const open = () => {
      visible.value = true
      // 这里可以加载当前题目的数据
      loadTitleData()
    }

    const close = () => {
      visible.value = false
    }

    const loadTitleData = () => {
      // 假设加载当前题目的数据
      title.value = '这是一道测试题目'
      explanation.value = '这是题目的详细解释'
      options.value = ['选项A', '选项B', '选项C', '选项D']
      correctAnswer.value = 0
    }

    const addOption = () => {
      options.value.push('新选项')
    }

    const removeOption = (index) => {
      if (options.value.length > 2) {
        options.value.splice(index, 1)
        if (correctAnswer.value >= options.value.length) {
          correctAnswer.value = options.value.length - 1
        }
      }
    }

    const saveEdit = () => {
      // 保存编辑
      console.log('保存编辑:', {
        title: title.value,
        explanation: explanation.value,
        options: options.value,
        correctAnswer: correctAnswer.value
      })
      // 触发保存成功提示
      const event = new CustomEvent('show-response-tip', {
        detail: {
          message: '题目编辑保存成功',
          duration: 2000
        }
      })
      window.dispatchEvent(event)
      close()
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
      options,
      correctAnswer,
      close,
      addOption,
      removeOption,
      saveEdit
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

.option-input {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.option-input input {
  flex: 1;
  margin-right: 0.5rem;
}

.remove-option,
.add-option {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.remove-option {
  background-color: #f44336;
  color: white;
  width: 30px;
}

.add-option {
  background-color: #4CAF50;
  color: white;
  margin-top: 0.5rem;
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
