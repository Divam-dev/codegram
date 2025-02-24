<template>
  <BaseHeader />
  <div class="not-found-page">
    <div class="not-found-container">
      <div class="not-found-content">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">Сторінку не знайдено</h2>
        <p class="error-description">
          Вибачте, але сторінка, яку ви шукаєте, не існує або була переміщена
        </p>
        <router-link to="/" class="home-button"> Повернутися на головну </router-link>
      </div>
    </div>
    <BaseFooter />
  </div>
</template>

<script>
import BaseHeader from '../components/BaseHeader.vue'
import BaseFooter from '../components/BaseFooter.vue'

export default {
  name: 'NotFoundPage',
  components: {
    BaseHeader,
    BaseFooter,
  },
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #bbd3fc;
}

.not-found-container {
  min-width: 500px;
  margin: auto;
  padding: 2rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.not-found-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
}

.error-code {
  font-size: 100px;
  font-weight: bold;
  margin: 0;
  color: #3b82f6;
}

.error-title {
  font-size: 24px;
  font-weight: bold;
  margin: 1rem 0;
}

.error-description {
  color: #666;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 2rem;
}

.home-button {
  padding: 10px 20px;
  background-color: transparent;
  border: 1px solid #000;
  border-radius: 25px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  color: #000;
  transition:
    background-color 0.3s,
    color 0.3s;
}

.home-button:hover {
  background-color: #3b82f6;
  color: #fff;
}
</style>
