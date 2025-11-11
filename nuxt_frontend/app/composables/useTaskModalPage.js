// composables/useTaskModalPage.js
import { useLabels } from "@/composables/useLabels";
import { useTaskModal } from "@/composables/useTaskModal";
import { onMounted, ref, watch } from "vue";

export function useTaskModalPage(emit) {
  // ---------------------
  // 🧩 Core modal logic
  // ---------------------
  const { isOpen, task, close, updateDescription, onUpdated } = useTaskModal();

  // ---------------------
  // 📝 Description
  // ---------------------
  const isEditing = ref(false);
  const editableDescription = ref("");

  watch(task, (newVal) => {
    if (newVal) {
      editableDescription.value = newVal.description || "";
      if (newVal.id) fetchTaskLabels(newVal.id);
    }
  });

  onUpdated((updatedTask) => {
    emit("task-updated", updatedTask);
  });

  const toggleEdit = () => {
    editableDescription.value = task.value.description || "";
    isEditing.value = !isEditing.value;
  };

  const saveDescription = async () => {
    if (!editableDescription.value.trim()) return;

    await updateDescription(editableDescription.value);

    const updatedTask = {
      ...task.value,
      description: editableDescription.value,
      labels: taskLabels.value,
    };

    emit("task-updated", updatedTask);
    isEditing.value = false;
  };

  // ---------------------
  // 🏷️ Labels
  // ---------------------
  const showLabelMenu = ref(false);
  const { fetchLabels, fetchTaskLabels, addLabelToTask, removeLabelFromTask } = useLabels();

  const labels = ref([]);
  const taskLabels = ref([]);

  onMounted(async () => {
    labels.value = await fetchLabels();

    if (task.value?.labels) {
      taskLabels.value = task.value.labels;
    }
  });

  watch(task, (newTask) => {
    if (!newTask) {
      taskLabels.value = [];
      return;
    }

    if (newTask.labels?.length) {
      taskLabels.value = newTask.labels;
    } else if (newTask.id) {
      fetchTaskLabels(newTask.id).then((res) => {
        taskLabels.value = res;
      });
    }
  });

  const addLabel = async (labelId) => {
    if (!task.value?.id) return;
    await addLabelToTask(task.value.id, labelId);
    taskLabels.value = await fetchTaskLabels(task.value.id);
    showLabelMenu.value = false;
    emit("task-updated", { ...task.value, labels: taskLabels.value });
  };

  const removeLabel = async (labelId) => {
    if (!task.value?.id) return;
    await removeLabelFromTask(task.value.id, labelId);
    taskLabels.value = await fetchTaskLabels(task.value.id);
    emit("task-updated", { ...task.value, labels: taskLabels.value });
  };

  const toggleLabel = async (labelId) => {
    const exists = taskLabels.value.some((l) => l.id === labelId);
    if (exists) {
      await removeLabel(labelId);
    } else {
      await addLabel(labelId);
    }
  };

  // ---------------------
  // 🧰 Quill Config
  // ---------------------
  const toolbarOptions = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "link"],
    [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["clean"],
  ];

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "link",
    "list",
    "bullet",
    "check",
    "indent",
  ];

  const readOnlyOptions = {
    readOnly: true,
    modules: { toolbar: false },
  };

  return {
    // modal
    isOpen,
    task,
    close,

    // description
    isEditing,
    editableDescription,
    toggleEdit,
    saveDescription,

    // labels
    showLabelMenu,
    labels,
    taskLabels,
    addLabel,
    removeLabel,
    toggleLabel,

    // quill
    toolbarOptions,
    formats,
    readOnlyOptions,
  };
}
