import { ref } from "vue";

export function useChecklists(taskId) {
  const runtimeConfig = useRuntimeConfig();
  const API_BASE = runtimeConfig.public.apiBase || import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
  const checklists = ref([]);
  const loading = ref(false);

  const fetchChecklists = async () => {
    loading.value = true;
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/checklists`);
      checklists.value = await res.json();
    } finally {
      loading.value = false;
    }
  };

  const addChecklist = async (name) => {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/checklists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const newItem = await res.json();
    checklists.value.push(newItem);
  };

  const toggleDone = async (item) => {
    item.is_done = !item.is_done;
    await fetch(`${API_BASE}/checklists/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_done: item.is_done }),
    });
  };

  const renameChecklist = async (item, newName) => {
    item.name = newName;
    await fetch(`${API_BASE}/checklists/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
  };

  const deleteChecklist = async (itemId) => {
    await fetch(`${API_BASE}/checklists/${itemId}`, { method: "DELETE" });
    checklists.value = checklists.value.filter((c) => c.id !== itemId);
  };

  return {
    checklists,
    loading,
    fetchChecklists,
    addChecklist,
    toggleDone,
    renameChecklist,
    deleteChecklist,
  };
}
