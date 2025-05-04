<template>
  <div class="admin-page">
    <BaseHeader />
    <main class="admin-container">
      <h1 class="admin-title">Адмін-панель</h1>

      <div class="admin-section">
        <h2 class="section-title">Курси на перевірці</h2>

        <div v-if="loading" class="loading-state">
          <p>Завантаження курсів...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="fetchPendingCourses" class="retry-button">Спробувати знову</button>
        </div>

        <div v-else-if="pendingCourses.length === 0" class="empty-state">
          <p>Немає курсів, що очікують на перевірку</p>
        </div>

        <div v-else class="courses-list">
          <div v-for="course in pendingCourses" :key="course.id" class="course-card">
            <div class="course-header">
              <img
                :src="course.image || defaultCourseImage"
                :alt="course.title"
                class="course-image"
              />

              <div class="course-info">
                <h3 class="course-title">{{ course.title }}</h3>
                <p class="course-description">{{ course.description }}</p>

                <div class="course-meta">
                  <div class="meta-item">
                    <span class="meta-label">Автор:</span>
                    <span class="meta-value">
                      {{ course.author ? course.author.username : 'Невідомий автор' }}
                    </span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Дата створення:</span>
                    <span class="meta-value">{{ formatDate(course.createdAt) }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Рівень:</span>
                    <span class="meta-value">{{ formatLevel(course.level) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="course-actions">
              <button @click="approveCourse(course.id)" class="approve-button">
                Схвалити курс
              </button>
              <button @click="rejectCourse(course.id)" class="reject-button">Відхилити</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showRejectModal" class="modal-overlay" @click="closeRejectModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Відхилення курсу</h3>
            <button class="close-btn" @click="closeRejectModal">&times;</button>
          </div>
          <div class="modal-body">
            <p>
              Вкажіть причину відхилення курсу "{{ selectedCourse ? selectedCourse.title : '' }}"
            </p>
            <textarea
              v-model="rejectReason"
              placeholder="Опишіть чому курс відхилено та що потрібно виправити"
              rows="4"
              class="reject-textarea"
            ></textarea>
            <div class="modal-actions">
              <button class="cancel-btn" @click="closeRejectModal">Скасувати</button>
              <button class="confirm-btn" @click="confirmReject" :disabled="!rejectReason.trim()">
                Підтвердити відхилення
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
    <BaseFooter />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore'
import BaseHeader from '@/components/BaseHeader.vue'
import BaseFooter from '@/components/BaseFooter.vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useRouter } from 'vue-router'

export default {
  name: 'AdminPage',
  components: {
    BaseHeader,
    BaseFooter,
  },
  setup() {
    const db = getFirestore()
    const authStore = useAuthStore()
    const profileStore = useProfileStore()
    const router = useRouter()

    const loading = ref(true)
    const error = ref(null)
    const pendingCourses = ref([])
    const defaultCourseImage = 'https://i.ibb.co/nq4bG4r/Icon.jpg'

    const showRejectModal = ref(false)
    const selectedCourse = ref(null)
    const rejectReason = ref('')

    const checkAdminAccess = () => {
      const userRole = profileStore.profile?.role

      if (!authStore.isAuthenticated || (userRole !== 'admin' && userRole !== 'moderator')) {
        router.push('/')
        return false
      }

      return true
    }

    const fetchPendingCourses = async () => {
      if (!checkAdminAccess()) return

      loading.value = true
      error.value = null

      try {
        const coursesRef = collection(db, 'courses')
        const q = query(coursesRef, where('status', '==', 'pending'))
        const querySnapshot = await getDocs(q)

        const courses = []

        for (const docSnapshot of querySnapshot.docs) {
          const courseData = {
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }

          if (courseData.authorId) {
            try {
              const authorRef = doc(db, 'users', courseData.authorId)
              const authorDoc = await getDoc(authorRef)

              if (authorDoc.exists()) {
                courseData.author = authorDoc.data()
              }
            } catch (err) {
              console.error(`Помилка при отриманні автора для курсу ${courseData.id}:`, err)
            }
          }

          courses.push(courseData)
        }

        pendingCourses.value = courses
      } catch (err) {
        console.error('Помилка при отриманні курсів на перевірці:', err)
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    const approveCourse = async (courseId) => {
      if (!checkAdminAccess()) return

      try {
        const courseRef = doc(db, 'courses', courseId)

        await updateDoc(courseRef, {
          status: 'approved',
          reviewedBy: profileStore.profile.userId,
          updatedAt: new Date(),
        })

        alert('Курс успішно схвалено!')

        await fetchPendingCourses()
      } catch (err) {
        console.error(`Помилка при схваленні курсу ${courseId}:`, err)
        alert(`Помилка: ${err.message}`)
      }
    }

    const rejectCourse = (courseId) => {
      const course = pendingCourses.value.find((c) => c.id === courseId)
      if (course) {
        selectedCourse.value = course
        showRejectModal.value = true
      }
    }

    const closeRejectModal = () => {
      showRejectModal.value = false
      selectedCourse.value = null
      rejectReason.value = ''
    }

    const confirmReject = async () => {
      if (!selectedCourse.value || !rejectReason.value.trim()) return

      try {
        const courseRef = doc(db, 'courses', selectedCourse.value.id)

        await updateDoc(courseRef, {
          status: 'rejected',
          reviewedBy: profileStore.profile.userId,
          rejectionReason: rejectReason.value,
          updatedAt: new Date(),
        })

        alert('Курс відхилено')
        closeRejectModal()

        await fetchPendingCourses()
      } catch (err) {
        console.error(`Помилка при відхиленні курсу:`, err)
        alert(`Помилка: ${err.message}`)
      }
    }

    const formatDate = (timestamp) => {
      if (!timestamp) return 'Невідомо'

      try {
        let date

        if (timestamp._seconds) {
          date = new Date(timestamp._seconds * 1000)
        } else if (timestamp.seconds) {
          date = new Date(timestamp.seconds * 1000)
        } else if (timestamp.toDate) {
          date = timestamp.toDate()
        } else if (timestamp instanceof Date) {
          date = timestamp
        } else {
          return 'Невідомо'
        }

        return date.toLocaleDateString('uk-UA', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      } catch (err) {
        console.error('Помилка при форматуванні дати:', err)
        return 'Невідомо'
      }
    }

    const formatLevel = (level) => {
      const levels = {
        beginner: 'Початковий',
        intermediate: 'Середній',
        advanced: 'Просунутий',
      }

      return levels[level] || level
    }

    onMounted(() => {
      fetchPendingCourses()
    })

    return {
      loading,
      error,
      pendingCourses,
      defaultCourseImage,
      showRejectModal,
      selectedCourse,
      rejectReason,
      fetchPendingCourses,
      approveCourse,
      rejectCourse,
      closeRejectModal,
      confirmReject,
      formatDate,
      formatLevel,
    }
  },
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f3f4f6;
}

.admin-container {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  width: 100%;
}

.admin-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #111827;
}

.admin-section {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #111827;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  color: #6b7280;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #e5e7eb;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #d1d5db;
}

.courses-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.course-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #f9fafb;
}

.course-header {
  display: flex;
  padding: 1.25rem;
  gap: 1.5rem;
}

.course-image {
  width: 150px;
  height: 100px;
  object-fit: cover;
  border-radius: 0.375rem;
}

.course-info {
  flex: 1;
}

.course-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: #111827;
}

.course-description {
  font-size: 0.875rem;
  color: #4b5563;
  margin: 0 0 1rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.meta-item {
  font-size: 0.875rem;
}

.meta-label {
  color: #6b7280;
  margin-right: 0.25rem;
}

.meta-value {
  font-weight: 500;
  color: #111827;
}

.course-actions {
  display: flex;
  padding: 1rem 1.25rem;
  gap: 0.75rem;
  background-color: #f3f4f6;
  border-top: 1px solid #e5e7eb;
}

.approve-button,
.reject-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.approve-button {
  background-color: #10b981;
  color: white;
}

.approve-button:hover {
  background-color: #059669;
}

.reject-button {
  background-color: #ef4444;
  color: white;
}

.reject-button:hover {
  background-color: #dc2626;
}

/* Модальне вікно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
}

.reject-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  margin: 1rem 0;
  font-size: 0.875rem;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.cancel-btn,
.confirm-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.cancel-btn {
  background-color: #e5e7eb;
  color: #4b5563;
}

.cancel-btn:hover {
  background-color: #d1d5db;
}

.confirm-btn {
  background-color: #ef4444;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background-color: #dc2626;
}

.confirm-btn:disabled {
  background-color: #fca5a5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .course-header {
    flex-direction: column;
    gap: 1rem;
  }

  .course-image {
    width: 100%;
    height: auto;
  }

  .course-meta {
    grid-template-columns: 1fr;
  }

  .course-actions {
    flex-direction: column;
  }
}
</style>
