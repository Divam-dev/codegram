<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { useAuthStore } from './stores/auth'

export default {
  name: 'App',
  mounted() {
    const authStore = useAuthStore()
    authStore.init()
  },
}
</script>
