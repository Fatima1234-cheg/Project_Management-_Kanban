<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow">
    <div class="container-fluid">
      <!-- Logo / Brand -->
      <router-link class="navbar-brand d-flex align-items-center" to="/">
        <i class="bi bi-kanban-fill fs-4 me-2"></i>
        <span class="fw-bold">Kanban Manager</span>
      </router-link>

      <!-- Burger Menu Button -->
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Menu Items -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">
              <i class="bi bi-house me-1"></i>Accueil
            </router-link>
          </li>
          
          <li v-if="authStore.user" class="nav-item">
            <router-link class="nav-link" to="/dashboard">
              <i class="bi bi-speedometer2 me-1"></i>Dashboard
            </router-link>
          </li>
        </ul>

        <!-- User Section -->
        <div class="navbar-nav align-items-center">
          <template v-if="authStore.user">
            <!-- User Info -->
            <div class="nav-item dropdown">
              <a 
                class="nav-link dropdown-toggle d-flex align-items-center" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown"
              >
                <div class="me-2">
                  <div class="bg-light rounded-circle d-flex align-items-center justify-content-center" 
                       style="width: 32px; height: 32px;">
                    <i class="bi bi-person-fill text-primary"></i>
                  </div>
                </div>
                <div class="d-none d-md-block">
                  <div class="fw-bold">{{ authStore.userName }}</div>
                  <small class="text-light">{{ authStore.user.email }}</small>
                </div>
              </a>
              
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <router-link class="dropdown-item" to="/dashboard">
                    <i class="bi bi-speedometer2 me-2"></i>Dashboard
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <button class="dropdown-item text-danger" @click="handleLogout">
                    <i class="bi bi-box-arrow-right me-2"></i>Déconnexion
                  </button>
                </li>
              </ul>
            </div>
          </template>

          <template v-else>
            <!-- Auth Buttons -->
            <router-link class="btn btn-outline-light btn-sm me-2" to="/auth">
              <i class="bi bi-box-arrow-in-right me-1"></i>Connexion
            </router-link>
            <router-link class="btn btn-light btn-sm" to="/auth?tab=register">
              <i class="bi bi-person-plus me-1"></i>Inscription
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  const result = await authStore.logout()
  if (result.success) {
    router.push('/')
  }
}
</script>

<style scoped>
.navbar {
  padding: 0.75rem 0;
}

.navbar-brand {
  font-size: 1.25rem;
}

.nav-link {
  transition: all 0.2s;
}

.nav-link:hover {
  transform: translateY(-1px);
}

.dropdown-toggle::after {
  margin-left: 0.5rem;
}

.bg-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.btn-outline-light:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>