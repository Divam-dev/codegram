import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { EnrollmentsService } from '../services/enrollments.service'
import { CoursesService } from '../services/courses.service'
import { useAuthStore } from './auth'

export const useEnrollmentsStore = defineStore('enrollments', () => {
  const enrollmentsService = new EnrollmentsService()
  const coursesService = new CoursesService()
  const authStore = useAuthStore()

  const enrolledCourses = ref([])
  const userEnrollments = ref([])
  const currentEnrollment = ref(null)
  const completedLessons = ref([])
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const userId = computed(() => authStore.user?.uid)

  async function loadUserEnrollments() {
    if (!isAuthenticated.value) return

    loading.value = true
    error.value = null

    try {
      // Отримуємо всі записи користувача
      const enrollments = await enrollmentsService.getUserEnrollments(userId.value)
      userEnrollments.value = enrollments

      if (enrollments.length === 0) {
        enrolledCourses.value = []
        return
      }

      // Отримуємо дані курсів
      const courseIds = enrollments.map((enrollment) => enrollment.courseId)
      const coursesData = []

      for (const courseId of courseIds) {
        try {
          const course = await coursesService.getCourseById(courseId)
          if (course) {
            const enrollment = enrollments.find((e) => e.courseId === courseId)

            coursesData.push({
              ...course,
              enrollmentId: enrollment.id,
              progress: enrollment.progress || 0,
              lastModuleId: enrollment.lastModuleId,
              lastLessonId: enrollment.lastLessonId,
              completed: enrollment.completed || false,
              continueLink:
                enrollment.lastModuleId && enrollment.lastLessonId
                  ? `/courses/${courseId}/modules/${enrollment.lastModuleId}/lessons/${enrollment.lastLessonId}`
                  : `/courses/${courseId}`,
            })
          }
        } catch (err) {
          console.error(`Помилка при отриманні курсу ${courseId}:`, err)
        }
      }

      enrolledCourses.value = coursesData
    } catch (err) {
      console.error('Помилка при завантаженні курсів користувача:', err)
      error.value = `Помилка при завантаженні курсів: ${err.message}`
    } finally {
      loading.value = false
    }
  }

  async function checkEnrollment(courseId) {
    if (!isAuthenticated.value) return { isEnrolled: false, enrollment: null }

    try {
      const result = await enrollmentsService.checkEnrollment(userId.value, courseId)

      if (result.isEnrolled) {
        currentEnrollment.value = result.enrollment
      }

      return result
    } catch (err) {
      console.error('Помилка при перевірці запису на курс:', err)
      error.value = `Помилка при перевірці запису на курс: ${err.message}`
      return { isEnrolled: false, enrollment: null }
    }
  }

  async function enrollCourse(courseId) {
    if (!isAuthenticated.value) return null

    loading.value = true
    error.value = null

    try {
      const enrollment = await enrollmentsService.enrollCourse(userId.value, courseId)

      currentEnrollment.value = enrollment
      await loadUserEnrollments()

      return enrollment
    } catch (err) {
      console.error('Помилка при записі на курс:', err)
      error.value = `Помилка при записі на курс: ${err.message}`
      return null
    } finally {
      loading.value = false
    }
  }

  async function loadCurrentEnrollment(courseId) {
    if (!isAuthenticated.value) return

    try {
      const { isEnrolled, enrollment } = await checkEnrollment(courseId)

      if (isEnrolled) {
        currentEnrollment.value = enrollment
        await loadCompletedLessons(enrollment.id)
      } else {
        currentEnrollment.value = null
        completedLessons.value = []
      }

      return enrollment
    } catch (err) {
      console.error('Помилка при завантаженні даних запису:', err)
      error.value = `Помилка при завантаженні даних запису: ${err.message}`
      return null
    }
  }

  async function loadCompletedLessons(enrollmentId) {
    if (!enrollmentId) return

    try {
      const lessons = await enrollmentsService.getCompletedLessons(enrollmentId)
      completedLessons.value = lessons
    } catch (err) {
      console.error('Помилка при завантаженні виконаних уроків:', err)
      error.value = `Помилка при завантаженні виконаних уроків: ${err.message}`
    }
  }

  function isLessonCompleted(moduleId, lessonId) {
    return completedLessons.value.some(
      (lesson) => lesson.moduleId === moduleId && lesson.id === lessonId,
    )
  }

  async function completeLesson(moduleId, lessonId) {
    if (!currentEnrollment.value || !currentEnrollment.value.id) return

    loading.value = true
    error.value = null

    try {
      await enrollmentsService.completeLesson(currentEnrollment.value.id, moduleId, lessonId)

      await loadCompletedLessons(currentEnrollment.value.id)

      const updatedEnrollment = await enrollmentsService.getEnrollment(currentEnrollment.value.id)
      currentEnrollment.value = updatedEnrollment

      await loadUserEnrollments()

      return updatedEnrollment
    } catch (err) {
      console.error('Помилка при позначенні уроку як виконаного:', err)
      error.value = `Помилка при позначенні уроку як виконаного: ${err.message}`
    } finally {
      loading.value = false
    }
  }

  async function updateLastViewedLesson(moduleId, lessonId) {
    if (!currentEnrollment.value || !currentEnrollment.value.id) return

    try {
      await enrollmentsService.updateLastViewedLesson(
        currentEnrollment.value.id,
        moduleId,
        lessonId,
      )

      currentEnrollment.value.lastModuleId = moduleId
      currentEnrollment.value.lastLessonId = lessonId
    } catch (err) {
      console.error('Помилка при оновленні останнього переглянутого уроку:', err)
      error.value = `Помилка при оновленні останнього переглянутого уроку: ${err.message}`
    }
  }

  function getCourseProgress(courseId) {
    const course = enrolledCourses.value.find((c) => c.id === courseId)
    return course ? course.progress : 0
  }

  async function cancelEnrollment(enrollmentId) {
    if (!enrollmentId) return

    loading.value = true
    error.value = null

    try {
      await enrollmentsService.cancelEnrollment(enrollmentId)

      if (currentEnrollment.value && currentEnrollment.value.id === enrollmentId) {
        currentEnrollment.value = null
        completedLessons.value = []
      }

      // Оновлюємо список курсів, на які записаний користувач
      await loadUserEnrollments()
    } catch (err) {
      console.error('Помилка при скасуванні запису на курс:', err)
      error.value = `Помилка при скасуванні запису на курс: ${err.message}`
    } finally {
      loading.value = false
    }
  }

  if (isAuthenticated.value) {
    loadUserEnrollments()
  }

  return {
    enrolledCourses,
    userEnrollments,
    currentEnrollment,
    completedLessons,
    loading,
    error,

    loadUserEnrollments,
    checkEnrollment,
    enrollCourse,
    loadCurrentEnrollment,
    loadCompletedLessons,
    isLessonCompleted,
    completeLesson,
    updateLastViewedLesson,
    getCourseProgress,
    cancelEnrollment,
  }
})
