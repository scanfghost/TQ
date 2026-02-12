<template>
  <div v-if="visible" class="setting-content modalCard">
    <div class="shadow-cover" @click="close"></div>
    <div class="modal-content">
      <h3>偏好设置</h3>
      <div class="form-group">
        <label class="switch">
          <input type="checkbox" v-model="settings.instantJudge">
          <span class="slider round"></span>
          即时评判
        </label>
      </div>
      <div class="form-group">
        <label>题目数量</label>
        <input type="number" v-model="settings.questionCount" min="1" max="100">
      </div>
      <div class="form-group">
        <label>答题模式</label>
        <select v-model="settings.answerMode">
          <option value="single">单选题</option>
          <option value="multiple">多选题</option>
          <option value="mixed">混合模式</option>
        </select>
      </div>
      <div class="actions">
        <button class="cancel-btn" @click="close">取消</button>
        <button class="confirm-btn" @click="saveSettings">保存设置</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '../../utils/api.js'

export default {
  name: 'Setting',
  setup() {
    const visible = ref(false)
    const settings = ref({
      instantJudge: true,
      questionCount: 10,
      answerMode: 'single'
    })

    const open = () => {
      visible.value = true
      loadSettings()
    }

    const close = () => {
      visible.value = false
    }

    const loadSettings = async () => {
      try {
        const response = await api.getUserSetting()
        if (response.data.data) {
          settings.value = { ...settings.value, ...response.data.data }
        }
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    }

    const saveSettings = async () => {
      try {
        const response = await api.updateUserSetting(settings.value)
        if (response.data.data) {
          // 触发保存成功提示
          const event = new CustomEvent('show-response-tip', {
            detail: {
              message: '设置保存成功',
              duration: 2000
            }
          })
          window.dispatchEvent(event)
          close()
        }
      } catch (error) {
        console.error('保存设置失败:', error)
        // 触发保存失败提示
        const event = new CustomEvent('show-response-tip', {
          detail: {
            message: '保存设置失败',
            duration: 2000
          }
        })
        window.dispatchEvent(event)
      }
    }

    onMounted(() => {
      window.addEventListener('open-setting', open)
    })

    onUnmounted(() => {
      window.removeEventListener('open-setting', open)
    })

    return {
      visible,
      settings,
      close,
      saveSettings
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
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #666;
}

.form-group input[type="number"],
.form-group select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #4CAF50;
}

input:focus + .slider {
  box-shadow: 0 0 1px #4CAF50;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
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
