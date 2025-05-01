import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  limit,
} from 'firebase/firestore'
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth'

export class AuthHelper {
  constructor() {
    this.db = getFirestore()
    this.auth = getAuth()
  }

  // Check if an email exists in the database
  async checkEmailExists(email) {
    if (!email) {
      return { exists: false, authType: null }
    }

    try {
      const normalizedEmail = email.toLowerCase()
      const usersRef = collection(this.db, 'users')
      const q = query(usersRef, where('email', '==', normalizedEmail), limit(1))
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

  // Check if a username exists in the database
  async checkUsernameExists(username) {
    if (!username) {
      return false
    }

    try {
      const usersRef = collection(this.db, 'users')

      const normalizedUsername = username.toLowerCase()
      const q = query(usersRef, where('normalizedUsername', '==', normalizedUsername), limit(1))
      const querySnapshot = await getDocs(q)

      return !querySnapshot.empty
    } catch (error) {
      console.error('Error checking username:', error)
      throw new Error(`Помилка перевірки логіна: ${error.message}`)
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

  // Create a new user record in the database
  async createUserRecord(user, username, authType) {
    try {
      const email = this.getUserEmail(user)

      if (!email) {
        throw new Error("Email є обов'язковим для створення профілю")
      }

      const finalUsername = username || email.split('@')[0]

      let avatarUrl = ''
      if (user.photoURL) {
        avatarUrl = user.photoURL.split('=')[0]
      }

      const userDoc = {
        userId: user.uid,
        email: email.toLowerCase(),
        username: finalUsername,
        normalizedUsername: finalUsername.toLowerCase(),
        role: 'user',
        authType: authType,
        createdAt: new Date(),
        profile: {
          avatarUrl: avatarUrl,
          bio: '',
        },
      }

      const userRef = doc(this.db, 'users', user.uid)
      await setDoc(userRef, userDoc)

      return userDoc
    } catch (error) {
      console.error('Error in createUserRecord:', error)
      throw new Error(`Не вдалося створити профіль користувача: ${error.message}`)
    }
  }

  // Register a new user with email and password
  async registerWithEmail(email, password, username) {
    try {
      const { exists: emailExists, authType } = await this.checkEmailExists(email)

      if (emailExists) {
        if (authType === 'email') {
          throw new Error('Користувач з такою електронною поштою вже існує')
        }
        throw new Error('Ця електронна пошта вже використовується через інший метод автентифікації')
      }

      if (username) {
        const usernameExists = await this.checkUsernameExists(username)
        if (usernameExists) {
          throw new Error('Цей логін вже використовується іншим користувачем')
        }
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

      if (error.code?.startsWith('auth/')) {
        throw new Error(`Помилка реєстрації: ${error.message}`)
      }

      if (error.message) {
        throw error
      }

      throw new Error('Помилка при реєстрації. Спробуйте ще раз.')
    }
  }

  // Sign in with email and password
  async signInWithEmail(email, password, rememberMe = false) {
    try {
      const { exists, authType } = await this.checkEmailExists(email)

      if (exists && authType !== 'email') {
        throw new Error('Цей email зареєстрований через інший метод автентифікації')
      }

      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence
      await setPersistence(this.auth, persistence)

      const userCredential = await signInWithEmailAndPassword(this.auth, email, password)
      return userCredential.user
    } catch (error) {
      console.error('Login error:', error)

      if (error.code === 'auth/invalid-email') {
        throw new Error('Невірний формат електронної пошти')
      }
      if (error.code === 'auth/user-not-found') {
        throw new Error('Користувача з такою електронною поштою не знайдено')
      }
      if (error.code === 'auth/wrong-password') {
        throw new Error('Невірний пароль')
      }
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Забагато спроб входу. Спробуйте пізніше')
      }
      if (error.code === 'auth/invalid-credential') {
        throw new Error('Невірні облікові дані. Перевірте email та пароль')
      }

      if (error.code?.startsWith('auth/')) {
        throw new Error(`Помилка входу: ${error.message}`)
      }

      if (error.message) {
        throw error
      }

      throw new Error('Помилка при вході. Спробуйте ще раз.')
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    let temporaryUser = null

    try {
      const provider = new GoogleAuthProvider()
      provider.addScope('email')

      const result = await signInWithPopup(this.auth, provider)
      temporaryUser = result.user

      const email = this.getUserEmail(result.user)

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

  // Send password reset email
  async sendPasswordReset(email) {
    try {
      const { exists, authType } = await this.checkEmailExists(email)

      if (!exists) {
        throw new Error('Користувача з такою електронною поштою не знайдено')
      }

      if (authType !== 'email') {
        throw new Error('Цей email зареєстрований через Google. Використовуйте Google для входу.')
      }

      await sendPasswordResetEmail(this.auth, email)

      return true
    } catch (error) {
      console.error('Password reset error:', error)

      if (error.code === 'auth/invalid-email') {
        throw new Error('Невірний формат електронної пошти')
      }
      if (error.code === 'auth/user-not-found') {
        throw new Error('Користувача з такою електронною поштою не знайдено')
      }

      if (error.code?.startsWith('auth/')) {
        throw new Error(`Помилка відновлення паролю: ${error.message}`)
      }

      if (error.message) {
        throw error
      }

      throw new Error('Помилка при відновленні паролю. Спробуйте ще раз.')
    }
  }
}
