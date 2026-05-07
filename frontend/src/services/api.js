const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("atende_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Erro ao comunicar com a API.");
  }

  if (response.status === 204) return null;
  return response.json();
}
