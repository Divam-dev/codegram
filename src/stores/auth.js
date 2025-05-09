import { defineStore } from 'pinia'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useProfileStore } from './profile'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    initPromise: null,
  }),

  actions: {
    init() {
      if (this.initPromise) return this.initPromise

      const auth = getAuth()
      const profileStore = useProfileStore()

      this.initPromise = new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          this.user = user
          this.isAuthenticated = !!user

          // Load user profile
          if (user) {
            try {
              await profileStore.loadUserProfile(user.uid)
            } catch (error) {
              console.error('Error loading user profile:', error)
            }
          } else {
            profileStore.clearProfile()
          }

          this.isInitialized = true
          resolve()
        })
      })

      return this.initPromise
    },

    setUser(user) {
      this.user = user
      this.isAuthenticated = !!user
    },

    clearUser() {
      this.user = null
      this.isAuthenticated = false
      const profileStore = useProfileStore()
      profileStore.clearProfile()
    },
  },
})
