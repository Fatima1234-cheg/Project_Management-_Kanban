<template>
  <div class="min-vh-100 d-flex flex-column bg-light py-4">
    <main class="flex-grow-0 d-flex align-items-center py-0">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-6">
            <!-- Login Form -->
            <div v-if="isLoginPage" class="card shadow-sm border-0">
              <div class="card-body p-4 p-md-4">
                <div class="text-center mb-4">
                  <h2 class="fw-bold mb-2">Connexion</h2>
                  <p class="text-muted">Connectez-vous à votre compte</p>
                </div>

                <form @submit.prevent="handleLogin">
                  <div class="mb-3">
                    <label class="form-label">Email :</label>
                    <input 
                      type="email" 
                      v-model="loginData.email" 
                      class="form-control"
                      required
                      @input="validateEmail"
                    />
                    <div v-if="emailError" class="text-danger small mt-1">{{ emailError }}</div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Mot de passe :</label>
                    <div class="input-group">
                      <input 
                        :type="showPassword ? 'text' : 'password'" 
                        v-model="loginData.password" 
                        class="form-control"
                        required
                        @input="validatePassword"
                      />
                      
                    </div>
                    <div v-if="passwordError" class="text-danger small mt-1">{{ passwordError }}</div>
                  </div>
                  <button 
                    type="submit" 
                    class="btn btn-primary w-100 mb-3"
                    :disabled="loading || !isLoginFormValid"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Connexion...' : 'Se connecter' }}
                  </button>

                  <div class="text-center mb-4">
                    <p class="text-muted mb-0">
                      Pas de compte ? 
                      <a href="#" @click="switchToSignup" class="text-decoration-none fw-medium">
                        S'inscrire
                      </a>
                    </p>
                  </div>


                  <button 
                    type="button" 
                    class="btn btn-outline-secondary w-100"
                    @click="loginWithGoogle"
                    :disabled="loading"
                  >
                    <i class="bi bi-google me-2"></i>
                    Google
                  </button>
                </form>
              </div>
            </div>

            <!-- Signup Form -->
            <div v-else class="card shadow-sm border-0">
              <div class="card-body p-2 p-md-5">
                <div class="text-center mb-2">
                  <h2 class="fw-bold mb-3">Inscription</h2>
                  <p class="text-muted">Créez votre compte gratuitement</p>
                </div>

                <form @submit.prevent="handleSignup">
                  <div class="mb-3">
                    <label class="form-label">Nom complet :</label>
                    <input 
                      type="text" 
                      v-model="signupData.name" 
                      class="form-control"
                      
                      required
                    />
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Email :</label>
                    <input 
                      type="email" 
                      v-model="signupData.email" 
                      class="form-control"
                     
                      required
                      @input="validateEmail"
                    />
                    <div v-if="emailError" class="text-danger small mt-1">{{ emailError }}</div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Mot de passe :</label>
                    <div class="input-group">
                      <input 
                        :type="showPassword ? 'text' : 'password'" 
                        v-model="signupData.password" 
                        class="form-control"
                        
                        required
                        minlength="6"
                        @input="validatePassword"
                      />
                     
                    </div>
                    <div v-if="passwordError" class="text-danger small mt-1">{{ passwordError }}</div>
                  </div>

                  <button 
                    type="submit" 
                    class="btn btn-primary w-100 mb-3"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Inscription...' : 'S\'inscrire' }}
                  </button>

                  <div class="text-center mb-4">
                    <p class="text-muted mb-0">
                      Déjà un compte ? 
                      <a href="#" @click="switchToLogin" class="text-decoration-none fw-medium">
                        Se connecter
                      </a>
                    </p>
                  </div>


                  <button 
                    type="button" 
                    class="btn btn-outline-secondary w-100"
                    @click="signupWithGoogle"
                    :disabled="loading"
                  >
                    <i class="bi bi-google me-2"></i>
                    Google
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Toast Bootstrap -->
    <div v-if="toast.show" 
         class="position-fixed bottom-0 end-0 m-3"
         style="z-index: 1050;"
    >
      <div :class="`alert alert-${toast.type} alert-dismissible fade show shadow`" role="alert">
        <i :class="`bi ${toast.icon} me-2`"></i>
        {{ toast.message }}
        <button type="button" class="btn-close" @click="toast.show = false"></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// État pour switcher entre login et signup
const isLoginPage = ref(true)

// Synchroniser avec la query string
watch(() => route.query.mode, (newMode) => {
  isLoginPage.value = newMode !== 'signup'
}, { immediate: true })

// Données login
const loginData = reactive({
  email: '',
  password: ''
})

const rememberMe = ref(false)
const showPassword = ref(false)

// Validation
const emailError = ref('')
const passwordError = ref('')

// Données signup
const signupData = reactive({ 
  name: '', 
  email: '', 
  password: '' 
})
const loading = ref(false)
const toast = ref({ 
  show: false, 
  type: 'success', 
  message: '', 
  icon: 'bi-check-circle' 
})

// Fonction de retour
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

// Validation de l'email
const validateEmail = () => {
  let email
  if (isLoginPage.value) {
    email = loginData.email.trim()
  } else {
    email = signupData.email.trim()
  }
  
  if (!email) {
    emailError.value = 'Email requis'
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    emailError.value = 'Format d\'email invalide'
    return false
  }
  
  emailError.value = ''
  return true
}

// Validation du mot de passe
const validatePassword = () => {
  let password
  if (isLoginPage.value) {
    password = loginData.password
  } else {
    password = signupData.password
  }
  
  if (!password) {
    passwordError.value = 'Mot de passe requis'
    return false
  }
  
  if (password.length < 6) {
    passwordError.value = 'Minimum 6 caractères'
    return false
  }
  
  passwordError.value = ''
  return true
}

// Vérification du formulaire login
const isLoginFormValid = computed(() => {
  return loginData.email && 
         loginData.password && 
         !emailError.value && 
         !passwordError.value
})

// Fonction de login
const handleLogin = async () => {
  if (!validateEmail() || !validatePassword()) {
    showToast('danger', 'Veuillez vérifier vos informations', 'bi-x-circle')
    return
  }

  loading.value = true
  try {
    const result = await authStore.login(loginData.email, loginData.password)
    
    if (result.success) {
      showToast('success', 'Connexion réussie ! Redirection...', 'bi-check-circle')
      setTimeout(() => router.push('/dashboard'), 1500)
    } else {
      showToast('danger', 'Email ou mot de passe incorrect', 'bi-x-circle')
    }
  } catch {
    showToast('danger', 'Une erreur est survenue', 'bi-x-circle')
  } finally {
    loading.value = false
  }
}

// Fonction de signup
const handleSignup = async () => {
  if (!validateEmail() || !validatePassword() || !signupData.name) {
    showToast('danger', 'Veuillez vérifier vos informations', 'bi-x-circle')
    return
  }

  loading.value = true
  try {
    const result = await authStore.register(signupData.email, signupData.password, signupData.name)
    if (result.success) {
      showToast('success', 'Compte créé avec succès ! Redirection...', 'bi-check-circle')
      setTimeout(() => router.push('/dashboard'), 1500)
    } else {
      showToast('danger', result.error || 'Échec de l\'inscription', 'bi-x-circle')
    }
  } catch {
    showToast('danger', 'Une erreur est survenue', 'bi-x-circle')
  } finally {
    loading.value = false
  }
}

const signupWithGoogle = async () => {
  loading.value = true
  try {
    const result = await authStore.loginWithGoogle()
    if (result.success) {
      showToast('success', 'Inscription avec Google réussie !', 'bi-check-circle')
      setTimeout(() => router.push('/dashboard'), 1500)
    } else {
      showToast('danger', 'Échec de l\'inscription Google', 'bi-x-circle')
    }
  } catch {
    showToast('danger', 'Une erreur est survenue', 'bi-x-circle')
  } finally {
    loading.value = false
  }
}

const loginWithGoogle = async () => {
  loading.value = true
  try {
    const result = await authStore.loginWithGoogle()
    if (result.success) {
      showToast('success', 'Connexion Google réussie !', 'bi-check-circle')
      setTimeout(() => router.push('/dashboard'), 1500)
    } else {
      showToast('danger', 'Échec de la connexion Google', 'bi-x-circle')
    }
  } catch {
    showToast('danger', 'Une erreur est survenue', 'bi-x-circle')
  } finally {
    loading.value = false
  }
}

// Fonctions pour switcher entre pages
const switchToSignup = () => {
  isLoginPage.value = false
  router.push({ query: { mode: 'signup' } })
  loginData.email = ''
  loginData.password = ''
  emailError.value = ''
  passwordError.value = ''
}

const switchToLogin = () => {
  isLoginPage.value = true
  router.push({ query: { mode: 'login' } })
  signupData.name = ''
  signupData.email = ''
  signupData.password = ''
  emailError.value = ''
  passwordError.value = ''
}

// Toast avec Bootstrap Alert
const showToast = (type, message, icon) => {
  toast.value = { show: true, type, message, icon }
  setTimeout(() => toast.value.show = false, 3000)
}
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}

.card {
  border-radius: 12px;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

.btn-outline-primary {
  color: #0d6efd;
  border-color: #0d6efd;
}

.btn-outline-primary:hover {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.divider {
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #dee2e6;
}

.alert {
  min-width: 400px;
  max-width: 300px;
}
</style>