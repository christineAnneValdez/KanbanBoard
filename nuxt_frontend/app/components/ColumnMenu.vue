<template>
  <div class="relative inline-block text-left">
    <button
      class="ml-2 rounded-full p-1.5 text-gray-600 transition hover:bg-gray-100 hover:text-black"
      @click.stop="toggleMenu"
    >
      ...
    </button>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        class="absolute right-0 z-50 mt-2 w-44 origin-top-right rounded-lg border border-gray-200 bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
      >
        <ul class="py-1 text-sm text-gray-700">
          <li v-if="canAddTask">
            <button
              class="flex w-full items-center gap-2 px-4 py-2 text-left transition hover:bg-gray-100"
              @click="handleAddCard"
            >
              <span>+</span> Add Card
            </button>
          </li>
          <li>
            <button
              class="flex w-full items-center gap-2 px-4 py-2 text-left transition hover:bg-gray-100"
              @click="handleChangeColor"
            >
              <span>*</span> Change Color
            </button>
          </li>
          <li>
            <hr class="my-1 border-gray-200" />
          </li>
          <li>
            <button
              class="flex w-full items-center gap-2 px-4 py-2 text-left text-red-600 transition hover:bg-gray-100"
              @click="handleArchive"
            >
              <span>x</span> Archive List
            </button>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  column: {
    type: Object,
    required: true,
  },
  canAddTask: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["add-card", "change-color", "archive"]);

const open = ref(false);

function toggleMenu() {
  open.value = !open.value;
}

function handleAddCard() {
  emit("add-card", props.column);
  open.value = false;
}

function handleChangeColor() {
  emit("change-color", props.column);
  open.value = false;
}

function handleArchive() {
  emit("archive", props.column);
  open.value = false;
}

function handleClickOutside(event) {
  if (!event.target.closest(".relative.inline-block.text-left")) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside));
</script>

