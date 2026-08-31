const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()

export const API_URL = (
  configuredApiUrl || 'http://localhost:3333'
).replace(/\/+$/, '')