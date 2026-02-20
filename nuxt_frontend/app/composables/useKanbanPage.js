// composables/useKanbanPage.js
import { onMounted } from "vue"
import { useRoute } from "vue-router"
import { useKanbanBoard } from "@/composables/useKanbanBoard"
import { useProjectDetails } from "@/composables/useProjectDetails"
import { useTaskModal } from "@/composables/useTaskModal"

export function useKanbanPage() {
  const route = useRoute()
  const projectId = route.params.id

  const { projectName, fetchProject } = useProjectDetails()
  const { open: openTask } = useTaskModal()
  const {
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
  } = useKanbanBoard(projectId)

  const updateTaskInBoard = (updatedTask) => {
    const column = columns.value.find((c) => c.id === updatedTask.group_id)
    if (!column) return

    const index = column.tasks.findIndex((t) => t.id === updatedTask.id)
    if (index !== -1) {
      column.tasks[index] = {
        ...column.tasks[index],
        ...updatedTask,
      }
    }
  }

  onMounted(async () => {
    await fetchProject(projectId)
    await fetchKanban()
  })

  return {
    projectName,
    openTask,
    columns,
    dragging,
    addingColumn,
    newColumnTitle,
    board,
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
    updateTaskInBoard,
  }
}
