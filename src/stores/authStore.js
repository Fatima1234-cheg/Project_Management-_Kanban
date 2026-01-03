import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { auth, googleProvider } from '@/firebase/config'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

export const useAuthStore = defineStore('auth', () => {
  // États
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const userProfile = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userName = computed(() => 
    userProfile.value?.displayName || user.value?.displayName || user.value?.email?.split('@')[0]
  )

  // Actions
  
  // Initialiser l'authentification
  const initAuth = () => {
    loading.value = true
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        user.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          emailVerified: firebaseUser.emailVerified
        }
        await loadUserProfile(firebaseUser.uid)
      } else {
        user.value = null
        userProfile.value = null
      }
      loading.value = false
    }, (err) => {
      error.value = err.message
      loading.value = false
    })
  }

  // Charger le profil utilisateur
  const loadUserProfile = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        userProfile.value = { id: userSnap.id, ...userSnap.data() }
      } else {
        userProfile.value = {
          id: userId,
          displayName: user.value?.displayName || user.value?.email?.split('@')[0],
          email: user.value?.email,
          createdAt: new Date().toISOString(),
        }
        await setDoc(userRef, userProfile.value)
      }
    } catch (err) {
      console.error('Erreur chargement profil:', err)
    }
  }

  // Inscription
  const register = async (email, password, displayName = '') => {
    try {
      loading.value = true
      error.value = null
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      if (displayName) {
        await updateProfile(userCredential.user, { displayName })
      }
      
      const userRef = doc(db, 'users', userCredential.user.uid)
      await setDoc(userRef, {
        email: email,
        displayName: displayName || email.split('@')[0],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        // ✅ PAS DE MOT DE PASSE ICI !
      })
      
      return { success: true, message: 'Inscription réussie !' }
    } catch (err) {
      error.value = getErrorMessage(err.code)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Connexion email/password
  const login = async (email, password) => {
    try {
      loading.value = true
      error.value = null
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      const userRef = doc(db, 'users', userCredential.user.uid)
      await setDoc(userRef, {
        // ✅ CORRECT : Pas de mot de passe ici !
        lastLogin: new Date().toISOString()
      }, { merge: true })
      
      return { success: true, message: 'Connexion réussie !' }
    } catch (err) {
      error.value = getErrorMessage(err.code)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Connexion Google
  const loginWithGoogle = async () => {
    try {
      loading.value = true
      error.value = null
      
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          provider: 'google',
          // ✅ CORRECT : Pas de mot de passe pour Google
        })
      } else {
        await setDoc(userRef, {
          // ✅ CORRECT : Pas de mot de passe ici non plus !
          lastLogin: new Date().toISOString()
        }, { merge: true })
      }
      
      return { success: true, message: 'Connexion Google réussie !' }
    } catch (err) {
      error.value = getErrorMessage(err.code)
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Déconnexion
  const logout = async () => {
    try {
      loading.value = true
      await signOut(auth)
      user.value = null
      userProfile.value = null
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Messages d'erreur
  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/email-already-in-use': 'Cet email est déjà utilisé.',
      'auth/invalid-email': 'Email invalide.',
      'auth/operation-not-allowed': 'Opération non autorisée.',
      'auth/weak-password': 'Le mot de passe est trop faible (minimum 6 caractères).',
      'auth/user-disabled': 'Ce compte a été désactivé.',
      'auth/user-not-found': 'Aucun compte trouvé avec cet email.',
      'auth/wrong-password': 'Mot de passe incorrect.',
      'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
      'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion.'
    }
    
    return errorMessages[errorCode] || 'Une erreur est survenue. Veuillez réessayer.'
  }

  // Nettoyer les erreurs
  const clearError = () => {
    error.value = null
  }

  return {
    // États
    user,
    userProfile,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    userName,
    
    // Actions
    initAuth,
    register,
    login,
    loginWithGoogle,
    logout,
    clearError
  }
})