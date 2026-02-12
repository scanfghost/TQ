<template>
  <div v-if="visible" class="login-content modalCard">
    <div class="shadow-cover" @click="close"></div>
    <div class="modal-content" @click.stop>
      <h2>登录</h2>
      <form @submit.prevent="login">
        <div>邮箱</div>
        <input type="email" v-model="userEmail" required>
        <div>密码</div>
        <input type="password" v-model="userPasswd" required>
        <button id="submitLoginButton" type="submit">
          提交
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../utils/api.js'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const visible = ref(false)
    const userEmail = ref('')
    const userPasswd = ref('')

    const showLogin = () => {
      visible.value = true
    }

    const close = () => {
      visible.value = false
    }

    const login = async () => {
      try {
        const response = await api.login(userEmail.value, userPasswd.value)
        if (response.data.data.loginSuccess) {
          sessionStorage.setItem('userEmail', userEmail.value)
          visible.value = false
          // 触发登录成功提示
          const event = new CustomEvent('show-response-tip', {
            detail: {
              message: '登录成功，3秒后跳转...',
              duration: 2000
            }
          })
          window.dispatchEvent(event)
          // 跳转到TQ页面
          setTimeout(() => {
            router.push('/TQ')
          }, 3000)
        } else {
          // 触发登录失败提示
          const event = new CustomEvent('show-response-tip', {
            detail: {
              message: '登录失败: ' + response.data.errMsg,
              duration: 4000
            }
          })
          window.dispatchEvent(event)
        }
      } catch (error) {
        const errorMsg = error.response?.data?.errMsg || error.message
        // 触发登录失败提示
        const event = new CustomEvent('show-response-tip', {
          detail: {
            message: '登录失败: ' + errorMsg,
            duration: 4000
          }
        })
        window.dispatchEvent(event)
      }
    }

    onMounted(() => {
      window.addEventListener('show-login', showLogin)
    })

    onUnmounted(() => {
      window.removeEventListener('show-login', showLogin)
    })

    return {
      visible,
      userEmail,
      userPasswd,
      close,
      login
    }
  }
}
</script>

<style scoped>
.modalCard {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.shadow-cover {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 400px;
  max-width: 90vw;
  position: relative;
  z-index: 1001;
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
}

.modal-content div {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #666;
}

.modal-content input {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.modal-content button {
  width: 100%;
  padding: 0.8rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.modal-content button:hover {
  background-color: #45a049;
}
</style>
