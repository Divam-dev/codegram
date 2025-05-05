<template>
  <div class="course-editor-page">
    <BaseHeader />
    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">
            {{ isEditMode ? 'Редагування курсу' : 'Створення нового курсу' }}
          </h1>
          <div class="action-buttons">
            <button @click="saveDraft" class="btn-save-draft" :disabled="isSaving">
              {{ isSaving ? 'Збереження...' : 'Зберегти чернетку' }}
            </button>
            <button
              @click="submitForReview"
              class="btn-submit"
              :disabled="isSaving || !isFormValid"
            >
              {{ isSaving ? 'Відправка...' : 'Відправити на перевірку' }}
            </button>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <p>Завантаження даних курсу...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="loadCourse" class="retry-button" v-if="isEditMode">
            Спробувати знову
          </button>
          <router-link to="/my-courses" class="back-button">Повернутися до моїх курсів</router-link>
        </div>

        <div v-else class="editor-container">
          <div class="tabs">
            <button
              @click="activeTab = 'info'"
              :class="['tab-button', { active: activeTab === 'info' }]"
            >
              Основна інформація
            </button>
            <button
              @click="activeTab = 'modules'"
              :class="['tab-button', { active: activeTab === 'modules' }]"
            >
              Модулі та лекції
            </button>
            <button
              @click="activeTab = 'finalQuiz'"
              :class="['tab-button', { active: activeTab === 'finalQuiz' }]"
            >
              Фінальний тест
            </button>
          </div>

          <div v-if="activeTab === 'info'" class="tab-content">
            <form @submit.prevent="submitForReview" class="course-form">
              <div class="form-section">
                <h2 class="section-title">Основна інформація</h2>

                <div class="form-group">
                  <label for="title">Назва курсу *</label>
                  <input
                    v-model="course.title"
                    type="text"
                    id="title"
                    placeholder="Введіть назву курсу"
                    required
                    maxlength="100"
                    @input="validateForm"
                  />
                  <div v-if="formErrors.title" class="error-message">{{ formErrors.title }}</div>
                </div>

                <div class="form-group">
                  <label for="description">Опис курсу *</label>
                  <textarea
                    v-model="course.description"
                    id="description"
                    placeholder="Детальний опис вашого курсу"
                    required
                    rows="5"
                    maxlength="1000"
                    @input="validateForm"
                  ></textarea>
                  <div v-if="formErrors.description" class="error-message">
                    {{ formErrors.description }}
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group half-width">
                    <label for="level">Рівень складності *</label>
                    <select v-model="course.level" id="level" required @change="validateForm">
                      <option value="">Виберіть рівень</option>
                      <option value="beginner">Початковий</option>
                      <option value="intermediate">Середній</option>
                      <option value="advanced">Просунутий</option>
                    </select>
                    <div v-if="formErrors.level" class="error-message">{{ formErrors.level }}</div>
                  </div>

                  <div class="form-group half-width">
                    <label for="language">Мова курсу *</label>
                    <select v-model="course.language" id="language" required @change="validateForm">
                      <option value="">Виберіть мову</option>
                      <option value="українська">Українська</option>
                      <option value="english">Англійська</option>
                      <option value="інша">Інша</option>
                    </select>
                    <div v-if="formErrors.language" class="error-message">
                      {{ formErrors.language }}
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group half-width">
                    <label for="duration">Тривалість (годин) *</label>
                    <input
                      v-model.number="course.duration"
                      type="number"
                      id="duration"
                      placeholder="Наприклад: 10"
                      min="1"
                      required
                      @input="validateForm"
                    />
                    <div v-if="formErrors.duration" class="error-message">
                      {{ formErrors.duration }}
                    </div>
                  </div>

                  <div class="form-group half-width">
                    <label for="availableFrom">Доступність</label>
                    <select v-model="course.availableFrom" id="availableFrom">
                      <option value="постійно">Доступний завжди</option>
                      <option value="custom">Вказати дату</option>
                    </select>

                    <div v-if="course.availableFrom === 'custom'" class="date-input">
                      <input v-model="customDate" type="date" @change="updateAvailableFromDate" />
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="image">Зображення курсу</label>
                  <div class="image-upload">
                    <div class="image-preview" v-if="imagePreview">
                      <img :src="imagePreview" alt="Preview" />
                    </div>
                    <div class="upload-controls">
                      <input
                        type="file"
                        id="image"
                        ref="imageInput"
                        accept="image/*"
                        @change="handleImageUpload"
                        class="file-input"
                      />
                      <button type="button" @click="triggerImageUpload" class="upload-button">
                        {{ imagePreview ? 'Змінити зображення' : 'Завантажити зображення' }}
                      </button>
                      <p class="image-hint">Рекомендований розмір: 1280x720px, до 5MB</p>
                      <div v-if="formErrors.image" class="error-message">
                        {{ formErrors.image }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h2 class="section-title">Теми та технології</h2>

                <div class="form-group">
                  <label>Теми курсу *</label>
                  <div class="tags-container">
                    <div
                      v-for="topic in availableTopics"
                      :key="topic.id"
                      :class="['tag-item', { selected: course.topics.includes(topic.id) }]"
                      @click="toggleTopic(topic.id)"
                    >
                      {{ topic.label }}
                    </div>
                  </div>
                  <div v-if="formErrors.topics" class="error-message">{{ formErrors.topics }}</div>
                </div>

                <div class="form-group">
                  <label>Технології</label>
                  <div class="tags-container">
                    <div
                      v-for="tech in availableTechnologies"
                      :key="tech.id"
                      :class="['tag-item', { selected: course.technologies.includes(tech.id) }]"
                      @click="toggleTechnology(tech.id)"
                    >
                      {{ tech.label }}
                    </div>
                  </div>
                  <div v-if="formErrors.technologies" class="error-message">
                    {{ formErrors.technologies }}
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div v-if="activeTab === 'modules'" class="tab-content">
            <div class="form-section">
              <h2 class="section-title">Модулі та лекції</h2>

              <div v-if="modules.length === 0" class="empty-state">
                <p>Ви ще не додали модулів до курсу</p>
              </div>

              <div v-else class="modules-list">
                <div
                  v-for="(module, moduleIndex) in modules"
                  :key="moduleIndex"
                  class="module-item"
                >
                  <div class="module-header">
                    <div class="module-title-wrapper">
                      <span class="module-number">{{ moduleIndex + 1 }}</span>
                      <h3 class="module-title">{{ module.title }}</h3>
                    </div>
                    <div class="module-actions">
                      <button @click="toggleModuleExpand(moduleIndex)" class="btn-toggle">
                        {{ expandedModules.includes(moduleIndex) ? 'Згорнути' : 'Розгорнути' }}
                      </button>
                      <button @click="editModule(moduleIndex)" class="btn-edit">Редагувати</button>
                      <button @click="removeModule(moduleIndex)" class="btn-delete">
                        Видалити
                      </button>
                    </div>
                  </div>

                  <div v-if="expandedModules.includes(moduleIndex)" class="module-content">
                    <div class="module-description">{{ module.description }}</div>

                    <div class="lessons-container">
                      <h4 class="lessons-title">Лекції модуля</h4>

                      <div v-if="module.lessons.length === 0" class="empty-lessons">
                        <p>Немає лекцій у цьому модулі</p>
                      </div>

                      <div v-else class="lessons-list">
                        <div
                          v-for="(lesson, lessonIndex) in module.lessons"
                          :key="lessonIndex"
                          class="lesson-item"
                        >
                          <div class="lesson-header">
                            <span class="lesson-number"
                              >{{ moduleIndex + 1 }}.{{ lessonIndex + 1 }}</span
                            >
                            <h5 class="lesson-title">{{ lesson.title }}</h5>
                            <div class="lesson-type-badge" :class="lesson.type">
                              {{ getLessonTypeLabel(lesson.type) }}
                            </div>
                            <div class="lesson-actions">
                              <button
                                @click="editLesson(moduleIndex, lessonIndex)"
                                class="btn-edit-small"
                              >
                                Ред.
                              </button>
                              <button
                                @click="removeLesson(moduleIndex, lessonIndex)"
                                class="btn-delete-small"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button @click="addLesson(moduleIndex)" class="btn-add">
                        + Додати лекцію
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button @click="addModule" class="btn-add-module">+ Додати новий модуль</button>
            </div>
          </div>

          <div v-if="activeTab === 'finalQuiz'" class="tab-content">
            <div class="form-section">
              <h2 class="section-title">Фінальний тест</h2>

              <div class="form-group">
                <label for="quizTitle">Назва тесту</label>
                <input
                  v-model="finalQuiz.title"
                  type="text"
                  id="quizTitle"
                  placeholder="Наприклад: Фінальний тест курсу"
                />
              </div>

              <div class="form-group">
                <label for="quizDescription">Опис тесту</label>
                <textarea
                  v-model="finalQuiz.description"
                  id="quizDescription"
                  placeholder="Опис тесту та вказівки для учнів"
                  rows="2"
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group half-width">
                  <label for="passingScore">Прохідний бал (%) *</label>
                  <input
                    v-model.number="finalQuiz.passingScore"
                    type="number"
                    id="passingScore"
                    placeholder="Наприклад: 60"
                    min="1"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div class="quiz-questions">
                <h3 class="quiz-questions-title">Питання тесту</h3>

                <div v-if="finalQuiz.questions.length === 0" class="empty-state">
                  <p>Ще немає питань у тесті</p>
                </div>

                <div v-else class="questions-list">
                  <div
                    v-for="(question, qIndex) in finalQuiz.questions"
                    :key="qIndex"
                    class="question-item"
                  >
                    <div class="question-header">
                      <span class="question-number">{{ qIndex + 1 }}</span>
                      <h4 class="question-text">{{ question.question }}</h4>
                      <div class="question-actions">
                        <button @click="editQuestion(qIndex)" class="btn-edit-small">
                          Редагувати
                        </button>
                        <button @click="removeQuestion(qIndex)" class="btn-delete-small">
                          Видалити
                        </button>
                      </div>
                    </div>

                    <div class="options-list">
                      <div
                        v-for="(option, oIndex) in question.options"
                        :key="oIndex"
                        :class="[
                          'option-item',
                          { 'correct-option': oIndex === question.correctOptionIndex },
                        ]"
                      >
                        <span class="option-letter">{{ String.fromCharCode(65 + oIndex) }}.</span>
                        <span class="option-text">{{ option }}</span>
                        <span v-if="oIndex === question.correctOptionIndex" class="correct-mark"
                          >✓</span
                        >
                      </div>
                    </div>
                  </div>
                </div>

                <button @click="addQuestion" class="btn-add">+ Додати питання</button>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <router-link to="/my-courses" class="btn-cancel">Скасувати</router-link>
            <button @click="saveDraft" class="btn-save-draft" :disabled="isSaving">
              {{ isSaving ? 'Збереження...' : 'Зберегти чернетку' }}
            </button>
            <button
              @click="submitForReview"
              class="btn-submit"
              :disabled="isSaving || !isFormValid"
            >
              {{ isSaving ? 'Відправка...' : 'Відправити на перевірку' }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <div v-if="showModuleModal" class="modal-overlay" @click="closeModuleModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingModuleIndex === null ? 'Додати новий модуль' : 'Редагувати модуль' }}</h3>
          <button class="close-btn" @click="closeModuleModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="moduleTitle">Назва модуля *</label>
            <input
              v-model="moduleForm.title"
              type="text"
              id="moduleTitle"
              placeholder="Введіть назву модуля"
              required
            />
          </div>

          <div class="form-group">
            <label for="moduleDescription">Опис модуля</label>
            <textarea
              v-model="moduleForm.description"
              id="moduleDescription"
              placeholder="Опис модуля"
              rows="3"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button class="cancel-btn" @click="closeModuleModal">Скасувати</button>
            <button class="confirm-btn" @click="saveModule" :disabled="!moduleForm.title">
              {{ editingModuleIndex === null ? 'Додати модуль' : 'Зберегти зміни' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showLessonModal" class="modal-overlay" @click="closeLessonModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingLessonIndex === null ? 'Додати нову лекцію' : 'Редагувати лекцію' }}</h3>
          <button class="close-btn" @click="closeLessonModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="lessonTitle">Назва лекції *</label>
            <input
              v-model="lessonForm.title"
              type="text"
              id="lessonTitle"
              placeholder="Введіть назву лекції"
              required
            />
          </div>

          <div class="form-group">
            <label for="lessonType">Тип лекції *</label>
            <select v-model="lessonForm.type" id="lessonType" required>
              <option value="text">Текстова лекція</option>
              <option value="video">Відео</option>
              <option value="pdf">PDF документ</option>
              <option value="combined">Комбінована лекція</option>
            </select>
          </div>

          <div
            class="form-group"
            v-if="lessonForm.type === 'text' || lessonForm.type === 'combined'"
          >
            <label for="lessonContent">Вміст лекції</label>
            <textarea
              v-model="lessonForm.content"
              id="lessonContent"
              placeholder="Введіть текст лекції (підтримується HTML форматування)"
              rows="6"
            ></textarea>
          </div>

          <div
            class="form-group"
            v-if="lessonForm.type === 'video' || lessonForm.type === 'combined'"
          >
            <label for="lessonVideoUrl">Посилання на відео</label>
            <input
              v-model="lessonForm.videoUrl"
              type="url"
              id="lessonVideoUrl"
              placeholder="Наприклад: https://youtube.com/watch?v=..."
            />
            <div class="input-hint">Підтримуються YouTube, Vimeo та інші відеохостинги</div>
          </div>

          <div
            class="form-group"
            v-if="lessonForm.type === 'pdf' || lessonForm.type === 'combined'"
          >
            <label for="lessonPdfUrl">Посилання на PDF</label>
            <input
              v-model="lessonForm.pdfUrl"
              type="url"
              id="lessonPdfUrl"
              placeholder="Наприклад: https://drive.google.com/..."
            />
            <div class="input-hint">URL документа, який доступний для перегляду в iframe</div>
          </div>

          <div class="modal-actions">
            <button class="cancel-btn" @click="closeLessonModal">Скасувати</button>
            <button
              class="confirm-btn"
              @click="saveLesson"
              :disabled="!lessonForm.title || !lessonForm.type"
            >
              {{ editingLessonIndex === null ? 'Додати лекцію' : 'Зберегти зміни' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showQuestionModal" class="modal-overlay" @click="closeQuestionModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            {{ editingQuestionIndex === null ? 'Додати нове питання' : 'Редагувати питання' }}
          </h3>
          <button class="close-btn" @click="closeQuestionModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="questionText">Текст питання *</label>
            <textarea
              v-model="questionForm.question"
              id="questionText"
              placeholder="Введіть текст питання"
              rows="2"
              required
            ></textarea>
          </div>

          <h4 class="options-heading">Варіанти відповідей</h4>

          <div class="form-group" v-for="(option, index) in questionForm.options" :key="index">
            <div class="option-form-row">
              <input
                type="radio"
                :name="'correctOption'"
                :id="'option' + index"
                :checked="questionForm.correctOptionIndex === index"
                @change="questionForm.correctOptionIndex = index"
                class="option-radio"
              />
              <label :for="'option' + index" class="option-radio-label">Правильна</label>
              <input
                v-model="questionForm.options[index]"
                type="text"
                :placeholder="`Варіант ${index + 1}`"
                class="option-input"
                required
              />
              <button
                v-if="questionForm.options.length > 2"
                @click="removeOption(index)"
                class="btn-remove-option"
              >
                ×
              </button>
            </div>
          </div>

          <button v-if="questionForm.options.length < 6" @click="addOption" class="btn-add-option">
            + Додати варіант
          </button>

          <div class="modal-actions">
            <button class="cancel-btn" @click="closeQuestionModal">Скасувати</button>
            <button class="confirm-btn" @click="saveQuestion" :disabled="!isQuestionFormValid">
              {{ editingQuestionIndex === null ? 'Додати питання' : 'Зберегти зміни' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <BaseFooter />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore'
import { useRoute, useRouter } from 'vue-router'
import BaseHeader from '@/components/BaseHeader.vue'
import BaseFooter from '@/components/BaseFooter.vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'CourseEditor',
  components: {
    BaseHeader,
    BaseFooter,
  },
  setup() {
    const db = getFirestore()
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const imageInput = ref(null)

    const isEditMode = computed(() => !!route.params.courseId)
    const courseId = computed(() => route.params.courseId || null)

    const loading = ref(true)
    const error = ref(null)
    const isSaving = ref(false)
    const imagePreview = ref(null)
    const customDate = ref('')
    const activeTab = ref('info')

    const course = reactive({
      title: '',
      description: '',
      level: '',
      language: 'українська',
      duration: null,
      availableFrom: 'постійно',
      image: '',
      topics: [],
      technologies: [],
      courseType: 'user',
      status: 'draft',
    })

    // Помилки валідації
    const formErrors = reactive({
      title: '',
      description: '',
      level: '',
      language: '',
      duration: '',
      image: '',
      topics: '',
      technologies: '',
    })

    const modules = reactive([])
    const expandedModules = ref([])

    const showModuleModal = ref(false)
    const editingModuleIndex = ref(null)
    const moduleForm = reactive({
      title: '',
      description: '',
      order: 0,
    })

    const showLessonModal = ref(false)
    const editingModuleForLesson = ref(null)
    const editingLessonIndex = ref(null)
    const lessonForm = reactive({
      title: '',
      type: 'text',
      content: '',
      videoUrl: '',
      pdfUrl: '',
      duration: null,
      order: 0,
    })

    // Фінальний тест
    const finalQuiz = reactive({
      title: 'Фінальний тест',
      description: 'Тест для перевірки знань з усього курсу',
      passingScore: 60,
      questions: [],
    })

    const showQuestionModal = ref(false)
    const editingQuestionIndex = ref(null)
    const questionForm = reactive({
      question: '',
      options: ['', ''],
      correctOptionIndex: 0,
      explanation: '',
    })

    // Теми курсу
    const availableTopics = [
      { id: 'programming', label: 'Програмування' },
      { id: 'design', label: 'Дизайн' },
      { id: 'marketing', label: 'Маркетинг' },
      { id: 'project-management', label: 'Управління проектами' },
      { id: 'ai', label: 'Штучний інтелект' },
      { id: 'ux-ui', label: 'UX/UI' },
      { id: 'data-science', label: 'Data Science' },
      { id: 'frontend-backend', label: 'Frontend / Backend' },
      { id: 'game-dev', label: 'Розробка ігор' },
      { id: 'devops', label: 'DevOps' },
      { id: 'seo-smm', label: 'SEO / SMM' },
    ]

    // Технології
    const availableTechnologies = [
      { id: 'javascript', label: 'JavaScript / TypeScript' },
      { id: 'python', label: 'Python' },
      { id: 'csharp', label: 'C# / .NET' },
      { id: 'java', label: 'Java' },
      { id: 'php', label: 'PHP' },
      { id: 'frontend-frameworks', label: 'Vue / React / Angular' },
      { id: 'design-tools', label: 'Figma / Adobe XD' },
      { id: 'game-engines', label: 'Unity / Unreal' },
      { id: 'wordpress', label: 'WordPress' },
    ]

    const isFormValid = computed(() => {
      const basicInfoValid =
        course.title &&
        course.description &&
        course.level &&
        course.language &&
        course.duration &&
        course.topics.length > 0

      const hasModules = modules.length > 0

      const modulesHaveLessons = modules.every(
        (module) => module.lessons && module.lessons.length > 0,
      )

      const hasQuestions = finalQuiz.questions.length > 0

      return basicInfoValid && hasModules && modulesHaveLessons && hasQuestions
    })

    const isQuestionFormValid = computed(() => {
      return (
        questionForm.question.trim() !== '' &&
        questionForm.options.every((option) => option.trim() !== '') &&
        questionForm.correctOptionIndex >= 0 &&
        questionForm.correctOptionIndex < questionForm.options.length
      )
    })

    //Методи для курсу
    const loadCourse = async () => {
      if (!isEditMode.value) {
        loading.value = false
        return
      }

      loading.value = true
      error.value = null

      try {
        const courseRef = doc(db, 'courses', courseId.value)
        const courseDoc = await getDoc(courseRef)

        if (!courseDoc.exists()) {
          throw new Error('Курс не знайдено')
        }

        const courseData = courseDoc.data()

        // Перевірка, чи користувач є автором курсу
        if (courseData.authorId !== authStore.user.uid) {
          throw new Error('У вас немає прав для редагування цього курсу')
        }

        // Заповнення форми даними курсу
        Object.keys(course).forEach((key) => {
          if (courseData[key] !== undefined) {
            course[key] = courseData[key]
          }
        })

        // Якщо є кастомна дата доступності
        if (course.availableFrom !== 'постійно') {
          const dateStr = course.availableFrom
          customDate.value = convertDateToInputFormat(dateStr)
          course.availableFrom = 'custom'
        }

        if (course.image) {
          imagePreview.value = course.image
        }

        await loadModules()

        await loadFinalQuiz()

        validateForm()
      } catch (err) {
        console.error('Помилка при завантаженні курсу:', err)
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    // Завантаження модулів курсу
    const loadModules = async () => {
      if (!isEditMode.value) return

      try {
        const modulesRef = collection(db, `courses/${courseId.value}/modules`)
        const modulesSnapshot = await getDocs(modulesRef)

        modules.splice(0, modules.length)

        const tempModules = []

        for (const moduleDoc of modulesSnapshot.docs) {
          const moduleData = moduleDoc.data()

          // Завантаження лекцій модуля
          const lessonsRef = collection(
            db,
            `courses/${courseId.value}/modules/${moduleDoc.id}/lessons`,
          )
          const lessonsSnapshot = await getDocs(lessonsRef)

          const lessons = []
          lessonsSnapshot.forEach((lessonDoc) => {
            lessons.push({
              id: lessonDoc.id,
              ...lessonDoc.data(),
            })
          })

          // Сортування лекцій за порядком
          lessons.sort((a, b) => (a.order || 0) - (b.order || 0))

          tempModules.push({
            id: moduleDoc.id,
            ...moduleData,
            lessons,
          })
        }

        tempModules.sort((a, b) => (a.order || 0) - (b.order || 0))

        tempModules.forEach((module) => {
          modules.push(module)
        })
      } catch (err) {
        console.error('Помилка при завантаженні модулів:', err)
        throw err
      }
    }

    // Завантаження фінального тесту
    const loadFinalQuiz = async () => {
      if (!isEditMode.value) return

      try {
        const quizRef = doc(db, `courses/${courseId.value}/finalQuiz/quiz`)
        const quizDoc = await getDoc(quizRef)

        if (quizDoc.exists()) {
          const quizData = quizDoc.data()

          finalQuiz.title = quizData.title || 'Фінальний тест'
          finalQuiz.description = quizData.description || 'Тест для перевірки знань з усього курсу'
          finalQuiz.passingScore = quizData.passingScore || 60
          finalQuiz.questions = quizData.questions || []
        }
      } catch (err) {
        console.error('Помилка при завантаженні фінального тесту:', err)
      }
    }

    // Конвертація дати
    const convertDateToInputFormat = (dateStr) => {
      try {
        const [day, month, year] = dateStr.split('.')
        return `${year}-${month}-${day}`
      } catch (err) {
        console.error('Помилка при конвертації дати:', err)
        return ''
      }
    }

    // Оновлення дати доступності
    const updateAvailableFromDate = () => {
      if (customDate.value) {
        const [year, month, day] = customDate.value.split('-')
        course.availableFrom = `${day}.${month}.${year}`
      } else {
        course.availableFrom = 'постійно'
      }
    }

    const triggerImageUpload = () => {
      imageInput.value.click()
    }

    // Обробка завантаженого зображення
    const handleImageUpload = async (event) => {
      const file = event.target.files[0]
      formErrors.image = ''

      if (!file) return

      if (file.size > 5 * 1024 * 1024) {
        formErrors.image = 'Розмір файлу перевищує 5МБ'
        return
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        formErrors.image = 'Формат файлу не підтримується. Використовуйте JPEG, PNG, WEBP або GIF'
        return
      }

      // Створення попереднього перегляду
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreview.value = e.target.result
      }
      reader.readAsDataURL(file)

      try {
        const imageUrl = await uploadImageToImgBB(file)
        course.image = imageUrl
        validateForm()
      } catch (err) {
        console.error('Помилка при завантаженні зображення:', err)
        formErrors.image = 'Помилка при завантаженні зображення: ' + err.message
      }
    }

    // Завантаження зображення на ImgBB
    const uploadImageToImgBB = async (file) => {
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY

      if (!apiKey) {
        throw new Error('API ключ ImgBB не налаштований')
      }

      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Помилка завантаження: ${response.statusText}`)
      }

      const result = await response.json()
      if (result.success) {
        return result.data.url
      } else {
        throw new Error('Помилка завантаження зображення')
      }
    }

    const toggleTopic = (topicId) => {
      const index = course.topics.indexOf(topicId)

      if (index === -1) {
        course.topics.push(topicId)
      } else {
        course.topics.splice(index, 1)
      }

      validateForm()
    }

    const toggleTechnology = (techId) => {
      const index = course.technologies.indexOf(techId)

      if (index === -1) {
        course.technologies.push(techId)
      } else {
        course.technologies.splice(index, 1)
      }

      validateForm()
    }

    const validateForm = () => {
      Object.keys(formErrors).forEach((key) => {
        formErrors[key] = ''
      })

      if (!course.title) {
        formErrors.title = "Назва курсу обов'язкова"
      } else if (course.title.length < 5) {
        formErrors.title = 'Назва повинна містити не менше 5 символів'
      }

      if (!course.description) {
        formErrors.description = "Опис курсу обов'язковий"
      } else if (course.description.length < 20) {
        formErrors.description = 'Опис повинен містити не менше 20 символів'
      }

      if (!course.level) {
        formErrors.level = "Рівень складності обов'язковий"
      }

      if (!course.language) {
        formErrors.language = "Мова курсу обов'язкова"
      }

      if (!course.duration) {
        formErrors.duration = "Тривалість курсу обов'язкова"
      } else if (course.duration <= 0) {
        formErrors.duration = 'Тривалість повинна бути більше 0'
      }

      if (course.topics.length === 0) {
        formErrors.topics = 'Виберіть хоча б одну тему'
      }
    }

    // Методи для модулів
    const toggleModuleExpand = (moduleIndex) => {
      const index = expandedModules.value.indexOf(moduleIndex)
      if (index === -1) {
        expandedModules.value.push(moduleIndex)
      } else {
        expandedModules.value.splice(index, 1)
      }
    }

    const addModule = () => {
      editingModuleIndex.value = null
      moduleForm.title = ''
      moduleForm.description = ''
      moduleForm.order = modules.length
      showModuleModal.value = true
    }

    const editModule = (moduleIndex) => {
      editingModuleIndex.value = moduleIndex
      const module = modules[moduleIndex]
      moduleForm.title = module.title
      moduleForm.description = module.description || ''
      moduleForm.order = module.order || moduleIndex
      showModuleModal.value = true
    }

    // Видалення модуля
    const removeModule = (moduleIndex) => {
      if (
        confirm(
          'Ви впевнені, що хочете видалити цей модуль? Всі лекції модуля також будуть видалені.',
        )
      ) {
        modules.splice(moduleIndex, 1)

        modules.forEach((module, index) => {
          module.order = index
        })

        expandedModules.value = expandedModules.value
          .filter((index) => index !== moduleIndex)
          .map((index) => (index > moduleIndex ? index - 1 : index))
      }
    }

    // Збереження модуля
    const saveModule = () => {
      if (!moduleForm.title) return

      if (editingModuleIndex.value === null) {
        modules.push({
          title: moduleForm.title,
          description: moduleForm.description,
          order: moduleForm.order,
          lessons: [],
        })
      } else {
        const module = modules[editingModuleIndex.value]
        module.title = moduleForm.title
        module.description = moduleForm.description
        module.order = moduleForm.order
      }

      closeModuleModal()
    }

    const closeModuleModal = () => {
      showModuleModal.value = false
      editingModuleIndex.value = null
    }

    // Додавання лекції
    const addLesson = (moduleIndex) => {
      editingModuleForLesson.value = moduleIndex
      editingLessonIndex.value = null

      lessonForm.title = ''
      lessonForm.type = 'text'
      lessonForm.content = ''
      lessonForm.videoUrl = ''
      lessonForm.pdfUrl = ''
      lessonForm.duration = null
      lessonForm.order = modules[moduleIndex].lessons.length

      showLessonModal.value = true
    }

    // Редагування лекції
    const editLesson = (moduleIndex, lessonIndex) => {
      editingModuleForLesson.value = moduleIndex
      editingLessonIndex.value = lessonIndex

      const lesson = modules[moduleIndex].lessons[lessonIndex]

      lessonForm.title = lesson.title
      lessonForm.type = lesson.type || 'text'
      lessonForm.content = lesson.content || ''
      lessonForm.videoUrl = lesson.videoUrl || ''
      lessonForm.pdfUrl = lesson.pdfUrl || ''
      lessonForm.duration = lesson.duration || null
      lessonForm.order = lesson.order || lessonIndex

      showLessonModal.value = true
    }

    // Видалення лекції
    const removeLesson = (moduleIndex, lessonIndex) => {
      if (confirm('Ви впевнені, що хочете видалити цю лекцію?')) {
        modules[moduleIndex].lessons.splice(lessonIndex, 1)

        // Оновлення порядкових номерів
        modules[moduleIndex].lessons.forEach((lesson, index) => {
          lesson.order = index
        })
      }
    }

    // Збереження лекції
    const saveLesson = () => {
      if (!lessonForm.title || !lessonForm.type) return

      const moduleIndex = editingModuleForLesson.value

      if (lessonForm.type === 'video' && !lessonForm.videoUrl) {
        alert('Будь ласка, вкажіть посилання на відео')
        return
      }

      if (lessonForm.type === 'pdf' && !lessonForm.pdfUrl) {
        alert('Будь ласка, вкажіть посилання на PDF')
        return
      }

      if (
        lessonForm.type === 'combined' &&
        !lessonForm.content &&
        !lessonForm.videoUrl &&
        !lessonForm.pdfUrl
      ) {
        alert('Для комбінованої лекції потрібно додати хоча б один тип вмісту')
        return
      }

      const newLesson = {
        title: lessonForm.title,
        type: lessonForm.type,
        order: lessonForm.order,
      }

      if (lessonForm.type === 'text' || lessonForm.type === 'combined') {
        newLesson.content = lessonForm.content
      }

      if (lessonForm.type === 'video' || lessonForm.type === 'combined') {
        newLesson.videoUrl = lessonForm.videoUrl
      }

      if (lessonForm.type === 'pdf' || lessonForm.type === 'combined') {
        newLesson.pdfUrl = lessonForm.pdfUrl
      }

      if (editingLessonIndex.value === null) {
        modules[moduleIndex].lessons.push(newLesson)
      } else {
        const lesson = modules[moduleIndex].lessons[editingLessonIndex.value]
        Object.assign(lesson, newLesson)
      }

      closeLessonModal()
    }

    const closeLessonModal = () => {
      showLessonModal.value = false
      editingModuleForLesson.value = null
      editingLessonIndex.value = null
    }

    const getLessonTypeLabel = (type) => {
      const types = {
        text: 'Текст',
        video: 'Відео',
        pdf: 'PDF',
        combined: 'Комбін.',
      }
      return types[type] || type
    }

    // Додавання питання
    const addQuestion = () => {
      editingQuestionIndex.value = null

      questionForm.question = ''
      questionForm.options = ['', '']
      questionForm.correctOptionIndex = 0
      questionForm.explanation = ''

      showQuestionModal.value = true
    }

    // Редагування питання
    const editQuestion = (questionIndex) => {
      editingQuestionIndex.value = questionIndex

      const question = finalQuiz.questions[questionIndex]

      questionForm.question = question.question
      questionForm.options = [...question.options]
      questionForm.correctOptionIndex = question.correctOptionIndex
      questionForm.explanation = question.explanation || ''

      showQuestionModal.value = true
    }

    // Видалення питання
    const removeQuestion = (questionIndex) => {
      if (confirm('Ви впевнені, що хочете видалити це питання?')) {
        finalQuiz.questions.splice(questionIndex, 1)
      }
    }

    // Додавання варіанту відповіді
    const addOption = () => {
      if (questionForm.options.length < 6) {
        questionForm.options.push('')
      }
    }

    // Видалення варіанту відповіді
    const removeOption = (optionIndex) => {
      if (questionForm.options.length > 2) {
        questionForm.options.splice(optionIndex, 1)

        if (questionForm.correctOptionIndex === optionIndex) {
          questionForm.correctOptionIndex = 0
        } else if (questionForm.correctOptionIndex > optionIndex) {
          questionForm.correctOptionIndex--
        }
      }
    }

    // Збереження питання
    const saveQuestion = () => {
      if (!isQuestionFormValid.value) return

      const newQuestion = {
        question: questionForm.question,
        options: [...questionForm.options],
        correctOptionIndex: questionForm.correctOptionIndex,
      }

      if (editingQuestionIndex.value === null) {
        finalQuiz.questions.push(newQuestion)
      } else {
        finalQuiz.questions[editingQuestionIndex.value] = newQuestion
      }

      closeQuestionModal()
    }

    const closeQuestionModal = () => {
      showQuestionModal.value = false
      editingQuestionIndex.value = null
    }

    // Збереження чернетки
    const saveDraft = async () => {
      if (isSaving.value) return

      isSaving.value = true

      try {
        if (course.availableFrom === 'custom') {
          updateAvailableFromDate()
        }

        const userId = authStore.user.uid

        const courseData = {
          ...course,
          authorId: userId,
          status: 'draft',
          updatedAt: serverTimestamp(),
        }

        let savedCourseId

        if (!isEditMode.value) {
          courseData.createdAt = serverTimestamp()

          const coursesRef = collection(db, 'courses')
          const docRef = await addDoc(coursesRef, courseData)
          savedCourseId = docRef.id
        } else {
          const courseRef = doc(db, 'courses', courseId.value)
          await updateDoc(courseRef, courseData)
          savedCourseId = courseId.value
        }

        await saveModules(savedCourseId)

        await saveFinalQuiz(savedCourseId)

        alert('Чернетку збережено!')

        if (!isEditMode.value) {
          router.push(`/create-course/edit/${savedCourseId}`)
        }
      } catch (err) {
        console.error('Помилка при збереженні чернетки:', err)
        alert(`Помилка: ${err.message}`)
      } finally {
        isSaving.value = false
      }
    }

    // Збереження модулів
    const saveModules = async (courseId) => {
      try {
        for (const module of modules) {
          const moduleData = {
            title: module.title,
            description: module.description || '',
            order: module.order,
          }

          let moduleId = module.id

          if (!moduleId) {
            const moduleRef = collection(db, `courses/${courseId}/modules`)
            const moduleDoc = await addDoc(moduleRef, moduleData)
            moduleId = moduleDoc.id
            module.id = moduleId
          } else {
            const moduleRef = doc(db, `courses/${courseId}/modules`, moduleId)
            await updateDoc(moduleRef, moduleData)
          }

          // Збереження лекцій модуля
          if (module.lessons && module.lessons.length > 0) {
            for (const lesson of module.lessons) {
              const lessonData = {
                title: lesson.title,
                type: lesson.type || 'text',
                order: lesson.order,
              }

              if (lesson.type === 'text' || lesson.type === 'combined') {
                lessonData.content = lesson.content || ''
              }

              if (lesson.type === 'video' || lesson.type === 'combined') {
                lessonData.videoUrl = lesson.videoUrl || ''
              }

              if (lesson.type === 'pdf' || lesson.type === 'combined') {
                lessonData.pdfUrl = lesson.pdfUrl || ''
              }

              if (lesson.duration) {
                lessonData.duration = lesson.duration
              }

              if (!lesson.id) {
                const lessonRef = collection(db, `courses/${courseId}/modules/${moduleId}/lessons`)
                const lessonDoc = await addDoc(lessonRef, lessonData)
                lesson.id = lessonDoc.id
              } else {
                const lessonRef = doc(
                  db,
                  `courses/${courseId}/modules/${moduleId}/lessons`,
                  lesson.id,
                )
                await updateDoc(lessonRef, lessonData)
              }
            }
          }
        }
      } catch (err) {
        console.error('Помилка при збереженні модулів:', err)
        throw err
      }
    }

    // Збереження фінального тесту
    const saveFinalQuiz = async (courseId) => {
      try {
        if (finalQuiz.questions.length > 0) {
          const quizData = {
            title: finalQuiz.title,
            description: finalQuiz.description,
            passingScore: finalQuiz.passingScore,
            questions: finalQuiz.questions,
          }

          const quizRef = doc(db, `courses/${courseId}/finalQuiz/quiz`)
          await setDoc(quizRef, quizData)
        }
      } catch (err) {
        console.error('Помилка при збереженні фінального тесту:', err)
        throw err
      }
    }

    // Відправка курсу на перевірку
    const submitForReview = async () => {
      if (isSaving.value) return

      validateForm()

      if (!isFormValid.value) {
        if (
          !course.title ||
          !course.description ||
          !course.level ||
          !course.language ||
          !course.duration ||
          !course.image ||
          course.topics.length === 0 ||
          course.technologies.length === 0
        ) {
          alert('Будь ласка, заповніть всі обов\'язкові поля в розділі "Основна інформація"')
          activeTab.value = 'info'
        } else if (modules.length === 0) {
          alert('Будь ласка, додайте хоча б один модуль у розділі "Модулі та лекції"')
          activeTab.value = 'modules'
        } else if (!modules.every((module) => module.lessons && module.lessons.length > 0)) {
          alert('Будь ласка, додайте хоча б одну лекцію до кожного модуля')
          activeTab.value = 'modules'
        } else if (finalQuiz.questions.length === 0) {
          alert('Будь ласка, додайте хоча б одне питання до фінального тесту')
          activeTab.value = 'finalQuiz'
        }
        return
      }

      isSaving.value = true

      try {
        if (course.availableFrom === 'custom') {
          updateAvailableFromDate()
        }

        const userId = authStore.user.uid

        const courseData = {
          ...course,
          authorId: userId,
          status: 'pending',
          updatedAt: serverTimestamp(),
        }

        let savedCourseId

        if (!isEditMode.value) {
          courseData.createdAt = serverTimestamp()

          const coursesRef = collection(db, 'courses')
          const docRef = await addDoc(coursesRef, courseData)
          savedCourseId = docRef.id
        } else {
          const courseRef = doc(db, 'courses', courseId.value)
          await updateDoc(courseRef, courseData)
          savedCourseId = courseId.value
        }

        await saveModules(savedCourseId)

        await saveFinalQuiz(savedCourseId)

        alert('Курс відправлено на перевірку!')
        router.push('/my-courses')
      } catch (err) {
        console.error('Помилка при відправленні курсу на перевірку:', err)
        alert(`Помилка: ${err.message}`)
      } finally {
        isSaving.value = false
      }
    }

    onMounted(() => {
      if (!authStore.isAuthenticated) {
        router.push('/login')
        return
      }

      loadCourse()
    })

    return {
      course,
      isEditMode,
      loading,
      error,
      isSaving,
      activeTab,
      formErrors,
      imagePreview,
      customDate,
      availableTopics,
      availableTechnologies,
      isFormValid,
      imageInput,
      modules,
      expandedModules,
      showModuleModal,
      editingModuleIndex,
      moduleForm,
      showLessonModal,
      editingModuleForLesson,
      editingLessonIndex,
      lessonForm,
      finalQuiz,
      showQuestionModal,
      editingQuestionIndex,
      questionForm,
      isQuestionFormValid,
      loadCourse,
      updateAvailableFromDate,
      triggerImageUpload,
      handleImageUpload,
      toggleTopic,
      toggleTechnology,
      validateForm,
      toggleModuleExpand,
      addModule,
      editModule,
      removeModule,
      saveModule,
      closeModuleModal,
      addLesson,
      editLesson,
      removeLesson,
      saveLesson,
      closeLessonModal,
      getLessonTypeLabel,
      addQuestion,
      editQuestion,
      removeQuestion,
      addOption,
      removeOption,
      saveQuestion,
      closeQuestionModal,
      saveDraft,
      submitForReview,
    }
  },
}
</script>

<style scoped>
.course-editor-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f3f4f6;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #6b7280;
}

.retry-button,
.back-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #e5e7eb;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  color: #4b5563;
}

.retry-button:hover,
.back-button:hover {
  background-color: #d1d5db;
}

.editor-container {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.tab-button {
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab-button:hover {
  color: #111827;
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background-color: #eff6ff;
}

.tab-content {
  padding: 1.5rem;
}

.course-form {
  padding: 0;
}

.form-section {
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1.5rem;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.25rem;
}

.half-width {
  flex: 1;
  margin-bottom: 0;
}

label {
  display: block;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

input[type='text'],
input[type='number'],
input[type='date'],
input[type='url'],
textarea,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

textarea {
  resize: vertical;
  min-height: 60px;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
}

.input-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.image-upload {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.image-preview {
  width: 200px;
  height: 120px;
  border-radius: 0.375rem;
  overflow: hidden;
  background-color: #f3f4f6;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-controls {
  flex: 1;
}

.file-input {
  display: none;
}

.upload-button {
  padding: 0.5rem 1rem;
  background-color: #e5e7eb;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.upload-button:hover {
  background-color: #d1d5db;
}

.image-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.5rem 0 0;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.tag-item {
  padding: 0.5rem 0.75rem;
  background-color: #f3f4f6;
  border-radius: 2rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-item:hover {
  background-color: #e5e7eb;
}

.tag-item.selected {
  background-color: #3b82f6;
  color: white;
}

.tag-item.selected:hover {
  background-color: #2563eb;
}

.date-input {
  margin-top: 0.5rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.empty-state {
  background-color: #f9fafb;
  padding: 2rem;
  border-radius: 0.5rem;
  text-align: center;
  color: #6b7280;
  border: 1px dashed #d1d5db;
  margin-bottom: 1.5rem;
}

.modules-list {
  margin-bottom: 1.5rem;
}

.module-item {
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.module-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.module-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #3b82f6;
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
}

.module-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.module-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-toggle,
.btn-edit,
.btn-delete {
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-toggle {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-toggle:hover {
  background-color: #e5e7eb;
}

.btn-edit {
  background-color: #3b82f6;
  color: white;
}

.btn-edit:hover {
  background-color: #2563eb;
}

.btn-delete {
  background-color: #ef4444;
  color: white;
}

.btn-delete:hover {
  background-color: #dc2626;
}

.module-content {
  padding: 1rem;
  background-color: white;
}

.module-description {
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.lessons-container {
  margin-top: 1rem;
}

.lessons-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #111827;
}

.empty-lessons {
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 0.375rem;
  text-align: center;
  color: #6b7280;
  border: 1px dashed #e5e7eb;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.lessons-list {
  margin-bottom: 1rem;
}

.lesson-item {
  margin-bottom: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  overflow: hidden;
}

.lesson-header {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  gap: 0.5rem;
  background-color: #f9fafb;
}

.lesson-number {
  font-size: 0.75rem;
  color: #6b7280;
  min-width: 30px;
}

.lesson-title {
  flex: 1;
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
}

.lesson-type-badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  color: white;
}

.lesson-type-badge.text {
  background-color: #10b981;
}

.lesson-type-badge.video {
  background-color: #f59e0b;
}

.lesson-type-badge.pdf {
  background-color: #ef4444;
}

.lesson-type-badge.combined {
  background-color: #8b5cf6;
}

.lesson-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-edit-small,
.btn-delete-small {
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-edit-small {
  background-color: #e5e7eb;
  color: #4b5563;
}

.btn-edit-small:hover {
  background-color: #d1d5db;
}

.btn-delete-small {
  background-color: #ef4444;
  color: white;
  width: 60px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-delete-small:hover {
  background-color: #dc2626;
}

.btn-add,
.btn-add-module {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-block;
}

.btn-add:hover,
.btn-add-module:hover {
  background-color: #2563eb;
}

.btn-add-module {
  margin-top: 1rem;
}

.quiz-questions {
  margin-top: 2rem;
}

.quiz-questions-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.question-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.question-header {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  gap: 0.75rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.question-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #3b82f6;
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
}

.question-text {
  flex: 1;
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
}

.question-actions {
  display: flex;
  gap: 0.5rem;
}

.options-list {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  background-color: #f3f4f6;
  font-size: 0.875rem;
}

.option-letter {
  font-weight: 600;
  margin-right: 0.75rem;
  color: #4b5563;
}

.option-text {
  flex: 1;
}

.correct-option {
  background-color: #d1fae5;
  border: 1px solid #10b981;
}

.correct-mark {
  color: #10b981;
  font-weight: 700;
  margin-left: auto;
}

.btn-add-option {
  display: block;
  margin-top: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  background-color: #f3f4f6;
  border: 1px dashed #d1d5db;
  border-radius: 0.375rem;
  color: #6b7280;
  font-size: 0.75rem;
  width: 100%;
  text-align: center;
  cursor: pointer;
}

.btn-add-option:hover {
  background-color: #e5e7eb;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.cancel-btn,
.confirm-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.cancel-btn {
  background-color: #e5e7eb;
  color: #4b5563;
}

.cancel-btn:hover {
  background-color: #d1d5db;
}

.confirm-btn {
  background-color: #3b82f6;
  color: white;
}

.confirm-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.options-heading {
  font-size: 1rem;
  font-weight: 600;
  margin: 1.5rem 0 0.75rem;
  color: #111827;
}

.option-form-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.option-radio {
  margin: 0;
}

.option-radio-label {
  font-size: 0.75rem;
  color: #6b7280;
  min-width: 60px;
}

.option-input {
  flex: 1;
}

.btn-remove-option {
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-remove-option:hover {
  background-color: #dc2626;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-save-draft,
.btn-submit {
  padding: 0.75rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-cancel {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background-color: #e5e7eb;
}

.btn-save-draft {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #3b82f6;
}

.btn-save-draft:hover:not(:disabled) {
  background-color: #eff6ff;
  color: #3b82f6;
}

.btn-submit {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.btn-submit:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-save-draft:disabled,
.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.validation-progress {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 1.25rem;
  }

  .half-width {
    width: 100%;
  }

  .image-upload {
    flex-direction: column;
    align-items: center;
  }

  .image-preview {
    width: 100%;
    max-width: 300px;
    height: 180px;
    margin-bottom: 1rem;
  }

  .upload-controls {
    width: 100%;
    text-align: center;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-cancel,
  .btn-save-draft,
  .btn-submit {
    width: 100%;
    text-align: center;
  }
}
</style>
