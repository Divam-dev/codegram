<template>
  <div class="user-cabinet">
    <BaseHeader />
    <div class="cabinet-container">
      <div class="profile-section">
        <div class="profile-header">
          <img :src="displayAvatar" :alt="profileStore.userName" class="avatar" />
          <div class="user-details">
            <div class="detail-item">
              <span class="detail-label">Логін:</span>
              <p class="detail-value">{{ profileStore.userName }}</p>
            </div>
            <div class="detail-item">
              <span class="detail-label">Електронна пошта:</span>
              <p class="detail-value">{{ profileStore.userEmail }}</p>
            </div>
            <div class="detail-item">
              <span class="detail-label">Ім'я та прізвище:</span>
              <p class="detail-value">{{ profileStore.userFullName || 'Не вказано' }}</p>
            </div>
            <div class="detail-item">
              <span class="detail-label">Про мене:</span>
              <p class="detail-value bio">{{ profileStore.userBio || 'Не вказано' }}</p>
            </div>
          </div>
          <div class="edit-profile-container">
            <button @click="showEditModal = true" class="edit-profile-btn">
              Редагувати профіль
            </button>
          </div>
        </div>

        <div class="my-courses">
          <h3>Мої курси</h3>
          <div v-if="myCourses.length" class="courses-grid">
            <CourseCard v-for="course in myCourses" :key="course.id" :course="course" />
          </div>
          <p v-else>Ви ще не зареєструвались ні на один курс</p>
        </div>
      </div>
    </div>

    <ProfileEditModal
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
import profileAvatarSvg from '@/assets/svg/profile-avatar.svg'

export default {
  name: 'UserCabinetPage',
  components: {
    BaseHeader,
    BaseFooter,
    CourseCard,
    ProfileEditModal,
  },
  data() {
    return {
      myCourses: [],
      defaultAvatar: profileAvatarSvg,
      showEditModal: false,
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    profileStore() {
      return useProfileStore()
    },
    displayAvatar() {
      return this.profileStore.userAvatar || this.defaultAvatar
    },
  },
  methods: {
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
  background-color: #bbd3fc;
}

.cabinet-container {
  max-width: 1200px;
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

.my-courses {
  margin-bottom: 2rem;
}

.my-courses h3 {
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

@media (max-width: 768px) {
  .cabinet-container {
    padding: 1rem;
  }
}
</style>
