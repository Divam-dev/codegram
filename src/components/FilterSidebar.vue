<template>
  <aside class="filter-sidebar">
    <div class="filter-header">
      <h2 class="filter-title">Фільтри</h2>
      <button class="clear-filters-btn" @click="clearAllFilters">Очистити фільтри</button>
    </div>

    <!-- Теми -->
    <div class="filter-section">
      <h3 class="section-title">Теми</h3>
      <div class="filter-options">
        <label v-for="topic in filters.topics" :key="topic.id" class="filter-option">
          <input
            type="checkbox"
            :value="topic.id"
            v-model="topic.checked"
            @change="handleFilterChange"
          />
          <span>{{ topic.label }}</span>
        </label>
      </div>
    </div>

    <!-- Технології -->
    <div class="filter-section">
      <h3 class="section-title">Технології</h3>
      <div class="filter-options">
        <label v-for="tech in filters.technologies" :key="tech.id" class="filter-option">
          <input
            type="checkbox"
            :value="tech.id"
            v-model="tech.checked"
            @change="handleFilterChange"
          />
          <span>{{ tech.label }}</span>
        </label>
      </div>
    </div>

    <!-- Тип курсу -->
    <div class="filter-section">
      <h3 class="section-title">Тип курсу</h3>
      <div class="filter-options">
        <label v-for="type in filters.courseType" :key="type.id" class="filter-option">
          <input
            type="checkbox"
            :value="type.id"
            v-model="type.checked"
            @change="handleFilterChange"
          />
          <span>{{ type.label }}</span>
        </label>
      </div>
    </div>

    <!-- Рівень складності -->
    <div class="filter-section">
      <h3 class="section-title">Рівень складності</h3>
      <div class="filter-options">
        <label v-for="level in filters.difficulty" :key="level.id" class="filter-option">
          <input
            type="checkbox"
            :value="level.id"
            v-model="level.checked"
            @change="handleFilterChange"
          />
          <span>{{ level.label }}</span>
        </label>
      </div>
    </div>

    <!-- Тривалість -->
    <div class="filter-section">
      <h3 class="section-title">Тривалість</h3>
      <div class="filter-options">
        <label v-for="duration in filters.duration" :key="duration.id" class="filter-option">
          <input
            type="checkbox"
            :value="duration.id"
            v-model="duration.checked"
            @change="handleFilterChange"
          />
          <span>{{ duration.label }}</span>
        </label>
      </div>
    </div>

    <!-- Мова -->
    <div class="filter-section">
      <h3 class="section-title">Мова</h3>
      <div class="filter-options">
        <label v-for="lang in filters.language" :key="lang.id" class="filter-option">
          <input
            type="checkbox"
            :value="lang.id"
            v-model="lang.checked"
            @change="handleFilterChange"
          />
          <span>{{ lang.label }}</span>
        </label>
      </div>
    </div>

    <!-- Доступність -->
    <div class="filter-section">
      <h3 class="section-title">Доступність</h3>
      <div class="filter-options">
        <label v-for="avail in filters.availability" :key="avail.id" class="filter-option">
          <input
            type="checkbox"
            :value="avail.id"
            v-model="avail.checked"
            @change="handleFilterChange"
          />
          <span>{{ avail.label }}</span>
        </label>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'FilterSidebar',
  props: {
    filters: {
      type: Object,
      required: true,
    },
  },
  methods: {
    handleFilterChange() {
      this.$emit('filter-change', this.filters)
    },
    clearAllFilters() {
      Object.keys(this.filters).forEach((category) => {
        if (Array.isArray(this.filters[category])) {
          this.filters[category].forEach((item) => {
            if ('checked' in item) {
              item.checked = false
            }
          })
        }
      })

      this.$emit('filter-change', this.filters)

      this.$emit('clear-filters')
    },
  },
}
</script>

<style scoped>
.filter-sidebar {
  width: 280px;
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  height: fit-content;
  overflow-y: auto;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  flex-direction: column;
}

.filter-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
}

.clear-filters-btn {
  font-size: 0.875rem;
  color: #3b82f6;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: all 0.2s;
}

.clear-filters-btn:hover {
  background-color: #eff6ff;
  text-decoration: underline;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.filter-option input[type='checkbox'],
.filter-option input[type='radio'] {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 768px) {
  .filter-sidebar {
    width: 100%;
    max-height: none;
  }

  .filter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .clear-filters-btn {
    align-self: flex-end;
  }
}
</style>
