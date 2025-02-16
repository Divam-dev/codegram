<template>
  <div class="reset-password-page">
    <BaseHeader />
    <div class="reset-container">
      <form class="reset-form" @submit.prevent="resetPassword">
        <h1 class="form-title">Відновлення паролю</h1>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <p class="form-description">
          Введіть адресу електронної пошти, і ми надішлемо вам інструкції з відновлення паролю
        </p>

        <div class="form-group">
          <div class="input-wrapper">
            <input
              v-model="email"
              type="email"
              id="email"
              placeholder="Введіть вашу електронну пошту"
              required
            />
            <img class="icon" src="@/assets/svg/email.svg" alt="Email icon" />
          </div>
        </div>

        <button type="submit" class="reset-button" :disabled="isLoading">
          {{ isLoading ? 'Відправляємо...' : 'Відправити' }}
        </button>

        <p class="login-link">
          <router-link to="/login">Повернутися до входу</router-link>
        </p>
      </form>
    </div>
    <BaseFooter />
  </div>
</template>

<script>
import BaseHeader from '../components/BaseHeader.vue'
import BaseFooter from '../components/BaseFooter.vue'
import { AuthHelper } from '../services/auth.service'

export default {
  name: 'ResetPasswordPage',
  components: {
    BaseHeader,
    BaseFooter,
  },
  data() {
    return {
      email: '',
      isLoading: false,
      errorMessage: '',
      successMessage: '',
      authHelper: new AuthHelper(),
    }
  },
  methods: {
    async resetPassword() {
      if (!this.email) {
        this.errorMessage = 'Будь ласка, введіть email'
        return
      }

      this.isLoading = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        await this.authHelper.sendPasswordReset(this.email)

        this.successMessage = 'Інструкції з відновлення паролю надіслані на вашу електронну пошту'
        setTimeout(() => {
          this.$router.push('/login')
        }, 3000)
      } catch (error) {
        this.errorMessage = error.message
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #bbd3fc;
}

.error-message {
  color: #dc2626;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.875rem;
}

.success-message {
  color: #059669;
  background-color: #d1fae5;
  border: 1px solid #a7f3d0;
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.875rem;
}

.reset-container {
  min-width: 500px;
  margin: auto;
  padding: 2rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.reset-form {
  display: flex;
  flex-direction: column;
}

.form-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.form-description {
  text-align: center;
  color: #666;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.input-wrapper {
  position: relative;
  border-bottom: 2px solid #ccc;
  display: flex;
  align-items: center;
}

.input-wrapper input {
  width: 100%;
  padding: 10px 10px 10px 0;
  border: none;
  outline: none;
  font-size: 16px;
}

.input-wrapper input::placeholder {
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

.reset-button {
  padding: 10px;
  background-color: transparent;
  border: 1px solid #000;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition:
    background-color 0.3s,
    color 0.3s;
}

.reset-button:hover:not(:disabled) {
  background-color: #3b82f6;
  color: #fff;
}

.reset-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  border-color: #ccc;
}

.login-link {
  font-size: 14px;
  margin-top: 20px;
  text-align: center;
}

.login-link a {
  color: #0066cc;
  text-decoration: none;
  font-weight: bold;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
