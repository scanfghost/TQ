<template>
  <div class="panel">
    <div class="float-btn" @click="togglePanel">＋</div>
    <div class="actions" v-show="panelVisible">
      <div class="actions-item" id="subjectName">
        {{ currentSubject }}
      </div>
      <div class="actions-item" id="chapterName">
        {{ currentChapter }}
      </div>
      <div class="actions-item" id="sectionName" style="border-bottom: 1px solid rgb(146, 144, 144);">
        {{ currentSection }}
      </div>
      <div class="actions-item" id="AIConsultant"
           style="border-bottom: 1px solid rgb(146, 144, 144); cursor: pointer;"
           @click="openAIConsultant">
        <span style="display: inline-block;
        padding: 2px 6px;
        font-size: 11px;
        font-weight: bold;
        line-height: 1;
        color: #ffffff;
        background-color: #6e7781;
        /* GitHub 灰 */
        border-radius: 4px;
        margin-right: 6px;
        vertical-align: middle;
        white-space: nowrap;">Beta</span>AI咨询
      </div>
      <div class="action actions-item" id="selectSubject" @click="openSwitchSubject">
        选择科目与章节
      </div>
      <div class="action actions-item" id="saveAnswer" @click="saveAnswer">
        提交作答版本
      </div>
      <div v-if="isAdmin" class="action actions-item" id="uploadPictureOfTitle" @click="openUploadPicture('title')">
        设置题干图片
      </div>
      <div v-if="isAdmin" class="action actions-item" id="uploadPictureOfExplan" @click="openUploadPicture('explan')">
        设置解释图片
      </div>
      <div v-if="isAdmin" class="action actions-item" id="editTitle" @click="openEditTitle">
        编辑题目
      </div>
      <div class="action actions-item" id="addFavoriteTitle" @click="openAddFavorite">
        加入收藏
      </div>
      <div class="action actions-item" id="restartAnswer" @click="restartAnswer">
        重新做题
      </div>
      <div class="action actions-item" id="setting" @click="openSetting">
        偏好设置
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'Panel',
  setup() {
    const panelVisible = ref(false)
    const currentSubject = ref('数学')
    const currentChapter = ref('第一章')
    const currentSection = ref('第一节')
    const isAdmin = ref(false)

    const togglePanel = () => {
      panelVisible.value = !panelVisible.value
    }

    const openAIConsultant = () => {
      // 触发打开AI咨询
      const event = new CustomEvent('open-ai-consultant')
      window.dispatchEvent(event)
    }

    const openSwitchSubject = () => {
      // 触发打开选择科目模态框
      const event = new CustomEvent('open-switch-subject')
      window.dispatchEvent(event)
    }

    const saveAnswer = () => {
      // 提交作答版本
      const event = new CustomEvent('save-answer')
      window.dispatchEvent(event)
    }

    const openUploadPicture = (type) => {
      // 触发打开上传图片模态框
      const event = new CustomEvent('open-upload-picture', {
        detail: { type }
      })
      window.dispatchEvent(event)
    }

    const openEditTitle = () => {
      // 触发打开编辑题目模态框
      const event = new CustomEvent('open-edit-title')
      window.dispatchEvent(event)
    }

    const openAddFavorite = () => {
      // 触发打开加入收藏模态框
      const event = new CustomEvent('open-add-favorite')
      window.dispatchEvent(event)
    }

    const restartAnswer = () => {
      // 重新做题
      const event = new CustomEvent('restart-answer')
      window.dispatchEvent(event)
    }

    const openSetting = () => {
      // 触发打开设置模态框
      const event = new CustomEvent('open-setting')
      window.dispatchEvent(event)
    }

    onMounted(() => {
      // 可以从API获取当前科目信息和用户权限
    })

    return {
      panelVisible,
      currentSubject,
      currentChapter,
      currentSection,
      isAdmin,
      togglePanel,
      openAIConsultant,
      openSwitchSubject,
      saveAnswer,
      openUploadPicture,
      openEditTitle,
      openAddFavorite,
      restartAnswer,
      openSetting
    }
  }
}
</script>

<style scoped>
.panel {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 100;
}

.float-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #4CAF50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.float-btn:hover {
  background-color: #45a049;
  transform: scale(1.1);
}

.actions {
  position: absolute;
  bottom: 60px;
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  min-width: 200px;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.actions-item {
  padding: 1rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.actions-item:hover {
  background-color: #f9f9f9;
}

.actions-item:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .panel {
    bottom: 1rem;
    right: 1rem;
  }
  
  .float-btn {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
  
  .actions {
    min-width: 180px;
  }
  
  .actions-item {
    padding: 0.8rem;
    font-size: 0.9rem;
  }
}
</style>
