export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("user-token")
    if (!token) throw new Error("Token de autenticação ausente")
  
    const headers = new Headers(options.headers || {})
    headers.set("Authorization", `Bearer ${token}`)
  
    return fetch(url, {
      ...options,
      headers,
    })
  }
  