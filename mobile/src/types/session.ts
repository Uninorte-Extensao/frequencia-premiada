export type Perfil = 'aluno' | 'professor'

export type Aluno = {
  id: string
  nome: string
  apelido?: string | null
  matricula: string
  turmaId: string
  pontos: number
  primeiro_acesso: boolean
  termo_versao?: string | null
  termo_ciente_em?: string | null
  turma?: { id: string; nome: string }
}

export type Professor = {
  id: string
  nome: string
  email: string
}

export type Sessao =
  | { perfil: 'aluno'; token: string; usuario: Aluno }
  | { perfil: 'professor'; token: string; usuario: Professor }

export function sessaoValida(valor: unknown): valor is Sessao {
  if (!valor || typeof valor !== 'object') return false
  const sessao = valor as Record<string, unknown>
  const usuario = sessao.usuario as Record<string, unknown> | undefined
  if (typeof sessao.token !== 'string' || !usuario || typeof usuario.id !== 'string' || typeof usuario.nome !== 'string') return false
  if (sessao.perfil === 'aluno') return typeof usuario.matricula === 'string' && typeof usuario.turmaId === 'string' && typeof usuario.primeiro_acesso === 'boolean'
  if (sessao.perfil === 'professor') return typeof usuario.email === 'string'
  return false
}
