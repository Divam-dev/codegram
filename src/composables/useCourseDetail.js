import { computed, reactive } from 'vue'
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore'
import { CoursesService } from '../services/courses.service'

export function useCourseDetail(courseId) {
  const coursesService = new CoursesService()
  const db = getFirestore()

  // State management
  const state = reactive({
    course: {},
    author: null,
    modules: [],
    moduleLessons: {},
    loading: {
      course: true,
      lessons: {},
    },
    errors: {
      course: null,
      lessons: {},
    },
    expandedModuleIds: new Set(),
    showAllModules: false,
    isModuleClickable: true,
  })

  // Computed properties
  const sortedModules = computed(() =>
    [...state.modules].sort((a, b) => (a.order || 0) - (b.order || 0)),
  )

  const isAvailable = computed(() => {
    const { availableFrom } = state.course

    if (!availableFrom) return true
    if (availableFrom === 'постійно') return true

    try {
      const [day, month, year] = availableFrom.split('.').map(Number)
      if (isNaN(day) || isNaN(month) || isNaN(year)) return false

      const availableDate = new Date(year, month - 1, day)
      return new Date() >= availableDate
    } catch (e) {
      console.error('Error parsing date:', e)
      return false
    }
  })

  // For template compatibility
  const course = computed(() => state.course)
  const author = computed(() => state.author)
  const modules = computed(() => state.modules)
  const loading = computed(() => state.loading.course)
  const error = computed(() => state.errors.course)
  const expandedModules = computed(() => Array.from(state.expandedModuleIds))
  const moduleLessons = computed(() => state.moduleLessons)
  const isLoadingLessons = computed(() => state.loading.lessons)
  const lessonErrors = computed(() => state.errors.lessons)
  const showAllModules = computed(() => state.showAllModules)

  const fetchCourse = async () => {
    state.loading.course = true
    state.errors.course = null

    try {
      const courseRef = doc(db, 'courses', courseId)
      const courseDoc = await getDoc(courseRef)

      if (!courseDoc.exists()) {
        state.errors.course = 'Курс не знайдено'
        return
      }

      state.course = {
        id: courseDoc.id,
        ...courseDoc.data(),
      }

      await Promise.all([fetchAuthor(), fetchModules()])
    } catch (err) {
      console.error('Error fetching course details:', err)
      state.errors.course = `Помилка при завантаженні курсу: ${err.message}`
    } finally {
      state.loading.course = false
    }
  }

  const fetchAuthor = async () => {
    if (!state.course.authorId) return null

    try {
      state.author = await coursesService.getAuthorById(state.course.authorId)
    } catch (err) {
      console.error('Error fetching author:', err)
    }
  }

  const fetchModules = async () => {
    try {
      const modulesRef = collection(db, `courses/${courseId}/modules`)
      const modulesQuery = query(modulesRef, orderBy('order', 'asc'))
      const modulesSnapshot = await getDocs(modulesQuery)

      const modulesData = []
      modulesSnapshot.forEach((moduleDoc) => {
        modulesData.push({
          id: moduleDoc.id,
          ...moduleDoc.data(),
        })
      })

      state.modules = modulesData

      if (modulesData.length > 0) {
        const firstModuleId = modulesData[0].id
        state.expandedModuleIds.add(firstModuleId)
        fetchLessonsForModule(firstModuleId)
      }

      state.showAllModules = modulesData.length <= 3
    } catch (err) {
      console.error('Error fetching modules:', err)
      state.errors.course = `Помилка при завантаженні модулів: ${err.message}`
    }
  }

  const fetchLessonsForModule = async (moduleId) => {
    if (state.moduleLessons[moduleId]) return

    state.loading.lessons[moduleId] = true
    state.errors.lessons[moduleId] = null

    try {
      const lessonsPath = `courses/${courseId}/modules/${moduleId}/lessons`
      const lessonsRef = collection(db, lessonsPath)
      const lessonsQuery = query(lessonsRef, orderBy('order', 'asc'))
      const lessonsSnapshot = await getDocs(lessonsQuery)

      const lessons = []
      lessonsSnapshot.forEach((lessonDoc) => {
        lessons.push({
          id: lessonDoc.id,
          ...lessonDoc.data(),
        })
      })

      state.moduleLessons[moduleId] = lessons
    } catch (err) {
      console.error(`Error fetching lessons for module ${moduleId}:`, err)
      state.errors.lessons[moduleId] = `Помилка при завантаженні лекцій: ${err.message}`
    } finally {
      state.loading.lessons[moduleId] = false
    }
  }

  const toggleModule = (moduleId) => {
    if (!state.isModuleClickable) return

    state.isModuleClickable = false

    if (state.expandedModuleIds.has(moduleId)) {
      state.expandedModuleIds.delete(moduleId)
    } else {
      state.expandedModuleIds.add(moduleId)
      fetchLessonsForModule(moduleId)
    }

    setTimeout(() => {
      state.isModuleClickable = true
    }, 300)
  }

  const expandAllModules = () => {
    state.showAllModules = true

    state.modules.forEach((module) => {
      if (!state.expandedModuleIds.has(module.id)) {
        state.expandedModuleIds.add(module.id)
        fetchLessonsForModule(module.id)
      }
    })
  }

  const formatAvailability = (availability) => {
    if (!availability) return 'Доступність не вказана'
    if (availability === 'постійно') return 'Доступний завжди'
    return `Доступний з ${availability}`
  }

  const formatLevel = (level) => {
    const levels = {
      beginner: 'Початковий',
      intermediate: 'Середній',
      advanced: 'Просунутий',
    }
    return levels[level] || level
  }

  return {
    course,
    author,
    modules,
    sortedModules,
    moduleLessons,
    isLoadingLessons,
    lessonErrors,
    loading,
    error,
    expandedModules,
    showAllModules,
    isAvailable,

    fetchCourse,
    toggleModule,
    expandAllModules,
    formatAvailability,
    formatLevel,
  }
}
