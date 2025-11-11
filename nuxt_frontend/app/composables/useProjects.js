// composables/useProjects.js
import { ref, onMounted } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export function useProjects() {
  const projects = ref([])
  const pending = ref(false)
  const error = ref(null)

  const fetchProjects = async () => {
    pending.value = true
    error.value = null
    try {
      const res = await fetch(`${API_BASE}/projects`)
      if (!res.ok) throw new Error('Failed to fetch projects')
      projects.value = await res.json()
    } catch (err) {
      error.value = err.message
    } finally {
      pending.value = false
    }
  }

  onMounted(fetchProjects)

  return { projects, pending, error }
}
