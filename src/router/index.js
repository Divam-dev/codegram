import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import CoursesPage from '../views/CoursesPage.vue'
import CourseDetailPage from '../views/CourseDetailPage.vue'
import LessonPage from '../views/LessonPage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import UserProfilePage from '../views/UserProfilePage.vue'
import AdminPage from '../views/AdminPage.vue'
import UserCoursesPage from '../views/UserCoursesPage.vue'
import CourseEditor from '../views/CourseEditor.vue'
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'
import { useEnrollmentsStore } from '../stores/enrollments'
import ResetPassword from '@/views/ResetPassword.vue'
import { ref } from 'vue'

export const isRouteLoading = ref(false)

const routes = [
  { path: '/', component: HomePage },
  { path: '/courses', component: CoursesPage },
  { path: '/courses/:courseId', component: CourseDetailPage },
  {
    path: '/courses/:courseId/modules/:moduleId/lessons/:lessonId',
    component: LessonPage,
    meta: { requiresAuth: true },
    beforeEnter: async (to, from, next) => {
      const enrollmentsStore = useEnrollmentsStore()
      const authStore = useAuthStore()

      if (!authStore.isAuthenticated) {
        next('/login')
        return
      }

      const { isEnrolled } = await enrollmentsStore.checkEnrollment(to.params.courseId)
      if (!isEnrolled) {
        next(`/courses/${to.params.courseId}`)
        return
      }

      next()
    },
  },
  { path: '/login', component: LoginPage, meta: { requiresGuest: true } },
  { path: '/register', component: RegisterPage, meta: { requiresGuest: true } },
  { path: '/reset-password', component: ResetPassword, meta: { requiresGuest: true } },
  { path: '/profile', component: UserProfilePage, meta: { requiresAuth: true } },
  { path: '/user/:userId', component: UserProfilePage },

  // Сторінка курсів користувача
  {
    path: '/my-courses',
    component: UserCoursesPage,
    meta: { requiresAuth: true },
  },

  // Сторінка створення курсу
  {
    path: '/create-course',
    redirect: '/my-courses',
    meta: { requiresAuth: true },
  },
  {
    path: '/create-course/new',
    component: CourseEditor,
    meta: { requiresAuth: true },
  },
  {
    path: '/create-course/edit/:courseId',
    component: CourseEditor,
    meta: { requiresAuth: true },
  },

  // Адмін-панель
  {
    path: '/admin',
    component: AdminPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },

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
  const profileStore = useProfileStore()

  // Чекаємо ініціалізації авторизації
  if (!authStore.isInitialized) {
    try {
      await authStore.initPromise
    } catch (e) {
      console.error('Помилка ініціалізації аутентифікації:', e)
    }
  }

  // Чекаємо завантаження профілю
  if (authStore.isAuthenticated && !profileStore.profile) {
    try {
      await profileStore.loadUserProfile(authStore.user.uid)
    } catch (e) {
      console.error('Помилка завантаження профілю:', e)
    }
  }

  // Перевірка на права доступу до адмін-панелі
  if (to.matched.some((record) => record.meta.requiresAdmin)) {
    const userRole = profileStore.profile?.role || ''

    if (!authStore.isAuthenticated) {
      next('/login')
    } else if (userRole !== 'admin' && userRole !== 'moderator') {
      next('/')
    } else {
      next()
    }
  } else if (to.meta.requiresAuth && !authStore.isAuthenticated) {
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
