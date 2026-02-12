<template>
  <div class="explanation">
    <div class="explanation-content">
      <div class="answer-section">
        <h4>[答案]</h4>
        <p>{{ question?.answer || '' }}</p>
      </div>
      <div class="analysis-section">
        <h4>[解析]</h4>
        <p>{{ question?.analysis || '' }}</p>
      </div>
      <div class="solution-section" v-if="question?.solution">
        <h4>[另解]</h4>
        <p>{{ question.solution }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'Explanation',
  props: {
    question: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    return {
      // 可以添加计算属性或方法
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
.solution-section {
  margin-bottom: 1.5rem;
}

.answer-section h4,
.analysis-section h4,
.solution-section h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #333;
  font-weight: bold;
}

.answer-section p,
.analysis-section p,
.solution-section p {
  margin: 0 0 1rem 0;
  line-height: 1.5;
  color: #666;
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
