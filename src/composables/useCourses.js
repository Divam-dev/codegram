import { ref, reactive } from 'vue'
import { CoursesService } from '../services/courses.service'

export function useCourses() {
  const allCourses = ref([])
  const courses = ref([])
  const loading = ref(true)
  const error = ref(null)
  const searchTerm = ref('')
  const selectedRating = ref(null)
  const coursesService = new CoursesService()

  const activeFilters = reactive({
    topics: [],
    technologies: [],
    courseType: [],
    difficulty: [],
    rating: null,
    duration: [],
    language: [],
    availability: [],
  })

  const sortOptions = [
    { value: 'newest', label: 'Найновіші' },
    { value: 'popular', label: 'Найпопулярніші' },
    { value: 'rating', label: 'За рейтингом' },
  ]

  const filters = {
    topics: [
      { id: 'programming', label: 'Програмування', checked: false },
      { id: 'design', label: 'Дизайн', checked: false },
      { id: 'marketing', label: 'Маркетинг', checked: false },
      { id: 'project-management', label: 'Управління проектами', checked: false },
      { id: 'ai', label: 'Штучний інтелект', checked: false },
      { id: 'ux-ui', label: 'UX/UI', checked: false },
      { id: 'data-science', label: 'Data Science', checked: false },
      { id: 'frontend-backend', label: 'Frontend / Backend', checked: false },
      { id: 'game-dev', label: 'Розробка ігор', checked: false },
      { id: 'devops', label: 'DevOps', checked: false },
      { id: 'seo-smm', label: 'SEO / SMM', checked: false },
    ],
    technologies: [
      { id: 'javascript', label: 'JavaScript / TypeScript', checked: false },
      { id: 'python', label: 'Python', checked: false },
      { id: 'csharp', label: 'C# / .NET', checked: false },
      { id: 'java', label: 'Java', checked: false },
      { id: 'php', label: 'PHP', checked: false },
      { id: 'frontend-frameworks', label: 'Vue / React / Angular', checked: false },
      { id: 'design-tools', label: 'Figma / Adobe XD', checked: false },
      { id: 'game-engines', label: 'Unity / Unreal', checked: false },
      { id: 'wordpress', label: 'WordPress', checked: false },
    ],
    courseType: [
      { id: 'codegram', label: 'Розробка Codegram', checked: false },
      { id: 'user', label: 'Користувацький', checked: false },
    ],
    difficulty: [
      { id: 'beginner', label: 'Початковий (beginner)', checked: false },
      { id: 'intermediate', label: 'Середній (intermediate)', checked: false },
      { id: 'advanced', label: 'Просунутий (advanced)', checked: false },
    ],
    rating: [
      { id: 'rating-5', label: 'Від 5 зірок' },
      { id: 'rating-4', label: 'Від 4 зірок' },
      { id: 'rating-3', label: 'Від 3 зірок' },
      { id: 'rating-0', label: 'Без рейтингу' },
    ],
    duration: [
      { id: 'duration-5', label: 'До 5 годин', checked: false },
      { id: 'duration-10', label: 'До 10 годин', checked: false },
      { id: 'duration-10plus', label: '10+ годин', checked: false },
    ],
    language: [
      { id: 'ukrainian', label: 'Українська 🇺🇦', checked: false },
      { id: 'english', label: 'Англійська 🇬🇧', checked: false },
      { id: 'other', label: 'Інші мови', checked: false },
    ],
    availability: [
      { id: 'available-now', label: 'Доступний зараз', checked: false },
      { id: 'coming-soon', label: 'Очікується скоро', checked: false },
      { id: 'always-available', label: 'Завжди доступний', checked: false },
    ],
  }

  async function fetchCourses() {
    loading.value = true
    error.value = null

    try {
      allCourses.value = await coursesService.getCoursesWithAuthors()
      applyFilters()
      loading.value = false
    } catch (err) {
      console.error('Error loading courses:', err)
      error.value = `Помилка завантаження курсів: ${err.message}`
      loading.value = false
    }
  }

  function handleSearch(term) {
    searchTerm.value = term
    applyFilters()
  }

  function handleFilterChange(updatedFilters) {
    Object.keys(updatedFilters).forEach((category) => {
      if (Array.isArray(updatedFilters[category])) {
        activeFilters[category] = updatedFilters[category]
          .filter((item) => item.checked)
          .map((item) => item.id)
      }
    })

    activeFilters.rating = selectedRating.value
    applyFilters()
  }

  function handleRatingChange(rating) {
    selectedRating.value = rating
    activeFilters.rating = rating
    applyFilters()
  }

  function handleClearFilters() {
    searchTerm.value = ''

    Object.keys(activeFilters).forEach((category) => {
      if (Array.isArray(activeFilters[category])) {
        activeFilters[category] = []
      } else {
        activeFilters[category] = null
      }
    })

    selectedRating.value = null

    applyFilters()
  }

  function applyFilters() {
    let filteredCourses = [...allCourses.value]

    // Search filter
    if (searchTerm.value) {
      const searchLower = searchTerm.value.toLowerCase()
      filteredCourses = filteredCourses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchLower) ||
          (course.description && course.description.toLowerCase().includes(searchLower)),
      )
    }

    // Topic filters
    if (activeFilters.topics.length > 0) {
      filteredCourses = filteredCourses.filter(
        (course) =>
          course.topics && activeFilters.topics.some((topic) => course.topics.includes(topic)),
      )
    }

    // Technology filters
    if (activeFilters.technologies.length > 0) {
      filteredCourses = filteredCourses.filter(
        (course) =>
          course.technologies &&
          activeFilters.technologies.some((tech) => course.technologies.includes(tech)),
      )
    }

    // Course type filter
    if (activeFilters.courseType.length > 0) {
      filteredCourses = filteredCourses.filter((course) => {
        if (course.courseType === 'user' && activeFilters.courseType.includes('user')) {
          return true
        }
        return activeFilters.courseType.includes(course.courseType)
      })
    }

    // Difficulty level filter
    if (activeFilters.difficulty.length > 0) {
      filteredCourses = filteredCourses.filter((course) =>
        activeFilters.difficulty.includes(course.level),
      )
    }

    // Rating filter
    if (activeFilters.rating) {
      if (activeFilters.rating === 'rating-0') {
        filteredCourses = filteredCourses.filter(
          (course) => !course.rating || course.rating === '0' || course.rating === 0,
        )
      } else {
        const minRating = parseInt(activeFilters.rating.split('-')[1], 10)
        filteredCourses = filteredCourses.filter((course) => {
          const ratingValue = parseFloat(course.rating)
          return !isNaN(ratingValue) && ratingValue >= minRating
        })
      }
    }

    // Duration filter
    if (activeFilters.duration.length > 0) {
      filteredCourses = filteredCourses.filter((course) => {
        if (!course.duration) return false

        const hours =
          typeof course.duration === 'string' ? parseFloat(course.duration) : course.duration

        if (isNaN(hours)) return false

        return activeFilters.duration.some((durationFilter) => {
          if (durationFilter === 'duration-5') return hours <= 5
          if (durationFilter === 'duration-10') return hours <= 10
          if (durationFilter === 'duration-10plus') return hours > 10
          return false
        })
      })
    }

    // Language filter
    if (activeFilters.language.length > 0) {
      filteredCourses = filteredCourses.filter((course) => {
        if (!course.language) return false

        const courseLang = course.language.toLowerCase()

        if (
          activeFilters.language.includes('ukrainian') &&
          (courseLang === 'українська' || courseLang === 'ukrainian')
        ) {
          return true
        }

        if (
          activeFilters.language.includes('english') &&
          (courseLang === 'англійська' || courseLang === 'english')
        ) {
          return true
        }

        if (
          activeFilters.language.includes('other') &&
          courseLang !== 'українська' &&
          courseLang !== 'ukrainian' &&
          courseLang !== 'англійська' &&
          courseLang !== 'english'
        ) {
          return true
        }

        return false
      })
    }

    // Availability filter
    if (activeFilters.availability.length > 0) {
      const currentDate = new Date()

      filteredCourses = filteredCourses.filter((course) => {
        if (!course.availableFrom) return false

        if (
          activeFilters.availability.includes('always-available') &&
          course.availableFrom === 'постійно'
        ) {
          return true
        }

        if (course.availableFrom !== 'постійно') {
          try {
            const [day, month, year] = course.availableFrom.split('.').map(Number)
            if (isNaN(day) || isNaN(month) || isNaN(year)) return false

            const availableDate = new Date(year, month - 1, day)

            if (
              activeFilters.availability.includes('available-now') &&
              availableDate <= currentDate
            ) {
              return true
            }

            if (activeFilters.availability.includes('coming-soon') && availableDate > currentDate) {
              return true
            }
          } catch (e) {
            console.error('Error parsing date:', e)
            return false
          }
        }

        return false
      })
    }

    courses.value = filteredCourses
  }

  function handleSortChange(sortOption) {
    const sortMethods = {
      newest: (a, b) => {
        const dateA = a.availableFrom === 'постійно' ? new Date(0) : parseDate(a.availableFrom)
        const dateB = b.availableFrom === 'постійно' ? new Date(0) : parseDate(b.availableFrom)
        return dateB - dateA
      },
      popular: (a, b) => (b.students || 0) - (a.students || 0),
      rating: (a, b) => (b.rating || 0) - (a.rating || 0),
    }

    if (sortMethods[sortOption]) {
      courses.value = [...courses.value].sort(sortMethods[sortOption])
    }
  }

  function parseDate(dateStr) {
    if (!dateStr || dateStr === 'постійно') return new Date(0)

    const [day, month, year] = dateStr.split('.').map(Number)
    return new Date(year, month - 1, day)
  }

  return {
    courses,
    allCourses,
    loading,
    error,
    filters,
    sortOptions,
    fetchCourses,
    handleSearch,
    handleFilterChange,
    handleRatingChange,
    handleClearFilters,
    handleSortChange,
  }
}
