<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Редагування профілю</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      <form @submit.prevent="submitForm" class="edit-form">
        <div class="form-group">
          <label for="username">Логін</label>
          <div class="input-wrapper">
            <input
              v-model="formData.username"
              type="text"
              id="username"
              placeholder="Введіть новий логін"
              minlength="3"
              maxlength="20"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="avatar">Фото профілю</label>
          <div class="avatar-upload">
            <div class="avatar-preview">
              <img :src="previewAvatar || userAvatar" alt="Avatar preview" />
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
            <div v-if="fileError" class="file-error">{{ fileError }}</div>
          </div>
        </div>

        <div class="form-group">
          <label for="fullName">Ім'я та прізвище</label>
          <div class="input-wrapper">
            <input
              v-model="formData.fullName"
              type="text"
              id="fullName"
              placeholder="Введіть ваше повне ім'я"
              minlength="3"
              maxlength="100"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="bio">Про мене</label>
          <div class="input-wrapper">
            <textarea
              v-model="formData.bio"
              id="bio"
              placeholder="Розкажіть щось про себе"
              rows="4"
              maxlength="1000"
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="closeModal">Скасувати</button>
          <button type="submit" class="save-btn" :disabled="isSubmitting">
            {{ isSubmitting ? 'Зберігаємо...' : 'Зберегти зміни' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { AuthHelper } from '../services/auth.service'

export default {
  name: 'ProfileEditModal',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    userData: {
      type: Object,
      required: true,
    },
    userAvatar: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      formData: {
        username: '',
        fullName: '',
        bio: '',
        avatar: null,
      },
      previewAvatar: null,
      isSubmitting: false,
      fileError: null,
      maxFileSize: 30 * 1024 * 1024,
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.resetForm()
      }
    },
    userData: {
      handler(newVal) {
        if (newVal) {
          this.formData.username = newVal.userName || ''
          this.formData.fullName = newVal.userFullName || ''
          this.formData.bio = newVal.userBio || ''
        }
      },
      immediate: true,
    },
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    resetForm() {
      this.formData.username = this.userData.userName || ''
      this.formData.fullName = this.userData.userFullName || ''
      this.formData.bio = this.userData.userBio || ''
      this.formData.avatar = null
      this.previewAvatar = null
      this.fileError = null
      this.isSubmitting = false
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleAvatarChange(event) {
      const file = event.target.files[0]
      if (!file) return

      this.fileError = null

      if (file.size > this.maxFileSize) {
        this.fileError = 'Файл занадто великий. Максимальний розмір: 30MB'
        this.$refs.fileInput.value = null
        return
      }

      this.formData.avatar = file

      // Image preview
      const reader = new FileReader()
      reader.onload = (e) => {
        this.previewAvatar = e.target.result
      }
      reader.readAsDataURL(file)
    },
    async uploadImageToImgBB(file) {
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY

      if (!apiKey) {
        throw new Error('ImgBB API key is not configured.')
      }

      const formData = new FormData()
      formData.append('image', file)

      try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Помилка завантаження: ${response.statusText}`)
        }

        const result = await response.json()
        if (result.success) {
          return result.data.url
        } else {
          throw new Error('Помилка завантаження зображення')
        }
      } catch (error) {
        console.error('Помилка завантаження на ImgBB:', error)
        throw error
      }
    },
    async submitForm() {
      try {
        this.isSubmitting = true
        this.fileError = null

        // Login check
        if (this.formData.username !== this.userData.userName) {
          const authHelper = new AuthHelper()
          const usernameExists = await authHelper.checkUsernameExists(this.formData.username)
          if (usernameExists) {
            alert('Цей логін вже використовується іншим користувачем')
            this.isSubmitting = false
            return
          }
        }

        const updateData = {
          username: this.formData.username,
          fullName: this.formData.fullName,
          bio: this.formData.bio,
        }

        // Upload avatar
        if (this.formData.avatar) {
          try {
            const avatarUrl = await this.uploadImageToImgBB(this.formData.avatar)
            updateData.avatarUrl = avatarUrl
          } catch (error) {
            console.error('Помилка завантаження аватара:', error)
            alert(`Помилка завантаження аватара: ${error.message}`)
            this.isSubmitting = false
            return
          }
        }

        this.$emit('submit', updateData)
      } catch (error) {
        console.error('Помилка при оновленні профілю:', error)
        alert(`Помилка при оновленні профілю: ${error.message}`)
      } finally {
        this.isSubmitting = false
      }
    },
  },
}
</script>

<style scoped>
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
  font-family: inherit;
}

.input-wrapper input::placeholder,
.input-wrapper textarea::placeholder {
  color: #aaa;
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

.save-btn:hover:not(:disabled) {
  background-color: #3b82f6;
  color: #fff;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
  }
}
</style>
