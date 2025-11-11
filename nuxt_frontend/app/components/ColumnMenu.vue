<template>
  <div class="relative inline-block text-left">
    <!-- ⋯ Menu Button -->
    <button
      class="ml-2 text-gray-600 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition"
      @click.stop="toggleMenu"
    >
      ⋯
    </button>

    <!-- Dropdown Menu -->
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
        class="absolute right-0 mt-2 w-44 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg ring-1 ring-black/5 focus:outline-none z-50"
      >
        <ul class="py-1 text-sm text-gray-700">
          <li>
            <button
              class="w-full text-left px-4 py-2 hover:bg-gray-100 transition flex items-center gap-2"
              @click="handleAddCard"
            >
              <span>➕</span> Add Card
            </button>
          </li>
          <li>
            <button
              class="w-full text-left px-4 py-2 hover:bg-gray-100 transition flex items-center gap-2"
              @click="handleChangeColor"
            >
              <span>🎨</span> Change Color
            </button>
          </li>
          <li>
            <hr class="my-1 border-gray-200" />
          </li>
          <li>
            <button
              class="w-full text-left px-4 py-2 hover:bg-gray-100 transition flex items-center gap-2 text-red-600"
              @click="handleArchive"
            >
              <span>🗄️</span> Archive List
            </button>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  column: Object
})

const emit = defineEmits(['add-card', 'change-color', 'archive'])

const open = ref(false)

function toggleMenu() {
  open.value = !open.value
}

function handleAddCard() {
  emit('add-card', props.column)
  open.value = false
}

function handleChangeColor() {
  emit('change-color', props.column)
  open.value = false
}

function handleArchive() {
  emit('archive', props.column)
  open.value = false
}

function handleClickOutside(event) {
  if (!event.target.closest('.relative.inline-block.text-left')) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>
