<template>
  <div class="login-page">
    <BaseHeader />
    <div class="login-container">
      <form class="login-form" @submit.prevent="Login">
        <h1 class="form-title">Увійти</h1>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="button" class="google-button" @click="signInWithGoogle">
          <img src="@/assets/svg/google.svg" alt="Google icon" />
          Увійти через Google
        </button>

        <div class="separator">
          <span>або</span>
        </div>

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

        <div class="form-group">
          <div class="input-wrapper">
            <input
              v-model="password"
              type="password"
              id="password"
              placeholder="Введіть пароль"
              required
            />
            <img class="icon" src="@/assets/svg/lock.svg" alt="Lock icon" />
          </div>
        </div>

        <div class="options">
          <router-link to="/reset-password">Забули пароль?</router-link>
        </div>

        <button type="submit" class="login-button">Увійти</button>

        <p class="register-link">
          Немає акаунту? <router-link to="/register">Зареєструватися</router-link>
        </p>
      </form>
    </div>
    <BaseFooter />
  </div>
</template>

<script>
import BaseHeader from '../components/BaseHeader.vue'
import BaseFooter from '../components/BaseFooter.vue'
import { useAuthStore } from '../stores/auth'
import { AuthHelper } from '../services/auth.service'

export default {
  name: 'LoginPage',
  components: {
    BaseHeader,
    BaseFooter,
  },
  data() {
    return {
      email: '',
      password: '',
      rememberMe: false,
      authHelper: new AuthHelper(),
      errorMessage: '',
    }
  },
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  methods: {
    async Login() {
      try {
        this.errorMessage = ''

        const user = await this.authHelper.signInWithEmail(
          this.email,
          this.password,
          this.rememberMe,
        )

        this.authStore.setUser(user)
        this.$router.push('/profile')
      } catch (error) {
        this.errorMessage = error.message
      }
    },

    async signInWithGoogle() {
      try {
        this.errorMessage = ''
        const user = await this.authHelper.signInWithGoogle()
        this.authStore.setUser(user)
        this.$router.push('/profile')
      } catch (error) {
        this.errorMessage = `Помилка входу через Google: ${error.message}`
      }
    },
  },
}
</script>

<style scoped>
.login-page {
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

.login-container {
  min-width: 500px;
  margin: auto;
  padding: 2rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.google-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: bold;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  background-color: white;
  cursor: pointer;
  transition:
    border-color 0.3s,
    background-color 0.3s;
}

.google-button:hover {
  border: 1px solid black;
}

.google-button img {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.separator {
  display: flex;
  align-items: center;
  text-align: center;
}

.separator::before,
.separator::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e0e0e0;
}

.separator span {
  padding: 0 10px;
  color: #666;
  font-size: 14px;
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

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
}

.options a {
  color: #0066cc;
  text-decoration: none;
}

.options a:hover {
  text-decoration: underline;
}

.options label {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 0.3rem;
}

.login-button {
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

.login-button:hover {
  background-color: #3b82f6;
  color: #fff;
}

.register-link {
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}

.register-link a {
  color: #0066cc;
  text-decoration: none;
  font-weight: bold;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
