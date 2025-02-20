import { defineStore } from 'pinia'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    initPromise: null,
  }),
  actions: {
    init() {
      this.initPromise = new Promise((resolve) => {
        const auth = getAuth()
        onAuthStateChanged(auth, (user) => {
          this.user = user
          this.isAuthenticated = !!user
          resolve()
        })
      })
    },
    setUser(user) {
      this.user = user
      this.isAuthenticated = !!user
    },
    clearUser() {
      this.user = null
      this.isAuthenticated = false
    },
  },
})
