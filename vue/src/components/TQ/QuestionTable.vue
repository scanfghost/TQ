<template>
  <div class="question-table">
    <div class="question-grid">
      <div 
        v-for="(item, index) in questions" 
        :key="index"
        :id="`serial${item.id || index + 1}`"
        class="question-item"
        :class="tableClasses[index]"
        @click="goToQuestion(index, item.id)"
      >
        {{ item.serial }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import api from '../../utils/api.js'

export default {
  name: 'QuestionTable',
  props: {
    settings: {
      type: Object,
      default: () => ({})
    },
    serial: {
      type: Number,
      default: 1
    }
  },
  setup(props) {
    const questions = ref([])
    const currentSerial = ref(1)
    const tableClasses = computed(() => {
      return loadTableClasses()
    })

    const loadTableClasses = () => {
      let classes = []
     
      for(let i = 0; i < questions.value.length; i++){
        const item = questions.value[i]
        classes[i] = {}
        classes[i].current = props.serial === item.serial
        if (props.settings.instantJudge && item.userOption) {
          classes[i].right = item.isCorrect === true || item.isCorrect == 1
          classes[i].wrong = !classes[i].right
        }else if(item.userOption){
          classes[i].answered = true
        }
      }
        
      return classes
    }
    
    const loadQuestions = async () => {
      console.log('loadQuestions')
      try {
        const response = await api.getTableData()
        if (response.data.data) {
          const { pageList, instantJudge } = response.data.data
          questions.value = pageList.map((item, index) => {
            const isCorrect = item.isCorrect
            return {
              id: item.id,
              serial: item.serial,
              userOption: item.userOption,
              isCorrect: isCorrect,
              class: !instantJudge ? item.userOption ? 'answered' : '' : isCorrect == undefined ? '' : (isCorrect === true || isCorrect == 1 ? 'right' : 'wrong')
            }
          })
        }
      } catch (error) {
        questions.value = []
      }
    }

    const goToQuestion = (index, questionId) => {
      console.log('goToQuestion', index, questionId)
      currentSerial.value = index + 1
      // 触发跳转到指定题目
      const event = new CustomEvent('go-to-question', {
        detail: { serial: currentSerial.value, questionId }
      })
      window.dispatchEvent(event)
      // 更新当前进度
      api.updateProcessSerial(currentSerial.value)
    }

    // 监听题目列表刷新事件
    const handleQuestionListRefresh = () => {
      console.log('handleQuestionListRefresh')
      loadQuestions()
    }

    // 监听科目切换事件
    const handleSubjectChanged = () => {
      console.log('handleSubjectChanged')
      initLoad()
    }

    const initLoad = async () => {
      console.log('initLoad')
      try {
        const response = await api.fetchProcessSerial()
        if (response.data.data && response.data.data.serial) {
          console.log('response.data.data.serial', response.data.data.serial)
          currentSerial.value = response.data.data.serial
          loadQuestions()
        }
      } catch (error) {
        currentSerial.value = 1
        console.error('获取当前进度失败:', error)
      }
    }

    // 监听题目回答事件
    const handleQuestionAnswered = (event) => {
      console.log('handleQuestionAnswered')
      const { question, index } = event.detail
      const classToAdd = question.isCorrect === true || question.isCorrect == 1 ? 'right' : 'wrong'
      if (questions.value[index]) {
        questions.value[index] = {
          ...questions.value[index],
          userOption: question.userOption,
          isCorrect: question.isCorrect,
          class: classToAdd
        }
      }
      
    }

    watch(() => props.settings, (newSettings) => {
      console.log('newSettings')
      if (newSettings.instantJudge) {
        questions.value.forEach(item => {
          item.class = item.userOption ? (item.isCorrect === true || item.isCorrect == 1 ? 'right' : 'wrong') : ''
        })
      }else{
        questions.value.forEach(item => {
          item.class = item.userOption ? 'answered' : ''
        })
      }
    }, { deep: true, immediate: true})

    watch(() => props.serial, (newSerial) => {
      console.log('newSerial')
      if (newSerial) {
        currentSerial.value = newSerial
      }
    })

    onMounted(async () => {
      console.log('onMounted')
      await initLoad()
      window.addEventListener('question-list-refresh', handleQuestionListRefresh)
      window.addEventListener('subject-changed', handleSubjectChanged)
      window.addEventListener('question-answered', handleQuestionAnswered)
    })

    onUnmounted(() => {
      console.log('onUnmounted')
      window.removeEventListener('question-list-refresh', handleQuestionListRefresh)
      window.removeEventListener('subject-changed', handleSubjectChanged)
      window.removeEventListener('question-answered', handleQuestionAnswered)
    })

    return {
      questions,
      currentSerial,
      goToQuestion,
      tableClasses
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
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.question-item {
  min-width: 40px;
  max-width: 60px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  padding: 0.5rem;
}

.question-item:hover {
  background-color: #f0f0f0;
  border-color: #4CAF50;
}

.question-item.current {
  box-shadow: 2.5px 2.5px 3px 2px #787777;
  border-color: #dddddd93;
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
  background-color: #cbcbcb;
  border-color: #cecece;
}
</style>
