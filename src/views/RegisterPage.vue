<template>
  <div class="register-page">
    <BaseHeader />
    <div class="register-container">
      <form class="register-form">
        <h1 class="form-title">Зареєструватися</h1>

        <div class="form-group">
          <div class="input-wrapper">
            <input type="text" id="name" placeholder="Введіть логін" required />
            <img class="icon" src="@/assets/svg/userProfile.svg" alt="User icon" />
          </div>
        </div>

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
            Погоджуюся з <router-link to="/rules">правилами</router-link>
          </label>
        </div>

        <button type="submit" class="register-button">Зареєструватися</button>

        <p class="register-link">
          Вже зареєстровані? <router-link to="/login">Увійти</router-link>
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
  name: 'RegisterPage',
  components: {
    BaseHeader,
    BaseFooter,
  },
  data() {
    return {
      name: '',
      email: '',
      password: '',
    }
  },
  methods: {
    handleRegister() {
      // TODO: Implement registration logic
    },
  },
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #bbd3fc;
}

.register-container {
  min-width: 500px;
  margin: auto;
  padding: 2rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.register-form {
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

.register-button {
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

.register-button:hover {
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
