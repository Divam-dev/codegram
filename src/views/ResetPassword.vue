<template>
  <div class="reset-password-page">
    <BaseHeader />
    <div class="reset-container">
      <form class="reset-form" @submit.prevent="resetPassword">
        <h1 class="form-title">Відновлення паролю</h1>

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
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'
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
      authHelper: new AuthHelper(),
    }
  },
  methods: {
    async resetPassword() {
      if (!this.email) {
        alert('Будь ласка, введіть email')
        return
      }

      this.isLoading = true

      try {
        const { exists, authType } = await this.authHelper.checkEmailExists(this.email)

        if (!exists) {
          throw new Error('Користувача з такою електронною поштою не знайдено')
        }

        if (authType !== 'email') {
          throw new Error('Цей email зареєстрований через Google. Використовуйте Google для входу.')
        }

        const auth = getAuth()
        await sendPasswordResetEmail(auth, this.email)

        alert('Інструкції з відновлення паролю надіслані на вашу електронну пошту')
        this.$router.push('/login')
      } catch (error) {
        let errorMessage = 'Сталася помилка при відновленні паролю'

        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = 'Невірний формат електронної пошти'
            break
          case 'auth/user-not-found':
            errorMessage = 'Користувача з такою електронною поштою не знайдено'
            break
          case 'auth/too-many-requests':
            errorMessage = 'Забагато спроб. Спробуйте пізніше'
            break
          default:
            errorMessage = error.message
        }

        alert(errorMessage)
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
