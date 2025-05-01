<template>
  <div class="module-quiz">
    <h2 class="quiz-title">{{ title }}</h2>
    <p class="quiz-description">{{ description }}</p>

    <div v-if="!submitted" class="quiz-questions">
      <div v-for="(question, qIndex) in questions" :key="qIndex" class="quiz-question">
        <h3>{{ qIndex + 1 }}. {{ question.question }}</h3>

        <div class="quiz-options">
          <div v-for="(option, oIndex) in question.options" :key="oIndex" class="quiz-option">
            <input
              type="radio"
              :id="`q${qIndex}-opt${oIndex}`"
              :name="`question-${qIndex}`"
              :value="oIndex"
              v-model="answers[qIndex]"
            />
            <label :for="`q${qIndex}-opt${oIndex}`">{{ option }}</label>
          </div>
        </div>
      </div>

      <div class="quiz-actions">
        <button @click="submitQuiz" class="submit-button" :disabled="!isComplete">
          Відправити відповіді
        </button>
      </div>
    </div>

    <div v-else class="quiz-results">
      <div class="result-header">
        <h3>Результати тесту</h3>
        <div class="score" :class="{ 'passing-score': isPassed, 'failing-score': !isPassed }">
          <span class="score-value">{{ score }}%</span>
          <span class="score-label">{{ isPassed ? 'Тест пройдено!' : 'Тест не пройдено' }}</span>
        </div>
      </div>

      <div class="question-results">
        <div v-for="(question, qIndex) in questions" :key="qIndex" class="question-result">
          <h4>
            {{ qIndex + 1 }}. {{ question.question }}
            <span
              class="result-indicator"
              :class="{
                correct: answers[qIndex] === question.correctOptionIndex,
                incorrect: answers[qIndex] !== question.correctOptionIndex,
              }"
            >
              {{ answers[qIndex] === question.correctOptionIndex ? '✓' : '✗' }}
            </span>
          </h4>

          <div class="options-result">
            <div
              v-for="(option, oIndex) in question.options"
              :key="oIndex"
              class="option-result"
              :class="{
                'user-selected': answers[qIndex] === oIndex,
                'correct-option': question.correctOptionIndex === oIndex,
                'incorrect-option':
                  answers[qIndex] === oIndex && question.correctOptionIndex !== oIndex,
              }"
            >
              {{ option }}
            </div>
          </div>

          <div
            v-if="question.explanation && answers[qIndex] !== question.correctOptionIndex"
            class="explanation"
          >
            <p>{{ question.explanation }}</p>
          </div>
        </div>
      </div>

      <div class="quiz-actions">
        <button v-if="!isPassed" @click="retakeQuiz" class="retake-button">
          Пройти тест знову
        </button>
        <button v-if="isFinalQuiz && isPassed" @click="completeCourse" class="complete-button">
          Завершити курс
        </button>
        <button v-else-if="isPassed" @click="$emit('continue')" class="continue-button">
          Продовжити навчання
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModuleQuiz',
  props: {
    title: {
      type: String,
      default: 'Тест',
    },
    description: {
      type: String,
      default: 'Перевірте свої знання, відповівши на запитання нижче.',
    },
    questions: {
      type: Array,
      required: true,
    },
    passingScore: {
      type: Number,
      default: 60,
    },
    moduleId: {
      type: String,
      required: true,
    },
    isFinalQuiz: {
      type: Boolean,
      default: false,
    },
    weight: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      answers: [],
      submitted: false,
      score: 0,
    }
  },
  computed: {
    isComplete() {
      return (
        this.answers.length === this.questions.length &&
        !this.answers.some((answer) => answer === undefined || answer === null)
      )
    },
    isPassed() {
      return this.score >= this.passingScore
    },
  },
  methods: {
    submitQuiz() {
      if (!this.isComplete) return

      // Підраховуємо кількість правильних відповідей
      let correctCount = 0

      this.questions.forEach((question, index) => {
        if (this.answers[index] === question.correctOptionIndex) {
          correctCount++
        }
      })

      this.score = Math.round((correctCount / this.questions.length) * 100)

      this.submitted = true

      // Відправляємо результат
      this.$emit('quiz-submitted', {
        moduleId: this.moduleId,
        score: this.score,
        passed: this.isPassed,
        answers: [...this.answers],
        isFinalQuiz: this.isFinalQuiz,
        weight: this.weight,
      })
    },
    retakeQuiz() {
      this.answers = []
      this.submitted = false
      this.score = 0

      this.$emit('quiz-retake', this.moduleId)
    },
    completeCourse() {
      this.$emit('course-completed')
    },
  },
}
</script>

<style scoped>
.module-quiz {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.quiz-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.quiz-description {
  color: #6b7280;
  margin-bottom: 2rem;
}

.quiz-question {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.quiz-question h3 {
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quiz-option {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
}

.quiz-option input {
  margin-top: 0.25rem;
  margin-right: 0.5rem;
}

.quiz-option label {
  flex: 1;
  cursor: pointer;
}

.quiz-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.submit-button,
.retake-button,
.continue-button,
.complete-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.submit-button {
  background-color: #3b82f6;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.submit-button:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.retake-button {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
  margin-right: 1rem;
}

.retake-button:hover {
  background-color: #e5e7eb;
}

.continue-button,
.complete-button {
  background-color: #10b981;
  color: white;
}

.continue-button:hover,
.complete-button:hover {
  background-color: #059669;
}

.complete-button {
  background-color: #8b5cf6;
}

.complete-button:hover {
  background-color: #7c3aed;
}

.quiz-results {
  padding: 1rem 0;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.score {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
}

.passing-score {
  background-color: #d1fae5;
  color: #065f46;
}

.failing-score {
  background-color: #fee2e2;
  color: #991b1b;
}

.score-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.question-result {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: #f9fafb;
}

.question-result h4 {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.result-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-weight: bold;
}

.result-indicator.correct {
  background-color: #d1fae5;
  color: #065f46;
}

.result-indicator.incorrect {
  background-color: #fee2e2;
  color: #991b1b;
}

.options-result {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-result {
  padding: 0.75rem 1rem;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
  background-color: white;
}

.user-selected {
  font-weight: 500;
}

.correct-option {
  border-color: #10b981;
  background-color: #d1fae5;
}

.incorrect-option {
  border-color: #ef4444;
  background-color: #fee2e2;
}

.explanation {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background-color: #eff6ff;
  border-radius: 0.25rem;
  color: #1e40af;
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .module-quiz {
    padding: 1.5rem;
  }

  .result-header {
    flex-direction: column;
    gap: 1rem;
  }

  .quiz-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .retake-button {
    margin-right: 0;
    margin-bottom: 0.75rem;
  }
}
</style>
