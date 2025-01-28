<template>
  <div class="course-card">
    <img :src="course.image" :alt="course.title" class="course-image" />
    <div class="course-content">
      <h3 class="course-title">{{ course.title }}</h3>
      <p class="course-available">Доступний з {{ course.availableFrom }}</p>
      <div class="course-stats">
        <span class="students">
          <img src="@/assets/svg/user.svg" alt="User icon" class="icon" />
          <i class="fas fa-user"></i>
          {{ course.students }}
        </span>
        <span class="rating">
          <img src="@/assets/svg/star.svg" alt="Star icon" class="icon" />
          <i class="fas fa-star"></i>
          {{ course.rating }}
        </span>
      </div>
      <p class="course-type">{{ course.type }}</p>
      <div class="course-author">
        <img :src="authorIcon" :alt="course.author" class="author-icon" />
        <span :class="['author-badge', course.author.toLowerCase()]">
          {{ course.author }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseCard',
  props: {
    course: {
      type: Object,
      required: true,
    },
  },
  computed: {
    authorIcon() {
      return this.course.author.toLowerCase() === 'codegram'
        ? 'https://i.ibb.co/19zSGXf/logo.png'
        : 'https://i.ibb.co/tXGTqW5/Icon2-0.jpg'
    },
  },
}
</script>

<style scoped>
.course-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  transition: transform 0.2s;

  display: flex;
  flex-direction: column;
}

.course-card:hover {
  transform: translateY(-4px);
}

.course-image {
  width: 100%;
  height: 160px;
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

.course-available {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.course-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.students,
.rating {
  display: flex;
  gap: 0.1rem;
}

.course-type {
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.course-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  margin-top: auto;
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
}
</style>
