<template>
  <div class="title-choice">
    <div class="title-content" v-if="question">
      <h3>{{ currentIndex + 1 }}. {{ question.title }}</h3>
      <div class="options">
        <div 
          v-for="(option, index) in question.options" 
          :key="index"
          class="option"
          :class="{ 'selected': selectedOption === index }"
          @click="selectOption(index)"
        >
          {{ String.fromCharCode(65 + index) }}. {{ option }}
        </div>
      </div>
      <div class="actions">
        <button 
          class="prev-btn" 
          @click="prevQuestion"
          :disabled="currentIndex === 0"
        >
          上一题
        </button>
        <button 
          class="next-btn" 
          @click="nextQuestion"
          :disabled="currentIndex === questions.length - 1"
        >
          下一题
        </button>
      </div>
    </div>
    <div v-else class="loading">
      加载中...
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../../utils/api.js'

export default {
  name: 'TitleChoice',
  emits: ['question-change'],
  setup(props, { emit }) {
    const questions = ref([])
    const currentIndex = ref(0)
    const selectedOption = ref(null)

    const question = computed(() => {
      if (!questions.value || questions.value.length === 0) {
        return null
      }
      return questions.value[currentIndex.value]
    })

    const loadQuestions = async () => {
      try {
        const response = await api.getQuestions()
        questions.value = response.data?.data || []
        // 加载完成后通知父组件
        if (questions.value.length > 0) {
          emit('question-change', questions.value[0], 0)
        }
      } catch (error) {
        console.error('加载题目失败:', error)
        questions.value = []
      }
    }

    const selectOption = async (index) => {
      selectedOption.value = index
      // 保存答案
      if (questions.value[currentIndex.value]) {
        questions.value[currentIndex.value].userOption = index
        
        try {
          // 提交答案到服务器
          const response = await api.submitChoice(
            questions.value[currentIndex.value].id,
            [[index]] // 适配旧API格式
          )
          
          // 处理响应
          if (response.data.answer === 'right') {
            questions.value[currentIndex.value].isCorrect = true
          } else if (response.data.answer === 'wrong') {
            questions.value[currentIndex.value].isCorrect = false
          }
        } catch (error) {
          console.error('提交答案失败:', error)
        }
      }
    }

    const prevQuestion = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--
        selectedOption.value = questions.value[currentIndex.value]?.userOption || null
        // 通知父组件题目切换
        emit('question-change', questions.value[currentIndex.value], currentIndex.value)
      }
    }

    const nextQuestion = () => {
      if (currentIndex.value < questions.value.length - 1) {
        currentIndex.value++
        selectedOption.value = questions.value[currentIndex.value]?.userOption || null
        // 通知父组件题目切换
        emit('question-change', questions.value[currentIndex.value], currentIndex.value)
      }
    }

    // 监听question变化，通知父组件
    watch(question, (newQuestion) => {
      if (newQuestion) {
        emit('question-change', newQuestion, currentIndex.value)
      }
    })

    onMounted(() => {
      loadQuestions()
      // 监听跳转到指定题目的事件
      window.addEventListener('go-to-question', async (event) => {
        const { index } = event.detail
        if (index >= 0 && index < questions.value.length) {
          currentIndex.value = index
          selectedOption.value = questions.value[index]?.userOption || null
          
          try {
            // 获取题目详情
            const questionId = questions.value[index].id
            const response = await api.fetchTitle(questionId)
            
            // 这里可以根据API返回的数据更新题目内容
            // 如果需要的话
          } catch (error) {
            console.error('获取题目详情失败:', error)
          }
          
          emit('question-change', questions.value[index], index)
        }
      })
    })

    return {
      questions,
      currentIndex,
      selectedOption,
      question,
      selectOption,
      prevQuestion,
      nextQuestion
    }
  }
}
</script>

<style scoped>
.title-choice {
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.title-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.2rem;
  line-height: 1.4;
}

.options {
  margin-bottom: 2rem;
}

.option {
  padding: 1rem;
  margin-bottom: 0.8rem;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option:hover {
  background-color: #f0f0f0;
  border-color: #4CAF50;
}

.option.selected {
  background-color: #e8f5e9;
  border-color: #4CAF50;
  color: #2e7d32;
}

.actions {
  display: flex;
  justify-content: space-between;
}

.prev-btn, .next-btn {
  padding: 0.8rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.prev-btn:hover, .next-btn:hover {
  background-color: #45a049;
}

.prev-btn:disabled, .next-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 1.2rem;
  color: #666;
}
</style>
