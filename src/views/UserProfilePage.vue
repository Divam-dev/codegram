<template>
  <div class="user-cabinet">
    <BaseHeader />
    <div class="cabinet-container">
      <div class="profile-section">
        <div class="profile-header">
          <img src="@/assets/svg/profile-avatar.svg" alt="User Avatar" class="avatar" />
          <h2>{{ userName }}</h2>
          <p>{{ userEmail }}</p>
        </div>

        <div class="my-courses">
          <h3>Мої курси</h3>
          <div v-if="myCourses.length" class="courses-grid">
            <CourseCard v-for="course in myCourses" :key="course.id" :course="course" />
          </div>
          <p v-else>Ви ще не зареєструвались ні на один курс</p>
        </div>

        <div class="account-actions">
          <button @click="editProfile" class="action-btn">Редагувати профіль</button>
          <button @click="logout" class="action-btn logout">Вийти</button>
        </div>
      </div>
    </div>
    <BaseFooter />
  </div>
</template>

<script>
import BaseHeader from '../components/BaseHeader.vue'
import BaseFooter from '../components/BaseFooter.vue'
import CourseCard from '../components/CourseCard.vue'
import { getAuth, signOut } from 'firebase/auth'

export default {
  name: 'UserCabinetPage',
  components: {
    BaseHeader,
    BaseFooter,
    CourseCard,
  },
  data() {
    return {
      user: null,
      defaultAvatar: 'https://i.ibb.co/tXGTqW5/Icon2-0.jpg',
      myCourses: [],
      unsubscribeAuth: null,
    }
  },
  methods: {
    async logout() {
      try {
        const auth = getAuth()
        await signOut(auth)

        // Clear any local user data
        this.user = null
        this.myCourses = []

        // Redirect to home page
        this.$router.push('/')
      } catch (error) {
        console.error('Помилка при виході:', error)
        alert('Сталася помилка при виході. Спробуйте ще раз.')
      }
    },
  },
}
</script>

<style scoped>
.user-cabinet {
  min-height: 100vh;
  background-color: #f3f4f6;
}

.cabinet-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
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
  margin-bottom: 1rem;
}

.my-courses {
  margin-bottom: 2rem;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.account-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.action-btn.logout {
  background-color: #ef4444;
  color: white;
}
</style>
