<template>
  <div class="modal fade" :id="modalId" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ isEditing ? 'Modifier le projet' : 'Nouveau projet' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label class="form-label">Nom du projet *</label>
              <input 
                type="text" 
                class="form-control" 
                v-model="formData.name"
                required
                maxlength="50"
              >
              <div class="form-text">
                {{ formData.name.length }}/50 caractères
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea 
                class="form-control" 
                v-model="formData.description"
                rows="3"
                maxlength="200"
              ></textarea>
              <div class="form-text">
                {{ formData.description.length }}/200 caractères
              </div>
            </div>
            
            <div class="mb-4">
              <label class="form-label">Couleur du projet</label>
              <div class="color-picker d-flex gap-2">
                <button 
                  v-for="color in colorOptions" 
                  :key="color"
                  type="button"
                  class="color-option"
                  :class="{ 'active': formData.color === color }"
                  :style="{ backgroundColor: color }"
                  @click="formData.color = color"
                >
                  <i v-if="formData.color === color" class="bi bi-check"></i>
                </button>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            data-bs-dismiss="modal"
          >
            Annuler
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="handleSubmit"
            :disabled="loading || !formData.name.trim()"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ isEditing ? 'Modifier' : 'Créer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watch, onMounted } from 'vue'
import { Modal } from 'bootstrap'

const props = defineProps({
  project: {
    type: Object,
    default: null
  },
  modalId: {
    type: String,
    default: 'projectModal'
  }
})

const emit = defineEmits(['submit'])

const isEditing = ref(false)
const loading = ref(false)
const modal = ref(null)

const colorOptions = [
  '#667eea', '#764ba2', '#f093fb', '#4facfe', 
  '#00f2fe', '#43e97b', '#38f9d7', '#fa709a',
  '#ffecd2', '#fcb69f'
]

const formData = ref({
  name: '',
  description: '',
  color: colorOptions[0]
})

// Initialiser le modal Bootstrap
onMounted(() => {
  modal.value = new Modal(document.getElementById(props.modalId))
})

// Mettre à jour le formulaire quand le projet change
watch(() => props.project, (newProject) => {
  if (newProject) {
    isEditing.value = true
    formData.value = {
      name: newProject.name || '',
      description: newProject.description || '',
      color: newProject.color || colorOptions[0]
    }
  } else {
    isEditing.value = false
    formData.value = {
      name: '',
      description: '',
      color: colorOptions[0]
    }
  }
})

const handleSubmit = async () => {
  if (!formData.value.name.trim()) return
  
  loading.value = true
  try {
    await emit('submit', { ...formData.value })
    modal.value.hide()
  } finally {
    loading.value = false
  }
}

// Exposer des méthodes pour contrôler le modal
const show = () => modal.value.show()
const hide = () => modal.value.hide()

defineExpose({ show, hide })
</script>

<style scoped>
.color-picker {
  flex-wrap: wrap;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #333;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
}

.modal-content {
  border: none;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.modal-header .btn-close {
  filter: invert(1);
}
</style>