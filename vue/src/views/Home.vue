<template>
  <div class="home">
    <Header />
    <div class="content">
      <div class="hero">
        <h1>Master knowledge, One question at a time</h1>
        <p>Built with Node.js and MySQL to help you truly understand — not just memorize — the fundamentals across disciplines.</p>
        <a class="enterTQ" href="/TQ" @click.prevent="goToTQ">Let's go</a>
      </div>
    </div>
    <Login v-if="!isLoggedIn" />
    <ResponseTip />
  </div>
</template>

<script>
import Header from '../components/Common/Header.vue'
import Login from '../components/Auth/Login.vue'
import ResponseTip from '../components/Common/ResponseTip.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../utils/api.js'

export default {
  name: 'Home',
  components: {
    Header,
    Login,
    ResponseTip
  },
  setup() {
    const router = useRouter()
    const isLoggedIn = ref(false)

    const checkAuth = async () => {
      try {
        const response = await api.get('/authCheck')
        return response.data.data?.logined || false
      } catch (error) {
        console.error('认证检查失败:', error)
        return false
      }
    }

    onMounted(() => {
      // 检查登录状态
      const userEmail = sessionStorage.getItem('userEmail')
      isLoggedIn.value = !!userEmail
    })

    const goToTQ = async () => {
      if (!isLoggedIn.value) {
        // 触发登录模态框
        const event = new CustomEvent('show-login')
        window.dispatchEvent(event)
      } else {
        // 检查真正的session状态
        const isAuthenticated = await checkAuth()
        if (isAuthenticated) {
          router.push('/TQ')
        } else {
          // session已过期，触发登录模态框
          const event = new CustomEvent('show-login')
          window.dispatchEvent(event)
        }
      }
    }

    return {
      isLoggedIn,
      goToTQ
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.hero {
  text-align: center;
  max-width: 800px;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #666;
  line-height: 1.5;
}

.enterTQ {
  display: inline-block;
  padding: 0.8rem 2rem;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.enterTQ:hover {
  background-color: #45a049;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }

  .hero p {
    font-size: 1rem;
  }

  .enterTQ {
    padding: 0.6rem 1.5rem;
    font-size: 1rem;
  }
}
</style>
