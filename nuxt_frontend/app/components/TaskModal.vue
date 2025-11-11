<template>
  <div
    v-if="isOpen && task"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60"
  >
    <div
      class="mx-4 flex max-h-[90vh] w-[95%] max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl sm:mx-auto sm:w-[90%] md:w-full dark:bg-gray-800"
    >
      <div
        class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700"
      >
        <div class="flex items-center gap-2">
          <span class="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            To Do
          </span>
          <h2 class="text-xl font-bold">{{ task.name || "Untitled Task" }}</h2>
        </div>
        <button
          @click="close"
          class="text-xl font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ×
        </button>
      </div>

      <div class="flex flex-1 flex-col gap-6 overflow-y-auto p-6 md:flex-row">
        <div class="flex-1">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200">
              <span class="text-lg">📝</span> Description
            </h3>
            <button
              @click="toggleEdit"
              class="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-800 transition hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            >
              {{ isEditing ? "Cancel" : "Edit" }}
            </button>
          </div>

          <!--(Edit Description) -->
          <div v-if="isEditing" class="max-h-[400px] overflow-y-auto rounded-md p-2">
            <QuillEditor
              v-model:content="editableDescription"
              content-type="html"
              theme="snow"
              :toolbar="toolbarOptions"
              :formats="formats"
              class="min-h-[180px]"
            />
            <div class="mt-3 flex justify-end">
              <button
                @click="saveDescription"
                class="rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                Save
              </button>
            </div>
          </div>

          <div
            v-else
            class="max-h-[300px] overflow-y-auto rounded-md p-3 text-sm leading-relaxed text-gray-700 dark:text-gray-200"
          >
            <QuillEditor
              v-model:content="task.description"
              content-type="html"
              :options="readOnlyOptions"
              theme="bubble"
              class="ql-readonly"
            />
          </div>
        </div>

        <!--(Ride Side Bar Modal) -->
        <div class="flex-shrink-0 space-y-4 md:w-60">
          <div>
            <h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Members</h4>
            <div class="flex items-center gap-2">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-white dark:bg-gray-600"
              >
                +
              </div>
            </div>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Labels</h4>

            <!--(Label)) -->
            <div class="mb-3 flex flex-wrap gap-2">
              <div
                v-for="label in taskLabels"
                :key="label.id"
                :style="{ backgroundColor: label.color }"
                class="rounded-md px-3 py-1 text-xs font-semibold text-white select-none"
              >
                {{ label.name }}
              </div>
              <button
                @click="showLabelMenu = !showLabelMenu"
                class="rounded-md bg-gray-200 px-2 py-1 text-xs text-gray-800 transition hover:bg-gray-300 hover:text-gray-900"
              >
                + Add
              </button>
            </div>

            <!--(Select Label) -->
            <transition name="fade">
              <div
                v-if="showLabelMenu"
                class="relative max-h-60 w-full space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-100 p-4 shadow-md sm:max-h-48 sm:w-64 sm:p-3 dark:border-gray-700 dark:bg-gray-700"
              >
                <div
                  class="sticky top-0 z-10 mb-3 flex items-center justify-between rounded-md bg-gray-100 px-3 py-2 dark:bg-gray-700"
                >
                  <h5 class="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Select Labels
                  </h5>
                  <button
                    @click="showLabelMenu = false"
                    class="rounded-md px-2 text-base font-bold text-gray-600 transition hover:bg-gray-300 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                    title="Close"
                  >
                    ×
                  </button>
                </div>

                <!--(Label List) -->
                <div
                  v-for="label in labels"
                  :key="label.id"
                  :style="{ backgroundColor: label.color }"
                  class="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm text-white transition hover:opacity-80"
                  @click="toggleLabel(label.id)"
                >
                  <span>{{ label.name }}</span>
                  <span v-if="taskLabels.some((tl) => tl.id === label.id)">✔</span>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <div
        class="border-t border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
      >
        <p>Comments and activity section (static placeholder)</p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import "quill/dist/quill.snow.css";
  import "quill/dist/quill.bubble.css";

  import { useTaskModalPage } from "@/composables/useTaskModalPage";

  const emit = defineEmits(["task-updated"]);
  const {
    isOpen,
    task,
    close,
    isEditing,
    editableDescription,
    toggleEdit,
    saveDescription,
    showLabelMenu,
    labels,
    taskLabels,
    addLabel,
    removeLabel,
    toggleLabel,
    toolbarOptions,
    formats,
    readOnlyOptions,
  } = useTaskModalPage(emit);
</script>
