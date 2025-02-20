import { defineStore } from 'pinia'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    initPromise: null,
    profile: null,
  }),

  getters: {
    userProfile: (state) => state.profile,
    userName: (state) => state.profile?.username || state.user?.displayName || 'Користувач',
    userEmail: (state) => state.profile?.email || state.user?.email || '',
    userAvatar: (state) => state.profile?.profile?.avatarUrl || state.user?.photoURL || '',
  },

  actions: {
    init() {
      const auth = getAuth()
      const db = getFirestore()

      this.initPromise = new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          this.user = user
          this.isAuthenticated = !!user

          // Load user profile
          if (user) {
            try {
              const userDoc = await getDoc(doc(db, 'users', user.uid))
              if (userDoc.exists()) {
                this.profile = userDoc.data()
              }
            } catch (error) {
              console.error('Error loading user profile:', error)
            }
          } else {
            this.profile = null
          }

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
      this.profile = null
    },

    async updateProfile(profileData) {
      if (!this.user) throw new Error('User not authenticated')

      const db = getFirestore()
      const userRef = doc(db, 'users', this.user.uid)

      try {
        const updates = {}
        if (profileData.username) updates.username = profileData.username
        if (profileData.bio) updates['profile.bio'] = profileData.bio
        if (profileData.avatarUrl) updates['profile.avatarUrl'] = profileData.avatarUrl

        await updateDoc(userRef, updates)

        // Update local cache
        this.profile = {
          ...this.profile,
          ...(profileData.username && { username: profileData.username }),
          profile: {
            ...this.profile?.profile,
            ...(profileData.bio && { bio: profileData.bio }),
            ...(profileData.avatarUrl && { avatarUrl: profileData.avatarUrl }),
          },
        }

        return this.profile
      } catch (error) {
        console.error('Error updating profile:', error)
        throw new Error('Failed to update profile')
      }
    },

    async refreshProfile() {
      if (!this.user) return null

      const db = getFirestore()
      try {
        const userDoc = await getDoc(doc(db, 'users', this.user.uid))
        if (userDoc.exists()) {
          this.profile = userDoc.data()
        }
        return this.profile
      } catch (error) {
        console.error('Error refreshing profile:', error)
        throw new Error('Failed to refresh profile')
      }
    },
  },
})
