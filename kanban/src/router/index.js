import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
// Tu peux ajouter d'autres vues plus tard (AuthView, Dashboard, etc.)

const routes = [
  {
    path: '/',           // page par défaut
    name: 'Home',
    component: HomeView
  },
  // Exemple futur :
  // { path: '/auth', name: 'Auth', component: AuthView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
