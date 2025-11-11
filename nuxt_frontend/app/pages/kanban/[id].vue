<template>
  <div
    class="flex flex-col overflow-hidden bg-gray-50 p-4 text-gray-900 transition-colors duration-300 select-none dark:bg-gray-900 dark:text-gray-100"
  >
    <h1 v-if="projectName" class="mb-6 text-xl font-bold sm:mb-8 sm:text-2xl">
      {{ projectName }}
    </h1>
    <div v-else class="flex h-[70vh] w-full items-center justify-center">
      <div class="flex flex-col items-center">
        <div
          class="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-black"
        ></div>
        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading project...</p>
      </div>
    </div>

    <draggable
      v-if="columns.length"
      ref="board"
      v-model="columns"
      group="columns"
      direction="horizontal"
      class="flex snap-x flex-row items-start gap-6 overflow-x-auto scroll-smooth pb-2"
      item-key="id"
      animation="300"
      ghost-class="opacity-50"
      @change="onColumnDrop"
    >
      <template #item="{ element: column, index }">
        <div
          class="flex w-[85%] flex-shrink-0 snap-start flex-col rounded-xl bg-white p-4 shadow-md sm:w-80 dark:bg-gray-800"
        >
          <div class="mb-4">
            <div v-if="!column.editing" class="relative flex items-center justify-between">
              <h2
                class="flex-1 cursor-pointer truncate rounded-xl bg-black p-2 text-base font-semibold text-white sm:text-lg"
                @click="editColumnTitle(column)"
              >
                {{ column.title }}
              </h2>

              <ColumnMenu
                :column="column"
                @add-card="showAddTask"
                @change-color="changeColumnColor"
                @archive="archiveColumn"
              />
            </div>

            <div v-else class="flex gap-2">
              <input
                v-model="column.newTitle"
                type="text"
                class="w-full rounded-md border p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                @keyup.enter="saveColumnTitle(column)"
                @keyup.esc="cancelEditColumn(column)"
                @blur="saveColumnTitle(column)"
                autofocus
              />
            </div>
          </div>

          <draggable
            v-model="column.tasks"
            tag="ul"
            group="tasks"
            animation="300"
            ghost-class="opacity-50"
            class="flex flex-col gap-2 overflow-y-auto"
            style="max-height: 400px"
            @start="dragging = true"
            @end="dragging = false"
            @change="onTaskDrop($event, column)"
          >
            <template #item="{ element }">
              <li
                class="cursor-pointer rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm transition-all duration-200 select-none hover:bg-gray-200 sm:text-base dark:border-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
                @click="openTask(element)"
              >
 
                <div class="truncate font-medium text-gray-800 dark:text-gray-100">
                  {{ element.name }}
                </div>

                <div
                  v-if="element.labels && element.labels.length"
                  class="mb-1 flex flex-wrap gap-1"
                >
                  <span
                    v-for="label in element.labels"
                    :key="label.id"
                    class="rounded-full px-2 py-[2px] text-[10px] font-medium text-white"
                    :style="{ backgroundColor: label.color || '#6b7280' }"
                  >
                  </span>
                </div>
              </li>
            </template>
          </draggable>

          <div v-if="column.adding" class="mt-4 flex flex-col gap-2">
            <textarea
              v-model="column.newTask"
              rows="2"
              placeholder="Enter a title for this task..."
              class="w-full resize-none rounded-md border p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            ></textarea>
            <div class="flex gap-2">
              <button
                @click="addTask(column)"
                class="rounded-lg bg-blue-500 px-3 py-1 text-sm text-white transition hover:bg-blue-600"
              >
                Add
              </button>
              <button
                @click="cancelAdd(column)"
                class="rounded-lg bg-gray-200 px-3 py-1 text-sm text-gray-800 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>

          <button
            v-else
            @click="showAddTask(column)"
            class="hover:text-gray mt-4 rounded-lg px-3 py-1 text-left text-sm text-gray-700 transition select-none hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600"
            :class="{ 'pointer-events-none opacity-70': dragging }"
          >
            + Add Task
          </button>
        </div>
      </template>

      <template #footer>
        <div
          class="flex w-[85%] flex-shrink-0 snap-start flex-col items-start justify-start rounded-xl border border-gray-200 bg-gray-50 p-4 sm:w-80 dark:bg-gray-900"
        >
          <div v-if="addingColumn" class="flex w-full flex-col gap-2">
            <input
              v-model="newColumnTitle"
              type="text"
              placeholder="Enter column title..."
              class="w-full rounded-md border p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <div class="flex gap-2">
              <button
                @click="addColumn"
                class="rounded-lg bg-blue-500 px-3 py-1 text-sm text-white transition hover:bg-blue-600"
              >
                Add
              </button>
              <button
                @click="cancelAddColumn"
                class="rounded-lg bg-gray-200 px-3 py-1 text-sm text-gray-800 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>

          <button
            v-else
            @click="showAddColumn"
            class="w-full rounded-lg bg-gray-100 px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-black hover:text-white dark:bg-gray-700 dark:text-gray-300"
            :class="{ 'pointer-events-none opacity-70': dragging }"
          >
            + Add Column
          </button>
        </div>
      </template>
    </draggable>
  </div>
  <TaskModal @task-updated="updateTaskInBoard" />
</template>

<script setup>
  import TaskModal from "@/components/TaskModal.vue";
  import { useKanbanPage } from "@/composables/useKanbanPage";
  import draggable from "vuedraggable";

  const {
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
  } = useKanbanPage();
</script>
