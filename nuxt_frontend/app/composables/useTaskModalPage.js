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
  const { comments, mentionableUsers, loadCommentsForTask, loadMentionableUsers, addCommentForTask } =
    useComments();
  const commentInputHtml = ref("");
  const isCommentComposerOpen = ref(false);
  const activeReplyCommentId = ref(null);
  const replyDraftByCommentId = ref({});

  const currentUserName = computed(() => user.value?.name || "User");

  const isHtmlContentEmpty = (html) => {
    const normalized = (html || "")
      .replace(/<p><br><\/p>/g, "")
      .replace(/<(.|\n)*?>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    return !normalized;
  };

  const appendMention = (target, mentionName) => {
    if (!mentionName) return target;

    const mentionToken = `@${mentionName} `;
    const base = target || "<p><br></p>";

    if (base === "<p><br></p>") {
      return `<p>${mentionToken}</p>`;
    }

    return `${base}<p>${mentionToken}</p>`;
  };

  const insertMentionInComment = (mentionName) => {
    commentInputHtml.value = appendMention(commentInputHtml.value, mentionName);
  };

  const openCommentComposer = () => {
    isCommentComposerOpen.value = true;
  };

  const cancelCommentComposer = () => {
    isCommentComposerOpen.value = false;
    commentInputHtml.value = "";
  };

  const insertMentionInReply = (commentId, mentionName) => {
    replyDraftByCommentId.value[commentId] = appendMention(
      replyDraftByCommentId.value[commentId],
      mentionName
    );
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

  const startReply = (commentId) => {
    activeReplyCommentId.value = commentId;
    replyDraftByCommentId.value[commentId] = replyDraftByCommentId.value[commentId] || "<p><br></p>";
  };

  const cancelReply = (commentId) => {
    if (activeReplyCommentId.value === commentId) {
      activeReplyCommentId.value = null;
    }
  };

  const submitReply = async (parentCommentId) => {
    if (!task.value?.id) return;

    const replyContent = replyDraftByCommentId.value[parentCommentId];
    if (isHtmlContentEmpty(replyContent)) return;

    try {
      await addCommentForTask(task.value.id, replyContent, currentUserName.value, parentCommentId);
      replyDraftByCommentId.value[parentCommentId] = "<p><br></p>";
      activeReplyCommentId.value = null;
    } catch (error) {
      console.error("Failed to post reply:", error);
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
    currentUserName,
    submitComment,
    openCommentComposer,
    cancelCommentComposer,
    startReply,
    cancelReply,
    submitReply,
    insertMentionInComment,
    insertMentionInReply,
    isHtmlContentEmpty,
    formatCommentDate,

    // quill
    toolbarOptions,
    formats,
    readOnlyOptions,
  };
}
