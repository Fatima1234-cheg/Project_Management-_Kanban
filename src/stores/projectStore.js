import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from './authStore'

export const useProjectStore = defineStore('project', () => {
  // États
  const projects = ref([])
  const currentProject = ref(null)
  const tasks = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const todoTasks = computed(() => tasks.value.filter(task => task.status === 'todo'))
  const doingTasks = computed(() => tasks.value.filter(task => task.status === 'doing'))
  const doneTasks = computed(() => tasks.value.filter(task => task.status === 'done'))

  // Actions

  // Charger les projets
  const loadProjects = async () => {
    try {
      loading.value = true
      const authStore = useAuthStore()
      const userId = authStore.user?.uid
      
      if (!userId) throw new Error('Utilisateur non connecté')
      
      const q = query(
        collection(db, 'projects'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      projects.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Créer un projet
  const createProject = async (projectData) => {
    try {
      loading.value = true
      const authStore = useAuthStore()
      const userId = authStore.user?.uid
      
      if (!userId) throw new Error('Utilisateur non connecté')
      
      const projectWithMeta = {
        ...projectData,
        userId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        taskCount: 0,
        completedTasks: 0
      }
      
      const docRef = await addDoc(collection(db, 'projects'), projectWithMeta)
      
      const newProject = {
        id: docRef.id,
        ...projectWithMeta
      }
      
      projects.value.unshift(newProject)
      
      return { success: true, project: newProject }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Charger les tâches d'un projet
  const loadTasks = async (projectId) => {
    try {
      loading.value = true
      currentProject.value = projects.value.find(p => p.id === projectId)
      
      const q = query(
        collection(db, 'projects', projectId, 'tasks'),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      tasks.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Ajouter une tâche
  const addTask = async (projectId, taskData) => {
    try {
      loading.value = true
      
      const taskWithMeta = {
        ...taskData,
        projectId: projectId,
        status: 'todo',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        completed: false
      }
      
      const docRef = await addDoc(
        collection(db, 'projects', projectId, 'tasks'), 
        taskWithMeta
      )
      
      const newTask = {
        id: docRef.id,
        ...taskWithMeta
      }
      
      tasks.value.unshift(newTask)
      
      return { success: true, task: newTask }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Changer le statut d'une tâche
  const updateTaskStatus = async (projectId, taskId, newStatus) => {
    try {
      loading.value = true
      
      const taskRef = doc(db, 'projects', projectId, 'tasks', taskId)
      await updateDoc(taskRef, {
        status: newStatus,
        completed: newStatus === 'done',
        updatedAt: serverTimestamp()
      })
      
      // Mettre à jour localement
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = {
          ...tasks.value[index],
          status: newStatus,
          completed: newStatus === 'done'
        }
      }
      
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Supprimer une tâche
  const deleteTask = async (projectId, taskId) => {
    try {
      loading.value = true
      
      await deleteDoc(doc(db, 'projects', projectId, 'tasks', taskId))
      tasks.value = tasks.value.filter(t => t.id !== taskId)
      
      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    // États
    projects,
    currentProject,
    tasks,
    loading,
    error,
    
    // Getters
    todoTasks,
    doingTasks,
    doneTasks,
    
    // Actions
    loadProjects,
    createProject,
    loadTasks,
    addTask,
    updateTaskStatus,
    deleteTask
  }
})