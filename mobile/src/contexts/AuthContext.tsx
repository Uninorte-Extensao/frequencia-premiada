import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { api, configurarSessaoExpirada, configurarToken } from '../services/api'
import { lerSessao, limparSessaoArmazenada, salvarSessao } from '../services/sessionStorage'
import { Sessao } from '../types/session'

type AuthContextValue = {
  sessao: Sessao | null
  carregando: boolean
  aviso: string | null
  entrar: (sessao: Sessao) => Promise<void>
  sair: () => Promise<void>
  limparAviso: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [sessao, setSessao] = useState<Sessao | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [aviso, setAviso] = useState<string | null>(null)

  const sair = async () => {
    configurarToken(null)
    await limparSessaoArmazenada()
    setSessao(null)
  }

  useEffect(() => {
    configurarSessaoExpirada(() => {
      setAviso('Sua sessão expirou. Entre novamente.')
      void sair()
    })
    const restaurar = async () => {
      const armazenada = await lerSessao()
      if (!armazenada) return
      try {
        configurarToken(armazenada.token)
        await api.get('/auth/me')
        setSessao(armazenada)
      } catch {
        configurarToken(null)
        await limparSessaoArmazenada()
        setAviso('Não foi possível restaurar a sessão. Entre novamente.')
      }
    }
    restaurar().finally(() => setCarregando(false))
    return () => configurarSessaoExpirada(null)
  }, [])

  const entrar = async (novaSessao: Sessao) => {
    configurarToken(novaSessao.token)
    await salvarSessao(novaSessao)
    setAviso(null)
    setSessao(novaSessao)
  }

  return <AuthContext.Provider value={{ sessao, carregando, aviso, entrar, sair, limparAviso: () => setAviso(null) }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}

