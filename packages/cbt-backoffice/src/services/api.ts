// src/services/api.ts
const API_URL = import.meta.env.VITE_API_URL as string

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  // HAPUS JWT token
  // const token = localStorage.getItem("access_token") // ← Hapus ini

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  // HAPUS Authorization header
  // if (token) {
  //   headers["Authorization"] = `Bearer ${token}`
  // }

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include', // ← INI YANG PENTING untuk cookie
  })

  if (!res.ok) {
    if (res.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    const errorText = await res.text()
    throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`)
  }

  const text = await res.text()

  if (!text) {
    console.warn(`Empty response from ${url} [${res.status}]`)
    return null as T
  }

  return JSON.parse(text) as T
}

export default {
  get: <T>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: "GET" }),
  post: <T>(url: string, body?: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: <T>(url: string, body?: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: <T>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: "DELETE" }),
}