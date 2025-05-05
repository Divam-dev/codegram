<template>
  <div class="courses-page">
    <BaseHeader />
    <main class="main-content">
      <div class="container-search">
        <h1 class="page-title">Каталог курсів Codegram</h1>

        <div class="search-section">
          <SearchBar @search="handleSearch" />
        </div>
      </div>
      <div class="container">
        <div v-if="loading" class="loading-state">
          <p>Завантаження курсів...</p>
        </div>
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="fetchCourses" class="retry-button">Спробувати знову</button>
        </div>
        <div v-else class="content-layout">
          <FilterSidebar
            :filters="filters"
            @filter-change="handleFilterChange"
            @clear-filters="handleClearFilters"
          />

          <div class="courses-section">
            <div class="courses-header">
              <p class="courses-count">Знайдено курсів: {{ courses.length }}</p>
              <SortDropdown :options="sortOptions" @sort-change="handleSortChange" />
            </div>

            <div v-if="courses.length === 0" class="no-courses">
              <p>Курсів не знайдено. Спробуйте змінити фільтри пошуку.</p>
            </div>

            <div v-else class="courses-grid">
              <CourseCard v-for="course in courses" :key="course.id" :course="course" />
            </div>
          </div>
        </div>
      </div>
    </main>
    <BaseFooter />
  </div>
</template>

<script>
import BaseHeader from '../components/BaseHeader.vue'
import BaseFooter from '../components/BaseFooter.vue'
import SearchBar from '../components/SearchBar.vue'
import FilterSidebar from '../components/FilterSidebar.vue'
import SortDropdown from '../components/SortDropdown.vue'
import CourseCard from '../components/CourseCard.vue'
import { useCourses } from '../composables/useCourses'

export default {
  name: 'CoursesPage',
  components: {
    BaseHeader,
    BaseFooter,
    SearchBar,
    FilterSidebar,
    SortDropdown,
    CourseCard,
  },
  setup() {
    const {
      courses,
      loading,
      error,
      filters,
      sortOptions,
      fetchCourses,
      handleSearch,
      handleFilterChange,
      handleClearFilters,
      handleSortChange,
    } = useCourses()

    fetchCourses()

    return {
      courses,
      loading,
      error,
      filters,
      sortOptions,
      fetchCourses,
      handleSearch,
      handleFilterChange,
      handleClearFilters,
      handleSortChange,
    }
  },
}
</script>

<style scoped>
.courses-page {
  min-height: 100vh;
  background-color: #f3f4f6;
}

.main-content {
  padding-bottom: 2em;
}

.container {
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 1rem;
  padding-top: 2em;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
}

.container-search {
  background-color: #bbd3fc;
  padding-top: 2em;
  padding-bottom: 1em;
}

.search-section {
  margin-bottom: 2rem;
}

.content-layout {
  display: flex;
  gap: 2rem;
}

.courses-section {
  flex: 1;
}

.courses-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.courses-count {
  font-size: 0.9rem;
  color: #6b7280;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.loading-state,
.error-state,
.no-courses {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
}

.retry-button:hover {
  background-color: #2563eb;
}

@media (max-width: 768px) {
  .content-layout {
    flex-direction: column;
  }

  .courses-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
