// composables/useTaskModalPage.js
import { useAuth } from "@/composables/useAuth";
import { useComments } from "@/composables/useComments";
import { useLabels } from "@/composables/useLabels";
import { useTaskModal } from "@/composables/useTaskModal";
import { computed, onMounted, ref, watch } from "vue";

export function useTaskModalPage(emit) {
  // ---------------------
  // 🧩 Core modal logic
  // ---------------------
  const { isOpen, task, close, updateDescription, updateTaskFields, onUpdated } = useTaskModal();
  const { user } = useAuth();

  // ---------------------
  // 📝 Description
  // ---------------------
  const isEditing = ref(false);
  const editableDescription = ref("");
  const assignedUserId = ref("");
  const startDate = ref("");
  const dueDate = ref("");
  const isSavingDetails = ref(false);

  watch(task, (newVal) => {
    if (newVal) {
      editableDescription.value = newVal.description || "";
      assignedUserId.value = newVal.assigned_user_id ? String(newVal.assigned_user_id) : "";
      startDate.value = newVal.start_date || "";
      dueDate.value = newVal.due_date || "";
      if (newVal.id) fetchTaskLabels(newVal.id);
    }
  });

  const saveTaskDetails = async () => {
    if (!task.value?.id) return;

    isSavingDetails.value = true;

    try {
      const updatedTask = await updateTaskFields({
        assigned_user_id: assignedUserId.value ? Number(assignedUserId.value) : null,
        start_date: startDate.value || null,
        due_date: dueDate.value || null,
      });

      if (!updatedTask) return;

      emit("task-updated", {
        ...task.value,
        assigned_user_id: updatedTask.assigned_user_id,
        start_date: updatedTask.start_date,
        due_date: updatedTask.due_date,
        assignee: updatedTask.assignee || null,
      });
    } finally {
      isSavingDetails.value = false;
    }
  };

  // ---------------------
  // 💬 Comments
  // ---------------------
  const {
    comments,
    mentionableUsers,
    loadCommentsForTask,
    loadMentionableUsers,
    addCommentForTask,
    updateCommentForTask,
    deleteCommentForTask,
  } = useComments();
  const commentInputHtml = ref("");
  const isCommentComposerOpen = ref(false);
  const activeReplyCommentId = ref(null);
  const replyDraftByCommentId = ref({});
  const replyTargetByCommentId = ref({});
  const editingCommentId = ref(null);
  const editingCommentHtmlById = ref({});

  const currentUserName = computed(() => user.value?.name || "User");

  const isHtmlContentEmpty = (html) => {
    const normalized = (html || "")
      .replace(/<p><br><\/p>/g, "")
      .replace(/<(.|\n)*?>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    return !normalized;
  };

  const openCommentComposer = () => {
    isCommentComposerOpen.value = true;
  };

  const cancelCommentComposer = () => {
    isCommentComposerOpen.value = false;
    commentInputHtml.value = "";
  };

  const submitComment = async () => {
    if (!task.value?.id) return;
    if (isHtmlContentEmpty(commentInputHtml.value)) return;

    try {
      await addCommentForTask(task.value.id, commentInputHtml.value, currentUserName.value);
      commentInputHtml.value = "";
      isCommentComposerOpen.value = false;
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  const startReply = (commentId, target = null) => {
    activeReplyCommentId.value = commentId;
    replyTargetByCommentId.value[commentId] = target;

    const currentDraft = replyDraftByCommentId.value[commentId] || "";
    if (!isHtmlContentEmpty(currentDraft)) return;

    replyDraftByCommentId.value[commentId] = "<p><br></p>";
  };

  const cancelReply = (commentId) => {
    if (activeReplyCommentId.value === commentId) {
      activeReplyCommentId.value = null;
    }
    delete replyTargetByCommentId.value[commentId];
  };

  const submitReply = async (parentCommentId) => {
    if (!task.value?.id) return;

    const replyContent = replyDraftByCommentId.value[parentCommentId];
    if (isHtmlContentEmpty(replyContent)) return;

    try {
      await addCommentForTask(task.value.id, replyContent, currentUserName.value, parentCommentId);
      replyDraftByCommentId.value[parentCommentId] = "<p><br></p>";
      delete replyTargetByCommentId.value[parentCommentId];
      activeReplyCommentId.value = null;
    } catch (error) {
      console.error("Failed to post reply:", error);
    }
  };

  const canModifyComment = (comment) => {
    const currentUserId = user.value?.id ? Number(user.value.id) : null;
    const commentUserId = comment?.userId ? Number(comment.userId) : null;
    if (currentUserId && commentUserId && currentUserId === commentUserId) return true;

    const currentName = (user.value?.name || "").trim().toLowerCase();
    const commentName = (comment?.authorName || "").trim().toLowerCase();
    return !!currentName && !!commentName && currentName === commentName;
  };

  const startEditComment = (comment) => {
    if (!comment?.id) return;
    editingCommentId.value = comment.id;
    editingCommentHtmlById.value[comment.id] = comment.content || "<p><br></p>";
  };

  const cancelEditComment = (commentId) => {
    if (editingCommentId.value === commentId) {
      editingCommentId.value = null;
    }
  };

  const saveEditComment = async (commentId) => {
    if (!task.value?.id) return;
    const content = editingCommentHtmlById.value[commentId];
    if (isHtmlContentEmpty(content)) return;

    try {
      await updateCommentForTask(task.value.id, commentId, content);
      editingCommentId.value = null;
    } catch (error) {
      console.error("Failed to edit comment:", error);
    }
  };

  const removeComment = async (commentId) => {
    if (!task.value?.id) return;

    try {
      await deleteCommentForTask(task.value.id, commentId);
      if (editingCommentId.value === commentId) {
        editingCommentId.value = null;
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const formatCommentDate = (isoDate) => {
    if (!isoDate) return "";
    return new Date(isoDate).toLocaleString();
  };

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
      assignedUserId.value = "";
      startDate.value = "";
      dueDate.value = "";
      isSavingDetails.value = false;
      taskLabels.value = [];
      comments.value = [];
      commentInputHtml.value = "";
      isCommentComposerOpen.value = false;
      activeReplyCommentId.value = null;
      replyDraftByCommentId.value = {};
      replyTargetByCommentId.value = {};
      editingCommentId.value = null;
      editingCommentHtmlById.value = {};
      return;
    }

    if (newTask.id) {
      loadCommentsForTask(newTask.id);
      loadMentionableUsers(newTask.id);
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

    // task details
    assignedUserId,
    startDate,
    dueDate,
    isSavingDetails,
    saveTaskDetails,

    // comments
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

    // quill
    toolbarOptions,
    formats,
    readOnlyOptions,
  };
}
