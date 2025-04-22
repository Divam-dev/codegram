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
      <div v-if="!authStore.isAuthenticated" class="auth-buttons">
        <button class="btn-login" @click="goToLogin">Увійти</button>
        <button class="btn-signup" @click="goToRegister">Приєднатися</button>
      </div>
      <div v-else class="user-menu">
        <div
          class="profile-wrapper"
          @mouseenter="isProfileMenuOpen = true"
          @mouseleave="isProfileMenuOpen = false"
        >
          <img :src="displayAvatar" :alt="profileStore.userName" class="avatar" />
          <span class="profile-link">{{ profileStore.userName }}</span>

          <transition name="fade">
            <div v-if="isProfileMenuOpen" class="profile-menu">
              <router-link to="/profile" class="menu-item">Профіль</router-link>
              <router-link to="/my-courses" class="menu-item">Мої курси</router-link>
              <router-link to="/create-course" class="menu-item">Створити курс</router-link>
              <button @click="logout" class="menu-item logout">Вийти</button>
            </div>
          </transition>
        </div>
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
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'
import { getAuth, signOut } from 'firebase/auth'
import profileAvatarSvg from '@/assets/svg/profile-avatar.svg'

export default {
  name: 'BaseHeader',
  data() {
    return {
      isMobileMenuOpen: false,
      isProfileMenuOpen: false,
      defaultAvatar: profileAvatarSvg,
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
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
    },
    goToLogin() {
      this.$router.push('/login')
    },
    goToRegister() {
      this.$router.push('/register')
    },
    async logout() {
      try {
        const auth = getAuth()
        await signOut(auth)
        this.authStore.clearUser()
        this.$router.push('/')
      } catch (error) {
        console.error('Помилка виходу:', error)
      }
    },
  },
  async mounted() {
    await this.authStore.initPromise
    this.authStore.init()
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

.user-menu {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.profile-link {
  text-decoration: none;
  color: #333;
}

.profile-link:hover {
  color: #3b82f6;
}

.avatar {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.profile-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  padding: 0.5rem 0;
  z-index: 1001;
  margin-top: 0.5rem;
}

.menu-item {
  display: block;
  padding: 0.75rem 1.5rem;
  color: #333;
  text-decoration: none;
  transition: all 0.2s ease;
}

.menu-item:hover {
  color: #3b82f6;
}

.logout {
  color: #ef4444;
  border-top: 1px solid #eee;
  margin-top: 0.5rem;
  padding-top: 1rem;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
  transform-origin: top right;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .header-links,
  .auth-buttons,
  .user-menu {
    display: none;
  }

  .profile-menu {
    position: static;
    box-shadow: none;
    background: transparent;
    margin-top: 0;
  }

  .menu-item {
    padding: 0.5rem 1rem;
  }

  .logout {
    border-top: none;
    margin-top: 0;
  }
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
