// src/api.js
// small helper to send requests to my backend API.

const API_BASE_URL = 'http://localhost:5001/api'

export async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await res.json().catch(() => ({}))

    if (!res.ok) {
    const status = res.status
    const statusText = res.statusText
    // build a friendly error message for the UI
    const baseMessage = data.message || `request failed with status ${status}`
    throw new Error(`${baseMessage} (${statusText || 'error'})`)
  }


  return data
}
