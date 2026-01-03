<template>
  <div class="dashboard-view">
   
    <div class="dashboard-header">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1>Mes projets</h1>
            <p class="text-muted">Gérez tous vos projets</p>
          </div>
          <button 
            class="btn btn-primary"
            @click="openCreateModal"
          >
            <i class="bi bi-plus-lg"></i> Nouveau projet
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2">Chargement des projets...</p>
    </div>

    <div v-else-if="projects.length === 0" class="text-center py-5">
      <i class="bi bi-kanban display-1 text-muted"></i>
      <h3 class="mt-3">Aucun projet</h3>
      <p class="text-muted mb-4">Commencez par créer votre premier projet</p>
      <button class="btn btn-primary" @click="openCreateModal">
        Créer un projet
      </button>
    </div>

    <div v-else class="container">
      <div class="row">
        <div 
          v-for="project in projects" 
          :key="project.id"
          class="col-md-6 col-lg-4 mb-4"
        >
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <h5 class="card-title">{{ project.name }}</h5>
                <div class="dropdown">
                  <button class="btn btn-sm" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <button class="dropdown-item" @click="editProject(project)">
                        Modifier
                      </button>
                    </li>
                    <li>
                      <button class="dropdown-item text-danger" @click="deleteProject(project.id)">
                        Supprimer
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              <p class="card-text text-muted">
                {{ project.description || 'Aucune description' }}
              </p>
              <div class="mt-3">
                <router-link 
                  :to="`/project/${project.id}`"
                  class="btn btn-outline-primary w-100"
                >
                  Voir les tâches
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div 
      v-if="showModal"
      class="modal-backdrop show"
    ></div>
    
    <div 
      v-if="showModal"
      class="modal show d-block"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingProject ? 'Modifier' : 'Nouveau' }} projet
            </h5>
            <button 
              type="button" 
              class="btn-close"
              @click="closeModal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">Nom *</label>
                <input 
                  type="text" 
                  class="form-control"
                  v-model="formData.name"
                  required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea 
                  class="form-control"
                  v-model="formData.description"
                  rows="3"
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Couleur</label>
                <input 
                  type="color" 
                  class="form-control form-control-color"
                  v-model="formData.color"
                >
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary"
              @click="closeModal"
            >
              Annuler
            </button>
            <button 
              type="button" 
              class="btn btn-primary"
              @click="handleSubmit"
              :disabled="modalLoading"
            >
              <span 
                v-if="modalLoading"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              {{ editingProject ? 'Modifier' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div 
      v-if="showToast"
      class="toast-container position-fixed top-0 end-0 p-3"
    >
      <div class="toast show" :class="toastClass">
        <div class="toast-header">
          <i class="bi me-2" :class="toastIcon"></i>
          <strong class="me-auto">{{ toastTitle }}</strong>
          <button 
            type="button" 
            class="btn-close"
            @click="showToast = false"
          ></button>
        </div>
        <div class="toast-body">{{ toastMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { useAuthStore } from '@/stores/authStore'

const projectStore = useProjectStore()
const authStore = useAuthStore()

const showModal = ref(false)
const editingProject = ref(null)
const modalLoading = ref(false)
const unsubscribe = ref(null)

const showToast = ref(false)
const toastTitle = ref('')
const toastMessage = ref('')
const toastClass = ref('bg-success')
const toastIcon = ref('bi-check-circle')

const formData = ref({
  name: '',
  description: '',
  color: '#667eea'
})

const loading = computed(() => projectStore.loading)
const projects = computed(() => projectStore.projects)

onMounted(async () => {
  console.log('Dashboard mounted - User:', authStore.user?.uid)
  
  if (authStore.user) {
    try {
      unsubscribe.value = await projectStore.fetchProjects()
    } catch (error) {
      showError('Erreur', 'Impossible de charger les projets')
    }
  }
})

onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value()
  }
})

const openCreateModal = () => {
  editingProject.value = null
  formData.value = {
    name: '',
    description: '',
    color: '#667eea'
  }
  showModal.value = true
}

const editProject = (project) => {
  editingProject.value = project
  formData.value = {
    name: project.name,
    description: project.description || '',
    color: project.color || '#667eea'
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingProject.value = null
}

const handleSubmit = async () => {
  if (!formData.value.name.trim()) return

  modalLoading.value = true
  try {
    if (editingProject.value) {
   
      const result = await projectStore.updateProject(
        editingProject.value.id,
        formData.value
      )
      
      if (result.success) {
        showSuccess('Succès', 'Projet modifié')
        closeModal()
      } else {
        showError('Erreur', result.error)
      }
    } else {
     
      const result = await projectStore.createProject(formData.value)
      
      if (result.success) {
        showSuccess('Succès', 'Projet créé')
        closeModal()
      } else {
        showError('Erreur', result.error)
      }
    }
  } catch (error) {
    showError('Erreur', error.message)
  } finally {
    modalLoading.value = false
  }
}

const deleteProject = async (projectId) => {
  if (!confirm('Supprimer ce projet ?')) return
  
  const result = await projectStore.deleteProject(projectId)
  if (result.success) {
    showSuccess('Succès', 'Projet supprimé')
  } else {
    showError('Erreur', result.error)
  }
}

const showSuccess = (title, message) => {
  toastTitle.value = title
  toastMessage.value = message
  toastClass.value = 'bg-success text-white'
  toastIcon.value = 'bi-check-circle'
  showToast.value = true
  setTimeout(() => showToast.value = false, 3000)
}

const showError = (title, message) => {
  toastTitle.value = title
  toastMessage.value = message
  toastClass.value = 'bg-danger text-white'
  toastIcon.value = 'bi-x-circle'
  showToast.value = true
  setTimeout(() => showToast.value = false, 3000)
}
</script>
<style scoped>


.dashboard-view {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: calc(100vh - 56px);
}


.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2.5rem 0;
  margin-bottom: 2.5rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.dashboard-header .text-muted {
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 1.1rem;
  font-weight: 400;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.75rem;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.btn-primary:active {
  transform: translateY(-1px);
}

.btn-primary i {
  font-size: 1.2rem;
  margin-right: 0.5rem;
}

.text-center.py-5 {
  padding: 4rem 0 !important;
}

.spinner-border.text-primary {
  border-width: 0.3em;
  width: 3.5rem;
  height: 3.5rem;
  animation-duration: 0.8s;
}

.text-center.py-5 p {
  color: #6c757d;
  margin-top: 1.5rem;
  font-size: 1.1rem;
  font-weight: 500;
}

.text-center.py-5 .bi-kanban {
  color: #adb5bd;
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.text-center.py-5 h3 {
  color: #495057;
  font-weight: 700;
  font-size: 1.8rem;
  margin-bottom: 0.75rem;
}

.text-center.py-5 .text-muted {
  color: #6c757d !important;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.text-center.py-5 .btn-primary {
  padding: 0.875rem 2.25rem;
  font-size: 1.1rem;
  border-radius: 12px;
}

.container > .row {
  margin: 0 -15px;
}

.col-md-6.col-lg-4.mb-4 {
  padding: 0 15px;
  animation: cardAppear 0.5s ease forwards;
  opacity: 0;
}

@keyframes cardAppear {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  height: 100%;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  border-color: rgba(102, 126, 234, 0.2);
}

.card-body {
  padding: 1.75rem;
}

.card-title {
  color: #212529;
  font-weight: 700;
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.card-text.text-muted {
  color: #6c757d !important;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  min-height: 48px;
}

.btn-sm {
  background: transparent;
  border: 1px solid #dee2e6;
  color: #6c757d;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
}

.btn-sm:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
  color: #495057;
  transform: rotate(90deg);
}

.dropdown-menu {
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  margin-top: 0.5rem;
  min-width: 140px;
}

.dropdown-item {
  border-radius: 8px;
  padding: 0.625rem 1rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  color: #667eea;
  padding-left: 1.25rem;
}

.dropdown-item.text-danger:hover {
  background: linear-gradient(135deg, #dc354515 0%, #c8233315 100%);
  color: #dc3545 !important;
}

.btn-outline-primary {
  border: 2px solid #667eea;
  color: #667eea;
  background: transparent;
  font-weight: 600;
  padding: 0.625rem 1.5rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.btn-outline-primary:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  border-color: transparent;
}

.modal-backdrop.show {
  opacity: 0.5 !important;
  backdrop-filter: blur(3px);
}

.modal.show.d-block {
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-dialog {
  max-width: 500px;
}

.modal-content {
  border: none;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-bottom: none;
}

.modal-title {
  font-weight: 700;
  font-size: 1.4rem;
}

.modal-body {
  padding: 1.75rem;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.btn-secondary {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  border: none;
  color: white;
  font-weight: 600;
  padding: 0.625rem 1.5rem;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #5a6268 0%, #343a40 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-control {
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
  background: white;
}

.form-control-color {
  height: 45px;
  width: 45px;
  padding: 2px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid #dee2e6;
}

.form-control-color:hover {
  border-color: #667eea;
}

.toast-container {
  z-index: 1060;
  animation: toastSlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.toast {
  border: none;
  border-radius: 14px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  min-width: 320px;
  backdrop-filter: blur(10px);
}

.toast.bg-success {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%) !important;
  border-left: 4px solid #155724;
}

.toast.bg-danger {
  background: linear-gradient(135deg, #dc3545 0%, #bd2130 100%) !important;
  border-left: 4px solid #721c24;
}

.toast-header {
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.875rem 1rem;
  font-weight: 600;
}

.toast-header .bi {
  font-size: 1.1rem;
}

.toast-header .btn-close {
  filter: invert(1) brightness(2);
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.toast-header .btn-close:hover {
  opacity: 1;
}

.toast-body {
  background: rgba(255, 255, 255, 0.95);
  color: #212529;
  padding: 1rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.2em;
  animation-duration: 0.7s;
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 2rem 0;
  }
  
  .dashboard-header h1 {
    font-size: 2rem;
  }
  
  .dashboard-header .text-muted {
    font-size: 1rem;
  }
  
  .btn-primary {
    padding: 0.625rem 1.5rem;
    font-size: 0.95rem;
  }
  
  .card-body {
    padding: 1.5rem;
  }
  
  .modal-dialog {
    margin: 1rem;
  }
  
  .toast {
    min-width: 280px;
  }
}

.col-md-6.col-lg-4.mb-4:nth-child(1) { animation-delay: 0.1s; }
.col-md-6.col-lg-4.mb-4:nth-child(2) { animation-delay: 0.2s; }
.col-md-6.col-lg-4.mb-4:nth-child(3) { animation-delay: 0.3s; }
.col-md-6.col-lg-4.mb-4:nth-child(4) { animation-delay: 0.4s; }
.col-md-6.col-lg-4.mb-4:nth-child(5) { animation-delay: 0.5s; }
.col-md-6.col-lg-4.mb-4:nth-child(6) { animation-delay: 0.6s; }
</style>