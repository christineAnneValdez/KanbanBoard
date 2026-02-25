<template>
  <div
    v-if="isOpen && task"
    class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/45 p-4 backdrop-blur-sm"
  >
    <div class="my-2 mb-6 flex w-full max-w-[96rem] items-start justify-center gap-4">
      <div
        class="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900 dark:ring-white/10"
      >
      <div
        class="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-700 dark:bg-slate-900/70"
      >
        <div class="flex items-center gap-2">
          <span
            class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold tracking-wide text-slate-600 uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            To Do
          </span>
          <span
            v-if="task.ticket_no"
            class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          >
            {{ task.ticket_no }}
          </span>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {{ task.name || "Untitled Task" }}
          </h2>
        </div>
        <button
          @click="close"
          class="rounded-lg px-2 py-1 text-xl font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >&times;</button>
      </div>

      <div class="flex flex-1 flex-col gap-6 overflow-y-auto bg-slate-50/40 p-6 md:flex-row dark:bg-slate-950/20">
        <div class="flex-1">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-slate-200">
              <span class="text-base">&#128221;</span> Description
            </h3>
            <button
              @click="toggleEdit"
              class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {{ isEditing ? "Cancel" : "Edit" }}
            </button>
          </div>

          <div v-if="isEditing" class="max-h-[420px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
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
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>

          <div
            v-else
            class="max-h-[320px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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

        <div class="flex-shrink-0 space-y-5 md:w-72">
          <div>
            <h4 class="mb-3 text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-slate-200">Task Details</h4>
            <div class="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div>
                <label class="mb-1 block text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">Assigned To</label>
                <div class="relative">
                  <button
                    type="button"
                    @click="toggleAssigneePicker"
                    :disabled="isSavingDetails"
                    class="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-3 py-2 text-left transition hover:border-slate-300 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 dark:hover:border-slate-600"
                  >
                    <div class="flex items-center gap-2">
                      <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                        <img
                          v-if="selectedAssignee?.profile_photo_url"
                          :src="selectedAssignee.profile_photo_url"
                          :alt="selectedAssignee.name"
                          class="h-full w-full rounded-full object-cover"
                        />
                        <span v-else>{{ selectedAssignee ? getInitials(selectedAssignee.name) : "U" }}</span>
                      </span>
                      <span class="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {{ selectedAssignee ? selectedAssignee.name : "Unassigned" }}
                      </span>
                    </div>
                    <span class="text-xs text-slate-500 dark:text-slate-400">Select</span>
                  </button>

                  <div
                    v-if="activeAssigneePicker"
                    class="absolute left-0 z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                  >
                    <button
                      type="button"
                      @click="selectAssignee(null)"
                      class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-100">U</span>
                      <span>Unassigned</span>
                    </button>

                    <button
                      v-for="member in mentionableUsers"
                      :key="member.id"
                      type="button"
                      @click="selectAssignee(member.id)"
                      class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[11px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        <img
                          v-if="member.profile_photo_url"
                          :src="member.profile_photo_url"
                          :alt="member.name"
                          class="h-full w-full rounded-full object-cover"
                        />
                        <span v-else>{{ getInitials(member.name) }}</span>
                      </span>
                      <span class="flex-1 truncate">{{ member.name }}</span>
                      <span v-if="String(member.id) === assignedUserId" class="text-xs text-blue-600 dark:text-blue-300">Selected</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label class="mb-1 block text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">Start Date</label>
                <div class="relative">
                  <button
                    type="button"
                    @click="openDatePicker('start')"
                    :disabled="isSavingDetails"
                    class="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-3 py-2 text-left transition hover:border-slate-300 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 dark:hover:border-slate-600"
                  >
                    <div class="flex items-center gap-2">
                      <span class="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-sm text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">📅</span>
                      <span class="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {{ formatDateDisplay(startDate, "Pick a start date") }}
                      </span>
                    </div>
                    <span class="text-xs text-slate-500 dark:text-slate-400">Select</span>
                  </button>
                  <div
                    v-if="activeDatePicker === 'start'"
                    class="calendar-popover absolute left-0 z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div class="mb-2 flex items-center justify-between">
                      <button type="button" @click="goToPreviousMonth" class="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">‹</button>
                      <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ calendarTitle }}</p>
                      <button type="button" @click="goToNextMonth" class="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">›</button>
                    </div>
                    <div class="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span v-for="dayName in weekDays" :key="`start-week-${dayName}`">{{ dayName }}</span>
                    </div>
                    <div class="grid grid-cols-7 gap-1">
                      <button
                        v-for="(day, idx) in calendarDays"
                        :key="`start-day-${idx}`"
                        type="button"
                        :disabled="!day"
                        @click="selectCalendarDate(day)"
                        class="h-8 rounded-md text-xs transition"
                        :class="[
                          !day ? 'cursor-default opacity-0' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
                          day && isSelectedDate(day) ? 'bg-blue-600 font-semibold text-white hover:bg-blue-600 dark:hover:bg-blue-600' : '',
                          day && isToday(day) && !isSelectedDate(day) ? 'ring-1 ring-blue-300 dark:ring-blue-700' : ''
                        ]"
                      >
                        {{ day ? day.getDate() : '' }}
                      </button>
                    </div>
                    <div class="mt-3 flex justify-end">
                      <button type="button" class="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" @click="activeDatePicker = null">Close</button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label class="mb-1 block text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">Due Date</label>
                <div class="relative">
                  <button
                    type="button"
                    @click="openDatePicker('due')"
                    :disabled="isSavingDetails"
                    class="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-3 py-2 text-left transition hover:border-slate-300 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 dark:hover:border-slate-600"
                  >
                    <div class="flex items-center gap-2">
                      <span class="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100 text-sm text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">📅</span>
                      <span class="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {{ formatDateDisplay(dueDate, "Pick a due date") }}
                      </span>
                    </div>
                    <span class="text-xs text-slate-500 dark:text-slate-400">Select</span>
                  </button>
                  <div
                    v-if="activeDatePicker === 'due'"
                    class="calendar-popover absolute left-0 z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div class="mb-2 flex items-center justify-between">
                      <button type="button" @click="goToPreviousMonth" class="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">‹</button>
                      <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">{{ calendarTitle }}</p>
                      <button type="button" @click="goToNextMonth" class="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">›</button>
                    </div>
                    <div class="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span v-for="dayName in weekDays" :key="`due-week-${dayName}`">{{ dayName }}</span>
                    </div>
                    <div class="grid grid-cols-7 gap-1">
                      <button
                        v-for="(day, idx) in calendarDays"
                        :key="`due-day-${idx}`"
                        type="button"
                        :disabled="!day"
                        @click="selectCalendarDate(day)"
                        class="h-8 rounded-md text-xs transition"
                        :class="[
                          !day ? 'cursor-default opacity-0' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
                          day && isSelectedDate(day) ? 'bg-blue-600 font-semibold text-white hover:bg-blue-600 dark:hover:bg-blue-600' : '',
                          day && isToday(day) && !isSelectedDate(day) ? 'ring-1 ring-blue-300 dark:ring-blue-700' : ''
                        ]"
                      >
                        {{ day ? day.getDate() : '' }}
                      </button>
                    </div>
                    <div class="mt-3 flex justify-end">
                      <button type="button" class="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" @click="activeDatePicker = null">Close</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold tracking-wide text-slate-700 uppercase dark:text-slate-200">Labels</h4>

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
                class="rounded-md bg-slate-200 px-2 py-1 text-xs text-slate-800 transition hover:bg-slate-300 hover:text-slate-900 dark:bg-slate-700 dark:text-slate-100"
              >
                + Add
              </button>
            </div>

            <transition name="fade">
              <div
                v-if="showLabelMenu"
                class="relative max-h-60 w-full space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 shadow-md sm:max-h-48 sm:w-64 sm:p-3 dark:border-slate-700 dark:bg-slate-800"
              >
                <div
                  class="sticky top-0 z-10 mb-3 flex items-center justify-between rounded-md bg-white px-3 py-2 dark:bg-slate-800"
                >
                  <h5 class="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Select Labels
                  </h5>
                  <button
                    @click="showLabelMenu = false"
                    class="rounded-md px-2 text-base font-bold text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                    title="Close"
                  >&times;</button>
                </div>

                <div
                  v-for="label in labels"
                  :key="label.id"
                  :style="{ backgroundColor: label.color }"
                  class="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm text-white transition hover:opacity-80"
                  @click="toggleLabel(label.id)"
                >
                  <span>{{ label.name }}</span>
                  <span v-if="taskLabels.some((tl) => tl.id === label.id)">&#10003;</span>
                </div>
              </div>
            </transition>
          </div>
        </div>

      </div>
      </div>

      <div class="max-h-[calc(100vh-2rem)] w-[24rem] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900 dark:ring-white/10">
        <h4 class="mb-3 text-sm font-semibold tracking-wide text-slate-800 uppercase dark:text-slate-100">Comments</h4>
        <div class="space-y-4 overflow-y-auto">
          <form @submit.prevent="submitComment" class="flex items-start gap-2">
            <div class="w-full space-y-2">
              <button
                v-if="!isCommentComposerOpen"
                type="button"
                @click="openCommentComposer"
                class="w-full rounded-lg bg-slate-100 px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                Add a comment...
              </button>

              <div v-else class="space-y-2">
                <QuillEditor
                  v-model:content="commentInputHtml"
                  content-type="html"
                  theme="snow"
                  :toolbar="toolbarOptions"
                  :formats="formats"
                  class="min-h-[90px] rounded-md bg-white dark:bg-slate-800"
                />

                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    @click="cancelCommentComposer"
                    class="rounded-md bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="isHtmlContentEmpty(commentInputHtml)"
                    class="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div v-if="comments.length" class="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="rounded-md p-3"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="font-semibold text-slate-800 dark:text-slate-100">{{ comment.authorName }}</span>
                <span class="text-slate-500 dark:text-slate-400">{{ formatCommentDate(comment.createdAt) }}</span>
              </div>
              <div v-if="editingCommentId === comment.id" class="mt-2 space-y-2">
                <QuillEditor
                  v-model:content="editingCommentHtmlById[comment.id]"
                  content-type="html"
                  theme="snow"
                  :toolbar="toolbarOptions"
                  :formats="formats"
                  class="min-h-[90px] rounded-md bg-white dark:bg-slate-800"
                />
                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    class="rounded-md bg-slate-200 px-3 py-1 text-xs text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                    @click="cancelEditComment(comment.id)"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                    :disabled="isHtmlContentEmpty(editingCommentHtmlById[comment.id])"
                    @click="saveEditComment(comment.id)"
                  >
                    Save
                  </button>
                </div>
              </div>
              <QuillEditor
                v-else
                v-model:content="comment.content"
                content-type="html"
                :options="readOnlyOptions"
                theme="bubble"
                class="mt-1 ql-readonly"
              />

              <div class="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  class="inline-flex h-7 w-7 items-center justify-center rounded-md text-black transition hover:bg-slate-100"
                      title="Reply"
                      aria-label="Reply"
                      @click="startReply(comment.id, comment)"
                    >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-4 w-4"
                  >
                    <path d="M9 14 4 9l5-5" />
                    <path d="M4 9h10a6 6 0 0 1 6 6v1" />
                  </svg>
                </button>
                <button
                  v-if="canModifyComment(comment)"
                  type="button"
                  class="inline-flex h-7 w-7 items-center justify-center rounded-md text-black transition hover:bg-slate-100"
                  title="Edit"
                  aria-label="Edit"
                  @click="startEditComment(comment)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
                <button
                  v-if="canModifyComment(comment)"
                  type="button"
                  class="inline-flex h-7 w-7 items-center justify-center rounded-md text-black transition hover:bg-slate-100"
                  title="Delete"
                  aria-label="Delete"
                  @click="removeComment(comment.id)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </button>
              </div>

                  <div v-if="activeReplyCommentId === comment.id" class="mt-3 space-y-2 rounded-md bg-slate-50 p-2 dark:bg-slate-900">
                    <QuillEditor
                      v-model:content="replyDraftByCommentId[comment.id]"
                      content-type="html"
                  theme="snow"
                  :toolbar="toolbarOptions"
                  :formats="formats"
                  class="min-h-[100px] rounded-md bg-white dark:bg-slate-800"
                />

                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    class="rounded-md bg-slate-200 px-3 py-1 text-xs text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                    @click="cancelReply(comment.id)"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    :disabled="isHtmlContentEmpty(replyDraftByCommentId[comment.id])"
                    @click="submitReply(comment.id)"
                  >
                    Post reply
                  </button>
                </div>
              </div>

              <div v-if="comment.replies?.length" class="mt-3 space-y-2 pl-3">
                <div
                  v-for="reply in comment.replies"
                  :key="reply.id"
                  class="rounded-md p-2"
                >
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-semibold text-slate-800 dark:text-slate-100">{{ reply.authorName }}</span>
                    <span class="text-slate-500 dark:text-slate-400">{{ formatCommentDate(reply.createdAt) }}</span>
                  </div>
                  <div v-if="editingCommentId === reply.id" class="mt-2 space-y-2">
                    <QuillEditor
                      v-model:content="editingCommentHtmlById[reply.id]"
                      content-type="html"
                      theme="snow"
                      :toolbar="toolbarOptions"
                      :formats="formats"
                      class="min-h-[90px] rounded-md bg-white dark:bg-slate-800"
                    />
                    <div class="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        class="rounded-md bg-slate-200 px-3 py-1 text-xs text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                        @click="cancelEditComment(reply.id)"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        class="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                        :disabled="isHtmlContentEmpty(editingCommentHtmlById[reply.id])"
                        @click="saveEditComment(reply.id)"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                  <QuillEditor
                    v-else
                    v-model:content="reply.content"
                    content-type="html"
                    :options="readOnlyOptions"
                    theme="bubble"
                    class="mt-1 ql-readonly"
                  />
                  <div class="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                          class="inline-flex h-7 w-7 items-center justify-center rounded-md text-black transition hover:bg-slate-100"
                          title="Reply"
                          aria-label="Reply"
                          @click="startReply(comment.id, reply)"
                        >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="h-4 w-4"
                      >
                        <path d="M9 14 4 9l5-5" />
                        <path d="M4 9h10a6 6 0 0 1 6 6v1" />
                      </svg>
                    </button>
                    <button
                      v-if="canModifyComment(reply)"
                      type="button"
                      class="inline-flex h-7 w-7 items-center justify-center rounded-md text-black transition hover:bg-slate-100"
                      title="Edit"
                      aria-label="Edit"
                      @click="startEditComment(reply)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                    <button
                      v-if="canModifyComment(reply)"
                      type="button"
                      class="inline-flex h-7 w-7 items-center justify-center rounded-md text-black transition hover:bg-slate-100"
                      title="Delete"
                      aria-label="Delete"
                      @click="removeComment(reply.id)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p v-else class="text-xs text-slate-500 dark:text-slate-400">No comments yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import "quill/dist/quill.snow.css";
  import "quill/dist/quill.bubble.css";
  import { computed, ref } from "vue";

  import { useTaskModalPage } from "@/composables/useTaskModalPage";

  const activeDatePicker = ref(null);
  const calendarViewDate = ref(new Date());
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const normalizeToDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  };

  const toIsoDate = (date) => {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = `${date.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const openDatePicker = (type) => {
    activeAssigneePicker.value = false;
    activeDatePicker.value = activeDatePicker.value === type ? null : type;
    const selected = type === "start" ? normalizeToDate(startDate.value) : normalizeToDate(dueDate.value);
    calendarViewDate.value = selected || new Date();
  };

  const calendarTitle = computed(() =>
    calendarViewDate.value.toLocaleDateString(undefined, { month: "long", year: "numeric" })
  );

  const calendarDays = computed(() => {
    const year = calendarViewDate.value.getFullYear();
    const month = calendarViewDate.value.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
    while (cells.length < 42) cells.push(null);
    return cells;
  });

  const goToPreviousMonth = () => {
    const d = calendarViewDate.value;
    calendarViewDate.value = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  };

  const goToNextMonth = () => {
    const d = calendarViewDate.value;
    calendarViewDate.value = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  };

  const formatDateDisplay = (dateValue, fallback) => {
    if (!dateValue) return fallback;
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return fallback;
    return parsed.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isSelectedDate = (day) => {
    if (!day || !activeDatePicker.value) return false;
    const selectedValue = activeDatePicker.value === "start" ? startDate.value : dueDate.value;
    const selected = normalizeToDate(selectedValue);
    if (!selected) return false;
    return toIsoDate(selected) === toIsoDate(day);
  };

  const isToday = (day) => {
    if (!day) return false;
    return toIsoDate(day) === toIsoDate(new Date());
  };

  const selectCalendarDate = async (day) => {
    if (!day || !activeDatePicker.value) return;

    const value = toIsoDate(day);
    if (activeDatePicker.value === "start") {
      startDate.value = value;
    } else {
      dueDate.value = value;
    }

    await saveTaskDetails();
    activeDatePicker.value = null;
  };

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
    assignedUserId,
    startDate,
    dueDate,
    isSavingDetails,
    saveTaskDetails,
    comments,
    mentionableUsers,
    commentInputHtml,
    isCommentComposerOpen,
    activeReplyCommentId,
    replyDraftByCommentId,
    replyTargetByCommentId,
    editingCommentId,
    editingCommentHtmlById,
    currentUserName,
    submitComment,
    openCommentComposer,
    cancelCommentComposer,
    startReply,
    cancelReply,
    submitReply,
    isHtmlContentEmpty,
    formatCommentDate,
    canModifyComment,
    startEditComment,
    cancelEditComment,
    saveEditComment,
    removeComment,
    toolbarOptions,
    formats,
    readOnlyOptions,
  } = useTaskModalPage(emit);

  const activeAssigneePicker = ref(false);

  const selectedAssignee = computed(() => {
    return mentionableUsers.value.find((member) => String(member.id) === assignedUserId.value) || null;
  });

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() || "").join("");
  };

  const toggleAssigneePicker = () => {
    activeDatePicker.value = null;
    activeAssigneePicker.value = !activeAssigneePicker.value;
  };

  const selectAssignee = async (userId) => {
    assignedUserId.value = userId ? String(userId) : "";
    await saveTaskDetails();
    activeAssigneePicker.value = false;
  };
</script>

<style scoped></style>

