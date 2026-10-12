import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { api, configurarSessaoExpirada, configurarToken } from '../services/api'
import { lerSessao, limparSessaoArmazenada, salvarSessao } from '../services/sessionStorage'
import { Aluno, Sessao } from '../types/session'

type AuthContextValue = {
  sessao: Sessao | null
  carregando: boolean
  aviso: string | null
  entrar: (sessao: Sessao) => Promise<void>
  atualizarAluno: (aluno: Aluno) => Promise<void>
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
        if (armazenada.perfil === 'aluno') {
          const { data } = await api.get<Aluno>('/alunos/me')
          const restaurada: Sessao = { ...armazenada, usuario: data }
          await salvarSessao(restaurada)
          setSessao(restaurada)
        } else {
          await api.get('/auth/me')
          setSessao(armazenada)
        }
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

  const atualizarAluno = async (aluno: Aluno) => {
    if (sessao?.perfil !== 'aluno') return
    const atualizada: Sessao = { ...sessao, usuario: aluno }
    await salvarSessao(atualizada)
    setSessao(atualizada)
  }

  return <AuthContext.Provider value={{ sessao, carregando, aviso, entrar, atualizarAluno, sair, limparAviso: () => setAviso(null) }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
