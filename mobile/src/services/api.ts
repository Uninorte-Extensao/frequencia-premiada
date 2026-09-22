import axios from 'axios'

const baseURL = process.env.EXPO_PUBLIC_API_URL

if (!baseURL) throw new Error('EXPO_PUBLIC_API_URL não está configurada')

export const api = axios.create({ baseURL, timeout: 12000 })

let aoExpirar: (() => void) | null = null

export function configurarToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`
  else delete api.defaults.headers.common.Authorization
}

export function configurarSessaoExpirada(callback: (() => void) | null) {
  aoExpirar = callback
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && aoExpirar) aoExpirar()
    return Promise.reject(error)
  },
)

export function mensagemErro(error: any) {
  if (!error.response) return 'Não foi possível conectar à API. Verifique sua internet.'
  return error.response.data?.erro || 'Não foi possível concluir a operação.'
}

