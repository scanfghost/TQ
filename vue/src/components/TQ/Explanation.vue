<template>
  <div class="explanation">
    <div class="explanation-content" v-if="hasAnswered">
      <div class="answer-section">
        <h4>[答案]</h4>
        <p>{{ formattedAnswer }}</p>
      </div>
      <div class="result-section" v-if="resultText" :class="resultClass">
        <h4>[结果]</h4>
        <p>{{ resultText }}</p>
      </div>
      <div class="analysis-section">
        <h4>[解析]</h4>
        <p class="analysis-text">{{ question?.analysis || '' }}</p>
      </div>
      <!-- 解析图片 -->
      <div class="explanImg-content" v-if="question?.explanImgs && question.explanImgs.length > 0">
        <img 
          v-for="(img, index) in question.explanImgs" 
          :key="index" 
          :src="baseUrl + '/assets/img/' + img.fileName" 
          class="explan-img" 
        />
      </div>
    </div>
    <div v-else class="empty-explanation">
      <p>请先完成本题或打开即时判题设置</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

export default {
  name: 'Explanation',
  props: {
    question: {
      type: Object,
      default: () => ({})
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const baseUrl = import.meta.env.VITE_SERVER_URL
    // 判断是否已作答
    const hasAnswered = ref(false)

    // 判断结果文本
    const resultText = computed(() => {
      if (!hasAnswered.value) return ''
      if (props.question?.isCorrect === true) return '正确'
      if (props.question?.isCorrect === false) return '错误'
      return ''
    })

    // 判断结果样式类
    const resultClass = computed(() => {
      if (props.question?.isCorrect === true) return 'correct'
      if (props.question?.isCorrect === false) return 'wrong'
      return ''
    })

    // 格式化答案显示
    const formattedAnswer = computed(() => {
      console.log('formattedAnswer')
      if (!props.question || !props.question.answer) {
        return '';
      }
      
      const answer = props.question.answer;
      
      // 处理多空单选的情况 [[0], [3]] -> A D
      if (Array.isArray(answer) && answer.length > 0 && Array.isArray(answer[0])) {
        const letters = answer.map(item => {
          const index = item[0];
          if (typeof index === 'number' && index >= 0 && index < 26) {
            return String.fromCharCode(65 + index);
          }
          return '';
        }).filter(l => l !== '');
        
        if (letters.length > 0) {
          return letters.join(' ');
        }
      }
      
      // 处理其他情况
      return JSON.stringify(answer);
    });

    // 监听题目变化，渲染LaTeX公式
    watch(() => props.question, (newQuestion) => {
      if (newQuestion) {
        // 延迟渲染，确保DOM已更新
        setTimeout(() => {
          if (window.MathJax) {
            if (window.MathJax.typesetPromise) {
              window.MathJax.typesetPromise()
            } else if (window.MathJax.tex2svgPromise) {
              window.MathJax.tex2svgPromise()
            }
          }
        }, 300);
      }
    }, { deep: true });

    // 监听答案显示状态，当答案显示时再次渲染LaTeX
    watch(() => hasAnswered.value, (newValue) => {
      if (newValue) {
        setTimeout(() => {
          if (window.MathJax) {
            if (window.MathJax.typesetPromise) {
              window.MathJax.typesetPromise()
            } else if (window.MathJax.tex2svgPromise) {
              window.MathJax.tex2svgPromise()
            }
          }
        }, 300);
      }
    });

    watch(() => props.settings, (newSettings) => {
      if (!newSettings.instantJudge) {
          handleClearAnswer()
        }else if(hasAnswered.value){
          handleOpenAnswer()
        }
    },{deep:true})

    // const getExplanation = async () => {
    //   return await api.getExplanation(props.question.id)
    // }

    // 监听清空答案事件
    const handleClearAnswer = () => {
      console.log('handleClearAnswer')
      hasAnswered.value = false
    }

    // 监听打开答案事件
    const handleOpenAnswer = () => {
      console.log('handleOpenAnswer')
      hasAnswered.value = true
    }

    const loadExplanation = () => {
      console.log('loadExplanation')
      if (props.settings?.instantJudge && props.question?.userOption) {
        handleOpenAnswer()
      } else {
        handleClearAnswer()
      }
    }

    watch(() => props.question, (newQuestion) => {
      console.log('watch question')
      if (newQuestion) {
        loadExplanation()
      }
    }, { deep: true })

    watch(() => props.settings, (newSettings) => {
      console.log('watch settings')
      if (newSettings) {
        loadExplanation()
      }
    },{deep:true})

    onMounted(() => {
      console.log('onMounted')
      loadExplanation()
      window.addEventListener('clear-answer', handleClearAnswer)
      window.addEventListener('open-answer', handleOpenAnswer)
    })

    onUnmounted(() => {
      window.removeEventListener('clear-answer', handleClearAnswer)
      window.removeEventListener('open-answer', handleOpenAnswer)
    })

    return {
      baseUrl,
      formattedAnswer,
      hasAnswered,
      resultText,
      resultClass
    }
  }
}
</script>

<style scoped>
.explanation {
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 1rem;
}

.answer-section,
.analysis-section,
.solution-section,
.result-section {
  margin-bottom: 1.5rem;
}

.answer-section h4,
.analysis-section h4,
.solution-section h4,
.result-section h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #333;
  font-weight: bold;
}

.answer-section p,
.analysis-section p,
.solution-section p,
.result-section p {
  margin: 0 0 1rem 0;
  line-height: 1.5;
  color: #666;
  text-indent: 2em;
  white-space: pre-wrap;
}

.result-section.correct p {
  color: #4CAF50;
  font-weight: bold;
}

.result-section.wrong p {
  color: #f44336;
  font-weight: bold;
}

.empty-explanation {
  padding: 2rem;
  text-align: center;
  color: #999;
  font-size: 0.9rem;
}

.explanImg-content {
  margin-top: 1rem;
}

.explan-img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.5rem 0;
}

/* 进度条样式 */
.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin: 1.5rem 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  border-radius: 4px;
  transition: width 0.3s ease;
}
</style>
