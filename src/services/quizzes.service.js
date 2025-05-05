import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'

export class QuizzesService {
  constructor() {
    this.db = getFirestore()
  }

  async getFinalQuiz(courseId) {
    try {
      const finalQuizCollection = collection(this.db, `courses/${courseId}/finalQuiz`)
      const finalQuizSnapshot = await getDocs(finalQuizCollection)

      if (!finalQuizSnapshot.empty) {
        const quizDoc = finalQuizSnapshot.docs[0]

        return {
          id: quizDoc.id,
          ...quizDoc.data(),
          isFinalQuiz: true,
        }
      }

      const courseRef = doc(this.db, 'courses', courseId)
      const courseDoc = await getDoc(courseRef)

      if (courseDoc.exists() && courseDoc.data().finalQuiz) {
        const quizData = courseDoc.data().finalQuiz
        return {
          id: 'embedded-final-quiz',
          ...quizData,
          isFinalQuiz: true,
        }
      }

      return null
    } catch (error) {
      console.error(`Помилка при отриманні фінального тесту для курсу ${courseId}:`, error)
      throw new Error(`Помилка при отриманні фінального тесту: ${error.message}`)
    }
  }

  async saveQuizResult(enrollmentId, quizResult) {
    try {
      const quizData = {
        ...quizResult,
        completedAt: serverTimestamp(),
        isFinalQuiz: true,
      }

      // Перевіряємо, чи вже є результат для цього тесту
      const existingResults = await this.getQuizResults(enrollmentId)
      const existingResult = existingResults.find((result) => result.isFinalQuiz)

      if (existingResult) {
        // Оновлюємо існуючий результат
        const resultRef = doc(this.db, `enrollments/${enrollmentId}/quizResults`, existingResult.id)

        const updatedData = {
          ...quizData,
          attempts: (existingResult.attempts || 0) + 1,
        }

        await updateDoc(resultRef, updatedData)

        return {
          id: existingResult.id,
          ...updatedData,
        }
      } else {
        const resultData = {
          ...quizData,
          attempts: 1,
        }

        const resultsRef = collection(this.db, `enrollments/${enrollmentId}/quizResults`)
        const newResultRef = await addDoc(resultsRef, resultData)

        return {
          id: newResultRef.id,
          ...resultData,
        }
      }
    } catch (error) {
      console.error('Error saving quiz result:', error)
      throw new Error(`Помилка при збереженні результату тесту: ${error.message}`)
    }
  }

  async getQuizResults(enrollmentId) {
    try {
      const resultsRef = collection(this.db, `enrollments/${enrollmentId}/quizResults`)
      const resultsSnapshot = await getDocs(resultsRef)

      const results = []
      resultsSnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
        })
      })

      return results
    } catch (error) {
      console.error('Error fetching quiz results:', error)
      throw new Error(`Помилка при отриманні результатів тестів: ${error.message}`)
    }
  }

  async updateCourseCompletionStatus(enrollmentId) {
    try {
      const enrollmentRef = doc(this.db, 'enrollments', enrollmentId)
      const enrollmentDoc = await getDoc(enrollmentRef)

      if (!enrollmentDoc.exists()) {
        throw new Error('Запис на курс не знайдено')
      }

      // Отримуємо результат фінального тесту
      const results = await this.getQuizResults(enrollmentId)
      const finalQuizResult = results.find((result) => result.isFinalQuiz)

      if (!finalQuizResult) {
        return {
          id: enrollmentId,
          completed: false,
          finalScore: 0,
        }
      }

      const passed = finalQuizResult.score >= 60 && finalQuizResult.passed

      await updateDoc(enrollmentRef, {
        completed: passed,
        finalScore: finalQuizResult.score,
        completedAt: passed ? serverTimestamp() : null,
      })

      return {
        id: enrollmentId,
        completed: passed,
        finalScore: finalQuizResult.score,
      }
    } catch (error) {
      console.error('Error updating course completion status:', error)
      throw new Error(`Помилка при оновленні статусу проходження курсу: ${error.message}`)
    }
  }
}
