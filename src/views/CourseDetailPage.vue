<template>
  <div class="course-detail-page">
    <BaseHeader />
    <main class="main-content">
      <div v-if="loading" class="loading-state">
        <p>Завантаження курсу...</p>
      </div>
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="fetchCourse" class="retry-button">Спробувати знову</button>
      </div>
      <div v-else class="container">
        <div v-if="route.query.completed === 'true'" class="completion-notification">
          <div class="notification-content">
            <h2>Вітаємо з успішним завершенням курсу!</h2>
            <p>Ви успішно пройшли фінальний тест і завершили курс "{{ course.title }}".</p>
            <div v-if="enrollment && enrollment.certificateUrl" class="certificate-link">
              <p>Ваш сертифікат доступний за посиланням:</p>
              <a :href="enrollment.certificateUrl" target="_blank" class="certificate-button">
                Отримати сертифікат
              </a>
            </div>
          </div>
        </div>

        <div class="course-header">
          <div class="course-info">
            <h1 class="course-title">{{ course.title }}</h1>
            <p class="course-description">{{ course.description }}</p>

            <div class="course-stats">
              <div class="stat-item">
                <img src="@/assets/svg/user.svg" alt="User icon" class="icon" />
                <span>{{ course.students || 0 }} учнів</span>
              </div>
              <div class="stat-item">
                <img src="@/assets/svg/star.svg" alt="Star icon" class="icon" />
                <span>{{ course.rating || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="level-badge" :class="course.level">
                  {{ formatLevel(course.level) }}
                </span>
              </div>
            </div>

            <div
              class="course-technologies"
              v-if="course.technologies && course.technologies.length"
            >
              <h3>Технології:</h3>
              <div class="tech-tags">
                <span v-for="tech in course.technologies" :key="tech" class="tech-tag">
                  {{ tech }}
                </span>
              </div>
            </div>

            <div class="enroll-section">
              <p class="availability">{{ formatAvailability(course.availableFrom) }}</p>

              <div v-if="isEnrolled && courseProgress > 0" class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: `${courseProgress}%` }"></div>
                </div>
                <span class="progress-text">{{ courseProgress }}% завершено</span>
              </div>

              <button
                v-if="isEnrolled && enrollmentsStore.currentEnrollment?.completed"
                class="completed-button"
                disabled
              >
                Курс завершено
              </button>
              <button v-else class="enroll-button" :disabled="!isAvailable" @click="enrollCourse">
                {{ enrollButtonText }}
              </button>
            </div>
          </div>

          <div class="course-banner-wrapper">
            <div class="course-banner">
              <img
                :src="course.image || 'https://i.ibb.co/nq4bG4r/Icon.jpg'"
                :alt="course.title"
                class="course-image"
              />
            </div>

            <div class="course-meta">
              <div class="meta-item">
                <span class="meta-label">МОВА КУРСУ</span>
                <span class="meta-value">{{ course.language }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">ТРИВАЛІСТЬ</span>
                <span class="meta-value">{{ course.duration }}+ год</span>
              </div>
              <div v-if="course.hasCertificate" class="meta-item certificate">
                <span class="meta-label">СЕРТИФІКАТ</span>
                <span class="meta-value">По завершенню курсу</span>
              </div>
            </div>
          </div>
        </div>

        <div class="course-content">
          <h2 class="section-title">Програма курсу</h2>

          <div v-if="modules.length === 0" class="no-modules">
            <p>Програма курсу буде доступна незабаром.</p>
          </div>

          <div v-else class="modules-list">
            <div
              v-for="(module, index) in sortedModules"
              :key="module.id"
              class="module-item"
              :class="{ 'module-expanded': expandedModules.includes(module.id) }"
            >
              <div
                class="module-header"
                @click="toggleModule(module.id)"
                :class="{ 'module-header-expanded': expandedModules.includes(module.id) }"
              >
                <h3>Модуль {{ index + 1 }}. {{ module.title }}</h3>
                <span class="lesson-count"
                  >{{
                    moduleLessons[module.id]
                      ? moduleLessons[module.id].length
                      : module.lessonsCount || 0
                  }}
                  лекції</span
                >
                <div class="toggle-button-wrapper">
                  <button
                    class="toggle-button"
                    :class="{ 'toggle-active': expandedModules.includes(module.id) }"
                  >
                    ▼
                  </button>
                </div>
              </div>

              <transition name="expand">
                <div v-if="expandedModules.includes(module.id)" class="module-content">
                  <div v-if="isLoadingLessons[module.id]" class="loading-lessons">
                    <p>Завантаження лекцій...</p>
                  </div>
                  <div v-else-if="lessonErrors[module.id]" class="error-lessons">
                    <p>{{ lessonErrors[module.id] }}</p>
                  </div>
                  <div v-else>
                    <p class="module-description">
                      {{ module.description || 'Опис модуля відсутній' }}
                    </p>

                    <div v-if="moduleLessons[module.id] && moduleLessons[module.id].length > 0">
                      <transition-group name="list" tag="ul" class="lessons-list">
                        <li
                          v-for="(lesson, lessonIndex) in moduleLessons[module.id]"
                          :key="lesson.id"
                          class="lesson-item"
                        >
                          {{ index + 1 }}.{{ lessonIndex + 1 }}. {{ lesson.title }}
                        </li>
                      </transition-group>
                    </div>
                    <div v-else class="no-lessons">
                      <p class="no-lessons-message">
                        Лекції для цього модуля будуть доступні незабаром.
                      </p>
                    </div>
                  </div>
                </div>
              </transition>
            </div>

            <!-- Відображення секції фінального тесту -->
            <div v-if="isEnrolled && hasFinalQuiz" class="final-quiz-section">
              <div class="final-quiz-header">
                <h3>Фінальний тест</h3>
                <span v-if="isFinalQuizCompleted" class="quiz-status completed">Пройдено</span>
                <span v-else class="quiz-status pending">Не пройдено</span>
              </div>
              <p class="final-quiz-description">
                Фінальний тест допоможе вам перевірити знання, отримані під час проходження курсу.
                Для успішного завершення курсу необхідно набрати не менше 60% правильних відповідей.
              </p>

              <div class="final-quiz-actions">
                <button
                  v-if="canTakeFinalQuiz"
                  @click="navigateToFinalQuiz"
                  class="take-quiz-button"
                >
                  {{ isFinalQuizAttempted ? 'Перепройти фінальний тест' : 'Пройти фінальний тест' }}
                </button>
                <p v-else class="quiz-not-available">
                  Для доступу до фінального тесту необхідно спочатку пройти всі уроки курсу.
                </p>
              </div>
            </div>

            <button
              v-if="modules.length > 3 && !showAllModules"
              @click="expandAllModules"
              class="show-all-button"
            >
              Показати все
            </button>
          </div>
        </div>

        <div class="author-section">
          <h2 class="section-title">Автори курсу</h2>

          <div class="author-card" v-if="author">
            <router-link
              :to="course.authorId ? `/user/${course.authorId}` : '#'"
              class="author-link"
              v-if="course.authorId"
            >
              <img
                :src="author.profile?.avatarUrl || '@/assets/svg/profile-avatar.svg'"
                :alt="author.username"
                class="author-avatar"
              />
              <div class="author-info">
                <h3 class="author-name">{{ author.username }}</h3>
                <p class="author-bio">
                  {{ author.profile?.bio || 'Інформація про автора відсутня' }}
                </p>
              </div>
            </router-link>
            <div v-else class="author-content">
              <img
                :src="author.profile?.avatarUrl || '@/assets/svg/profile-avatar.svg'"
                :alt="author.username"
                class="author-avatar"
              />
              <div class="author-info">
                <h3 class="author-name">{{ author.username }}</h3>
                <p class="author-bio">
                  {{ author.profile?.bio || 'Інформація про автора відсутня' }}
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="course.courseType === 'codegram'" class="author-card">
            <img src="@/assets/svg/logo.svg" alt="Codegram" class="author-avatar" />
            <div class="author-info">
              <h3 class="author-name">Codegram</h3>
              <p class="author-bio">Офіційний курс від Codegram</p>
            </div>
          </div>

          <div v-else class="no-author">
            <p>Інформація про автора відсутня</p>
          </div>
        </div>
      </div>
    </main>
    <BaseFooter />
  </div>
</template>

<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseDetail } from '../composables/useCourseDetail'
import { useAuthStore } from '../stores/auth'
import { useEnrollmentsStore } from '../stores/enrollments'
import { QuizzesService } from '../services/quizzes.service'
import BaseHeader from '../components/BaseHeader.vue'
import BaseFooter from '../components/BaseFooter.vue'

const route = useRoute()
const router = useRouter()
const courseId = route.params.courseId

const authStore = useAuthStore()
const enrollmentsStore = useEnrollmentsStore()
const quizzesService = new QuizzesService()

const isEnrolled = ref(false)
const enrollment = ref(null)
const hasFinalQuiz = ref(false)
const isFinalQuizCompleted = ref(false)
const isFinalQuizAttempted = ref(false)

const {
  course,
  author,
  modules,
  sortedModules,
  moduleLessons,
  isLoadingLessons,
  lessonErrors,
  loading,
  error,
  expandedModules,
  showAllModules,
  isAvailable,
  fetchCourse,
  toggleModule,
  expandAllModules,
  formatAvailability,
  formatLevel,
} = useCourseDetail(courseId)

// Перевіряємо, чи може користувач проходити фінальний тест
const canTakeFinalQuiz = computed(() => {
  if (!isEnrolled.value) return false

  const allLessonsCompleted = checkAllLessonsCompleted()

  return allLessonsCompleted
})

// Обчислювані властивості
const enrollButtonText = computed(() => {
  if (!isAvailable.value) return 'Курс ще недоступний'
  if (!authStore.isAuthenticated) return 'Записатись на курс'
  if (isEnrolled.value) {
    if (enrollmentsStore.currentEnrollment?.lastLessonId) {
      return 'Продовжити навчання'
    }
    return 'Почати навчання'
  }
  return 'Записатись на курс'
})

const continueUrl = computed(() => {
  if (!isEnrolled.value || !enrollmentsStore.currentEnrollment) return null

  if (
    enrollmentsStore.currentEnrollment.lastModuleId &&
    enrollmentsStore.currentEnrollment.lastLessonId
  ) {
    return `/courses/${courseId}/modules/${enrollmentsStore.currentEnrollment.lastModuleId}/lessons/${enrollmentsStore.currentEnrollment.lastLessonId}`
  }

  // Якщо немає останнього уроку, починаємо з першого
  if (
    sortedModules.value.length > 0 &&
    moduleLessons.value[sortedModules.value[0].id] &&
    moduleLessons.value[sortedModules.value[0].id].length > 0
  ) {
    const firstModule = sortedModules.value[0]
    const firstLesson = moduleLessons.value[firstModule.id][0]
    return `/courses/${courseId}/modules/${firstModule.id}/lessons/${firstLesson.id}`
  }

  return null
})

const courseProgress = computed(() => {
  if (!isEnrolled.value || !enrollmentsStore.currentEnrollment) return 0
  return enrollmentsStore.currentEnrollment.progress || 0
})

// Перевіряємо запис на курс
async function checkEnrollment() {
  if (!authStore.isAuthenticated) return false

  try {
    const { isEnrolled: enrolled, enrollment: currentEnrollment } =
      await enrollmentsStore.checkEnrollment(courseId)
    isEnrolled.value = enrolled
    enrollment.value = currentEnrollment

    if (enrolled) {
      await checkFinalQuizStatus()
    }

    return enrolled
  } catch (error) {
    console.error('Помилка при перевірці запису на курс:', error)
    return false
  }
}

// Перевіряємо статус фінального тесту
async function checkFinalQuizStatus() {
  try {
    const finalQuiz = await quizzesService.getFinalQuiz(courseId)
    hasFinalQuiz.value = !!finalQuiz

    if (hasFinalQuiz.value && enrollment.value && enrollment.value.id) {
      const quizResults = await quizzesService.getQuizResults(enrollment.value.id)
      const finalQuizResult = quizResults.find((result) => result.isFinalQuiz)

      if (finalQuizResult) {
        isFinalQuizAttempted.value = true
        isFinalQuizCompleted.value = finalQuizResult.passed
      } else {
        isFinalQuizAttempted.value = false
        isFinalQuizCompleted.value = false
      }
    }
  } catch (error) {
    console.error('Помилка при перевірці статусу фінального тесту:', error)
    hasFinalQuiz.value = false
  }
}

function checkAllLessonsCompleted() {
  if (!isEnrolled.value) return false

  // Отримуємо всі уроки з усіх модулів
  let totalLessons = 0
  let completedLessons = 0

  Object.keys(moduleLessons.value).forEach((moduleId) => {
    const lessons = moduleLessons.value[moduleId] || []
    totalLessons += lessons.length

    lessons.forEach((lesson) => {
      if (enrollmentsStore.isLessonCompleted(moduleId, lesson.id)) {
        completedLessons++
      }
    })
  })

  return totalLessons > 0 && completedLessons === totalLessons
}

// Записуємо користувача на курс
async function enrollCourse() {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }

  if (isEnrolled.value) {
    if (continueUrl.value) {
      router.push(continueUrl.value)
    }
    return
  }

  try {
    const enrollment = await enrollmentsStore.enrollCourse(courseId)

    if (enrollment) {
      isEnrolled.value = true
      enrollment.value = enrollment

      if (continueUrl.value) {
        router.push(continueUrl.value)
      } else {
        alert(
          'Ви успішно записались на курс! Наразі лекції ще не доступні, але невдовзі будуть додані.',
        )
      }
    }
  } catch (error) {
    console.error('Помилка при записі на курс:', error)
    alert(`Помилка при записі на курс: ${error.message}`)
  }
}

function navigateToFinalQuiz() {
  if (!isEnrolled.value) return

  if (
    sortedModules.value.length > 0 &&
    moduleLessons.value[sortedModules.value[0].id] &&
    moduleLessons.value[sortedModules.value[0].id].length > 0
  ) {
    const firstModule = sortedModules.value[0]
    const firstLesson = moduleLessons.value[firstModule.id][0]

    router.push({
      path: `/courses/${courseId}/modules/${firstModule.id}/lessons/${firstLesson.id}`,
      query: { showFinalQuiz: 'true' },
    })
  }
}

onMounted(async () => {
  await fetchCourse()
  if (authStore.isAuthenticated) {
    await checkEnrollment()
  }
})

watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated) => {
    if (isAuthenticated) {
      await checkEnrollment()
    } else {
      isEnrolled.value = false
    }
  },
)
</script>

<style scoped>
.course-detail-page {
  min-height: 100vh;
  background-color: #f3f4f6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.completion-notification {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.notification-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.certificate-link {
  margin-top: 1rem;
}

.certificate-button {
  display: inline-block;
  background-color: #10b981;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 40px;
  text-decoration: none;
  font-weight: 600;
  margin-top: 0.5rem;
  transition: background-color 0.3s;
}

.certificate-button:hover {
  background-color: #059669;
}

.loading-state,
.error-state,
.no-modules,
.no-author {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.retry-button,
.show-all-button,
.enroll-button,
.completed-button,
.take-quiz-button {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button,
.enroll-button,
.take-quiz-button {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.retry-button:hover,
.enroll-button:hover,
.take-quiz-button:hover {
  background-color: #2563eb;
}

.completed-button {
  background-color: #10b981;
  color: white;
  border: none;
}

.enroll-button,
.completed-button,
.take-quiz-button {
  border-radius: 40px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
}

.enroll-button:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.show-all-button {
  display: block;
  margin: 1rem auto 0;
  background-color: transparent;
  border: 1px solid #3b82f6;
  color: #3b82f6;
}

.show-all-button:hover {
  background-color: #ebf5ff;
  transform: translateY(-2px);
}

.course-header,
.course-content,
.author-section {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.course-header {
  display: flex;
}

.course-content,
.author-section {
  padding: 2rem;
}

.course-info {
  flex: 1.5;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.course-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.course-description,
.author-bio {
  margin-bottom: 1.5rem;
  color: #4b5563;
  line-height: 1.5;
  word-wrap: break-word;
}

.course-banner-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 40%;
  padding: 2rem;
  justify-content: center;
  align-items: center;
}

.course-banner {
  width: 100%;
  margin-bottom: 1.5rem;
}

.course-image {
  width: 100%;
  object-fit: cover;
  border-radius: 1.5rem;
}

.course-meta,
.course-stats {
  display: flex;
  gap: 1.5rem;
}

.course-meta {
  text-align: center;
}

.course-stats {
  margin-bottom: 1.5rem;
}

.meta-item {
  margin-bottom: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.meta-label {
  font-size: 0.75rem;
  font-weight: bold;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.meta-value {
  font-weight: 500;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  width: 16px;
  height: 16px;
}

.level-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.level-badge.beginner {
  background-color: #dcfce7;
  color: #166534;
}

.level-badge.intermediate {
  background-color: #fef3c7;
  color: #92400e;
}

.level-badge.advanced {
  background-color: #fee2e2;
  color: #991b1b;
}

.course-technologies {
  margin-bottom: 1.5rem;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tech-tag {
  background-color: #e5e7eb;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.enroll-section {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.availability {
  font-weight: 500;
  color: #4b5563;
}

.progress-container {
  margin-bottom: 1rem;
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.progress-fill {
  height: 100%;
  background-color: #3b82f6;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.module-item {
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.module-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.module-expanded {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f3f4f6;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.module-header:hover,
.module-header-expanded {
  background-color: #e5e7eb;
}

.module-header h3 {
  flex: 1;
  margin: 0;
  font-size: 1.125rem;
}

.lesson-count {
  color: #6b7280;
  margin-right: 1rem;
  font-size: 0.875rem;
}

.toggle-button-wrapper {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-button {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #6b7280;
  transition: all 0.5s ease;
  transform: rotate(-90deg);
}

.toggle-button.toggle-active {
  transform: rotate(0deg);
  color: #3b82f6;
}

.module-content {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.final-quiz-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
}

.final-quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.final-quiz-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.quiz-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.quiz-status.completed {
  background-color: #dcfce7;
  color: #166534;
}

.quiz-status.pending {
  background-color: #fee2e2;
  color: #991b1b;
}

.final-quiz-description {
  margin-bottom: 1.5rem;
  color: #1e40af;
}

.final-quiz-actions {
  display: flex;
  justify-content: center;
}

.quiz-not-available {
  color: #6b7280;
  font-style: italic;
  text-align: center;
}

.expand-enter-active,
.expand-leave-active {
  transition:
    max-height 0.5s ease,
    opacity 0.5s ease,
    padding 0.5s ease;
  max-height: 1000px;
  overflow: hidden;
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.module-description {
  margin-bottom: 1rem;
  line-height: 1.5;
  color: #4b5563;
}

.loading-lessons,
.error-lessons,
.no-lessons {
  padding: 1rem 0;
  color: #6b7280;
}

.no-lessons-message {
  margin-top: 0.5rem;
  font-style: italic;
}

.lessons-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.lesson-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.3s ease;
}

.lesson-item:hover {
  background-color: #f9fafb;
  padding-left: 0.5rem;
}

.lesson-item:last-child {
  border-bottom: none;
}

.list-enter-active,
.list-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.list-move {
  transition: transform 0.5s ease;
}

.lesson-completed {
  margin-left: 0.5rem;
  color: #10b981;
  font-weight: bold;
}

.author-card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.author-link,
.author-content {
  display: flex;
  gap: 1.5rem;
  padding: 0.5rem;
}

.author-link {
  text-decoration: none;
  color: inherit;
  transition: background-color 0.3s ease;
  border-radius: 0.5rem;
}

.author-link:hover {
  background-color: #f3f4f6;
}

.author-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.author-card:hover .author-avatar {
  transform: scale(1.05);
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0 0 0.5rem;
}

@media (max-width: 768px) {
  .course-header {
    flex-direction: column;
  }

  .course-banner-wrapper {
    max-width: 100%;
    padding: 1.5rem 1.5rem 0 1.5rem;
  }

  .course-info {
    padding: 1.5rem;
  }

  .course-meta {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .meta-item {
    margin-bottom: 0;
    align-items: flex-start;
  }

  .course-stats {
    flex-wrap: wrap;
  }

  .final-quiz-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .quiz-status {
    align-self: flex-start;
  }
}
</style>
