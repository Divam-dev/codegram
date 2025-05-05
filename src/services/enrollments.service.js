import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore'

export class EnrollmentsService {
  constructor() {
    this.db = getFirestore()
  }

  async getUserEnrollments(userId) {
    try {
      const enrollmentsRef = collection(this.db, 'enrollments')
      const q = query(enrollmentsRef, where('userId', '==', userId))
      const querySnapshot = await getDocs(q)

      const enrollments = []
      querySnapshot.forEach((doc) => {
        enrollments.push({
          id: doc.id,
          ...doc.data(),
        })
      })

      return enrollments.sort((a, b) => {
        const dateA = a.enrolledAt ? new Date(a.enrolledAt.seconds * 1000) : new Date(0)
        const dateB = b.enrolledAt ? new Date(b.enrolledAt.seconds * 1000) : new Date(0)
        return dateB - dateA
      })
    } catch (error) {
      console.error('Помилка при отриманні записів користувача:', error)
      throw new Error(`Помилка при отриманні записів користувача: ${error.message}`)
    }
  }

  async checkEnrollment(userId, courseId) {
    try {
      const enrollmentsRef = collection(this.db, 'enrollments')
      const q = query(
        enrollmentsRef,
        where('userId', '==', userId),
        where('courseId', '==', courseId),
      )
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return { isEnrolled: false, enrollment: null }
      }

      const enrollmentDoc = querySnapshot.docs[0]
      return {
        isEnrolled: true,
        enrollment: {
          id: enrollmentDoc.id,
          ...enrollmentDoc.data(),
        },
      }
    } catch (error) {
      console.error('Помилка при перевірці запису на курс:', error)
      throw new Error(`Помилка при перевірці запису на курс: ${error.message}`)
    }
  }

  async enrollCourse(userId, courseId) {
    try {
      const { isEnrolled, enrollment } = await this.checkEnrollment(userId, courseId)

      if (isEnrolled) {
        return enrollment
      }

      const enrollmentData = {
        userId,
        courseId,
        enrolledAt: serverTimestamp(),
        progress: 0,
        completed: false,
      }

      const enrollmentsRef = collection(this.db, 'enrollments')
      const docRef = await addDoc(enrollmentsRef, enrollmentData)

      // Збільшуємо кількість студентів
      const courseRef = doc(this.db, 'courses', courseId)
      await runTransaction(this.db, async (transaction) => {
        const courseDoc = await transaction.get(courseRef)
        if (!courseDoc.exists()) {
          throw "Course doesn't exist!"
        }

        const courseData = courseDoc.data()
        const currentStudents = courseData.students || 0

        transaction.update(courseRef, {
          students: currentStudents + 1,
        })
      })

      return {
        id: docRef.id,
        ...enrollmentData,
      }
    } catch (error) {
      console.error('Помилка при записі на курс:', error)
      throw new Error(`Помилка при записі на курс: ${error.message}`)
    }
  }

  async getEnrollment(enrollmentId) {
    try {
      const enrollmentRef = doc(this.db, 'enrollments', enrollmentId)
      const enrollmentDoc = await getDoc(enrollmentRef)

      if (!enrollmentDoc.exists()) {
        return null
      }

      return {
        id: enrollmentDoc.id,
        ...enrollmentDoc.data(),
      }
    } catch (error) {
      console.error(`Помилка при отриманні запису ${enrollmentId}:`, error)
      throw new Error(`Помилка при отриманні запису: ${error.message}`)
    }
  }

  async getCompletedLessons(enrollmentId) {
    try {
      const lessonsRef = collection(this.db, `enrollments/${enrollmentId}/completedLessons`)
      const querySnapshot = await getDocs(lessonsRef)

      const completedLessons = []
      querySnapshot.forEach((doc) => {
        completedLessons.push({
          id: doc.id,
          ...doc.data(),
        })
      })

      return completedLessons
    } catch (error) {
      console.error('Помилка при отриманні виконаних уроків:', error)
      throw new Error(`Помилка при отриманні виконаних уроків: ${error.message}`)
    }
  }

  async completeLesson(enrollmentId, moduleId, lessonId) {
    try {
      // Перевіряємо, чи урок вже позначений як виконаний
      const completedLessons = await this.getCompletedLessons(enrollmentId)
      const isCompleted = completedLessons.some(
        (lesson) => lesson.id === lessonId && lesson.moduleId === moduleId,
      )

      if (isCompleted) {
        return completedLessons.find(
          (lesson) => lesson.id === lessonId && lesson.moduleId === moduleId,
        )
      }

      const lessonData = {
        moduleId,
        completedAt: serverTimestamp(),
      }

      const lessonsRef = collection(this.db, `enrollments/${enrollmentId}/completedLessons`)
      const lessonRef = doc(lessonsRef, lessonId)

      await setDoc(lessonRef, lessonData, { merge: true })

      await this.updateProgress(enrollmentId)

      return {
        id: lessonId,
        ...lessonData,
      }
    } catch (error) {
      console.error('Помилка при позначенні уроку як виконаного:', error)
      throw new Error(`Помилка при позначенні уроку як виконаного: ${error.message}`)
    }
  }

  async updateProgress(enrollmentId) {
    try {
      const enrollment = await this.getEnrollment(enrollmentId)

      if (!enrollment) {
        throw new Error('Запис не знайдено')
      }

      const courseId = enrollment.courseId

      const courseRef = doc(this.db, 'courses', courseId)
      const modulesRef = collection(courseRef, 'modules')
      const modulesSnapshot = await getDocs(modulesRef)

      let totalLessons = 0
      const modulesData = []

      modulesSnapshot.forEach((moduleDoc) => {
        modulesData.push({
          id: moduleDoc.id,
          ...moduleDoc.data(),
        })
      })

      // Для кожного модуля отримуємо уроки
      for (const module of modulesData) {
        const lessonsRef = collection(modulesRef, module.id, 'lessons')
        const lessonsSnapshot = await getDocs(lessonsRef)

        totalLessons += lessonsSnapshot.size
      }

      try {
        const finalQuizRef = doc(this.db, 'courses', courseId, 'finalQuiz', 'quiz')
        const finalQuizDoc = await getDoc(finalQuizRef)

        if (finalQuizDoc.exists()) {
          totalLessons += 1
        } else {
          const altFinalQuizRef = doc(this.db, 'courses', courseId, 'finalQuiz')
          const altQuizDoc = await getDoc(altFinalQuizRef)

          if (altQuizDoc.exists()) {
            totalLessons += 1
          } else {
            totalLessons += 1
          }
        }
      } catch (innerErr) {
        console.warn('Помилка при перевірці фінального тесту:', innerErr)
        totalLessons += 1
      }

      const completedLessons = await this.getCompletedLessons(enrollmentId)

      const quizResultsRef = collection(this.db, `enrollments/${enrollmentId}/quizResults`)
      const quizResultsSnapshot = await getDocs(quizResultsRef)

      let completedItems = completedLessons.length

      // Додаємо пройдений фінальний тест
      quizResultsSnapshot.forEach((resultDoc) => {
        const result = resultDoc.data()
        if (result.isFinalQuiz && result.passed) {
          completedItems += 1
        }
      })

      // Розраховуємо прогрес
      const progress = totalLessons > 0 ? Math.round((completedItems / totalLessons) * 100) : 0

      // Оновлюємо прогрес в записі
      const enrollmentRef = doc(this.db, 'enrollments', enrollmentId)
      await updateDoc(enrollmentRef, {
        progress,
      })

      return progress
    } catch (error) {
      console.error('Помилка при оновленні прогресу:', error)
      throw new Error(`Помилка при оновленні прогресу: ${error.message}`)
    }
  }

  async updateLastViewedLesson(enrollmentId, moduleId, lessonId) {
    try {
      const enrollmentRef = doc(this.db, 'enrollments', enrollmentId)

      await updateDoc(enrollmentRef, {
        lastModuleId: moduleId,
        lastLessonId: lessonId,
      })

      return {
        id: enrollmentId,
        lastModuleId: moduleId,
        lastLessonId: lessonId,
      }
    } catch (error) {
      console.error('Помилка при оновленні останнього переглянутого уроку:', error)
      throw new Error(`Помилка при оновленні останнього переглянутого уроку: ${error.message}`)
    }
  }

  async cancelEnrollment(enrollmentId) {
    try {
      const enrollmentRef = doc(this.db, 'enrollments', enrollmentId)
      await deleteDoc(enrollmentRef)
    } catch (error) {
      console.error('Помилка при скасуванні запису на курс:', error)
      throw new Error(`Помилка при скасуванні запису на курс: ${error.message}`)
    }
  }
}
