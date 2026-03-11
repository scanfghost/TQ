<template>
  <div class="tq">
    <div class="content">
      <div class="QA">
        <div class="title-content">
          <TitleChoice 
            :total-questions="totalQuestions" 
            @update:question="currentQuestion = $event"
            :settings="settings"
            @update:serial="currentSerial = $event"
          />
        </div>
        <div class="explanation-content">
          <Explanation :question="currentQuestion" :settings="settings"/>
        </div>
      </div>
      <div class="table-content">
        <QuestionTable :settings="settings" :serial="currentSerial"/> 
      </div>
    </div>
    <Panel />
    <SwitchSubject />
    <Setting @update:settings="settings = $event"/>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../utils/api.js'

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
    const router = useRouter()
    const currentQuestion = ref(null)
    const totalQuestions = ref()
    const questionList = ref([])
    const settings = ref({})
    const currentSerial = ref(null)

    // 检查用户是否登录（session是否有效）
    const checkAuth = async () => {
      try {
        const response = await api.get('/authCheck')
        
        if (!response.data.data?.logined) {
          // session过期，重定向到登录页面
          router.push('/')
          return false
        }
        return true
      } catch (error) {
        // 发生错误，重定向到登录页面
        router.push('/')
        return false
      }
    }

    // 加载题目数据
    const loadQuestions = async () => {
      try {
        // 首先检查认证状态
        const isAuthenticated = await checkAuth()
        if (!isAuthenticated) return

        const response = await api.get('/TQ')
        
        if (response.data.data) {
          const { userSetting, user, currentQuestionId, questionCount } = response.data.data
          userSetting.value = userSetting
          user.value = user
          totalQuestions.value = questionCount
          
          // 触发用户信息更新事件
          const userEvent = new CustomEvent('user-updated', {
            detail: { user }
          })
          window.dispatchEvent(userEvent) 
          
          // 触发学习路径更新事件，传递给Panel组件
          if (user) {
            const event = new CustomEvent('update-study-path', {
              detail: {
                subject: user.currentSubject || '',
                chapter: user.currentChapter || '',
                section: user.currentSection || ''
              }
            })
            window.dispatchEvent(event)
          }
        }
      } catch (error) {
        // 如果是认证错误，重定向到登录页面
        if (error.response?.status === 401) {
          router.push('/')
        }
      }
    }

    const handleSubjectChanged = (event) => {
      // 触发题目列表刷新事件，通知QuestionTable等组件
      const refreshEvent = new CustomEvent('question-list-refresh')
      window.dispatchEvent(refreshEvent)
    }

    const handleSaveHistoryAnswer = async () => {
      try {
        const response = await api.saveHistoryAnswer()
        // 触发成功提示
        const event = new CustomEvent('show-response-tip', {
          detail: {
            message: '作答版本保存成功',
            duration: 2000
          }
        })
        window.dispatchEvent(event)
      } catch (error) {
        // 触发错误提示
        const event = new CustomEvent('show-response-tip', {
          detail: {
            message: '作答版本保存失败',
            duration: 2000
          }
        })
        window.dispatchEvent(event)
      }
    }

    onMounted(() => {
      loadQuestions()

      // 监听科目切换事件
      window.addEventListener('subject-changed', handleSubjectChanged)

      // 监听保存历史答案事件
      window.addEventListener('save-history-answer', handleSaveHistoryAnswer)
    })

    return {
      currentQuestion,
      totalQuestions,
      questionList,
      settings,
      currentSerial
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
