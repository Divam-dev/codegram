<template>
  <div class="sort-dropdown">
    <select v-model="selectedOption" @change="handleChange" class="select-input">
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'SortDropdown',
  props: {
    options: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      selectedOption: this.options[0]?.value,
    }
  },
  methods: {
    handleChange() {
      this.$emit('sort-change', this.selectedOption)
    },
  },
}
</script>

<style scoped>
.sort-dropdown {
  min-width: 200px;
}

.select-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}
</style>
