<template>
  <div class="user-cabinet">
    <BaseHeader />
    <div class="cabinet-container">
      <div class="profile-section">
        <div class="profile-header">
          <img :src="displayAvatar" :alt="authStore.userName" class="avatar" />
          <div class="user-details">
            <div class="detail-item">
              <span class="detail-label">Логін:</span>
              <h2 class="detail-value">{{ authStore.userName }}</h2>
            </div>
            <div class="detail-item">
              <span class="detail-label">Електронна пошта:</span>
              <p class="detail-value">{{ authStore.userEmail }}</p>
            </div>
            <div class="detail-item">
              <span class="detail-label">Ім'я та прізвище:</span>
              <p class="detail-value">{{ authStore.profile?.profile?.fullName || 'Не вказано' }}</p>
            </div>
            <div class="detail-item">
              <span class="detail-label">Про мене:</span>
              <p class="detail-value bio">{{ authStore.profile?.profile?.bio || 'Не вказано' }}</p>
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

    <!-- Modal window for editing profile -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Редагування профілю</h3>
          <button class="close-btn" @click="showEditModal = false">&times;</button>
        </div>
        <form @submit.prevent="updateProfile" class="edit-form">
          <div class="form-group">
            <label for="username">Логін</label>
            <div class="input-wrapper">
              <input
                v-model="editData.username"
                type="text"
                id="username"
                placeholder="Введіть новий логін"
              />
              <img class="icon" src="@/assets/svg/userProfile.svg" alt="User icon" />
            </div>
          </div>

          <div class="form-group">
            <label for="avatar">Фото профілю</label>
            <div class="avatar-upload">
              <div class="avatar-preview">
                <img :src="previewAvatar || displayAvatar" alt="Avatar preview" />
              </div>
              <input
                type="file"
                id="avatar"
                ref="fileInput"
                accept="image/*"
                @change="handleAvatarChange"
                class="file-input"
              />
              <button type="button" class="upload-btn" @click="triggerFileInput">
                Завантажити фото
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="fullName">Ім'я та прізвище</label>
            <div class="input-wrapper">
              <input
                v-model="editData.fullName"
                type="text"
                id="fullName"
                placeholder="Введіть ваше повне ім'я"
              />
              <img class="icon" src="@/assets/svg/userProfile.svg" alt="User icon" />
            </div>
          </div>

          <div class="form-group">
            <label for="bio">Про мене</label>
            <div class="input-wrapper">
              <textarea
                v-model="editData.bio"
                id="bio"
                placeholder="Розкажіть щось про себе"
                rows="4"
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="showEditModal = false">
              Скасувати
            </button>
            <button type="submit" class="save-btn">Зберегти зміни</button>
          </div>
        </form>
      </div>
    </div>
    <BaseFooter />
  </div>
</template>

<script>
import BaseHeader from '../components/BaseHeader.vue'
import BaseFooter from '../components/BaseFooter.vue'
import CourseCard from '../components/CourseCard.vue'
import { useAuthStore } from '../stores/auth'
import profileAvatarSvg from '@/assets/svg/profile-avatar.svg'

export default {
  name: 'UserCabinetPage',
  components: {
    BaseHeader,
    BaseFooter,
    CourseCard,
  },
  data() {
    return {
      myCourses: [],
      defaultAvatar: profileAvatarSvg,
      showEditModal: false,
      editData: {
        username: '',
        fullName: '',
        bio: '',
        avatar: null,
      },
      previewAvatar: null,
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    displayAvatar() {
      return this.authStore.userAvatar || this.defaultAvatar
    },
  },
  created() {
    // Initialize form data from user profile
    this.editData.username = this.authStore.userName || ''
    if (this.authStore.profile?.profile) {
      this.editData.fullName = this.authStore.profile.profile.fullName || ''
      this.editData.bio = this.authStore.profile.profile.bio || ''
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleAvatarChange(event) {
      const file = event.target.files[0]
      if (!file) return

      this.editData.avatar = file

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        this.previewAvatar = e.target.result
      }
      reader.readAsDataURL(file)
    },
    async updateProfile() {
      try {
        // Here must be logic for updating the profile
        await this.authStore.updateUserProfile({
          username: this.editData.username,
          fullName: this.editData.fullName,
          bio: this.editData.bio,
          avatar: this.editData.avatar,
        })

        this.showEditModal = false
        this.previewAvatar = null

        // Update profile
        await this.authStore.refreshProfile()
      } catch (error) {
        console.error('Помилка при оновленні профілю:', error)
        alert('Сталася помилка при оновленні профілю. Спробуйте ще раз.')
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

.edit-icon {
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
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
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.edit-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.input-wrapper {
  position: relative;
  border-bottom: 2px solid #ccc;
  display: flex;
  align-items: center;
}

.input-wrapper input,
.input-wrapper textarea {
  width: 100%;
  padding: 10px 10px 10px 0;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
}

.input-wrapper textarea {
  resize: vertical;
  min-height: 100px;
}

.input-wrapper input::placeholder,
.input-wrapper textarea::placeholder {
  color: #aaa;
}

.input-wrapper .icon {
  margin-left: auto;
  font-size: 16px;
  color: #888;
}

.input-wrapper:focus-within {
  border-bottom-color: #000;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 2px solid #ccc;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-input {
  display: none;
}

.upload-btn {
  background-color: #f3f4f6;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-btn:hover {
  background-color: #e0e0e0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  border: 1px solid #ccc;
  border-radius: 25px;
  cursor: pointer;
}

.save-btn {
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  border: 1px solid #000;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition:
    background-color 0.3s,
    color 0.3s;
}

.save-btn:hover {
  background-color: #3b82f6;
  color: #fff;
}

@media (max-width: 768px) {
  .cabinet-container {
    padding: 1rem;
  }

  .modal-content {
    width: 95%;
  }
}
</style>
