import { createWebHistory, createRouter } from 'vue-router'
import Login from './components/login.vue'
import Result from './components/result.vue'
import { useAuthStore } from './stores/auth'

const routes = [
  { 
    path: '/', 
    redirect: '/login'
  },
  { 
    path: '/login', 
    component: Login,
    meta: { requiresGuest: true }
  },
  { 
    path: '/result', 
    component: Result,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.token) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.token) {
    next('/result')
  } else {
    next()
  }
})

export default router