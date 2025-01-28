<template>
  <aside class="filter-sidebar">
    <h2 class="filter-title">Фільтри</h2>

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

    <div class="filter-section">
      <h3 class="section-title">Рейтинг</h3>
      <div class="filter-options">
        <label v-for="rating in filters.rating" :key="rating.id" class="filter-option">
          <input
            type="radio"
            :value="rating.id"
            v-model="$parent.selectedRating"
            @change="handleFilterChange"
          />
          <span>{{ rating.label }}</span>
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
}

.filter-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.filter-option input[type='checkbox'] {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 768px) {
  .filter-sidebar {
    width: 100%;
  }
}
</style>
