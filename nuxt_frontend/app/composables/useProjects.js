// composables/useProjects.js
import { useAuth } from "~/composables/useAuth";
import { resolveApiBase } from "~/composables/useApi";
import { onMounted, ref } from "vue";

export function useProjects() {
  const runtimeConfig = useRuntimeConfig();
  const API_BASE = resolveApiBase(runtimeConfig);
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
          ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
        },
      });

      if (!res.ok) {
        const responseText = await res.text().catch(() => "");
        throw new Error(
          `Failed to fetch projects: ${res.status}${responseText ? ` - ${responseText}` : ""}`
        );
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
