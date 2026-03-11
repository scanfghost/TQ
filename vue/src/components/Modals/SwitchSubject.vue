<template>
  <div v-if="visible" class="switchSubject-wrapper">
    <div class="shadow-cover" @click="close"></div>
    <div class="modalCard">
      <div class="modal-content">
      <h3>选择科目与章节</h3>
      <div class="form-group">
        <label>科目</label>
        <select v-model="selectedSubject" @change="onSubjectChange">
          <option value="" disabled>-- 请选择 --</option>
          <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
            {{ subject.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>章节</label>
        <select v-model="selectedChapter" @change="onChapterChange" :disabled="!selectedSubject">
          <option value="" disabled>-- 请选择 --</option>
          <option v-for="chapter in chapters" :key="chapter.id" :value="chapter.id">
            {{ chapter.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>小节</label>
        <select v-model="selectedSection" :disabled="!selectedChapter">
          <option value="" disabled>-- 请选择 --</option>
          <option v-for="section in sections" :key="section.id" :value="section.id">
            {{ section.name }}
          </option>
        </select>
      </div>
      <div class="actions">
        <button class="cancel-btn" @click="close">取消</button>
        <button class="confirm-btn" @click="confirm">确认</button>
      </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '../../utils/api.js'

export default {
  name: 'SwitchSubject',
  setup() {
    const visible = ref(false)
    const selectedSubject = ref('')
    const selectedChapter = ref('')
    const selectedSection = ref('')
    
    const subjects = ref([])
    const chapters = ref([])
    const sections = ref([])

    const loadSubjects = async () => {
      try {
        const response = await api.fetchSubjectForm()
        if (response.data.data && response.data.data.subjectNames) {
          subjects.value = response.data.data.subjectNames.map((name, index) => ({
            id: name,
            name: name
          }))
        }
      } catch (error) {
      }
    }

    const loadChapters = async (subjectName) => {
      try {
        const response = await api.fetchChapterNames(subjectName)
        if (response.data.data && response.data.data.chapterNames) {
          chapters.value = response.data.data.chapterNames.map((name) => ({
            id: name,
            name: name
          }))
        }
      } catch (error) {
      }
    }

    const loadSections = async (chapterName) => {
      try {
        const response = await api.fetchSectionNames(chapterName)
        if (response.data.data && response.data.data.sectionNames) {
          sections.value = response.data.data.sectionNames.map((name) => ({
            id: name,
            name: name
          }))
        }
      } catch (error) {
      }
    }

    const open = async () => {
      visible.value = true
      await loadSubjects()
    }

    const close = () => {
      visible.value = false
      selectedSubject.value = ''
      selectedChapter.value = ''
      selectedSection.value = ''
      chapters.value = []
      sections.value = []
    }

    const onSubjectChange = async () => {
      selectedChapter.value = ''
      selectedSection.value = ''
      chapters.value = []
      sections.value = []
      if (selectedSubject.value) {
        await loadChapters(selectedSubject.value)
      }
    }

    const onChapterChange = async () => {
      selectedSection.value = ''
      sections.value = []
      if (selectedChapter.value) {
        await loadSections(selectedChapter.value)
      }
    }

    const confirm = async () => {
      if (!selectedSubject.value || !selectedChapter.value || !selectedSection.value) {
        return
      }
      
      try {
        const response = await api.modifyUserSubject(
          selectedSubject.value,
          selectedChapter.value,
          selectedSection.value
        )
        
        if (response.data.data && response.data.data.success) {
          const event = new CustomEvent('subject-changed', {
            detail: {
              subject: selectedSubject.value,
              chapter: selectedChapter.value,
              section: selectedSection.value
            }
          })
          window.dispatchEvent(event)
          
          const event2 = new CustomEvent('show-response-tip', {
            detail: {
              message: '切换成功',
              duration: 2000
            }
          })
          window.dispatchEvent(event2)
        }
        close()
      } catch (error) {
        const event = new CustomEvent('show-response-tip', {
          detail: {
            message: '切换失败: ' + (error.response?.data?.errMsg || error.message),
            duration: 2000
          }
        })
        window.dispatchEvent(event)
      }
    }

    onMounted(() => {
      window.addEventListener('open-switch-subject', open)
    })

    onUnmounted(() => {
      window.removeEventListener('open-switch-subject', open)
    })

    return {
      visible,
      selectedSubject,
      selectedChapter,
      selectedSection,
      subjects,
      chapters,
      sections,
      close,
      onSubjectChange,
      onChapterChange,
      confirm
    }
  }
}
</script>

<style scoped>
.switchSubject-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.shadow-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modalCard {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  width: 400px;
  max-width: 90%;
  padding: 20px;
}

.modal-content h3 {
  margin: 0 0 20px 0;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group select:disabled {
  background-color: #f5f5f5;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.cancel-btn, .confirm-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
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
