<template>
  <header class="header">
    <div class="header-container">
      <router-link to="/" class="logo">Codegram</router-link>
      <div class="header-links">
        <router-link to="/">Головна</router-link>
        <router-link to="/courses">Курси</router-link>
        <router-link to="/about">Про проект</router-link>
        <router-link to="/faq">Поширені питання</router-link>
      </div>
      <div class="auth-buttons">
        <button class="btn-login" @click="goToLogin">Увійти</button>
        <button class="btn-signup" @click="goToRegister">Приєднатися</button>
      </div>
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    <div class="mobile-menu" :class="{ 'is-active': isMobileMenuOpen }">
      <router-link to="/">Головна</router-link>
      <router-link to="/courses">Курси</router-link>
      <router-link to="/about">Про проект</router-link>
      <router-link to="/faq">Поширені питання</router-link>
      <button class="btn-login" @click="goToLogin">Увійти</button>
      <button class="btn-signup" @click="goToRegister">Приєднатися</button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'BaseHeader',
  data() {
    return {
      isMobileMenuOpen: false,
    }
  },
  methods: {
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
    },
    goToLogin() {
      this.$router.push('/login')
    },
    goToRegister() {
      this.$router.push('/register')
    },
  },
}
</script>

<style scoped>
.header {
  background-color: white;
  padding: 1rem 2rem;
  width: 100%;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: #333;
}

.header-links {
  display: flex;
  gap: 2rem;
}

.header-links a {
  text-decoration: none;
  color: #333;
}

.header-links a:hover {
  color: #3b82f6;
}

.auth-buttons {
  display: flex;
  gap: 1rem;
}

.btn-login,
.btn-signup {
  padding: 0.5rem 1rem;
  border-radius: 40px;
  border: none;
  cursor: pointer;
}

.btn-login {
  background: none;
  border: 1px solid #333;
  transition: all 0.3s ease-in-out;
}

.btn-login:hover {
  background: #333;
  color: white;
}

.btn-signup {
  background: #3b82f6;
  color: white;
  transition: all 0.3s ease-in-out;
}

.btn-signup:hover {
  background: #1d4ed8;
}

.mobile-menu-btn {
  display: none;
}

.mobile-menu {
  display: none;
}

@media (max-width: 768px) {
  .header-links,
  .auth-buttons {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
    background: none;
    border: none;
    cursor: pointer;
  }

  .mobile-menu-btn span {
    display: block;
    width: 25px;
    height: 3px;
    background: #333;
    margin: 5px 0;
  }

  .mobile-menu {
    display: none;
    flex-direction: column;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    padding: 1rem;
    gap: 1rem;
  }

  .mobile-menu a {
    text-decoration: none;
    color: #333;
  }
  .mobile-menu.is-active {
    display: flex;
  }
}
</style>
