// composables/useProjects.js
import { useAuth } from "~/composables/useAuth";
import { onMounted, ref } from "vue";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export function useProjects() {
  const projects = ref([]);
  const pending = ref(false);
  const error = ref(null);

  // Import token from your authentication composable
  const { token } = useAuth();

  const fetchProjects = async () => {
    pending.value = true;
    error.value = null;

    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.value}`, // IMPORTANT
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch projects: ${res.status}`);
      }

      // Backend returns only the user's projects
      projects.value = await res.json();
    } catch (err) {
      error.value = err.message;
      console.error("Error loading projects:", err);
    } finally {
      pending.value = false;
    }
  };

  // Fetch projects automatically on mount
  onMounted(fetchProjects);

  return {
    projects,
    pending,
    error,
    fetchProjects, // expose fetch manually (optional)
  };
}
