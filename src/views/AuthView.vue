<template>
  <!-- Page de Login -->
  <div class="login-page" v-if="isLoginPage">
    <header class="login-header">
      <router-link to="/" class="back-btn">
        <i class="bi bi-arrow-left"></i>
      </router-link>
    </header>

    <main class="login-main">
      <div class="login-container">
        <h1 class="login-title">Log In</h1>

        <form @submit.prevent="handleLogin" class="login-form">
          <input 
            type="email" 
            v-model="loginData.email" 
            placeholder="Email" 
            required 
            @input="validateEmail"
          />
          <div v-if="emailError" class="error-message">{{ emailError }}</div>
          
          <input 
            :type="showPassword ? 'text' : 'password'" 
            v-model="loginData.password" 
            placeholder="Password" 
            required 
            @input="validatePassword"
          />
          <div v-if="passwordError" class="error-message">{{ passwordError }}</div>
          
          <div class="remember-forgot">
            <label class="remember">
              <input type="checkbox" v-model="rememberMe" />
              Remember me
            </label>
            <a href="#" class="forgot">Forgot password?</a>
          </div>

          <button type="submit" :disabled="loading || !isLoginFormValid">
            <span v-if="loading" class="spinner"></span>
            Log In
          </button>
        </form>

        <p class="signup-link">
          Don't have an account? <a @click="switchToSignup">Sign up</a>
        </p>

        <div class="divider"><span>or</span></div>

        <button class="google-btn" @click="loginWithGoogle" :disabled="loading">
          <i class="bi bi-google"></i>
          Log in with Google
        </button>
      </div>
    </main>

    <!-- Toast -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      <i :class="toast.icon"></i>
      <span>{{ toast.message }}</span>
      <button @click="toast.show = false" class="toast-close">
        <i class="bi bi-x"></i>
      </button>
    </div>
  </div>

  <!-- Page de Signup (votre code original) -->
  <div class="signup-page" v-else>
    <header class="signup-header">
      <router-link to="/login" class="back-btn">
        <i class="bi bi-arrow-left"></i>
      </router-link>
    </header>

    <main class="signup-main">
      <div class="signup-container">
        <h1 class="signup-title">Sign Up</h1>

        <form @submit.prevent="handleSignup" class="signup-form">
          <input type="text" v-model="signupData.name" placeholder="Name" required />
          <input type="email" v-model="signupData.email" placeholder="Email" required />
          <input type="password" v-model="signupData.password" placeholder="Password" required minlength="6" />

          <button type="submit" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            Sign Up
          </button>
        </form>

        <p class="login-link">
          Already have an account? <a @click="switchToLogin">Log in</a>
        </p>

        <div class="divider"><span>or</span></div>

        <button class="google-btn" @click="signupWithGoogle" :disabled="loading">
          <i class="bi bi-google"></i>
          Sign up with Google
        </button>
      </div>
    </main>

    <!-- Toast -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      <i :class="toast.icon"></i>
      <span>{{ toast.message }}</span>
      <button @click="toast.show = false" class="toast-close">
        <i class="bi bi-x"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// État pour switcher entre login et signup
const isLoginPage = ref(true)

// Données login
const loginData = reactive({
  email: '',
  password: ''
})

const rememberMe = ref(false)
const showPassword = ref(false)

// Validation login
const emailError = ref('')
const passwordError = ref('')

// Données signup (votre code original)
const signupData = ref({ name: '', email: '', password: '' })
const loading = ref(false)
const toast = ref({ show: false, type: 'success', message: '', icon: '' })

// Validation de l'email
const validateEmail = () => {
  const email = loginData.email.trim()
  
  if (!email) {
    emailError.value = 'Email is required'
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    emailError.value = 'Invalid email format'
    return false
  }
  
  emailError.value = ''
  return true
}

// Validation du mot de passe
const validatePassword = () => {
  const password = loginData.password
  
  if (!password) {
    passwordError.value = 'Password is required'
    return false
  }
  
  if (password.length < 6) {
    passwordError.value = 'Minimum 6 characters'
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
    showToast('error', 'Please check your information', 'bi-x-circle')
    return
  }

  loading.value = true
  try {
    const result = await authStore.login(loginData.email, loginData.password)
    
    if (result.success) {
      showToast('success', 'Login successful!', 'bi-check-circle')
      setTimeout(() => router.push('/dashboard'), 1500)
    } else {
      showToast('error', 'Invalid email or password', 'bi-x-circle')
    }
  } catch {
    showToast('error', 'An error occurred', 'bi-x-circle')
  } finally {
    loading.value = false
  }
}

// Fonctions signup (votre code original)
const handleSignup = async () => {
  loading.value = true
  try {
    const result = await authStore.register(signupData.value.email, signupData.value.password, signupData.value.name)
    if (result.success) {
      showToast('success', 'Account created successfully!', 'bi-check-circle')
      setTimeout(() => router.push('/dashboard'), 1500)
    } else {
      showToast('error', result.error || 'Signup failed', 'bi-x-circle')
    }
  } catch {
    showToast('error', 'An error occurred', 'bi-x-circle')
  } finally {
    loading.value = false
  }
}

const signupWithGoogle = async () => {
  loading.value = true
  try {
    const result = await authStore.loginWithGoogle()
    if (result.success) {
      showToast('success', 'Signed up with Google!', 'bi-check-circle')
      setTimeout(() => router.push('/dashboard'), 1500)
    } else {
      showToast('error', 'Google signup failed', 'bi-x-circle')
    }
  } catch {
    showToast('error', 'An error occurred', 'bi-x-circle')
  } finally {
    loading.value = false
  }
}

const loginWithGoogle = async () => {
  loading.value = true
  try {
    const result = await authStore.loginWithGoogle()
    if (result.success) {
      showToast('success', 'Logged in with Google!', 'bi-check-circle')
      setTimeout(() => router.push('/dashboard'), 1500)
    } else {
      showToast('error', 'Google login failed', 'bi-x-circle')
    }
  } catch {
    showToast('error', 'An error occurred', 'bi-x-circle')
  } finally {
    loading.value = false
  }
}

// Fonctions pour switcher entre pages
const switchToSignup = () => {
  isLoginPage.value = false
  // Reset les champs login
  loginData.email = ''
  loginData.password = ''
  emailError.value = ''
  passwordError.value = ''
}

const switchToLogin = () => {
  isLoginPage.value = true
  // Reset les champs signup
  signupData.value = { name: '', email: '', password: '' }
}

// Toast
const showToast = (type, message, icon) => {
  toast.value = { show: true, type, message, icon }
  setTimeout(() => toast.value.show = false, 3000)
}
</script>

<style scoped>
/* Styles communs */
.login-page, .signup-page {
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  background: #f9f9f9;
}

.login-header, .signup-header {
  padding: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px; height: 40px;
  border-radius: 50%;
  color: #333;
  font-size: 1.25rem;
  transition: background 0.2s;
  text-decoration: none;
}

.back-btn:hover {
  background: #e0e0e0;
}

.login-main, .signup-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-container, .signup-container {
  width: 100%;
  max-width: 400px;
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  text-align: center;
}

.login-title, .signup-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.login-form input, .signup-form input {
  width: 100%;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
}

.login-form input:focus, .signup-form input:focus {
  outline: none;
  border-color: #007bff;
}

.error-message {
  color: #dc3545;
  font-size: 0.85rem;
  text-align: left;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.remember {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.remember input {
  margin: 0;
  width: auto;
}

.forgot {
  color: #007bff;
  text-decoration: none;
}

.forgot:hover {
  text-decoration: underline;
}

.login-form button, .signup-form button {
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
}

.login-form button:hover:not(:disabled), .signup-form button:hover:not(:disabled) {
  background: #0056b3;
}

.login-form button:disabled, .signup-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 1rem; height: 1rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 0.5rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

.signup-link, .login-link {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.signup-link a, .login-link a {
  color: #007bff;
  text-decoration: none;
  cursor: pointer;
}

.signup-link a:hover, .login-link a:hover {
  text-decoration: underline;
}

.divider {
  position: relative;
  margin: 1.5rem 0;
  text-align: center;
}
.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0; right: 0;
  height: 1px;
  background: #eee;
}
.divider span {
  position: relative;
  background: #fff;
  padding: 0 1rem;
  color: #666;
  font-size: 0.875rem;
}

.google-btn {
  width: 100%;
  padding: 0.85rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.google-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #ccc;
}

.google-btn i { color: #db4437; font-size: 1.2rem; }

/* Toast */
.toast {
  position: fixed;
  bottom: 1.5rem; right: 1.5rem;
  background: #fff;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex; align-items: center; gap: 0.75rem;
  animation: slideIn 0.3s ease;
  z-index: 1000;
}
.toast.success { border-left: 4px solid #28a745; }
.toast.error { border-left: 4px solid #dc3545; }
.toast i { font-size: 1.25rem; }
.toast span { flex: 1; font-size: 0.95rem; }
.toast-close { background: none; border: none; color: #999; cursor: pointer; }

/* Responsive */
@media (max-width: 480px) {
  .login-container, .signup-container { 
    padding: 1.5rem; 
    margin: 0 10PX;
  }
  .login-title, .signup-title { font-size: 1.75rem; }
  .toast { 
    left: 1rem; 
    right: 1rem; 
    max-width: none; 
  }
}
</style>