import { useAuth } from "@/composables/useAuth";
import { useAxio } from "@/composables/useAxio";
import { ref } from "vue";

const normalizeComment = (comment) => ({
  id: comment.id,
  content: comment.content,
  userId: comment.user_id || comment.user?.id || null,
  parentId: comment.parent_id || null,
  authorName: comment.user?.name || comment.author_name || "User",
  createdAt: comment.created_at || comment.createdAt,
  replies: (comment.replies || []).map(normalizeComment),
});

export function useComments() {
  const comments = ref([]);
  const mentionableUsers = ref([]);
  const { api } = useAxio();
  const { token } = useAuth();

  const authHeaders = () =>
    token.value
      ? {
          Authorization: `Bearer ${token.value}`,
        }
      : {};

  const loadCommentsForTask = async (taskId) => {
    if (!taskId) {
      comments.value = [];
      return;
    }

    try {
      const { data } = await api.get(`/tasks/${taskId}/comments`, {
        headers: authHeaders(),
      });
      comments.value = (data || []).map(normalizeComment);
    } catch (error) {
      console.error("Failed to load comments:", error);
      comments.value = [];
    }
  };

  const loadMentionableUsers = async (taskId) => {
    if (!taskId) {
      mentionableUsers.value = [];
      return;
    }

    try {
      const { data } = await api.get(`/tasks/${taskId}/mentionable-users`, {
        headers: authHeaders(),
      });
      mentionableUsers.value = data || [];
    } catch (error) {
      console.error("Failed to load mentionable users:", error);
      mentionableUsers.value = [];
    }
  };

  const addCommentForTask = async (taskId, content, authorName = "User", parentId = null) => {
    const text = content?.trim();
    if (!taskId || !text) return;

    try {
      await api.post(
        `/tasks/${taskId}/comments`,
        {
          content: text,
          author_name: authorName,
          parent_id: parentId,
        },
        {
          headers: authHeaders(),
        }
      );

      await loadCommentsForTask(taskId);
    } catch (error) {
      console.error("Failed to save comment:", error);
      throw error;
    }
  };

  const updateCommentForTask = async (taskId, commentId, content) => {
    const text = content?.trim();
    if (!taskId || !commentId || !text) return;

    try {
      await api.patch(
        `/tasks/${taskId}/comments/${commentId}`,
        { content: text },
        { headers: authHeaders() }
      );
      await loadCommentsForTask(taskId);
    } catch (error) {
      console.error("Failed to update comment:", error);
      throw error;
    }
  };

  const deleteCommentForTask = async (taskId, commentId) => {
    if (!taskId || !commentId) return;

    try {
      await api.delete(`/tasks/${taskId}/comments/${commentId}`, {
        headers: authHeaders(),
      });
      await loadCommentsForTask(taskId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      throw error;
    }
  };

  return {
    comments,
    mentionableUsers,
    loadCommentsForTask,
    loadMentionableUsers,
    addCommentForTask,
    updateCommentForTask,
    deleteCommentForTask,
  };
}
