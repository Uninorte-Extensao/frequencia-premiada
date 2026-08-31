const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim()

export const API_URL = (
  configuredApiUrl || 'http://localhost:3333'
).replace(/\/+$/, '')
