import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'http://localhost:3333'

interface Aluno {
  id: number
  nome: string
  pontos: number
  turma: { nome: string }
}

const getNivel = (pontos: number) => {
  if (pontos >= 300) return { nome: 'Diamante', emoji: '💎', cor: '#a78bfa', corBg: 'rgba(167,139,250,0.15)', borda: 'rgba(167,139,250,0.4)', next: null,        falta: 0 }
  if (pontos >= 151) return { nome: 'Ouro',     emoji: '🥇', cor: '#f6c90e', corBg: 'rgba(246,201,14,0.15)',  borda: 'rgba(246,201,14,0.4)',  next: 300,       falta: 300 - pontos }
  if (pontos >= 51)  return { nome: 'Prata',    emoji: '🥈', cor: '#94a3b8', corBg: 'rgba(148,163,184,0.15)', borda: 'rgba(148,163,184,0.4)', next: 151,       falta: 151 - pontos }
  return             { nome: 'Bronze',           emoji: '🥉', cor: '#cd7f32', corBg: 'rgba(205,127,50,0.15)',  borda: 'rgba(205,127,50,0.4)',  next: 51,        falta: 51 - pontos }
}

const getProgresso = (pontos: number) => {
  if (pontos >= 300) return 100
  if (pontos >= 151) return ((pontos - 151) / (300 - 151)) * 100
  if (pontos >= 51)  return ((pontos - 51)  / (151 - 51))  * 100
  return (pontos / 51) * 100
}

const getCertificado = (pontos: number) => pontos >= 151

export default function Gamificacao() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState<string>('Todos')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  // No useEffect do Gamificacao.tsx
useEffect(() => {
  // Busca turmas primeiro para pegar o ID real
  axios.get(`${API_URL}/turmas`, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => {
      if (res.data.length > 0) {
        const turmaId = res.data[0].id  // pega a primeira turma
        return axios.get(`${API_URL}/alunos/ranking/${turmaId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    })
    .then(res => res && setAlunos(res.data))
    .catch(console.error)
    .finally(() => setCarregando(false))
}, [token])

  const niveis = ['Todos', 'Diamante', 'Ouro', 'Prata', 'Bronze']

  const alunosFiltrados = alunos.filter(a => {
    if (filtro === 'Todos') return true
    return getNivel(a.pontos).nome === filtro
  })

  const stats = {
    total:     alunos.length,
    diamante:  alunos.filter(a => getNivel(a.pontos).nome === 'Diamante').length,
    ouro:      alunos.filter(a => getNivel(a.pontos).nome === 'Ouro').length,
    prata:     alunos.filter(a => getNivel(a.pontos).nome === 'Prata').length,
    bronze:    alunos.filter(a => getNivel(a.pontos).nome === 'Bronze').length,
    comCert:   alunos.filter(a => getCertificado(a.pontos)).length,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', color: '#fff', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 14 }}>
            ← Dashboard
          </button>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <h1 style={{ margin: 0, fontSize: 20 }}>🏆 Gamificação</h1>
        </div>
        <span style={{ color: '#94a3b8', fontSize: 13 }}>9º Ano A</span>
      </div>

      <div style={{ padding: '28px 32px' }}>

        {/* Cards de stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total Alunos',  valor: stats.total,    cor: '#63b3ed', emoji: '👥' },
            { label: 'Diamante 💎',   valor: stats.diamante, cor: '#a78bfa', emoji: '' },
            { label: 'Ouro 🥇',       valor: stats.ouro,     cor: '#f6c90e', emoji: '' },
            { label: 'Prata 🥈',      valor: stats.prata,    cor: '#94a3b8', emoji: '' },
            { label: 'Bronze 🥉',     valor: stats.bronze,   cor: '#cd7f32', emoji: '' },
            { label: 'Com Certificado 📜', valor: stats.comCert, cor: '#48c78e', emoji: '' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 12, padding: '16px 12px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 6px', color: '#64748b', fontSize: 11 }}>{s.label}</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 'bold', color: s.cor }}>{carregando ? '...' : s.valor}</p>
            </div>
          ))}
        </div>

        {/* Níveis explicados */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { nome: 'Bronze',   emoji: '🥉', faixa: '0 – 50 pts',   cor: '#cd7f32', desc: 'Primeiros passos' },
            { nome: 'Prata',    emoji: '🥈', faixa: '51 – 150 pts',  cor: '#94a3b8', desc: 'Frequência regular' },
            { nome: 'Ouro',     emoji: '🥇', faixa: '151 – 300 pts', cor: '#f6c90e', desc: '📜 Certificado liberado!' },
            { nome: 'Diamante', emoji: '💎', faixa: '300+ pts',      cor: '#a78bfa', desc: 'Frequência exemplar' },
          ].map((n, i) => (
            <div key={i} style={{ background: `rgba(${n.cor === '#cd7f32' ? '205,127,50' : n.cor === '#94a3b8' ? '148,163,184' : n.cor === '#f6c90e' ? '246,201,14' : '167,139,250'},0.08)`, border: `1px solid ${n.cor}40`, borderRadius: 12, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 36 }}>{n.emoji}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', color: n.cor, fontSize: 15 }}>{n.nome}</p>
                <p style={{ margin: '2px 0', color: '#94a3b8', fontSize: 12 }}>{n.faixa}</p>
                <p style={{ margin: 0, color: '#64748b', fontSize: 11 }}>{n.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {niveis.map(n => (
            <button key={n} onClick={() => setFiltro(n)} style={{
              padding: '7px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: 13,
              background: filtro === n ? '#4299e1' : 'rgba(255,255,255,0.07)',
              color: filtro === n ? '#fff' : '#94a3b8',
            }}>{n}</button>
          ))}
        </div>

        {/* Lista de alunos */}
        {carregando ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Carregando...</p>
        ) : alunosFiltrados.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>Nenhum aluno neste nível.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {alunosFiltrados.map((aluno) => {
              const nivel = getNivel(aluno.pontos)
              const progresso = getProgresso(aluno.pontos)
              const temCert = getCertificado(aluno.pontos)
              const posicao = alunos.findIndex(a => a.id === aluno.id) + 1

              return (
                <div key={aluno.id} style={{ background: nivel.corBg, border: `1px solid ${nivel.borda}`, borderRadius: 14, padding: '18px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

                    {/* Posição */}
                    <span style={{ fontSize: 20, fontWeight: 'bold', color: nivel.cor, minWidth: 36 }}>
                      {posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : `${posicao}º`}
                    </span>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontWeight: 'bold', fontSize: 15 }}>{aluno.nome}</span>
                        <span style={{ background: nivel.corBg, border: `1px solid ${nivel.borda}`, color: nivel.cor, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>
                          {nivel.emoji} {nivel.nome}
                        </span>
                        {temCert && (
                          <span style={{ background: 'rgba(72,199,142,0.15)', border: '1px solid rgba(72,199,142,0.4)', color: '#48c78e', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 'bold' }}>
                            📜 Certificado
                          </span>
                        )}
                      </div>

                      {/* Barra de progresso */}
                      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, height: 8, width: '100%' }}>
                        <div style={{ background: nivel.cor, borderRadius: 10, height: 8, width: `${progresso}%`, transition: 'width 0.6s ease' }} />
                      </div>

                      {nivel.next && (
                        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b' }}>
                          Faltam {nivel.falta} pts para {nivel.nome === 'Bronze' ? 'Prata 🥈' : nivel.nome === 'Prata' ? 'Ouro 🥇' : 'Diamante 💎'}
                        </p>
                      )}
                    </div>

                    {/* Pontos */}
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontSize: 24, fontWeight: 'bold', color: nivel.cor }}>{aluno.pontos}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>pontos</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}