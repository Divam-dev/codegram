import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import CoursesPage from '../views/CoursesPage.vue'
import CourseDetailPage from '../views/CourseDetailPage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import UserProfilePage from '../views/UserProfilePage.vue'
import { useAuthStore } from '../stores/auth'
import ResetPassword from '@/views/ResetPassword.vue'
import { ref } from 'vue'

export const isRouteLoading = ref(false)

const routes = [
  { path: '/', component: HomePage },
  { path: '/courses', component: CoursesPage },
  { path: '/courses/:courseId', component: CourseDetailPage },
  { path: '/login', component: LoginPage, meta: { requiresGuest: true } },
  { path: '/register', component: RegisterPage, meta: { requiresGuest: true } },
  { path: '/reset-password', component: ResetPassword, meta: { requiresGuest: true } },
  { path: '/profile', component: UserProfilePage, meta: { requiresAuth: true } },
  { path: '/user/:userId', component: UserProfilePage },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/404NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  isRouteLoading.value = true

  const authStore = useAuthStore()
  if (!authStore.isInitialized) {
    await authStore.initPromise
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/profile')
  } else {
    next()
  }
})

router.afterEach(() => {
  setTimeout(() => {
    isRouteLoading.value = false
  }, 150)
})

export default router
