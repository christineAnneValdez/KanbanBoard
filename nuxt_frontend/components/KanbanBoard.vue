<script setup>
import { ref, onMounted } from 'vue'
import draggable from 'vuedraggable'

// Tasks lists
const todo = ref([])
const inProgress = ref([])
const done = ref([])

// Fetch tasks from API
const fetchTasks = async () => {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/tasks')
    const data = await res.json()

    todo.value = data.todo
    inProgress.value = data.in_progress
    done.value = data.done
  } catch (error) {
    console.error(error)
  }
}

onMounted(fetchTasks)

// Update task status in DB
const updateTaskStatus = async (task, newStatus) => {
  if (task.status === newStatus) return
  try {
    await fetch(`http://127.0.0.1:8000/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    task.status = newStatus
  } catch (error) {
    console.error(error)
  }
}

// Handle changes when dragging
const handleChange = (list, newStatus) => {
  list.forEach(task => updateTaskStatus(task, newStatus))
}
</script>

<template>
  <h2 class="text-xl font-bold mb-2">To Do</h2>
  <draggable v-model="todo" :animation="300" tag="ul" group="tasks" @change="() => handleChange(todo, 'todo')">
    <template #item="{ element: task }">
      <li class="p-2 mb-1 bg-green-100 rounded border">{{ task.title }}</li>
    </template>
  </draggable>

  <h2 class="text-xl font-bold mt-4 mb-2">In Progress</h2>
  <draggable v-model="inProgress" :animation="300" tag="ul" group="tasks" @change="() => handleChange(inProgress, 'in_progress')">
    <template #item="{ element: task }">
      <li class="p-2 mb-1 bg-yellow-100 rounded border">{{ task.title }}</li>
    </template>
  </draggable>

  <h2 class="text-xl font-bold mt-4 mb-2">Done</h2>
  <draggable v-model="done" :animation="300" tag="ul" group="tasks" @change="() => handleChange(done, 'done')">
    <template #item="{ element: task }">
      <li class="p-2 mb-1 bg-blue-100 rounded border">{{ task.title }}</li>
    </template>
  </draggable>
</template>
