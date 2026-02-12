<template>
  <div class="tq">
    <div class="content">
      <div class="QA">
        <div class="title-content">
          <TitleChoice @question-change="updateCurrentQuestion" />
        </div>
        <div class="explanation-content">
          <Explanation :question="currentQuestion" />
        </div>
        <!-- 进度条 -->
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
      </div>
      <div class="table-content">
        <QuestionTable />
      </div>
    </div>
    <!-- 右下角加号按钮 -->
    <div class="add-button">
      <button class="plus-btn">+</button>
    </div>
    <Panel />
    <SwitchSubject />
    <Setting />
    <UploadPicture />
    <AddFavorite />
    <EditTitle />
    <ResponseTip />
  </div>
</template>

<script>
import TitleChoice from '../components/TQ/TitleChoice.vue'
import Explanation from '../components/TQ/Explanation.vue'
import QuestionTable from '../components/TQ/QuestionTable.vue'
import Panel from '../components/TQ/Panel.vue'
import SwitchSubject from '../components/Modals/SwitchSubject.vue'
import Setting from '../components/Modals/Setting.vue'
import UploadPicture from '../components/Modals/UploadPicture.vue'
import AddFavorite from '../components/Modals/AddFavorite.vue'
import EditTitle from '../components/Modals/EditTitle.vue'
import ResponseTip from '../components/Common/ResponseTip.vue'
import { ref, computed } from 'vue'

export default {
  name: 'TQ',
  components: {
    TitleChoice,
    Explanation,
    QuestionTable,
    Panel,
    SwitchSubject,
    Setting,
    UploadPicture,
    AddFavorite,
    EditTitle,
    ResponseTip
  },
  setup() {
    const currentQuestion = ref(null)
    const currentIndex = ref(0)
    const totalQuestions = ref(22) // 假设总共有22道题

    const updateCurrentQuestion = (question, index) => {
      currentQuestion.value = question
      currentIndex.value = index
    }

    const progressPercentage = computed(() => {
      return ((currentIndex.value + 1) / totalQuestions.value) * 100
    })

    return {
      currentQuestion,
      currentIndex,
      totalQuestions,
      progressPercentage,
      updateCurrentQuestion
    }
  }
}
</script>

<style scoped>
.tq {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 2rem;
}

.content {
  flex: 1;
  display: flex;
  gap: 2rem;
}

.QA {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.title-content {
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.explanation-content {
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-content {
  width: 300px;
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 进度条样式 */
.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 1rem;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* 右下角加号按钮 */
.add-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

.plus-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #2196F3;
  color: white;
  border: none;
  font-size: 2rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.plus-btn:hover {
  background-color: #1976D2;
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

@media (max-width: 1200px) {
  .content {
    flex-direction: column;
  }

  .table-content {
    width: 100%;
    order: -1;
  }
}
</style>
