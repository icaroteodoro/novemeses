export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  const isFormData = options.body instanceof FormData;
  const hasBody = options.body !== undefined && options.body !== null;

  const headers = {
    ...(hasBody && !isFormData ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(url, {
    ...options,
    headers,
    cache: options.cache || "no-store"
  });
}
