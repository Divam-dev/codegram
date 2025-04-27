import { defineStore } from 'pinia'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
import { AuthHelper } from '../services/auth.service'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null,
  }),

  getters: {
    userName: (state) => state.profile?.username || 'User',
    userEmail: (state) => state.profile?.email || '',
    userAvatar: (state) => state.profile?.profile?.avatarUrl || '',
    userFullName: (state) => state.profile?.profile?.fullName || '',
    userBio: (state) => state.profile?.profile?.bio || '',
  },

  actions: {
    async loadUserProfile(userId) {
      if (!userId) return null

      const db = getFirestore()
      try {
        const userDoc = await getDoc(doc(db, 'users', userId))
        if (userDoc.exists()) {
          this.profile = userDoc.data()
        }
        return this.profile
      } catch (error) {
        console.error('Error loading user profile:', error)
        throw new Error('Failed to load profile')
      }
    },

    // Update user profile
    async updateUserProfile(userId, profileData) {
      if (!userId) throw new Error('User not authenticated')

      const db = getFirestore()
      const userRef = doc(db, 'users', userId)

      try {
        if (profileData.username && profileData.username !== this.profile?.username) {
          const authHelper = new AuthHelper()
          const usernameExists = await authHelper.checkUsernameExists(profileData.username)
          if (usernameExists) {
            throw new Error('Цей логін вже використовується іншим користувачем')
          }
        }

        const updates = {}

        if (profileData.username && profileData.username !== this.profile?.username) {
          updates.username = profileData.username
          updates.normalizedUsername = profileData.username.toLowerCase()
        }

        // Handle profile fields
        if (profileData.fullName !== undefined) {
          if (!updates.profile) {
            updates.profile = {}
          }
          updates['profile.fullName'] = profileData.fullName
        }

        if (profileData.bio !== undefined) {
          if (!updates.profile) {
            updates.profile = {}
          }
          updates['profile.bio'] = profileData.bio
        }

        if (profileData.avatarUrl) {
          if (!updates.profile) {
            updates.profile = {}
          }
          updates['profile.avatarUrl'] = profileData.avatarUrl
        }

        if (Object.keys(updates).length > 0) {
          const firestoreUpdates = {}

          if (updates.username) {
            firestoreUpdates.username = updates.username
          }

          if (updates.normalizedUsername) {
            firestoreUpdates.normalizedUsername = updates.normalizedUsername
          }

          if (updates['profile.fullName']) {
            firestoreUpdates['profile.fullName'] = updates['profile.fullName']
          }

          if (updates['profile.bio']) {
            firestoreUpdates['profile.bio'] = updates['profile.bio']
          }

          if (updates['profile.avatarUrl']) {
            firestoreUpdates['profile.avatarUrl'] = updates['profile.avatarUrl']
          }

          await updateDoc(userRef, firestoreUpdates)

          // Update local cache
          if (!this.profile.profile) {
            this.profile.profile = {}
          }

          if (updates.username) {
            this.profile.username = updates.username
          }

          if (updates.normalizedUsername) {
            this.profile.normalizedUsername = updates.normalizedUsername
          }

          if (updates['profile.fullName']) {
            this.profile.profile.fullName = updates['profile.fullName']
          }

          if (updates['profile.bio']) {
            this.profile.profile.bio = updates['profile.bio']
          }

          if (updates['profile.avatarUrl']) {
            this.profile.profile.avatarUrl = updates['profile.avatarUrl']
          }
        }

        return this.profile
      } catch (error) {
        console.error('Error updating profile:', error)
        throw error
      }
    },

    clearProfile() {
      this.profile = null
    },
  },
})
