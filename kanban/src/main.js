// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'          // Import du routeur
import { createPinia } from 'pinia'    // Import de Pinia pour la gestion d'état

// Import Bootstrap 5 CSS + JS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Création de l'application Vue
const app = createApp(App)
import './firebase/config.js'

// Ajouter Pinia
app.use(createPinia())

// Ajouter Vue Router
app.use(router)

// Monter l'application
app.mount('#app')
