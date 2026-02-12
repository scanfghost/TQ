<template>
  <div class="question-table">
    <div class="question-grid">
      <div 
        v-for="(item, index) in questions" 
        :key="index"
        :id="`serial${item.id || index + 1}`"
        class="question-item"
        :class="{
          'answered': item.userOption !== undefined,
          'current': currentIndex === index,
          'right': item.isCorrect,
          'wrong': item.userOption !== undefined && !item.isCorrect
        }"
        @click="goToQuestion(index)"
      >
        {{ index + 1 }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import api from '../../utils/api.js'

export default {
  name: 'QuestionTable',
  setup() {
    const questions = ref([])
    const currentIndex = ref(0)

    const loadQuestions = async () => {
      try {
        const response = await api.getQuestions()
        questions.value = response.data?.data || []
      } catch (error) {
        console.error('加载题目失败:', error)
        questions.value = []
      }
    }

    const goToQuestion = (index) => {
      currentIndex.value = index
      // 触发跳转到指定题目
      const event = new CustomEvent('go-to-question', {
        detail: { index }
      })
      window.dispatchEvent(event)
    }

    onMounted(() => {
      loadQuestions()
    })

    return {
      questions,
      currentIndex,
      goToQuestion
    }
  }
}
</script>

<style scoped>
.question-table {
  background-color: #fff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.question-item {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.question-item:hover {
  background-color: #f0f0f0;
  border-color: #4CAF50;
}

.question-item.current {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
  font-weight: bold;
}

.question-item.right {
  background-color: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.question-item.wrong {
  background-color: #f44336;
  color: white;
  border-color: #f44336;
}

.question-item.answered {
  background-color: #e8f5e9;
  border-color: #4CAF50;
}
</style>
