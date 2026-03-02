import { ref } from 'vue'
import { resolveApiBase } from '~/composables/useAxio'

const cachedLabels = ref([])

export function useLabels() {
  const runtimeConfig = useRuntimeConfig()
  const API_BASE = resolveApiBase(runtimeConfig)

  const fetchLabels = async () => {
    if (cachedLabels.value.length) {
      return cachedLabels.value
    }

    try {
      const res = await fetch(`${API_BASE}/labels`)
      const data = await res.json()
      cachedLabels.value = data
      return cachedLabels.value
    } catch (err) {
      console.error('Error fetching labels:', err)
      return []
    }
  }

  const fetchTaskLabels = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/labels`)
      return await res.json()
    } catch (err) {
      console.error('Error fetching task labels:', err)
      return []
    }
  }

  const addLabelToTask = async (taskId, labelId) => {
    await fetch(`${API_BASE}/tasks/${taskId}/labels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label_id: labelId }),
    })
  }

  const removeLabelFromTask = async (taskId, labelId) => {
    await fetch(`${API_BASE}/tasks/${taskId}/labels/${labelId}`, {
      method: 'DELETE',
    })
  }

  return {
    fetchLabels,
    fetchTaskLabels,
    addLabelToTask,
    removeLabelFromTask
  }
}
