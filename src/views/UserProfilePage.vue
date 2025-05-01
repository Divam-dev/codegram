<template>
  <div class="user-cabinet">
    <BaseHeader />
    <div class="cabinet-container">
      <div class="profile-section">
        <div v-if="isLoading" class="loading-container">
          <p>Завантаження профілю...</p>
        </div>

        <div v-else-if="error" class="error-container">
          <h1 class="error-code">ПОМИЛКА</h1>
          <p class="error-description">{{ error }}</p>
          <router-link to="/courses" class="home-button"> Повернутися до курсів </router-link>
        </div>

        <div v-else class="profile-header">
          <img :src="displayAvatar" :alt="userName" class="avatar" />
          <div class="user-details">
            <div class="detail-item">
              <span class="detail-label">Логін:</span>
              <p class="detail-value">{{ userName }}</p>
            </div>
            <div class="detail-item" v-if="isOwnProfile">
              <span class="detail-label">Електронна пошта:</span>
              <p class="detail-value">{{ userEmail }}</p>
            </div>
            <div class="detail-item" v-if="isOwnProfile">
              <span class="detail-label">Ім'я та прізвище:</span>
              <p class="detail-value">{{ userFullName || 'Не вказано' }}</p>
            </div>
            <div class="detail-item">
              <span class="detail-label">Про мене:</span>
              <p class="detail-value bio">{{ userBio || 'Не вказано' }}</p>
            </div>
          </div>
          <div class="edit-profile-container" v-if="isOwnProfile">
            <button @click="showEditModal = true" class="edit-profile-btn">
              Редагувати профіль
            </button>
          </div>
        </div>

        <div v-if="!isLoading && !error">
          <div v-if="isOwnProfile" class="my-courses">
            <h3>Мої курси</h3>
            <div v-if="enrolledCourses.length" class="courses-grid">
              <CourseCard v-for="course in enrolledCourses" :key="course.id" :course="course" />
            </div>
            <p v-else>Ви ще не зареєструвались ні на один курс</p>
          </div>

          <div class="created-courses">
            <h3>{{ isOwnProfile ? 'Створені мною курси' : 'Курси, створені користувачем' }}</h3>
            <div v-if="createdCourses.length" class="courses-grid">
              <CourseCard v-for="course in createdCourses" :key="course.id" :course="course" />
            </div>
            <p v-else>
              {{
                isOwnProfile
                  ? 'Ви ще не створили жодного курсу'
                  : 'Користувач ще не створив жодного курсу'
              }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <ProfileEditModal
      v-if="isOwnProfile"
      :show="showEditModal"
      :userData="profileStore"
      :userAvatar="displayAvatar"
      @close="showEditModal = false"
      @submit="updateProfile"
    />

    <BaseFooter />
  </div>
</template>

<script>
import BaseHeader from '../components/BaseHeader.vue'
import BaseFooter from '../components/BaseFooter.vue'
import CourseCard from '../components/CourseCard.vue'
import ProfileEditModal from '../components/ProfileEditModal.vue'
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore'
import profileAvatarSvg from '@/assets/svg/profile-avatar.svg'

export default {
  name: 'UserProfilePage',
  components: {
    BaseHeader,
    BaseFooter,
    CourseCard,
    ProfileEditModal,
  },
  data() {
    return {
      enrolledCourses: [],
      createdCourses: [],
      defaultAvatar: profileAvatarSvg,
      showEditModal: false,
      isLoading: true,
      error: null,
      userData: null,
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    profileStore() {
      return useProfileStore()
    },
    isOwnProfile() {
      return (
        !this.$route.params.userId ||
        (this.authStore.user && this.$route.params.userId === this.authStore.user.uid)
      )
    },
    userId() {
      return this.isOwnProfile ? this.authStore.user?.uid : this.$route.params.userId
    },
    userName() {
      return this.isOwnProfile
        ? this.profileStore.userName
        : this.userData?.username || 'Користувач'
    },
    userEmail() {
      return this.isOwnProfile ? this.profileStore.userEmail : ''
    },
    userFullName() {
      return this.isOwnProfile
        ? this.profileStore.userFullName
        : this.userData?.profile?.fullName || ''
    },
    userBio() {
      return this.isOwnProfile ? this.profileStore.userBio : this.userData?.profile?.bio || ''
    },
    userAvatar() {
      return this.isOwnProfile
        ? this.profileStore.userAvatar
        : this.userData?.profile?.avatarUrl || ''
    },
    displayAvatar() {
      return this.userAvatar || this.defaultAvatar
    },
  },
  created() {
    this.loadProfile()
  },
  watch: {
    '$route.params.userId'() {
      this.loadProfile()
    },
  },
  methods: {
    async loadProfile() {
      this.isLoading = true
      this.error = null

      try {
        if (this.isOwnProfile) {
          if (this.authStore.user) {
            await Promise.all([
              this.loadEnrolledCourses(this.authStore.user.uid),
              this.loadCreatedCourses(this.authStore.user.uid),
            ])
          }
        } else {
          const userId = this.$route.params.userId
          const db = getFirestore()
          const userDoc = await getDoc(doc(db, 'users', userId))

          if (!userDoc.exists()) {
            throw new Error('Користувача не знайдено')
          }

          this.userData = userDoc.data()
          await this.loadCreatedCourses(userId)
        }
      } catch (error) {
        console.error('Помилка при завантаженні профілю:', error)
        this.error = `Не вдалося завантажити профіль: ${error.message}`
      } finally {
        this.isLoading = false
      }
    },

    // Завантаження курсів, на які записаний користувач
    async loadEnrolledCourses(userId) {
      if (!userId) return

      try {
        const db = getFirestore()

        const enrollmentsRef = collection(db, 'enrollments')
        const q = query(enrollmentsRef, where('userId', '==', userId))
        const enrollmentsSnapshot = await getDocs(q)

        if (enrollmentsSnapshot.empty) {
          this.enrolledCourses = []
          return
        }

        const enrollments = []
        enrollmentsSnapshot.forEach((doc) => {
          enrollments.push({
            id: doc.id,
            ...doc.data(),
          })
        })

        // Отримуємо дані кожного курсу
        const coursePromises = enrollments.map(async (enrollment) => {
          try {
            const courseRef = doc(db, 'courses', enrollment.courseId)
            const courseDoc = await getDoc(courseRef)

            if (courseDoc.exists()) {
              const courseData = courseDoc.data()
              let authorData = null

              if (courseData.authorId) {
                try {
                  const authorRef = doc(db, 'users', courseData.authorId)
                  const authorDoc = await getDoc(authorRef)

                  if (authorDoc.exists()) {
                    authorData = authorDoc.data()
                  }
                } catch (authorError) {
                  console.error(
                    `Помилка при отриманні автора для курсу ${courseDoc.id}:`,
                    authorError,
                  )
                }
              }

              return {
                id: courseDoc.id,
                ...courseData,
                author: authorData,
                enrollmentId: enrollment.id,
                progress: enrollment.progress || 0,
                lastModuleId: enrollment.lastModuleId,
                lastLessonId: enrollment.lastLessonId,
                completed: enrollment.completed || false,
                certificateIssued: enrollment.certificateIssued || false,
                certificateUrl: enrollment.certificateUrl,
                continueLink:
                  enrollment.lastModuleId && enrollment.lastLessonId
                    ? `/courses/${courseDoc.id}/modules/${enrollment.lastModuleId}/lessons/${enrollment.lastLessonId}`
                    : `/courses/${courseDoc.id}`,
              }
            }
            return null
          } catch (error) {
            console.error(`Помилка при отриманні курсу ${enrollment.courseId}:`, error)
            return null
          }
        })

        const courses = await Promise.all(coursePromises)
        this.enrolledCourses = courses.filter((course) => course !== null)
      } catch (error) {
        console.error('Помилка при завантаженні курсів користувача:', error)
        this.error = `Не вдалося завантажити курси: ${error.message}`
      }
    },

    async loadCreatedCourses(userId) {
      if (!userId) return

      // Код завантаження курсів які створив користувач

      this.createdCourses = []
    },

    async updateProfile(updateData) {
      try {
        await this.profileStore.updateUserProfile(this.authStore.user.uid, updateData)
        this.showEditModal = false
      } catch (error) {
        console.error('Помилка при оновленні профілю:', error)
        alert(`Помилка при оновленні профілю: ${error.message}`)
      }
    },
  },
}
</script>

<style scoped>
.user-cabinet {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #bbd3fc;
}

.cabinet-container {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 2rem auto;
  padding: 2rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.profile-section {
  display: flex;
  flex-direction: column;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1.5rem;
}

.user-details {
  width: 100%;
  margin-bottom: 1.5rem;
  margin-left: 3rem;
}

.detail-item {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-weight: bold;
  color: #4b5563;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.detail-value {
  margin: 0;
}

.detail-value.bio {
  white-space: pre-line;
  line-height: 1.5;
}

.edit-profile-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.edit-profile-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid #000;
  border-radius: 25px;
  font-size: 14px;
  cursor: pointer;
  transition:
    background-color 0.3s,
    color 0.3s;
}

.edit-profile-btn:hover {
  background-color: #3b82f6;
  color: #fff;
}

.my-courses,
.created-courses {
  margin-bottom: 2rem;
}

.my-courses h3,
.created-courses h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 24px;
  font-weight: bold;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
  padding: 2rem;
}

.error-code {
  font-size: 24px;
  font-weight: bold;
  margin: 1rem 0;
}

.error-description {
  color: #666;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 2rem;
}

.home-button {
  padding: 10px 20px;
  background-color: transparent;
  border: 1px solid #000;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  color: #000;
  transition:
    background-color 0.3s,
    color 0.3s;
}

.home-button:hover {
  background-color: #3b82f6;
  color: #fff;
}

@media (max-width: 768px) {
  .cabinet-container {
    padding: 1rem;
  }
}
</style>
