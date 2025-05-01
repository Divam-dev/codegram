<template>
  <div class="search-bar">
    <input
      type="text"
      :placeholder="'Шукати'"
      v-model="searchTerm"
      @input="handleInput"
      class="search-input"
    />
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  data() {
    return {
      searchTerm: '',
    }
  },
  methods: {
    handleInput() {
      this.$emit('search', this.searchTerm)
    },
    handleSearch() {
      this.$emit('search', this.searchTerm)
    },
  },
}
</script>

<style scoped>
.search-bar {
  display: flex;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
}
</style>
