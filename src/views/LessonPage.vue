<template>
  <div class="lesson-page">
    <BaseHeader />

    <div v-if="loading" class="loading-container">
      <p>Завантаження уроку...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <h1 class="error-code">ПОМИЛКА</h1>
      <p class="error-description">{{ error }}</p>
      <router-link :to="`/courses/${courseId}`" class="back-button">
        Повернутися до курсу
      </router-link>
    </div>

    <div v-else class="lesson-container">
      <div class="sidebar">
        <div class="course-title">
          <h2>{{ course.title }}</h2>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          <span class="progress-text">{{ progress }}% завершено</span>
        </div>

        <div class="modules-list">
          <div v-for="(module, moduleIndex) in sortedModules" :key="module.id" class="module-item">
            <div
              class="module-header"
              @click="toggleModule(module.id)"
              :class="{ expanded: expandedModuleIds.has(module.id) }"
            >
              <span class="module-number">{{ moduleIndex + 1 }}</span>
              <h3 class="module-title">{{ module.title }}</h3>
              <span class="toggle-icon">{{ expandedModuleIds.has(module.id) ? '▼' : '▶' }}</span>
            </div>

            <transition name="slide">
              <div v-if="expandedModuleIds.has(module.id)" class="module-lessons">
                <div
                  v-for="(lesson, lessonIndex) in moduleLessons[module.id]"
                  :key="lesson.id"
                  class="lesson-item"
                  :class="{
                    active: currentLesson && currentLesson.id === lesson.id,
                    completed: isLessonCompleted(module.id, lesson.id),
                  }"
                  @click="navigateToLesson(module.id, lesson.id)"
                >
                  <span class="lesson-number">{{ moduleIndex + 1 }}.{{ lessonIndex + 1 }}</span>
                  <span class="lesson-title" :title="lesson.title">{{ lesson.title }}</span>
                  <span class="completion-status">
                    <img
                      v-if="isLessonCompleted(module.id, lesson.id)"
                      src="@/assets/svg/check.svg"
                      alt="Completed"
                      class="check-icon"
                    />
                  </span>
                </div>
              </div>
            </transition>
          </div>

          <div v-if="finalQuiz" class="module-item final-quiz-item">
            <div
              class="module-header final-quiz-header"
              :class="{ expanded: showingFinalQuiz }"
              @click="showFinalQuiz"
            >
              <h3 class="module-title">🏆 Фінальний тест</h3>
              <span v-if="isFinalQuizCompleted" class="completion-status">
                <img src="@/assets/svg/check.svg" alt="Completed" class="check-icon" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="content">
        <div v-if="showingFinalQuiz && finalQuiz">
          <div class="navigation-buttons">
            <button @click="hideFinalQuiz" class="nav-button back-button">
              ← Повернутися до уроку
            </button>
          </div>

          <ModuleQuiz
            :title="finalQuiz.title || 'Фінальний тест'"
            :description="
              finalQuiz.description || 'Підсумковий тест для перевірки знань з усього курсу.'
            "
            :questions="finalQuiz.questions || []"
            :passing-score="finalQuiz.passingScore || 60"
            :module-id="'final'"
            :is-final-quiz="true"
            @quiz-submitted="handleQuizSubmitted"
            @quiz-retake="handleQuizRetake"
            @course-completed="completeCourse"
          />
        </div>

        <div v-else>
          <div class="lesson-header">
            <div class="navigation-buttons">
              <button
                v-if="prevLesson"
                @click="navigateToLesson(prevLesson.moduleId, prevLesson.id)"
                class="nav-button prev-button"
              >
                ← Попередній урок
              </button>
              <button
                v-if="nextLesson"
                @click="navigateToLesson(nextLesson.moduleId, nextLesson.id)"
                class="nav-button next-button"
              >
                Наступний урок →
              </button>
            </div>
            <div class="lesson-title-container">
              <h1 class="main-lesson-title">{{ currentLesson.title }}</h1>
            </div>
          </div>

          <div class="lesson-content">
            <div v-if="currentLesson.type === 'pdf' && currentLesson.pdfUrl" class="lesson-pdf">
              <iframe
                :src="currentLesson.pdfUrl"
                width="100%"
                height="600"
                frameborder="0"
                allowfullscreen
              ></iframe>
            </div>

            <div
              v-else-if="currentLesson.type === 'video' && currentLesson.videoUrl"
              class="lesson-video"
            >
              <iframe
                :src="getEmbedVideoUrl(currentLesson.videoUrl)"
                width="100%"
                height="450"
                frameborder="0"
                allowfullscreen
              ></iframe>
            </div>

            <template v-else-if="currentLesson.type === 'combined'">
              <div
                v-if="currentLesson.content"
                v-html="currentLesson.content"
                class="combined-html"
              ></div>

              <div v-if="currentLesson.videoUrl" class="lesson-video combined-video">
                <h3>Відео до уроку:</h3>
                <iframe
                  :src="getEmbedVideoUrl(currentLesson.videoUrl)"
                  width="100%"
                  height="450"
                  frameborder="0"
                  allowfullscreen
                ></iframe>
              </div>

              <div v-if="currentLesson.pdfUrl" class="lesson-pdf combined-pdf">
                <h3>Додаткові матеріали:</h3>
                <iframe
                  :src="currentLesson.pdfUrl"
                  width="100%"
                  height="600"
                  frameborder="0"
                  allowfullscreen
                ></iframe>
              </div>
            </template>

            <div v-else v-html="currentLesson.content"></div>
          </div>

          <div class="completion-section">
            <button
              v-if="!isLessonCompleted(moduleId, lessonId)"
              @click="markLessonAsCompleted"
              class="complete-button"
            >
              Позначити як виконане
            </button>
            <div v-else class="completion-message">
              <p>Урок виконано!</p>
              <div class="completion-actions">
                <button
                  v-if="nextLesson"
                  @click="navigateToLesson(nextLesson.moduleId, nextLesson.id)"
                  class="next-button"
                >
                  Перейти до наступного →
                </button>
                <button
                  v-else-if="
                    isLastLessonInCourse &&
                    finalQuiz &&
                    !courseCompleted &&
                    isLessonCompleted(moduleId, lessonId)
                  "
                  @click="showFinalQuiz"
                  class="final-quiz-button"
                >
                  Пройти фінальний тест
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BaseFooter />
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore'
import BaseHeader from '../components/BaseHeader.vue'
import BaseFooter from '../components/BaseFooter.vue'
import ModuleQuiz from '../components/ModuleQuiz.vue'
import { useAuthStore } from '../stores/auth'
import { useEnrollmentsStore } from '../stores/enrollments'
import { QuizzesService } from '../services/quizzes.service'

export default {
  name: 'LessonPage',
  components: {
    BaseHeader,
    BaseFooter,
    ModuleQuiz,
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const enrollmentsStore = useEnrollmentsStore()
    const quizzesService = new QuizzesService()
    const db = getFirestore()

    const courseId = ref(route.params.courseId)
    const moduleId = ref(route.params.moduleId)
    const lessonId = ref(route.params.lessonId)

    const loading = ref(true)
    const error = ref(null)
    const course = ref({})
    const modules = ref([])
    const moduleLessons = ref({})
    const currentLesson = ref(null)
    const enrollment = ref(null)
    const completedLessons = ref([])
    const expandedModuleIds = reactive(new Set())

    const finalQuiz = ref(null)
    const quizResults = ref([])
    const showingFinalQuiz = ref(false)
    const currentQuiz = ref(null)
    const courseCompleted = ref(false)

    const sortedModules = computed(() =>
      [...modules.value].sort((a, b) => (a.order || 0) - (b.order || 0)),
    )

    const progress = computed(() => {
      if (!modules.value.length) return 0

      let totalItems = 0
      let completedItems = 0

      for (const module of modules.value) {
        const moduleId = module.id

        if (moduleLessons.value[moduleId]) {
          const lessons = moduleLessons.value[moduleId]
          totalItems += lessons.length

          for (const lesson of lessons) {
            if (isLessonCompleted(moduleId, lesson.id)) {
              completedItems++
            }
          }
        }
      }

      if (finalQuiz.value) {
        totalItems += 1
        if (isFinalQuizCompleted.value) {
          completedItems += 1
        }
      }

      return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
    })

    const isFinalQuizCompleted = computed(() => {
      if (!quizResults.value.length) return false
      return quizResults.value.some((result) => result.isFinalQuiz && result.passed)
    })

    // Отримання всіх уроків у масиві
    const getAllLessonsFlat = () => {
      const allLessons = []

      sortedModules.value.forEach((module) => {
        const moduleLessonList = moduleLessons.value[module.id] || []
        const sortedLessons = [...moduleLessonList].sort((a, b) => (a.order || 0) - (b.order || 0))

        sortedLessons.forEach((lesson) => {
          allLessons.push({
            ...lesson,
            moduleId: module.id,
          })
        })
      })

      return allLessons
    }

    const prevLesson = computed(() => {
      if (!currentLesson.value) return null

      const allLessons = getAllLessonsFlat()
      const currentIndex = allLessons.findIndex(
        (lesson) => lesson.id === currentLesson.value.id && lesson.moduleId === moduleId.value,
      )

      if (currentIndex > 0) {
        return allLessons[currentIndex - 1]
      }

      return null
    })

    const nextLesson = computed(() => {
      if (!currentLesson.value) return null

      const allLessons = getAllLessonsFlat()
      const currentIndex = allLessons.findIndex(
        (lesson) => lesson.id === currentLesson.value.id && lesson.moduleId === moduleId.value,
      )

      if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
        return allLessons[currentIndex + 1]
      }

      return null
    })

    // Переревірка останнього уроку
    const isLastLessonInCourse = computed(() => {
      if (!currentLesson.value) return false

      const allLessons = getAllLessonsFlat()
      const currentIndex = allLessons.findIndex(
        (lesson) => lesson.id === currentLesson.value.id && lesson.moduleId === moduleId.value,
      )

      return currentIndex === allLessons.length - 1
    })

    // Завантаження всіх уроків
    const loadAllLessons = async () => {
      try {
        for (const module of modules.value) {
          if (!moduleLessons.value[module.id]) {
            await fetchLessonsForModule(module.id)
          }
        }
      } catch (error) {
        console.error('Помилка при завантаженні всіх уроків:', error)
      }
    }

    const loadData = async () => {
      loading.value = true
      error.value = null

      try {
        if (!authStore.isAuthenticated) {
          router.push('/login')
          return
        }

        const courseRef = doc(db, 'courses', courseId.value)
        const courseDoc = await getDoc(courseRef)

        if (!courseDoc.exists()) {
          throw new Error('Курс не знайдено')
        }

        course.value = {
          id: courseDoc.id,
          ...courseDoc.data(),
        }

        // Перевіряємо, чи користувач записаний на курс
        await enrollmentsStore.loadCurrentEnrollment(courseId.value)
        if (!enrollmentsStore.currentEnrollment) {
          throw new Error('Ви не записані на цей курс')
        }

        enrollment.value = enrollmentsStore.currentEnrollment
        completedLessons.value = enrollmentsStore.completedLessons

        await fetchModules()

        await fetchLessonsForModule(moduleId.value)
        expandedModuleIds.add(moduleId.value)

        await fetchLesson(moduleId.value, lessonId.value)

        await fetchFinalQuiz()

        await fetchQuizResults()

        checkCourseCompletion()

        await enrollmentsStore.updateLastViewedLesson(moduleId.value, lessonId.value)

        await loadAllLessons()
      } catch (err) {
        console.error('Помилка при завантаженні даних уроку:', err)
        error.value = `Помилка: ${err.message}`
      } finally {
        loading.value = false
      }
    }

    const fetchModules = async () => {
      try {
        const modulesRef = collection(db, `courses/${courseId.value}/modules`)
        const modulesQuery = query(modulesRef, orderBy('order', 'asc'))
        const modulesSnapshot = await getDocs(modulesQuery)

        const modulesData = []
        modulesSnapshot.forEach((moduleDoc) => {
          modulesData.push({
            id: moduleDoc.id,
            ...moduleDoc.data(),
          })
        })

        modules.value = modulesData
      } catch (error) {
        console.error('Помилка при завантаженні модулів:', error)
        throw new Error(`Помилка при завантаженні модулів: ${error.message}`)
      }
    }

    const fetchLessonsForModule = async (moduleId) => {
      if (moduleLessons.value[moduleId]) return

      try {
        const lessonsPath = `courses/${courseId.value}/modules/${moduleId}/lessons`
        const lessonsRef = collection(db, lessonsPath)
        const lessonsQuery = query(lessonsRef, orderBy('order', 'asc'))
        const lessonsSnapshot = await getDocs(lessonsQuery)

        const lessons = []
        lessonsSnapshot.forEach((lessonDoc) => {
          lessons.push({
            id: lessonDoc.id,
            moduleId: moduleId,
            ...lessonDoc.data(),
          })
        })

        moduleLessons.value[moduleId] = lessons
      } catch (error) {
        console.error(`Помилка при завантаженні уроків для модуля ${moduleId}:`, error)
        throw new Error(`Помилка при завантаженні уроків: ${error.message}`)
      }
    }

    const fetchLesson = async (modId, lesId) => {
      try {
        const lessonRef = doc(db, `courses/${courseId.value}/modules/${modId}/lessons`, lesId)
        const lessonDoc = await getDoc(lessonRef)

        if (!lessonDoc.exists()) {
          throw new Error('Урок не знайдено')
        }

        currentLesson.value = {
          id: lessonDoc.id,
          moduleId: modId,
          ...lessonDoc.data(),
        }

        return currentLesson.value
      } catch (error) {
        console.error('Помилка при завантаженні уроку:', error)
        throw new Error(`Помилка при завантаженні уроку: ${error.message}`)
      }
    }

    // Завантаження фінального тесту
    const fetchFinalQuiz = async () => {
      try {
        const quiz = await quizzesService.getFinalQuiz(courseId.value)

        if (quiz) {
          finalQuiz.value = { ...quiz, isFinalQuiz: true }

          if (route.query.showFinalQuiz === 'true') {
            setTimeout(() => {
              showFinalQuiz()
            }, 500)
          }
        } else {
          console.warn('Final quiz not found for course:', courseId.value)
          finalQuiz.value = null
        }
      } catch (error) {
        console.error('Помилка при завантаженні фінального тесту:', error)
        finalQuiz.value = null
      }
    }

    const fetchQuizResults = async () => {
      if (!enrollment.value || !enrollment.value.id) return

      try {
        const results = await quizzesService.getQuizResults(enrollment.value.id)
        quizResults.value = results
      } catch (error) {
        console.error('Помилка при завантаженні результатів тестів:', error)
      }
    }

    const checkCourseCompletion = () => {
      if (!enrollment.value) return

      courseCompleted.value = enrollment.value.completed || false
    }

    const isLessonCompleted = (moduleId, lessonId) => {
      return enrollmentsStore.isLessonCompleted(moduleId, lessonId)
    }

    const markLessonAsCompleted = async () => {
      try {
        await enrollmentsStore.completeLesson(moduleId.value, lessonId.value)
      } catch (error) {
        console.error('Помилка при позначенні уроку як виконаного:', error)
        alert(`Помилка: ${error.message}`)
      }
    }

    const navigateToLesson = (modId, lesId) => {
      if (modId === moduleId.value && lesId === lessonId.value) {
        return
      }

      showingFinalQuiz.value = false

      router
        .push({
          path: `/courses/${courseId.value}/modules/${modId}/lessons/${lesId}`,
        })
        .then(() => {
          moduleId.value = modId
          lessonId.value = lesId

          window.scrollTo(0, 0)

          loadData()
        })
        .catch((err) => {
          console.error('Помилка при навігації:', err)
        })
    }

    // Показуємо уроки модуля
    const toggleModule = (modId) => {
      if (expandedModuleIds.has(modId)) {
        expandedModuleIds.delete(modId)
      } else {
        expandedModuleIds.add(modId)
        if (!moduleLessons.value[modId]) {
          fetchLessonsForModule(modId)
        }
      }
    }

    const showFinalQuiz = () => {
      if (!finalQuiz.value) {
        console.error('Фінальний тест не знайдено, неможливо показати')
        alert('На жаль, фінальний тест не знайдено. Зверніться до адміністратора курсу.')
        return
      }

      if (!finalQuiz.value.questions || finalQuiz.value.questions.length === 0) {
        console.error('Фінальний тест не містить питань')
        alert('На жаль, фінальний тест не містить питань. Зверніться до адміністратора курсу.')
        return
      }

      currentQuiz.value = finalQuiz.value
      showingFinalQuiz.value = true

      window.scrollTo(0, 0)
    }

    const hideFinalQuiz = () => {
      showingFinalQuiz.value = false
      currentQuiz.value = null
    }

    // Оновлення результатів тесту
    const handleQuizSubmitted = async (quizResult) => {
      try {
        if (!enrollment.value || !enrollment.value.id) return

        await quizzesService.saveQuizResult(enrollment.value.id, quizResult)

        await fetchQuizResults()

        if (quizResult.isFinalQuiz && quizResult.passed) {
          await quizzesService.updateCourseCompletionStatus(enrollment.value.id)

          await enrollmentsStore.loadCurrentEnrollment(courseId.value)
          enrollment.value = enrollmentsStore.currentEnrollment

          checkCourseCompletion()
        }
      } catch (error) {
        console.error('Помилка при збереженні результатів тесту:', error)
        alert(`Помилка: ${error.message}`)
      }
    }

    const handleQuizRetake = async () => {}

    const completeCourse = async () => {
      try {
        if (!enrollment.value || !enrollment.value.id) return

        await quizzesService.updateCourseCompletionStatus(enrollment.value.id)

        await enrollmentsStore.loadCurrentEnrollment(courseId.value)
        enrollment.value = enrollmentsStore.currentEnrollment

        checkCourseCompletion()

        router.push(`/courses/${courseId.value}?completed=true`)
      } catch (error) {
        console.error('Помилка при завершенні курсу:', error)
        alert(`Помилка: ${error.message}`)
      }
    }

    const getEmbedVideoUrl = (url) => {
      if (!url) return ''

      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1].split('&')[0]
        return `https://www.youtube.com/embed/${videoId}`
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0]
        return `https://www.youtube.com/embed/${videoId}`
      }
      return url
    }

    onMounted(() => {
      loadData()
    })

    watch(
      () => [route.params.moduleId, route.params.lessonId, route.query.showFinalQuiz],
      (
        [newModuleId, newLessonId, newShowFinalQuiz],
        [oldModuleId, oldLessonId, oldShowFinalQuiz],
      ) => {
        if (newShowFinalQuiz === 'true' && oldShowFinalQuiz !== 'true' && finalQuiz.value) {
          setTimeout(() => {
            showFinalQuiz()
          }, 500)
          return
        }

        if (newModuleId !== oldModuleId || newLessonId !== oldLessonId) {
          moduleId.value = newModuleId
          lessonId.value = newLessonId

          showingFinalQuiz.value = false

          loadData()
        }
      },
    )

    return {
      courseId,
      moduleId,
      lessonId,
      loading,
      error,
      course,
      modules,
      moduleLessons,
      currentLesson,
      enrollment,
      completedLessons,
      expandedModuleIds,
      sortedModules,
      progress,
      prevLesson,
      nextLesson,

      finalQuiz,
      quizResults,
      showingFinalQuiz,
      currentQuiz,
      isFinalQuizCompleted,
      courseCompleted,
      isLastLessonInCourse,

      isLessonCompleted,
      markLessonAsCompleted,
      navigateToLesson,
      toggleModule,
      showFinalQuiz,
      hideFinalQuiz,
      handleQuizSubmitted,
      handleQuizRetake,
      completeCourse,
      getEmbedVideoUrl,
    }
  },
}
</script>

<style scoped>
.lesson-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
}

.loading-container,
.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.error-code {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.error-description {
  margin-bottom: 2rem;
  color: #6b7280;
}

.back-button {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 40px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #2563eb;
}

.lesson-container {
  flex: 1;
  display: flex;
  min-height: calc(100vh - 120px);
  position: relative;
}

.sidebar {
  width: 300px;
  background-color: white;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  position: fixed;
  top: 60px;
  left: 0;
}

.course-title {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-title h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.progress-bar {
  padding: 1rem 1.5rem;
  background-color: #f3f4f6;
  position: relative;
  height: 40px;
  display: flex;
  align-items: center;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: #bbdefb;
  z-index: 1;
  transition: width 0.5s ease;
}

.progress-text {
  position: relative;
  z-index: 2;
  font-weight: 500;
  margin-left: 1.5rem;
}

.modules-list {
  flex: 1;
  overflow-y: auto;
}

.module-item {
  border-bottom: 1px solid #e5e7eb;
}

.module-header {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.module-header:hover {
  background-color: #f3f4f6;
}

.module-header.expanded {
  background-color: #e5e7eb;
}

.module-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #3b82f6;
  color: white;
  border-radius: 50%;
  margin-right: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.module-number.final {
  background-color: #8b5cf6;
}

.module-title {
  flex: 1;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  white-space: normal;
}

.toggle-icon {
  font-size: 0.75rem;
  color: #6b7280;
}

.module-lessons {
  background-color: #f9fafb;
}

.lesson-item {
  padding: 0.75rem 1.5rem 0.75rem 3.5rem;
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
}

.lesson-item:hover {
  background-color: #f3f4f6;
}

.lesson-item.active {
  background-color: #eff6ff;
  border-left-color: #3b82f6;
}

.lesson-item.completed {
  color: #6b7280;
}

.lesson-item.quiz-item {
  background-color: #f0f9ff;
}

.lesson-item.quiz-item:hover {
  background-color: #e0f2fe;
}

.lesson-item.quiz-item.active {
  background-color: #dbeafe;
  border-left-color: #3b82f6;
}

.final-quiz-item {
  margin-top: 1rem;
}

.final-quiz-header {
  background-color: #f5f3ff;
}

.final-quiz-header:hover {
  background-color: #ede9fe;
}

.quiz-icon {
  font-style: normal;
}

.lesson-number {
  margin-right: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.lesson-title {
  font-size: 0.875rem;
  white-space: normal;
  overflow: visible;
  text-overflow: initial;
  flex: 1;
}

.completion-status {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: #10b981;
}

.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  margin-left: 300px;
}

.lesson-header {
  margin-bottom: 2rem;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.nav-button {
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-button:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.prev-button {
  margin-right: auto;
}

.next-button {
  margin-left: auto;
}

.lesson-title-container {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.main-lesson-title {
  font-size: 1.75rem;
  font-weight: bold;
  margin: 0;
  margin-right: 1rem;
}

.lesson-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  line-height: 1.7;
}

.lesson-content :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
  border-radius: 4px;
}

.lesson-content :deep(h2) {
  font-size: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.lesson-content :deep(h3) {
  font-size: 1.25rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.lesson-content :deep(code) {
  background-color: #f3f4f6;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
}

.lesson-content :deep(pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1rem 0;
}

.lesson-content :deep(blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 1rem;
  margin-left: 0;
  color: #4b5563;
}

.lesson-pdf,
.lesson-video {
  width: 100%;
  margin-bottom: 2rem;
}

.lesson-pdf iframe,
.lesson-video iframe {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.combined-html {
  margin-bottom: 2rem;
}

.combined-video,
.combined-pdf {
  margin-top: 3rem;
  margin-bottom: 3rem;
}

.combined-video h3,
.combined-pdf h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #3b82f6;
}

.completion-section {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.completion-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.completion-message p {
  font-weight: 600;
  color: #10b981;
  margin-bottom: 1rem;
}

.completion-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.complete-button,
.next-button,
.quiz-button,
.final-quiz-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.complete-button {
  background-color: #3b82f6;
  color: white;
}

.complete-button:hover {
  background-color: #2563eb;
}

.next-button {
  background-color: #10b981;
  color: white;
}

.next-button:hover {
  background-color: #059669;
}

.quiz-button {
  background-color: #6366f1;
  color: white;
}

.quiz-button:hover {
  background-color: #4f46e5;
}

.final-quiz-button {
  background-color: #8b5cf6;
  color: white;
}

.final-quiz-button:hover {
  background-color: #7c3aed;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s;
  max-height: 1000px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

@media (max-width: 1024px) {
  .sidebar {
    width: 250px;
  }

  .content {
    margin-left: 250px;
  }
}

@media (max-width: 768px) {
  .lesson-container {
    flex-direction: column;
  }

  .sidebar {
    position: static;
    height: auto;
    max-height: 300px;
    width: 100%;
  }

  .content {
    margin-left: 0;
  }

  .main-lesson-title {
    font-size: 1.5rem;
  }

  .lesson-content {
    padding: 1.5rem;
  }
}

.final-quiz-button {
  background-color: #8b5cf6;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.final-quiz-button:hover {
  background-color: #7c3aed;
  transform: translateY(-2px);
}

.module-item.final-quiz-item {
  margin-top: 1rem;
  border: 2px solid #8b5cf6;
  background-color: #f5f3ff;
}

.module-header.final-quiz-header {
  background-color: #f5f3ff;
}

.module-header.final-quiz-header:hover {
  background-color: #ede9fe;
}

@media (max-width: 480px) {
  .content {
    padding: 1rem;
  }

  .main-lesson-title {
    font-size: 1.25rem;
  }

  .lesson-content {
    padding: 1rem;
  }

  .navigation-buttons {
    flex-direction: column;
  }

  .nav-button {
    width: 100%;
  }
}
</style>
