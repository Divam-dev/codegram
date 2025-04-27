<template>
  <div class="loading-container">
    <div class="spinner"></div>
  </div>
</template>

<script>
export default {
  name: 'SpinnerLoading',
}
</script>

<style scoped>
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(52, 152, 219, 0.2);
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
