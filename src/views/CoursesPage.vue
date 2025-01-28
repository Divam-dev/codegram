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
        <div class="content-layout">
          <FilterSidebar :filters="filters" @filter-change="handleFilterChange" />

          <div class="courses-section">
            <div class="courses-header">
              <SortDropdown :options="sortOptions" @sort-change="handleSortChange" />
            </div>

            <div class="courses-grid">
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
  data() {
    return {
      allCourses: [
        {
          id: 1,
          title: 'Основи програмування C#',
          availableFrom: '10.01.2025',
          students: 100,
          rating: 4.5,
          type: 'C# для початківців',
          author: 'Codegram',
          image: 'https://i.ibb.co/gPV3fq8/C.jpg',
          topics: ['programming'],
          courseType: ['codegram'],
        },
        {
          id: 2,
          title: 'Основи програмування JavaScript',
          availableFrom: 'постійно',
          students: 228,
          rating: 3.9,
          type: 'JavaScript',
          author: 'Divam',
          image: 'https://i.ibb.co/brrtCtR/JS.jpg',
          topics: ['programming'],
          courseType: ['expert'],
        },
        {
          id: 3,
          title: 'Основи Java',
          availableFrom: '15.02.2025',
          students: 0,
          rating: 0,
          type: 'Java',
          author: 'Codegram',
          image: 'https://i.ibb.co/x12hvjk/Java.jpg',
          topics: ['programming', 'project-management'],
          courseType: ['codegram'],
        },
      ],
      courses: [],
      filters: {
        topics: [
          { id: 'programming', label: 'Програмування', checked: false },
          { id: 'design', label: 'Дизайн', checked: false },
          { id: 'marketing', label: 'Маркетинг', checked: false },
          { id: 'project-management', label: 'Управління проектами', checked: false },
        ],
        courseType: [
          { id: 'codegram', label: 'Розробка Codegram', checked: false },
          { id: 'expert', label: 'Розроблений експертами', checked: false },
        ],
        rating: [
          { id: 'rating-5', label: 'Від 5 зірок' },
          { id: 'rating-4', label: 'Від 4 зірок' },
          { id: 'rating-3', label: 'Від 3 зірок' },
        ],
      },
      sortOptions: [
        { value: 'newest', label: 'Найновіші' },
        { value: 'popular', label: 'Найпопулярніші' },
        { value: 'rating', label: 'За рейтингом' },
      ],
      selectedRating: null,
    }
  },
  created() {
    this.courses = this.allCourses
  },
  methods: {
    handleSearch(searchTerm) {
      if (!searchTerm) {
        this.courses = this.allCourses
      } else {
        this.courses = this.allCourses.filter((course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }
    },
    handleFilterChange(filters) {
      let filteredCourses = [...this.allCourses]

      const selectedTopics = filters.topics
        .filter((topic) => topic.checked)
        .map((topic) => topic.id)
      if (selectedTopics.length > 0) {
        filteredCourses = filteredCourses.filter((course) =>
          selectedTopics.some((topic) => course.topics.includes(topic)),
        )
      }

      const selectedCourseTypes = filters.courseType
        .filter((type) => type.checked)
        .map((type) => type.id)
      if (selectedCourseTypes.length > 0) {
        filteredCourses = filteredCourses.filter((course) =>
          selectedCourseTypes.some((type) => course.courseType.includes(type)),
        )
      }

      const selectedRating = filters.rating.find((rating) => rating.id === this.selectedRating)
      if (selectedRating) {
        const minRating = parseInt(selectedRating.id.split('-')[1], 10)
        filteredCourses = filteredCourses.filter((course) => course.rating >= minRating)
      }

      this.courses = filteredCourses
    },
    handleSortChange(sortOption) {
      const sortMethods = {
        newest: (a, b) => new Date(b.availableFrom) - new Date(a.availableFrom),
        popular: (a, b) => b.students - a.students,
        rating: (a, b) => b.rating - a.rating,
      }

      if (sortMethods[sortOption]) {
        this.courses = [...this.courses].sort(sortMethods[sortOption])
      }
    },
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
  max-width: 1200px;
  margin: 0 auto;
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
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .content-layout {
    flex-direction: column;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>
