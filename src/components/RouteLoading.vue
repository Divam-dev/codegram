<template>
  <transition name="fade">
    <div v-if="isLoading" class="route-loading">
      <div class="route-loader"></div>
    </div>
  </transition>
</template>

<script>
import { isRouteLoading } from '../router'

export default {
  name: 'RouteLoading',
  setup() {
    return {
      isLoading: isRouteLoading,
    }
  },
}
</script>

<style scoped>
.route-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #f3f3f3;
  z-index: 10000;
  overflow: hidden;
}

.route-loader {
  height: 100%;
  width: 50%;
  background-color: #3498db;
  position: absolute;
  animation: loading 1s infinite ease-in-out;
}

@keyframes loading {
  0% {
    left: -50%;
  }
  100% {
    left: 100%;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
