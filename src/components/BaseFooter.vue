<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="left-section">
        <div class="link-group">
          <h4 class="group-title">Компанія</h4>
          <nav class="link-list">
            <router-link to="/contacts" class="footer-link">Контакти</router-link>
            <router-link to="/about" class="footer-link">Про проект</router-link>
          </nav>
        </div>

        <div class="footer-logo">
          <img src="@/assets/svg/logo.svg" alt="Codegram" class="logo-img" />
          <p class="copyright">© Codegram {{ currentYear }}</p>
        </div>
      </div>

      <div class="link-group right-group">
        <h4 class="group-title">Допомога</h4>
        <nav class="link-list">
          <router-link to="/faq" class="footer-link">Поширені питання</router-link>
          <router-link to="/privacy" class="footer-link">Політика конфіденційності</router-link>
        </nav>
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
  padding: 3rem 2rem;
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

.left-section {
  display: flex;
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

.link-group {
  min-width: 180px;
}

.right-group {
  margin-left: 4rem;
}

.group-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: #f3f4f6;
}

.link-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-link {
  color: #9ca3af;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #f3f4f6;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 3rem;
    align-items: center;
    text-align: center;
  }

  .left-section {
    flex-direction: column-reverse;
    align-items: center;
    gap: 3rem;
  }

  .link-group {
    width: 100%;
    align-items: center;
  }

  .link-list {
    align-items: center;
  }

  .right-group {
    margin-left: 0;
  }

  .footer-logo {
    padding-left: 0;
  }
}
</style>
