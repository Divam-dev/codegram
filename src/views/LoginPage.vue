<template>
  <div class="login-page">
    <BaseHeader />
    <div class="login-container">
      <form class="login-form">
        <h1 class="form-title">Увійти</h1>

        <div class="form-group">
          <div class="input-wrapper">
            <input type="email" id="email" placeholder="Введіть вашу електронну пошту" required />
            <img class="icon" src="@/assets/svg/email.svg" alt="Email icon" />
          </div>
        </div>

        <div class="form-group">
          <div class="input-wrapper">
            <input type="password" id="password" placeholder="Введіть пароль" required />
            <img class="icon" src="@/assets/svg/lock.svg" alt="Lock icon" />
          </div>
        </div>

        <div class="options">
          <label>
            <input type="checkbox" />
            Запам'ятати мене
          </label>
          <a href="#">Забули пароль?</a>
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
    }
  },
  methods: {
    handleLogin() {
      // TODO: Implement login logic
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
