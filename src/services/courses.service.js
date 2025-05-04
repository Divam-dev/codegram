import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  addDoc,
} from 'firebase/firestore'

export class CoursesService {
  constructor() {
    this.db = getFirestore()
    this.authorsCache = new Map()
  }

  async getAllCourses() {
    try {
      // Модифікуємо запит, щоб отримувати тільки схвалені курси
      const coursesRef = collection(this.db, 'courses')
      const approvedCoursesQuery = query(coursesRef, where('status', '==', 'approved'))
      const querySnapshot = await getDocs(approvedCoursesQuery)

      const courses = []
      querySnapshot.forEach((doc) => {
        courses.push({
          id: doc.id,
          ...doc.data(),
        })
      })

      return courses
    } catch (error) {
      console.error('Error fetching courses:', error)
      throw new Error(`Помилка при отриманні курсів: ${error.message}`)
    }
  }

  async getCoursesWithAuthors() {
    try {
      const courses = await this.getAllCourses()

      const authorIds = new Set()
      courses.forEach((course) => {
        if (course.authorId) {
          authorIds.add(course.authorId)
        }
      })

      if (authorIds.size > 0) {
        const authorPromises = Array.from(authorIds).map(async (authorId) => {
          if (this.authorsCache.has(authorId)) {
            return { id: authorId, data: this.authorsCache.get(authorId) }
          }

          const userRef = doc(this.db, 'users', authorId)
          const userDoc = await getDoc(userRef)

          if (userDoc.exists()) {
            const userData = userDoc.data()
            this.authorsCache.set(authorId, userData)
            return { id: authorId, data: userData }
          }

          return { id: authorId, data: null }
        })

        const authors = await Promise.all(authorPromises)

        const authorsMap = new Map()
        authors.forEach((author) => {
          authorsMap.set(author.id, author.data)
        })

        return courses.map((course) => {
          const author = course.authorId ? authorsMap.get(course.authorId) : null

          return {
            ...course,
            author: author || null,
          }
        })
      }

      return courses.map((course) => ({ ...course, author: null }))
    } catch (error) {
      console.error('Error fetching courses with authors:', error)
      throw new Error(`Помилка при отриманні курсів з авторами: ${error.message}`)
    }
  }

  async getAuthorById(authorId) {
    if (!authorId) return null

    if (this.authorsCache.has(authorId)) {
      return this.authorsCache.get(authorId)
    }

    try {
      const userRef = doc(this.db, 'users', authorId)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        this.authorsCache.set(authorId, userData)
        return userData
      }

      return null
    } catch (error) {
      console.error(`Error fetching author with ID ${authorId}:`, error)
      return null
    }
  }

  async getCourseById(courseId) {
    try {
      const courseRef = doc(this.db, 'courses', courseId)
      const courseDoc = await getDoc(courseRef)

      if (courseDoc.exists()) {
        const courseData = {
          id: courseDoc.id,
          ...courseDoc.data(),
        }
        // Отримуємо дані автора
        if (courseData.authorId) {
          courseData.author = await this.getAuthorById(courseData.authorId)
        }

        return courseData
      }

      return null
    } catch (error) {
      console.error(`Error fetching course with ID ${courseId}:`, error)
      throw new Error(`Помилка при отриманні курсу: ${error.message}`)
    }
  }

  // Метод для отримання курсів, створених конкретним користувачем
  async getCoursesByAuthor(authorId) {
    try {
      const coursesRef = collection(this.db, 'courses')
      const q = query(coursesRef, where('authorId', '==', authorId))
      const querySnapshot = await getDocs(q)

      const courses = []
      querySnapshot.forEach((doc) => {
        courses.push({
          id: doc.id,
          ...doc.data(),
        })
      })

      return courses
    } catch (error) {
      console.error(`Error fetching courses by author ${authorId}:`, error)
      throw new Error(`Помилка при отриманні курсів автора: ${error.message}`)
    }
  }

  // Створення нового курсу
  async createCourse(courseData) {
    try {
      const coursesRef = collection(this.db, 'courses')
      const docRef = await addDoc(coursesRef, courseData)

      return {
        id: docRef.id,
        ...courseData,
      }
    } catch (error) {
      console.error('Error creating course:', error)
      throw new Error(`Помилка при створенні курсу: ${error.message}`)
    }
  }

  // Метод для отримання курсів, що очікують на перевірку (для адмін-панелі)
  async getPendingCourses() {
    try {
      const coursesRef = collection(this.db, 'courses')
      const q = query(coursesRef, where('status', '==', 'pending'))
      const querySnapshot = await getDocs(q)

      const courses = []
      querySnapshot.forEach((doc) => {
        courses.push({
          id: doc.id,
          ...doc.data(),
        })
      })

      return courses
    } catch (error) {
      console.error('Error fetching pending courses:', error)
      throw new Error(`Помилка при отриманні курсів на перевірці: ${error.message}`)
    }
  }
}
