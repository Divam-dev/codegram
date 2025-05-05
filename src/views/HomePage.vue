<template>
  <BaseHeader />
  <div class="hero">
    <div class="hero-content">
      <div class="hero-text">
        <h1>Розвивай свої навички, створюй майбутнє!</h1>
        <p>
          Codegram – це онлайн-платформа для навчання, яка відкриває нові горизонти. Освоюй
          програмування, дизайн, управління проектами та багато іншого разом із найкращими
          експертами.
        </p>
        <button v-if="!authStore.isAuthenticated" class="join-btn" @click="goToRegister">
          Приєднатися
        </button>
      </div>
      <div class="hero-image">
        <img src="@/assets/images/learning-illustration.png" alt="Learning illustration" />
      </div>
    </div>
    <section class="features-section">
      <h2>Чому обирають Codegram?</h2>
      <div class="features">
        <div class="feature-card simple">
          <h3>Просто</h3>
          <p>
            Створюй і проходь курси швидко та легко завдяки інтуїтивному інтерфейсу, доступному з
            будь-якого пристрою.
          </p>
          <img src="@/assets/svg/like.svg" alt="Like icon" class="card-icon" />
        </div>
        <div class="feature-card effective">
          <h3>Результативно</h3>
          <p>
            Інтерактивні завдання та практичні тести допоможуть тобі не просто вивчити, а засвоїти
            нові навички.
          </p>
          <img src="@/assets/svg/badge.svg" alt="Badge icon" class="card-icon" />
        </div>
        <div class="feature-card exciting">
          <h3>Захопливо</h3>
          <p>
            Курси від експертів захоплюють і надихають, перетворюючи процес навчання на справжню
            подорож.
          </p>
          <img src="@/assets/svg/happiness.svg" alt="Happiness icon" class="card-icon" />
        </div>
      </div>
    </section>
    <BaseFooter />
  </div>
</template>

<script>
import BaseHeader from '../components/BaseHeader.vue'
import BaseFooter from '../components/BaseFooter.vue'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'HomePage',
  components: {
    BaseHeader,
    BaseFooter,
  },
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  methods: {
    goToRegister() {
      this.$router.push('/register')
    },
  },
}
</script>

<style scoped>
.hero {
  padding: 3rem 0rem 0rem;
  background-color: #bbd3fc;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-bottom: 2rem;
}

.hero-text {
  flex: 1;
}

.hero-text h1 {
  font-weight: bold;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  line-height: normal;
}

.hero-text p {
  font-size: 20px;
  margin-bottom: 2rem;
}

.join-btn {
  padding: 0.75rem 2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 40px;
  font-size: 1.1rem;
  cursor: pointer;
}

.hero-image {
  flex: 1;
}

.hero-image img {
  max-width: 100%;
}

.features-section {
  padding: 2rem 2rem;
  background-color: white;
  padding-bottom: 3rem;
}

.features-section h2 {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
}

.features {
  max-width: 1200px;
  margin: 2rem auto 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.feature-card {
  padding: 1rem;
  border-radius: 40px;
  background-color: #f7f9fc;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 350px;
}

.card-content {
  flex-grow: 1;
}

.feature-card h3 {
  margin-bottom: 1rem;
  font-size: 25px;
  font-weight: bold;
}

.feature-card p {
  font-size: 20px;
}

.card-icon {
  height: 100px;
  margin-top: 1rem;
}

.feature-card.simple {
  background-color: #e8f1ff;
  border: 2px solid #0066ff;
}

.feature-card.effective {
  background-color: #e8ffe8;
  border: 2px solid #4caf50;
}

.feature-card.exciting {
  background-color: #fff4e6;
  border: 2px solid #ff9800;
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-text h1 {
    font-size: 2rem;
  }

  .features {
    grid-template-columns: 1fr;
  }
}
</style>
