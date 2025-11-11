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

  const updateDescription = async (newDescription) => {
    if (!task.value) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/tasks/${task.value.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          description: newDescription,
          group_id: task.value.group_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Server error:", data);
        throw new Error("Failed to update task");
      }

      task.value = { ...task.value, ...data };

      if (onUpdatedCallback) onUpdatedCallback(data);

      console.log("✅ Task updated successfully:", data);
    } catch (error) {
      console.error("❌ Error updating description:", error);
      alert("Failed to save description — check console for details.");
    }
  };

  return {
    isOpen,
    task,
    open,
    close,
    updateDescription,
    onUpdated, 
  };
}
