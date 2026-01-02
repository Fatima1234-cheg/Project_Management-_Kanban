import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/firebase/config'
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
  onSnapshot
} from 'firebase/firestore'
import { useAuthStore } from './authStore'

export const useProjectStore = defineStore('project', () => {
  const authStore = useAuthStore()
  const projects = ref([])
  const tasks = ref([])
  const loading = ref(false)

  // Charger les projets de l'utilisateur connecté
  const fetchProjects = async () => {
    if (!authStore.user) {
      console.log('No user found for fetching projects')
      return null
    }
    
    loading.value = true
    try {
      console.log('Fetching projects for user:', authStore.user.uid)
      
      const projectsRef = collection(db, 'projects')
      
      // Version 1: Sans orderBy (évite l'index composite)
      const q = query(
        projectsRef, 
        where('userId', '==', authStore.user.uid)
        // Note: On retire orderBy temporairement
        // orderBy('createdAt', 'desc')
      )
      
      // Version alternative si on veut garder le tri:
      // const q = query(
      //   projectsRef, 
      //   where('userId', '==', authStore.user.uid),
      //   orderBy('createdAt') // Ascending seulement
      // )
      
      // Écouter les changements en temps réel
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const projectsList = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          projectsList.push({
            id: doc.id,
            ...data
          })
        })
        
        // Trier manuellement côté client (plus récent en premier)
        projectsList.sort((a, b) => {
          const dateA = a.createdAt ? 
            (a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()) : 0
          const dateB = b.createdAt ? 
            (b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()) : 0
          return dateB - dateA // Décroissant
        })
        
        projects.value = projectsList
        console.log(`${projectsList.length} projects loaded:`, projectsList)
        loading.value = false
      }, (error) => {
        // Gestion d'erreur
        console.error('Error in projects snapshot:', error)
        
        // Fallback: utiliser getDocs (pas en temps réel)
        console.log('Trying fallback with getDocs...')
        getDocs(q).then((snapshot) => {
          const projectsList = []
          snapshot.forEach((doc) => {
            projectsList.push({
              id: doc.id,
              ...doc.data()
            })
          })
          
          // Trier
          projectsList.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
            return dateB - dateA
          })
          
          projects.value = projectsList
          loading.value = false
          console.log('Fallback successful:', projectsList)
        }).catch(fallbackError => {
          console.error('Fallback also failed:', fallbackError)
          loading.value = false
        })
      })

      return unsubscribe
    } catch (error) {
      console.error('Error in fetchProjects:', error)
      loading.value = false
      return null
    }
  }

  // Créer un projet
  const createProject = async (projectData) => {
    if (!authStore.user) {
      console.error('User not authenticated')
      return { success: false, error: 'Utilisateur non connecté' }
    }

    try {
      const project = {
        name: projectData.name,
        description: projectData.description || '',
        color: projectData.color || '#667eea',
        userId: authStore.user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      console.log('Creating project:', project)
      const docRef = await addDoc(collection(db, 'projects'), project)
      console.log('✅ Project created with ID:', docRef.id)
      
      // Ajouter automatiquement au state local
      projects.value = [{
        id: docRef.id,
        ...project
      }, ...projects.value]
      
      return { 
        success: true, 
        id: docRef.id 
      }
    } catch (error) {
      console.error('❌ Error creating project:', error)
      return { 
        success: false, 
        error: error.message 
      }
    }
  }

  // Mettre à jour un projet
  const updateProject = async (projectId, projectData) => {
    try {
      const updateData = {
        name: projectData.name,
        description: projectData.description || '',
        color: projectData.color || '#667eea',
        updatedAt: new Date()
      }
      
      await updateDoc(doc(db, 'projects', projectId), updateData)
      console.log('✅ Project updated:', projectId)
      
      // Mettre à jour le state local
      const index = projects.value.findIndex(p => p.id === projectId)
      if (index !== -1) {
        projects.value[index] = {
          ...projects.value[index],
          ...updateData
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('❌ Error updating project:', error)
      return { success: false, error: error.message }
    }
  }

  // Supprimer un projet
  const deleteProject = async (projectId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return { success: false, error: 'Annulé par l\'utilisateur' }
    }
    
    try {
      // D'abord supprimer toutes les tâches (optionnel)
      try {
        const tasksRef = collection(db, 'projects', projectId, 'tasks')
        const tasksSnapshot = await getDocs(tasksRef)
        const deletePromises = tasksSnapshot.docs.map(taskDoc => 
          deleteDoc(doc(db, 'projects', projectId, 'tasks', taskDoc.id))
        )
        await Promise.all(deletePromises)
        console.log('All tasks deleted for project:', projectId)
      } catch (tasksError) {
        console.warn('Could not delete tasks:', tasksError)
        // Continuer même si la suppression des tâches échoue
      }
      
      // Puis supprimer le projet
      await deleteDoc(doc(db, 'projects', projectId))
      console.log('✅ Project deleted:', projectId)
      
      // Mettre à jour le state local
      projects.value = projects.value.filter(p => p.id !== projectId)
      
      return { success: true }
    } catch (error) {
      console.error('❌ Error deleting project:', error)
      return { success: false, error: error.message }
    }
  }

  // Charger les tâches d'un projet
  const fetchTasks = async (projectId) => {
    if (!projectId) {
      console.error('No project ID provided')
      return null
    }
    
    loading.value = true
    try {
      console.log('Fetching tasks for project:', projectId)
      
      const tasksRef = collection(db, 'projects', projectId, 'tasks')
      
      // Version sans orderBy pour éviter les problèmes d'index
      const q = query(tasksRef)
      
      // Écouter les changements en temps réel
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasksList = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          tasksList.push({
            id: doc.id,
            ...data
          })
        })
        
        // Trier manuellement côté client
        tasksList.sort((a, b) => {
          const dateA = a.createdAt ? 
            (a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()) : 0
          const dateB = b.createdAt ? 
            (b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()) : 0
          return dateB - dateA // Décroissant
        })
        
        tasks.value = tasksList
        console.log(`${tasksList.length} tasks loaded for project ${projectId}`)
        loading.value = false
      }, (error) => {
        console.error('Error in tasks snapshot:', error)
        
        // Fallback
        getDocs(q).then((snapshot) => {
          const tasksList = []
          snapshot.forEach((doc) => {
            tasksList.push({
              id: doc.id,
              ...doc.data()
            })
          })
          
          tasksList.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
            return dateB - dateA
          })
          
          tasks.value = tasksList
          loading.value = false
        }).catch(fallbackError => {
          console.error('Tasks fallback failed:', fallbackError)
          loading.value = false
        })
      })

      return unsubscribe
    } catch (error) {
      console.error('Error in fetchTasks:', error)
      loading.value = false
      return null
    }
  }

  // Créer une tâche
  const createTask = async (projectId, taskData) => {
    if (!projectId) {
      return { success: false, error: 'ID de projet manquant' }
    }
    
    try {
      const task = {
        title: taskData.title,
        description: taskData.description || '',
        dueDate: taskData.dueDate || null,
        status: taskData.status || 'todo',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      console.log('Creating task in project:', projectId, task)
      const docRef = await addDoc(
        collection(db, 'projects', projectId, 'tasks'), 
        task
      )
      console.log('✅ Task created with ID:', docRef.id)
      
      return { 
        success: true, 
        id: docRef.id,
        task: { id: docRef.id, ...task }
      }
    } catch (error) {
      console.error('❌ Error creating task:', error)
      return { success: false, error: error.message }
    }
  }

  // Mettre à jour une tâche
  const updateTask = async (projectId, taskId, taskData) => {
    try {
      const updateData = {
        ...taskData,
        updatedAt: new Date()
      }
      
      await updateDoc(
        doc(db, 'projects', projectId, 'tasks', taskId), 
        updateData
      )
      console.log('✅ Task updated:', taskId)
      
      // Mettre à jour le state local
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value[index] = {
          ...tasks.value[index],
          ...updateData
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('❌ Error updating task:', error)
      return { success: false, error: error.message }
    }
  }

  // Supprimer une tâche
  const deleteTask = async (projectId, taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return { success: false, error: 'Annulé par l\'utilisateur' }
    }
    
    try {
      await deleteDoc(doc(db, 'projects', projectId, 'tasks', taskId))
      console.log('✅ Task deleted:', taskId)
      
      // Mettre à jour le state local
      tasks.value = tasks.value.filter(t => t.id !== taskId)
      
      return { success: true }
    } catch (error) {
      console.error('❌ Error deleting task:', error)
      return { success: false, error: error.message }
    }
  }

  // Getters pour les tâches par statut
  const todoTasks = () => tasks.value.filter(task => task.status === 'todo')
  const doingTasks = () => tasks.value.filter(task => task.status === 'doing')
  const doneTasks = () => tasks.value.filter(task => task.status === 'done')

  return {
    // State
    projects,
    tasks,
    loading,
    
    // Actions
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    
    // Getters
    todoTasks,
    doingTasks,
    doneTasks
  }
})