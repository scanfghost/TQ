<template>
  <div class="title-choice">
    <div class="title-content" v-if="question">
      <h3><span>{{ currentSerial }}. </span><span class="title-text">{{ question.title }}</span></h3>

      <!-- 题干图片 -->
      <div class="titleImg-content" v-if="question.titleImgs && question.titleImgs.length > 0">
        <img v-for="(img, index) in question.titleImgs" :key="index" :src="baseUrl + '/assets/img/' + img.fileName"
          class="title-img" />
      </div>

      <!-- 单空单选 -->
      <div class="options" v-if="question.type === 'choice'">
        <div v-for="(option, index) in question.options" :key="index" class="option" :class="optionsClass[index]"
          @click="selectOption(index)">
          {{ String.fromCharCode(65 + index) }}. {{ option }}
        </div>
      </div>

      <!-- 单空多选 -->
      <div class="options" v-else-if="question.type === 'multiple_choice'">
        <div v-for="(option, index) in question.options" :key="index" class="option" :class="{
          'selected': (question.userOption ? question.userOption.includes(index) : selectedOptions.includes(index)),
          'correct': (question.isCorrect == true || question.isCorrect === 1) && (question.userOption ? question.userOption.includes(index) : selectedOptions.includes(index)),
          'wrong': (question.isCorrect == false || question.isCorrect === 0) && (question.userOption ? question.userOption.includes(index) : selectedOptions.includes(index)),
          'disabled': question.userOption !== undefined && question.userOption !== null && question.userOption !== ''
        }" @click="toggleOption(index)">
          {{ String.fromCharCode(65 + index) }}. {{ option }}
        </div>
        <button class="submit-btn" @click="submitMultipleChoice"
          :disabled="selectedOptions.length === 0 || (question.userOption !== undefined && question.userOption !== null && question.userOption !== '')">
          提交答案
        </button>
      </div>

      <!-- 多空单选 -->
      <div class="options" v-else-if="question.type === 'multiple_blank'">
        <div v-for="(group, groupIndex) in question.optionGroups" :key="groupIndex" class="option-group">
          <h4>第 {{ groupIndex + 1 }} 空</h4>
          <div v-for="(option, index) in group" :key="index" class="option" :class="{
            'selected': (question.userOption ? question.userOption[groupIndex] === index : multiBlankAnswers[groupIndex] === index),
            'correct': (question.isCorrect == true || question.isCorrect === 1) && (question.userOption ? question.userOption[groupIndex] === index : multiBlankAnswers[groupIndex] === index),
            'wrong': (question.isCorrect == false || question.isCorrect === 0) && (question.userOption ? question.userOption[groupIndex] === index : multiBlankAnswers[groupIndex] === index),
            'disabled': question.userOption !== undefined && question.userOption !== null && question.userOption !== ''
          }" @click="selectMultiBlankOption(groupIndex, index)">
            {{ String.fromCharCode(65 + index) }}. {{ option }}
          </div>
        </div>
        <button class="submit-btn" @click="submitMultiBlankChoice"
          :disabled="!allMultiBlankAnswered || (question.userOption !== undefined && question.userOption !== null && question.userOption !== '')">
          提交答案
        </button>
      </div>

      <div class="actions">
        <button class="prev-btn" @click="prevQuestion" :disabled="currentSerial === 1">
          上一题
        </button>
        <button class="next-btn" @click="nextQuestion" :disabled="currentSerial >= totalQuestions ">
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import api from '../../utils/api.js'

export default {
  name: 'TitleChoice',
  props: {
    totalQuestions: {
      type: Number,
      default: 0
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { emit }) {
    const baseUrl = import.meta.env.VITE_SERVER_URL
    const currentSerial = ref(-1)
    const selectedOption = ref(null)
    const selectedOptions = ref([])
    const multiBlankAnswers = ref([])
    const question = ref(null)
    const optionsClass = computed(() => {
      console.log('computed optionsClass')
      let classes = []

      if (question.value?.userOption == undefined ||
        question.value?.userOption == null ||
        question.value?.userOption == '') {
        return classes
      }

      if (question.value?.type === 'choice')  {
        const userOptionIndex = question.value?.userOption[0][0]
        if (userOptionIndex !== undefined) {
          for (let i = 0; i < question.value?.options.length; i++) {
            classes[i] = {}
            classes[i].disabled = true
          }
          if (!props.settings?.instantJudge) {
            classes[userOptionIndex].selected = true
          }else{
            classes[userOptionIndex].correct = question.value?.isCorrect == true || question.value?.isCorrect === 1
            classes[userOptionIndex].wrong = question.value?.isCorrect == false || question.value?.isCorrect === 0
          }
        }
      } else if (question.value?.type === 'multiple_choice') {
      } else if (question.value?.type === 'multiple_blank') {
      }
      
      return classes
    })

    // 检查是否所有多空都已回答
    const allMultiBlankAnswered = computed(() => {
      if (!question.value || question.value.type !== 'multiple_blank') {
        return false
      }
      return multiBlankAnswers.value.length === question.value.optionGroups.length
    })

    // 加载题目详情
    const loadQuestionDetail = async (questionId) => {
      console.log('loadQuestionDetail')
      try {
        const response = await api.fetchTitle(questionId)
        if (response.data.data.questionDto) {
          const questionDto = response.data.data.questionDto
          
          question.value = {
            id: questionId,
            title: questionDto.title?.replace(/\\n/g, '\n'),
            type: questionDto.type,
            options: questionDto.choice?.options || [],
            optionGroups: questionDto.choice?.optionGroups || [],
            answer: questionDto.choice?.rightOption || [],
            analysis: questionDto.explanation || '',
            titleImgs: questionDto.titleImgs || [],
            userOption: questionDto.choice?.useranswer?.userOption,
            isCorrect: questionDto.choice?.useranswer?.isCorrect,
            serial: questionDto.serial || -1,
          }
          // 初始化选中状态
          if (question.value.userOption) {
            if (questionDto.type === 'choice') {
              selectedOption.value = question.value.userOption[0][0]
            } else if (questionDto.type === 'multiple_choice') {
              selectedOptions.value = question.value.userOption
            } else if (questionDto.type === 'multiple_blank') {
              multiBlankAnswers.value = question.value.userOption
            }
          }

          // 渲染LaTeX公式
          setTimeout(() => {
            if (window.MathJax && window.MathJax.typesetPromise) {
              window.MathJax.typesetPromise()
            }
          }, 100);
          
          currentSerial.value = question.value.serial

          // 通知父组件题目加载完成
          emit('update:question', question.value)
          emit('update:serial', question.value.serial)
        }
      } catch (error) {
      }
    }

    // 单空单选
    const selectOption = async (index) => {
      console.log('selectOption')
      selectedOption.value = index

      // 如果题目已完成，不允许修改，直接返回
      if (question.value.userOption !== undefined &&
        question.value.userOption !== null &&
        question.value.userOption !== '') {
        return
      }

      if (question.value) {
        question.value.userOption = [[index]]

        try {
          // 提交答案到服务器
          const response = await api.submitChoice(
            question.value.id,
            [[index]]
          )
          // 处理响应
          if (response.data.data.answer === 'right') {
            question.value.isCorrect = true
          } else if (response.data.data.answer === 'wrong') {
            question.value.isCorrect = false
          }

          // 如果返回了题目详情，更新题目数据
          if (response.data.data.questionDto) {
            question.value = {
              ...question.value,
              analysis: response.data.data.questionDto.explanation || '',
            }
          }
          
          // 通知父组件题目变化
          window.dispatchEvent(new CustomEvent('question-answered', {
            detail: { question: question.value, index: currentSerial.value - 1 }
          }))

          window.dispatchEvent(new CustomEvent('open-answer'))
        } catch (error) {
        }
      }
    }

    // 单空多选 - 切换选项
    const toggleOption = (index) => {
      console.log('toggleOption')
      // 如果题目已完成，不允许修改
      if (question.value.userOption !== undefined &&
        question.value.userOption !== null &&
        question.value.userOption !== '') {
        return
      }

      const optionIndex = selectedOptions.value.indexOf(index)
      if (optionIndex > -1) {
        selectedOptions.value.splice(optionIndex, 1)
      } else {
        selectedOptions.value.push(index)
      }
    }

    // 单空多选 - 提交答案
    const submitMultipleChoice = async () => {
      console.log('submitMultipleChoice')
      if (selectedOptions.value.length === 0) return

      if (question.value) {
        question.value.userOption = selectedOptions.value

        try {
          const response = await api.submitChoice(
            question.value.id,
            selectedOptions.value
          )

          if (response.data.answer === 'right') {
            question.value.isCorrect = true
          } else if (response.data.answer === 'wrong') {
            question.value.isCorrect = false
          }

          // 通知父组件题目变化
          emit('update:question', question.value)
        } catch (error) {
        }
      }
    }

    // 多空单选 - 选择选项
    const selectMultiBlankOption = (groupIndex, index) => {
      console.log('selectMultiBlankOption')
      // 如果题目已完成，不允许修改
      if (question.value.userOption !== undefined &&
        question.value.userOption !== null &&
        question.value.userOption !== '') {
        return
      }

      question.value.userOption[groupIndex] = [index]
    }

    // 多空单选 - 提交答案
    const submitMultiBlankChoice = async () => {
      console.log('submitMultiBlankChoice') 
      if (!allMultiBlankAnswered.value) return

      if (question.value) {
        question.value.userOption = multiBlankAnswers.value

        try {
          const response = await api.submitChoice(
            question.value.id,
            multiBlankAnswers.value
          )

          if (response.data.answer === 'right') {
            question.value.isCorrect = true
          } else if (response.data.answer === 'wrong') {
            question.value.isCorrect = false
          }

          // 通知父组件题目变化
          emit('update:question', question.value)
        } catch (error) {
        }
      }
    }

    const prevQuestion = async () => {
      if (currentSerial.value >= 2) {
        currentSerial.value--
         const qidResponse = await api.fetchQidBySerial(currentSerial.value)
          if (qidResponse.data.data && qidResponse.data.data.currentQuestionId) {
            resetSelection()
            await loadQuestionDetail(qidResponse.data.data.currentQuestionId)
            emit('update:serial', currentSerial.value)
            api.updateProcessSerial(currentSerial.value)
          }
      }
    }

    const nextQuestion = async () => {
      if (currentSerial.value < props.totalQuestions) {
        currentSerial.value++
         const qidResponse = await api.fetchQidBySerial(currentSerial.value)
          if (qidResponse.data.data && qidResponse.data.data.currentQuestionId) {
            resetSelection()
            await loadQuestionDetail(qidResponse.data.data.currentQuestionId)
            emit('update:serial', currentSerial.value)
            api.updateProcessSerial(currentSerial.value)
          }
      }
    }

    // 重置选中状态
    const resetSelection = () => {
      selectedOption.value = null
      selectedOptions.value = []
      multiBlankAnswers.value = []
    }

    // 监听question变化，通知父组件
    watch(question, (newQuestion) => {
      console.log('watch question')
      if (newQuestion) {
        // 初始化选中状态
        if (newQuestion.userOption) {
          if (newQuestion.type === 'choice') {
            selectedOption.value = newQuestion.userOption[0][0]
          } else if (newQuestion.type === 'multiple_choice') {
            selectedOptions.value = newQuestion.userOption
          } else if (newQuestion.type === 'multiple_blank') {
            multiBlankAnswers.value = newQuestion.userOption
          }
        }
        
      }
    })

    const resetQuestion = () => {
      question.value = {}
    }

    const handleGoToQuestion = async (event) => {
      console.log('handleGoToQuestion')
      const { serial, questionId } = event.detail
      currentSerial.value = serial
      resetSelection()
      resetQuestion()
      await loadQuestionDetail(questionId) 
      emit('update:question', question.value)
    }

    const handleSubjectChanged = async (event) => {
      console.log('handleSubjectChanged')
      await initLoad()
    }

    const handleQuestionRefresh = async () => {
      console.log('handleQuestionRefresh')
      if (question.value && question.value.id) {
        await loadQuestionDetail(question.value.id)
      }
    } 

    const initLoad = async () => {
      console.log('initLoad')
      try {
        const response = await api.fetchProcessSerial()
        if (response.data.data && response.data.data.serial) {
          currentSerial.value = response.data.data.serial
          const qidResponse = await api.fetchQidBySerial(response.data.data.serial)
          if (qidResponse.data.data && qidResponse.data.data.currentQuestionId) {
            resetSelection()
            await loadQuestionDetail(qidResponse.data.data.currentQuestionId)
          }
        }
      } catch (error) {
        currentSerial.value = 1
        console.error('获取当前进度失败:', error)
      }
    }



    onMounted(async () => {
      console.log('onMounted')
      await initLoad()
      
      // 监听跳转到指定题目的事件
      window.addEventListener('go-to-question', handleGoToQuestion)

      window.addEventListener('subject-changed', handleSubjectChanged)

      // 监听题目刷新事件
      window.addEventListener('question-refresh', handleQuestionRefresh)
    })

    onUnmounted(() => {
      window.removeEventListener('go-to-question', handleGoToQuestion)
      window.removeEventListener('subject-changed', handleSubjectChanged)
      window.removeEventListener('question-refresh', handleQuestionRefresh)
    })

    return {
      baseUrl,
      currentSerial,
      selectedOption,
      selectedOptions,
      multiBlankAnswers,
      question,
      allMultiBlankAnswered,
      optionsClass,
      selectOption,
      toggleOption,
      submitMultipleChoice,
      selectMultiBlankOption,
      submitMultiBlankChoice,
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

.title-text {
  white-space: pre-wrap;
}

.titleImg-content {
  margin-bottom: 1.5rem;
}

.title-img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.5rem 0;
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
  background-color: #c2c2c2;
  border-color: #a3a3a3;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(207, 207, 207, 0.3);
}

.option.correct {
  background-color: #4CAF50 !important;
  color: white !important;
  border-color: #4CAF50 !important;
  font-weight: bold;
}

.option.wrong {
  background-color: #f44336 !important;
  color: white !important;
  border-color: #f44336 !important;
  font-weight: bold;
}

.option.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.option.disabled:hover {
  
}

.option-group {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.option-group h4 {
  margin-top: 0;
  margin-bottom: 0.8rem;
  color: #555;
  font-size: 1rem;
}

.actions {
  display: flex;
  justify-content: space-between;
}

.prev-btn,
.next-btn {
  padding: 0.8rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.prev-btn:hover,
.next-btn:hover {
  background-color: #45a049;
}

.prev-btn:disabled,
.next-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.submit-btn {
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: #1976D2;
}

.submit-btn:disabled {
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
