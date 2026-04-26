export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(url, { ...options, headers });
}
