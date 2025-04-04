import { createWebHistory, createRouter } from 'vue-router'
import login from './components/login.vue'  

const routes = [
  { path: '/', component: login },
  { path: '/home', component: login },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router 