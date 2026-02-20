import { ref } from "vue";

const isOpen = ref(false);
const task = ref(null);

export function useTaskModal() {
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
      const response = await fetch(`http://127.0.0.1:8000/api/tasks/${task.value.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
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
