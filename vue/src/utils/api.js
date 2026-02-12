import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    const errorMsg = error.response?.data?.errMsg || error.message
    console.error('API错误:', errorMsg)
    
    // 触发全局错误提示事件
    const event = new CustomEvent('show-response-tip', {
      detail: {
        message: errorMsg,
        duration: 4000
      }
    })
    window.dispatchEvent(event)
    
    return Promise.reject(error)
  }
)

// 登录
api.login = (userEmail, userPasswd) => {
  return api.post('/login', { userEmail, userPasswd })
}

// 获取题目列表
api.getQuestions = () => {
  return api.get('/api/questions')
}

// 提交答案
api.submitAnswer = (questionId, userOption) => {
  return api.post('/api/submit-answer', { questionId, userOption })
}

// 获取用户设置
api.getUserSetting = () => {
  return api.get('/api/user-setting')
}

// 更新用户设置
api.updateUserSetting = (settings) => {
  return api.post('/api/update-user-setting', settings)
}

// 加入收藏
api.addFavorite = (questionId, keywords, comment) => {
  return api.post('/api/add-favorite', { questionId, keywords, comment })
}

// 旧项目API方法

// 获取题目详情
api.fetchTitle = (id) => {
  return api.get(`/title/${id}`)
}

// 提交答案（旧格式）
api.submitChoice = (id, userOption) => {
  return api.post('/choice', { userOption, _id: id })
}

// 重置答题记录
api.restartAnswer = () => {
  return api.delete('/restartAnswer')
}

// 保存历史答案
api.saveHistoryAnswer = () => {
  return api.post('/saveHistoryAnswer')
}

// 编辑图片
api.editImage = (formData) => {
  return api.post('/editImage', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 修改用户设置
api.modifyUserSetting = (instantJudge) => {
  return api.post('/modifyUserSetting', { instantJudge })
}

// 修改用户科目
api.modifyUserSubject = (subject, chapter, section) => {
  return api.post('/modifyUserSubject', { subject, chapter, section })
}

// 获取科目表单
api.fetchSubjectForm = () => {
  return api.get('/subjectForm')
}

// 获取章节名称
api.fetchChapterNames = (subject) => {
  return api.get(`/chapterNames?subjectName=${subject}`)
}

// 获取小节名称
api.fetchSectionNames = (chapterName) => {
  return api.get(`/sectionNames?chapterName=${chapterName}`)
}

// 添加收藏题目
api.addFavoriteTitle = (titleid, comment, keywords) => {
  return api.post('/addFavoriteTitle', { titleid, comment, keywords })
}

// 获取题目DTO
api.fetchTitleDto = (id) => {
  return api.get(`/titleDto/${id}`)
}

// 编辑题目
api.editTitle = (id, title, explanation) => {
  return api.post('/editTitle', { _id: id, title, explanation })
}

// 获取所有类型图片
api.fetchAllTypeImage = (questionId, type) => {
  return api.get(`/fetchAllTypeImage/${questionId}/${type}`)
}

export default api
