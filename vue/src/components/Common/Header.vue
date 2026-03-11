<template>
  <div class="header theme-header">
    <img src="../../assets/favicon.ico">
    <button v-if="userEmail" class="loginButton" id="TQ">
      {{ userEmail }}
    </button>
    <button v-else class="loginButton" id="loginButton" @click="showLogin">
      登录
    </button>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '../../utils/api.js'

export default {
  name: 'Header',
  setup() {
    const userEmail = ref('')
    let checkAuthInterval = null

    const checkAuth = async () => {
      console.log('checkAuth')
      try {
        const response = await api.get('/authCheck')
        console.log(response.data.data)
        if (!response.data.data?.logined) {
          // session已过期，清除sessionStorage
          sessionStorage.removeItem('userEmail')
          userEmail.value = ''
        }
      } catch (error) {
        console.error('认证检查失败:', error)
        // 发生错误，清除sessionStorage
        sessionStorage.removeItem('userEmail')
        userEmail.value = ''
      }
    }

    onMounted(() => {
      userEmail.value = sessionStorage.getItem('userEmail') || ''
      // 每30秒检查一次session状态
      checkAuthInterval = setInterval(checkAuth, 30000)
      checkAuth()
    })

    onUnmounted(() => {
      // 清除定时器
      if (checkAuthInterval) {
        clearInterval(checkAuthInterval)
      }
    })

    const showLogin = () => {
      const event = new CustomEvent('show-login')
      window.dispatchEvent(event)
    }

    return {
      userEmail,
      showLogin
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header img {
  height: 40px;
}

.loginButton {
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.loginButton:hover {
  background-color: #45a049;
}

@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }

  .header img {
    height: 30px;
  }

  .loginButton {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}
</style>
