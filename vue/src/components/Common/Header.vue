<template>
  <div class="header theme-header">
    <img src="../../assets/vue.svg">
    <button v-if="userEmail" class="loginButton" id="TQ">
      {{ userEmail }}
    </button>
    <button v-else class="loginButton" id="loginButton" @click="showLogin">
      登录
    </button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'Header',
  setup() {
    const userEmail = ref('')

    onMounted(() => {
      userEmail.value = sessionStorage.getItem('userEmail') || ''
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
