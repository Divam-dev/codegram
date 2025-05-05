<template>
  <div class="user-courses-page">
    <BaseHeader />
    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">Мої курси</h1>
          <router-link to="/create-course/new" class="create-course-btn">
            Створити новий курс
          </router-link>
        </div>

        <div v-if="loading" class="loading-state">
          <p>Завантаження ваших курсів...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="fetchUserCourses" class="retry-button">Спробувати знову</button>
        </div>

        <div v-else>
          <div class="courses-section">
            <h2 class="section-title">Опубліковані курси</h2>
            <div v-if="publishedCourses.length === 0" class="empty-section">
              <p>У вас немає опублікованих курсів</p>
            </div>
            <div v-else class="courses-grid">
              <div v-for="course in publishedCourses" :key="course.id" class="course-card">
                <div class="course-status approved">Опубліковано</div>
                <img
                  :src="course.image || defaultCourseImage"
                  :alt="course.title"
                  class="course-image"
                />
                <div class="course-content">
                  <h3 class="course-title">{{ course.title }}</h3>
                  <p class="course-description">{{ course.description }}</p>
                  <div class="course-meta">
                    <span class="meta-item">
                      <img src="@/assets/svg/user.svg" alt="Students" class="meta-icon" />
                      {{ course.students || 0 }} учнів
                    </span>
                  </div>
                  <div class="course-actions">
                    <router-link :to="`/courses/${course.id}`" class="btn-view">
                      Переглянути
                    </router-link>
                    <router-link :to="`/create-course/edit/${course.id}`" class="btn-edit">
                      Редагувати
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="courses-section">
            <h2 class="section-title">На перевірці</h2>
            <div v-if="pendingCourses.length === 0" class="empty-section">
              <p>У вас немає курсів, що очікують на перевірку</p>
            </div>
            <div v-else class="courses-grid">
              <div v-for="course in pendingCourses" :key="course.id" class="course-card">
                <div class="course-status pending">На перевірці</div>
                <img
                  :src="course.image || defaultCourseImage"
                  :alt="course.title"
                  class="course-image"
                />
                <div class="course-content">
                  <h3 class="course-title">{{ course.title }}</h3>
                  <p class="course-description">{{ course.description }}</p>
                  <div class="course-meta">
                    <span class="meta-item"> Створено: {{ formatDate(course.createdAt) }} </span>
                  </div>
                  <div class="course-actions">
                    <router-link :to="`/create-course/edit/${course.id}`" class="btn-edit">
                      Редагувати
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="courses-section">
            <h2 class="section-title">Відхилені курси</h2>
            <div v-if="rejectedCourses.length === 0" class="empty-section">
              <p>У вас немає відхилених курсів</p>
            </div>
            <div v-else class="courses-grid">
              <div v-for="course in rejectedCourses" :key="course.id" class="course-card">
                <div class="course-status rejected">Відхилено</div>
                <img
                  :src="course.image || defaultCourseImage"
                  :alt="course.title"
                  class="course-image"
                />
                <div class="course-content">
                  <h3 class="course-title">{{ course.title }}</h3>
                  <p class="course-description">{{ course.description }}</p>
                  <div class="course-meta rejection-reason">
                    <strong>Причина відхилення:</strong>
                    <p>{{ course.rejectionReason || 'Причина не вказана' }}</p>
                  </div>
                  <div class="course-actions">
                    <router-link :to="`/create-course/edit/${course.id}`" class="btn-edit">
                      Редагувати та відправити на повторну перевірку
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="courses-section">
            <h2 class="section-title">Чернетки</h2>
            <div v-if="draftCourses.length === 0" class="empty-section">
              <p>У вас немає збережених чернеток</p>
            </div>
            <div v-else class="courses-grid">
              <div v-for="course in draftCourses" :key="course.id" class="course-card">
                <div class="course-status draft">Чернетка</div>
                <img
                  :src="course.image || defaultCourseImage"
                  :alt="course.title"
                  class="course-image"
                />
                <div class="course-content">
                  <h3 class="course-title">{{ course.title }}</h3>
                  <p class="course-description">{{ course.description || 'Немає опису' }}</p>
                  <div class="course-meta">
                    <span class="meta-item">
                      Останнє оновлення: {{ formatDate(course.updatedAt || course.createdAt) }}
                    </span>
                  </div>
                  <div class="course-actions">
                    <router-link :to="`/create-course/edit/${course.id}`" class="btn-edit">
                      Продовжити редагування
                    </router-link>
                    <button @click="deleteDraft(course.id)" class="btn-delete">Видалити</button>
                  </div>
                </div>
              </div>
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
import { getFirestore, collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore'
import BaseHeader from '@/components/BaseHeader.vue'
import BaseFooter from '@/components/BaseFooter.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'UserCoursesPage',
  components: {
    BaseHeader,
    BaseFooter,
  },
  setup() {
    const db = getFirestore()
    const authStore = useAuthStore()
    const router = useRouter()

    const loading = ref(true)
    const error = ref(null)
    const publishedCourses = ref([])
    const pendingCourses = ref([])
    const rejectedCourses = ref([])
    const draftCourses = ref([])
    const defaultCourseImage = 'https://placehold.co/1280x720'

    // Завантаження курсів користувача
    const fetchUserCourses = async () => {
      if (!authStore.isAuthenticated) {
        router.push('/login')
        return
      }

      loading.value = true
      error.value = null

      try {
        const userId = authStore.user.uid

        const coursesRef = collection(db, 'courses')
        const userCoursesQuery = query(coursesRef, where('authorId', '==', userId))
        const querySnapshot = await getDocs(userCoursesQuery)

        publishedCourses.value = []
        pendingCourses.value = []
        rejectedCourses.value = []
        draftCourses.value = []

        querySnapshot.forEach((doc) => {
          const courseData = {
            id: doc.id,
            ...doc.data(),
          }

          switch (courseData.status) {
            case 'approved':
              publishedCourses.value.push(courseData)
              break
            case 'pending':
              pendingCourses.value.push(courseData)
              break
            case 'rejected':
              rejectedCourses.value.push(courseData)
              break
            case 'draft':
              draftCourses.value.push(courseData)
              break
            default:
              draftCourses.value.push(courseData)
          }
        })

        // Сортування за датою створення (від найновіших)
        const sortByDate = (a, b) => {
          const dateA = getTimestamp(a.updatedAt || a.createdAt)
          const dateB = getTimestamp(b.updatedAt || b.createdAt)
          return dateB - dateA
        }

        publishedCourses.value.sort(sortByDate)
        pendingCourses.value.sort(sortByDate)
        rejectedCourses.value.sort(sortByDate)
        draftCourses.value.sort(sortByDate)
      } catch (err) {
        console.error('Помилка при завантаженні курсів користувача:', err)
        error.value = `Помилка: ${err.message}`
      } finally {
        loading.value = false
      }
    }

    // Отримання timestamp з різних форматів дати
    const getTimestamp = (dateField) => {
      if (!dateField) return 0

      if (dateField._seconds) {
        return dateField._seconds * 1000
      } else if (dateField.seconds) {
        return dateField.seconds * 1000
      } else if (dateField.toDate) {
        return dateField.toDate().getTime()
      } else if (dateField instanceof Date) {
        return dateField.getTime()
      }

      return 0
    }

    // Форматування дати
    const formatDate = (dateField) => {
      if (!dateField) return 'Невідомо'

      try {
        let date

        if (dateField._seconds) {
          date = new Date(dateField._seconds * 1000)
        } else if (dateField.seconds) {
          date = new Date(dateField.seconds * 1000)
        } else if (dateField.toDate) {
          date = dateField.toDate()
        } else if (dateField instanceof Date) {
          date = dateField
        } else {
          return 'Невідомо'
        }

        return date.toLocaleDateString('uk-UA')
      } catch (err) {
        console.error('Помилка при форматуванні дати:', err)
        return 'Невідомо'
      }
    }

    // Видалення чернетки курсу
    const deleteDraft = async (courseId) => {
      if (!confirm('Ви впевнені, що хочете видалити цю чернетку?')) {
        return
      }

      try {
        const courseRef = doc(db, 'courses', courseId)
        await deleteDoc(courseRef)

        draftCourses.value = draftCourses.value.filter((course) => course.id !== courseId)

        alert('Чернетку видалено')
      } catch (err) {
        console.error('Помилка при видаленні чернетки:', err)
        alert(`Помилка: ${err.message}`)
      }
    }

    onMounted(() => {
      fetchUserCourses()
    })

    return {
      loading,
      error,
      publishedCourses,
      pendingCourses,
      rejectedCourses,
      draftCourses,
      defaultCourseImage,
      fetchUserCourses,
      formatDate,
      deleteDraft,
    }
  },
}
</script>

<style scoped>
.user-courses-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f3f4f6;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.create-course-btn {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.create-course-btn:hover {
  background-color: #2563eb;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
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
}

.retry-button:hover {
  background-color: #d1d5db;
}

.courses-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.empty-section {
  background-color: white;
  padding: 2rem;
  border-radius: 0.5rem;
  text-align: center;
  color: #6b7280;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.course-card {
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.course-status {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  z-index: 1;
}

.course-status.approved {
  background-color: #d1fae5;
  color: #065f46;
}

.course-status.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.course-status.rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

.course-status.draft {
  background-color: #e5e7eb;
  color: #4b5563;
}

.course-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.course-content {
  padding: 1.25rem;
}

.course-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem;
  overflow: hidden;
  height: 2.75rem;
}

.course-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1rem;
  overflow: hidden;
  height: 3.75rem;
}

.course-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #4b5563;
}

.meta-icon {
  width: 16px;
  height: 16px;
}

.rejection-reason {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background-color: #fee2e2;
  padding: 0.5rem;
  border-radius: 0.25rem;
  color: #991b1b;
}

.rejection-reason p {
  margin: 0;
  font-size: 0.8125rem;
}

.course-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-view,
.btn-edit,
.btn-delete {
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  text-decoration: none;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.btn-view {
  background-color: #e5e7eb;
  color: #4b5563;
  border: none;
  flex: 1;
}

.btn-view:hover {
  background-color: #d1d5db;
}

.btn-edit {
  background-color: #3b82f6;
  color: white;
  border: none;
  flex: 2;
}

.btn-edit:hover {
  background-color: #2563eb;
}

.btn-delete {
  background-color: #ef4444;
  color: white;
  border: none;
  flex: 1;
}

.btn-delete:hover {
  background-color: #dc2626;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .courses-grid {
    grid-template-columns: 1fr;
  }

  .course-actions {
    flex-direction: column;
  }

  .btn-view,
  .btn-edit,
  .btn-delete {
    width: 100%;
  }
}
</style>
