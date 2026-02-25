// composables/useProjectDetails.js
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export function useProjectDetails() {
  const { token } = useAuth()
  const projectName = ref('')
  const error = ref(null)

  const authHeaders = () =>
    token.value
      ? { Authorization: `Bearer ${token.value}` }
      : {}

  const fetchProject = async (projectId) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        headers: authHeaders(),
      })
      if (!res.ok) {
        throw new Error(`Failed to load project (${res.status})`)
      }
      const data = await res.json()
      projectName.value = data.name || data.project?.name || data.data?.name || 'Untitled Project'
      error.value = null
      return true
    } catch (err) {
      console.error('Error loading project:', err)
      error.value = err.message
      projectName.value = ''
      return false
    }
  }

  return { projectName, error, fetchProject }
}
