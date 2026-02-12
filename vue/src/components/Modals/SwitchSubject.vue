<template>
  <div v-if="visible" class="switchSubject-content modalCard">
    <div class="shadow-cover" @click="close"></div>
    <div class="modal-content">
      <h3>选择科目与章节</h3>
      <div class="form-group">
        <label>科目</label>
        <select v-model="selectedSubject" @change="onSubjectChange">
          <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
            {{ subject.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>章节</label>
        <select v-model="selectedChapter" @change="onChapterChange">
          <option v-for="chapter in chapters" :key="chapter.id" :value="chapter.id">
            {{ chapter.name }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label>小节</label>
        <select v-model="selectedSection">
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
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'SwitchSubject',
  setup() {
    const visible = ref(false)
    const selectedSubject = ref('')
    const selectedChapter = ref('')
    const selectedSection = ref('')
    
    const subjects = ref([
      { id: '1', name: '数学' },
      { id: '2', name: '语文' },
      { id: '3', name: '英语' }
    ])
    
    const chapters = ref([
      { id: '1', name: '第一章', subjectId: '1' },
      { id: '2', name: '第二章', subjectId: '1' }
    ])
    
    const sections = ref([
      { id: '1', name: '第一节', chapterId: '1' },
      { id: '2', name: '第二节', chapterId: '1' }
    ])

    const open = () => {
      visible.value = true
    }

    const close = () => {
      visible.value = false
    }

    const onSubjectChange = () => {
      // 根据选择的科目过滤章节
      selectedChapter.value = ''
      selectedSection.value = ''
    }

    const onChapterChange = () => {
      // 根据选择的章节过滤小节
      selectedSection.value = ''
    }

    const confirm = () => {
      // 确认选择
      const event = new CustomEvent('subject-changed', {
        detail: {
          subject: selectedSubject.value,
          chapter: selectedChapter.value,
          section: selectedSection.value
        }
      })
      window.dispatchEvent(event)
      close()
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

.form-group select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
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
