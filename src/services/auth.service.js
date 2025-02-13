import { getFirestore, collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore'
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'

export class AuthHelper {
  constructor() {
    this.db = getFirestore()
    this.auth = getAuth()
  }

  async checkEmailExists(email) {
    if (!email) {
      return { exists: false, authType: null }
    }

    try {
      const usersRef = collection(this.db, 'users')
      const q = query(usersRef, where('email', '==', email.toLowerCase()))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data()
        return {
          exists: true,
          authType: userData.authType,
        }
      }

      return {
        exists: false,
        authType: null,
      }
    } catch (error) {
      console.error('Error checking email:', error)
      throw new Error(`Помилка перевірки email: ${error.message}`)
    }
  }

  getUserEmail(user) {
    if (user.email) {
      return user.email
    }

    if (user.providerData && user.providerData.length > 0) {
      const googleData = user.providerData.find((provider) => provider.providerId === 'google.com')
      if (googleData && googleData.email) {
        return googleData.email
      }
    }

    throw new Error('Не вдалося отримати email користувача')
  }

  async createUserRecord(user, username, authType) {
    try {
      const email = this.getUserEmail(user)

      if (!email) {
        throw new Error("Email є обов'язковим для створення профілю")
      }

      const userDoc = {
        userId: user.uid,
        email: email.toLowerCase(),
        username: username || email.split('@')[0],
        role: 'user',
        authType: authType,
        createdAt: new Date(),
        profile: {
          avatarUrl: user.photoURL || '',
          bio: '',
        },
      }

      const userRef = doc(this.db, 'users', user.uid)
      await setDoc(userRef, userDoc)

      console.log('Successfully created user record')
      return userDoc
    } catch (error) {
      console.error('Error in createUserRecord:', error)
      throw new Error(`Не вдалося створити профіль користувача: ${error.message}`)
    }
  }

  async registerWithEmail(email, password, username) {
    try {
      const { exists, authType } = await this.checkEmailExists(email)

      if (exists) {
        if (authType === 'email') {
          throw new Error('Користувач з такою електронною поштою вже існує')
        }
        throw new Error('Ця електронна пошта вже використовується через інший метод автентифікації')
      }

      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password)

      await this.createUserRecord(userCredential.user, username, 'email')

      return userCredential.user
    } catch (error) {
      console.error('Registration error:', error)

      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Ця електронна пошта вже використовується')
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Невірний формат електронної пошти')
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('Пароль занадто слабкий')
      }

      if (error.message) {
        throw error
      }

      throw new Error('Помилка при реєстрації. Спробуйте ще раз.')
    }
  }

  async signInWithGoogle() {
    let temporaryUser = null

    try {
      console.log('Starting Google sign in process')
      const provider = new GoogleAuthProvider()
      provider.addScope('email')

      const result = await signInWithPopup(this.auth, provider)
      temporaryUser = result.user

      const email = this.getUserEmail(result.user)
      console.log('Retrieved email:', email)

      const { exists, authType } = await this.checkEmailExists(email)

      if (exists && authType !== 'google') {
        await temporaryUser.delete()
        throw new Error('Цей email вже зареєстрований через інший метод автентифікації')
      }

      if (!exists) {
        await this.createUserRecord(result.user, result.user.displayName, 'google')
      }

      return result.user
    } catch (error) {
      console.error('Google sign in error:', error)

      if (temporaryUser) {
        try {
          await temporaryUser.delete()
        } catch (deleteError) {
          console.error('Error deleting temporary user:', deleteError)
        }
      }

      throw error
    }
  }
}
