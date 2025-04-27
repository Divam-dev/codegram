<template>
  <div id="app">
    <route-loading />
    <spinner-loading v-if="isLoading" />
    <router-view v-else></router-view>
  </div>
</template>

<script>
import { useAuthStore } from './stores/auth'
import SpinnerLoading from './components/SpinnerLoading.vue'
import RouteLoading from './components/RouteLoading.vue'

export default {
  name: 'App',
  components: {
    SpinnerLoading,
    RouteLoading,
  },
  data() {
    return {
      isLoading: true,
    }
  },
  async mounted() {
    const authStore = useAuthStore()
    try {
      await authStore.init()
      this.isLoading = false
    } catch (error) {
      console.error('Auth initialization error:', error)
      this.isLoading = false
    }
  },
}
</script>
