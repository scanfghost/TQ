import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import TQ from '../views/TQ.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/TQ',
    name: 'TQ',
    component: TQ
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
