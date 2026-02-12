<template>
  <div v-if="visible" class="response-tip" :class="{ 'show': visible }">
    {{ message }}
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'ResponseTip',
  setup() {
    const visible = ref(false)
    const message = ref('')
    let timer = null

    const showResponseTip = (event) => {
      const { message: msg, duration = 3000 } = event.detail
      message.value = msg
      visible.value = true

      // 清除之前的定时器
      if (timer) {
        clearTimeout(timer)
      }

      // 设置定时器，自动隐藏
      timer = setTimeout(() => {
        visible.value = false
      }, duration)
    }

    onMounted(() => {
      window.addEventListener('show-response-tip', showResponseTip)
    })

    onUnmounted(() => {
      window.removeEventListener('show-response-tip', showResponseTip)
      if (timer) {
        clearTimeout(timer)
      }
    })

    return {
      visible,
      message
    }
  }
}
</script>

<style scoped>
.response-tip {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  z-index: 2000;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
}

.response-tip.show {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}
</style>
