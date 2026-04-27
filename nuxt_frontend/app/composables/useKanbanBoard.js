import { ref, nextTick } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { resolveApiBase } from '@/composables/useApi'

export function useKanbanBoard(projectId) {
  const { token } = useAuth()
  const runtimeConfig = useRuntimeConfig()
  const API_BASE = resolveApiBase(runtimeConfig)
  const columns = ref([])
  const dragging = ref(false)
  const addingColumn = ref(false)
  const newColumnTitle = ref('')
  const board = ref(null)

  const authHeaders = () =>
    token.value
      ? { Authorization: `Bearer ${token.value}` }
      : {}

  const fetchKanban = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/kanban`, {
        headers: authHeaders(),
      })
      if (!res.ok) {
        throw new Error(`Failed to load Kanban (${res.status})`)
      }
      const data = await res.json()
     columns.value = data.groups
      .sort((a, b) => a.sort - b.sort) 
      .map(group => ({
        id: group.id,
        title: group.name,
        tasks: group.tasks
          .sort((a, b) => a.sort - b.sort), 
        adding: false,
        newTask: '',
        editing: false,
        newTitle: '',
      }))

      nextTick(() => {
        const el = board.value?.$el || board.value
        if (el) el.scrollLeft = 0
      })
    } catch (error) {
      console.error('Error loading Kanban data:', error)
      columns.value = []
    }
  }


  const addTask = async (column) => {
    const name = column.newTask.trim()
    if (!name) return

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          name,
          group_id: column.id,
          project_id: projectId,
          sort: column.tasks.length + 1,
        }),
      })
      const newTask = await res.json()
      column.tasks.push(newTask)
      column.newTask = ''
      column.adding = false
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const cancelAdd = (column) => {
    column.newTask = ''
    column.adding = false
  }

  const showAddTask = (column) => {
    column.adding = true
    column.newTask = ''
  }

  // --- Add column ---
  const showAddColumn = () => {
    addingColumn.value = true
    newColumnTitle.value = ''
  }

  const addColumn = async () => {
    const title = newColumnTitle.value.trim()
    if (!title) return

    try {
      const res = await fetch(`${API_BASE}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          name: title,
          sort: columns.value.length + 1,
          project_id: projectId,
        }),
      })
      const newGroup = await res.json()
      columns.value.push({
        id: newGroup.id,
        title: newGroup.name,
        tasks: [],
        adding: false,
        newTask: '',
      })
      newColumnTitle.value = ''
      addingColumn.value = false
    } catch (error) {
      console.error('Error adding column:', error)
    }
  }

  const cancelAddColumn = () => {
    newColumnTitle.value = ''
    addingColumn.value = false
  }


  const onTaskDrop = async (event, targetColumn) => {
  const { added, moved } = event
  const task = added?.element || moved?.element
  if (!task) return

  try {
    task.group_id = targetColumn.id

    targetColumn.tasks = [...targetColumn.tasks]

    targetColumn.tasks.forEach((t, index) => {
      t.sort = index + 1
    })

    await Promise.all(
      targetColumn.tasks.map(t =>
        fetch(`${API_BASE}/tasks/${t.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({
            name: t.name,
            group_id: t.group_id,
            sort: t.sort,
          }),
        })
      )
    )
  } catch (error) {
    console.error('Error updating task position:', error)
  }
}

  const onColumnDrop = async (event) => {
    const { moved } = event
    if (!moved) return
    columns.value.forEach((col, index) => (col.sort = index + 1))

    try {
      await Promise.all(
        columns.value.map(col =>
          fetch(`${API_BASE}/groups/${col.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ name: col.title, sort: col.sort }),
          })
        )
      )
    } catch (error) {
      console.error('Error updating column order:', error)
    }
  }

  const editColumnTitle = (column) => {
    column.editing = true
    column.newTitle = column.title
  }

  const cancelEditColumn = (column) => {
    column.editing = false
    column.newTitle = column.title
  }

  const saveColumnTitle = async (column) => {
    const newTitle = column.newTitle.trim()
    if (!newTitle || newTitle === column.title) {
      column.editing = false
      return
    }

    try {
      const res = await fetch(`${API_BASE}/groups/${column.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ name: newTitle, sort: column.sort }),
      })

      if (res.ok) column.title = newTitle
      else console.error('Failed to update column name:', await res.text())
    } catch (error) {
      console.error('Error updating column name:', error)
    } finally {
      column.editing = false
    }
  }

  return {
    columns,
    dragging,
    addingColumn,
    newColumnTitle,
    board,
    fetchKanban,
    addTask,
    cancelAdd,
    showAddTask,
    showAddColumn,
    addColumn,
    cancelAddColumn,
    onTaskDrop,
    onColumnDrop,
    editColumnTitle,
    cancelEditColumn,
    saveColumnTitle,
  }
}
