// composables/useProjectDetails.js
import { ref } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export function useProjectDetails() {
  const projectName = ref('')
  const error = ref(null)

  const fetchProject = async (projectId) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}`)
      const data = await res.json()
      projectName.value = data.name || data.project?.name || data.data?.name || 'Untitled Project'
    } catch (err) {
      console.error('Error loading project:', err)
      error.value = err.message
    }
  }

  return { projectName, error, fetchProject }
}
