import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Import Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

/* ⭐ AJOUTEZ CES LIGNES POUR TESTER ⭐
import { auth, db } from './firebase/config'
console.log('=== TEST FIREBASE ===')
console.log('✅ Firebase config chargée')
console.log('Projet:', auth.app.options.projectId)
console.log('Services:', {
  auth: auth ? 'OK' : 'ERREUR',
  firestore: db ? 'OK' : 'ERREUR'
})*/

app.mount('#app')
import 'bootstrap-icons/font/bootstrap-icons.css'

// Initialiser l'authentification
import { useAuthStore } from './stores/authStore'
router.isReady().then(() => {
  const authStore = useAuthStore()
  authStore.initAuth()
  console.log('✅ AuthStore initialisé')
})