// composables/useKanbanPage.js
import { onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useKanbanBoard } from "@/composables/useKanbanBoard"
import { useProjectDetails } from "@/composables/useProjectDetails"
import { useTaskModal } from "@/composables/useTaskModal"

export function useKanbanPage() {
  const route = useRoute()
  const router = useRouter()
  const projectId = route.params.id
  const isLoading = ref(true)

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
    canAddTask,
    canAddColumn,
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
    isLoading.value = true
    try {
      const [projectLoaded] = await Promise.all([
        fetchProject(projectId),
        fetchKanban(),
      ])

      if (!projectLoaded) {
        router.replace("/projects/project")
      }
    } finally {
      isLoading.value = false
    }
  })

  return {
    projectName,
    isLoading,
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
    canAddTask,
    canAddColumn,
    updateTaskInBoard,
  }
}
