import { ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import { resolveApiBase } from "@/composables/useApi";

const isOpen = ref(false);
const task = ref(null);

export function useTaskModal() {
  const { token } = useAuth();
  const runtimeConfig = useRuntimeConfig();
  const API_BASE = resolveApiBase(runtimeConfig);
  let onUpdatedCallback = null;

  const open = (taskData) => {
    task.value = taskData;
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
    task.value = null;
  };

  const onUpdated = (callback) => {
    onUpdatedCallback = callback;
  };

  const updateTaskFields = async (fields) => {
    if (!task.value) return null;

    try {
      const response = await fetch(`${API_BASE}/tasks/${task.value.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
        },
        body: JSON.stringify({
          group_id: task.value.group_id,
          ...fields,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Server error:", data);
        throw new Error("Failed to update task");
      }

      task.value = { ...task.value, ...data };

      if (onUpdatedCallback) onUpdatedCallback(data);

      return data;
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to save task updates.");
      return null;
    }
  };

  const updateDescription = async (newDescription) => {
    return updateTaskFields({ description: newDescription });
  };

  return {
    isOpen,
    task,
    open,
    close,
    updateTaskFields,
    updateDescription,
    onUpdated,
  };
}
