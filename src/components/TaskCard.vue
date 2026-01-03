<template>
  <div 
    class="task-card" 
    :class="[`status-${task.status}`, { 'dragging': isDragging }]"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <div class="task-header">
      <h5 class="task-title">{{ task.title }}</h5>
      <div class="task-actions">
        <button 
          @click="editTask" 
          class="btn btn-sm btn-outline-secondary"
          title="Modifier"
        >
          <i class="bi bi-pencil"></i>
        </button>
        <button 
          @click="deleteTask" 
          class="btn btn-sm btn-outline-danger"
          title="Supprimer"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
    
    <p class="task-description">{{ task.description }}</p>
    
    <div class="task-footer">
      <span class="task-due-date">
        <i class="bi bi-calendar"></i>
        {{ formatDate(task.dueDate) }}
      </span>
      <span class="task-created">
        {{ formatRelativeTime(task.createdAt) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  projectId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])

const isDragging = ref(false)

const formatDate = (dateString) => {
  if (!dateString) return 'Aucune date'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatRelativeTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'À l\'instant'
  if (diffInHours < 24) return `Il y a ${diffInHours}h`
  if (diffInHours < 168) return `Il y a ${Math.floor(diffInHours / 24)}j`
  return formatDate(dateString)
}

const editTask = () => {
  emit('edit', props.task)
}

const deleteTask = () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
    emit('delete', props.task.id)
  }
}

const onDragStart = (event) => {
  isDragging.value = true
  event.dataTransfer.setData('taskId', props.task.id)
  event.dataTransfer.setData('projectId', props.projectId)
  event.dataTransfer.effectAllowed = 'move'
}

const onDragEnd = () => {
  isDragging.value = false
}
</script>

<style scoped>
.task-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  border-left: 4px solid #6c757d;
}

.task-card.status-todo {
  border-left-color: #6c757d;
}

.task-card.status-doing {
  border-left-color: #ffc107;
}

.task-card.status-done {
  border-left-color: #198754;
}

.task-card.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.task-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.task-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.task-actions {
  display: flex;
  gap: 0.25rem;
}

.task-description {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #888;
}

.task-due-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.task-created {
  font-style: italic;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}
</style>