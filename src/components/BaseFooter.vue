<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-logo">
        <img src="@/assets/svg/logo.svg" alt="Codegram" class="logo-img" />
        <p class="copyright">© Codegram {{ currentYear }}</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'BaseFooter',
  data() {
    return {
      currentYear: new Date().getFullYear(),
    }
  },
}
</script>

<style scoped>
.footer {
  background: #1a1a1a;
  color: white;
  padding: 2rem 1rem;
  width: 100%;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
}

.footer-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-img {
  width: 60px;
  height: 60px;
  margin-bottom: 1.4rem;
}

.copyright {
  font-size: 0.875rem;
  color: #9ca3af;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 3rem;
    align-items: center;
    text-align: center;
  }

  .footer-logo {
    padding-left: 0;
  }
}
</style>
