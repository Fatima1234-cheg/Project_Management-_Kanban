import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AuthView from '../views/AuthView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProjectDetails from '../views/ProjectDetails.vue'
import { useAuthStore } from '../stores/authStore'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Accueil - Kanban Manager' }
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
    meta: { 
      title: 'Connexion / Inscription',
      guestOnly: true // Seulement pour non-connectés
    }
  },
  { 
    path: '/dashboard', 
    name: 'dashboard',
    component: DashboardView,
    meta: { 
      requiresAuth: true, // Nécessite une connexion
      title: 'Tableau de bord'
    }
  },
  { 
    path: '/project/:id', 
    name: 'project-details',
    component: ProjectDetails,
    meta: { 
      requiresAuth: true, // Nécessite une connexion
      title: 'Détails du projet'
    },
    props: true
  },
  // Route 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// Navigation Guard - Protection des routes
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Mettre à jour le titre de la page
  if (to.meta.title) {
    document.title = to.meta.title
  } else {
    document.title = 'Kanban Manager'
  }
  
  // Vérifier si l'auth est initialisé
  if (authStore.loading && to.path !== '/') {
    // Attendre un peu que l'auth soit initialisé
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  // Route protégée - besoin d'être connecté
  if (to.meta.requiresAuth && !authStore.user) {
    next({
      path: '/auth',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  // Route réservée aux invités - si déjà connecté, rediriger
  if (to.meta.guestOnly && authStore.user) {
    next('/dashboard')
    return
  }
  
  // Tout est bon, continuer
  next()
})

export default router