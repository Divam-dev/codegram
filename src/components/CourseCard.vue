<template>
  <div class="course-card-container">
    <router-link :to="`/courses/${course.id}`" class="card-link">
      <div class="course-card">
        <img
          :src="course.image || 'https://placehold.co/1280x720'"
          :alt="course.title"
          class="course-image"
        />
        <div class="course-content">
          <h3 class="course-title">{{ course.title }}</h3>
          <div class="course-footer">
            <p class="course-available">{{ formatAvailability(course.availableFrom) }}</p>
            <div class="course-stats">
              <span class="students">
                <img src="@/assets/svg/user.svg" alt="User icon" class="icon" />
                {{ course.students || 0 }}
              </span>
            </div>
            <div class="course-author" @click.stop>
              <router-link
                v-if="course.authorId"
                :to="`/user/${course.authorId}`"
                class="author-link"
              >
                <img :src="authorAvatar" :alt="authorName" class="author-icon" />
                <span :class="['author-badge', course.courseType]">
                  {{ authorName }}
                </span>
              </router-link>
              <template v-else>
                <img :src="authorAvatar" :alt="authorName" class="author-icon" />
                <span :class="['author-badge', course.courseType]">
                  {{ authorName }}
                </span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
import codegramLogoSvg from '@/assets/svg/logo.svg'
import defaultAuthorSvg from '@/assets/svg/profile-avatar.svg'

export default {
  name: 'CourseCard',
  props: {
    course: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      codegramLogoSvg,
      defaultAuthorSvg,
    }
  },
  computed: {
    authorAvatar() {
      if (
        this.course.author &&
        this.course.author.profile &&
        this.course.author.profile.avatarUrl
      ) {
        return this.course.author.profile.avatarUrl
      }
      if (this.course.courseType === 'codegram') {
        return this.codegramLogoSvg
      }

      return this.defaultAuthorSvg
    },
    authorName() {
      if (this.course.author && this.course.author.username) {
        return this.course.author.username
      }
      if (this.course.courseType === 'codegram') {
        return 'Codegram'
      }
      return 'Автора не знайдено'
    },
  },
  methods: {
    formatCourseType(type) {
      if (type === 'codegram') return 'Codegram'
      if (type === 'user') return 'Користувач'
      return 'Автора не знайдено'
    },
    formatAvailability(availability) {
      if (!availability) return 'Доступність не вказана'
      if (availability === 'постійно') return 'Доступний завжди'
      return `Доступний з ${availability}`
    },
  },
}
</script>

<style scoped>
.course-card-container {
  height: 100%;
}

.card-link {
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;
}

.course-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.course-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.course-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.course-title {
  font-size: 1.125rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.course-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.course-available {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.course-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
}

.students {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.icon {
  width: 16px;
  height: 16px;
}

.course-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.author-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.author-link:hover {
  background-color: #f3f4f6;
}

.author-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.author-badge {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: bold;
  word-break: break-word;
}

.author-badge.codegram {
  color: #3b82f6;
}
</style>
