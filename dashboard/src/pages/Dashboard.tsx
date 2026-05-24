import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import heroAsset from '../assets/hero.png'

const API_URL = 'http://localhost:3333'

export type EduPointsView = 'director' | 'home' | 'nfc' | 'attendance'

type Checkin = {
  aluno: {
    id: number
    nome: string
    pontos: number
    turma: string
  }
  emRisco: boolean
  horario: string
}

type AlunoRisco = {
  id: number
  nome: string
  turma: { nome: string }
}

type AlunoRanking = {
  id: number
  nome: string
  pontos: number
  turma: { nome: string }
}

type AlunoEncontrado = {
  nome: string
  matricula?: string
  pontos?: number
  turma?: { nome: string }
}

type Turma = {
  id: string
  nome: string
}

type AttendanceStatus = 'Presente' | 'Falta' | 'Justificada'

const demoCheckins: Checkin[] = [
  { aluno: { id: 1, nome: 'Ricardo Santos', pontos: 340, turma: 'Engenharia de Software' }, emRisco: false, horario: '2026-05-13T09:41:00' },
  { aluno: { id: 2, nome: 'Ana Julia Oliveira', pontos: 328, turma: 'Arquitetura' }, emRisco: false, horario: '2026-05-13T09:40:00' },
  { aluno: { id: 3, nome: 'Daniel Ferreira', pontos: 82, turma: 'Direito' }, emRisco: true, horario: '2026-05-13T09:39:00' },
  { aluno: { id: 4, nome: 'Elisa Ribeiro', pontos: 301, turma: 'Economia' }, emRisco: false, horario: '2026-05-13T09:38:00' },
]

const demoRanking: AlunoRanking[] = [
  { id: 1, nome: 'Ana Silva', pontos: 980, turma: { nome: 'Eng. Computacao A' } },
  { id: 2, nome: 'Bruno Rocha', pontos: 942, turma: { nome: 'Medicina 4B' } },
  { id: 3, nome: 'Kauã Caçula', pontos: 918, turma: { nome: 'Psicologia Noite' } },
  { id: 4, nome: 'Felipe Eduardo', pontos: 874, turma: { nome: 'Direito 2A' } },
]

const demoRisco: AlunoRisco[] = [
  { id: 11, nome: 'Wesley Batista', turma: { nome: 'Direito 2A' } },
  { id: 12, nome: 'Juliana Salgado', turma: { nome: 'Eng. Computacao A' } },
  { id: 13, nome: 'Angelo Garcia', turma: { nome: 'Psicologia Noite' } },
]

const attendanceRows: Array<{ nome: string; matricula: string; status: AttendanceStatus; pontos: number }> = [
  { nome: 'Erick Freitas', matricula: '202300124', status: 'Presente', pontos: 980 },
  { nome: 'Amanda Greice', matricula: '202300189', status: 'Falta', pontos: 942 },
  { nome: 'Yvens Henrich', matricula: '202300255', status: 'Justificada', pontos: 918 },
  { nome: 'Emanuel Bastos', matricula: '202300312', status: 'Presente', pontos: 874 },
  { nome: 'Ana Karoline', matricula: '202300418', status: 'Presente', pontos: 850 },
  { nome: 'Gabriel José', matricula: '202300418', status: 'Presente', pontos: 840 },
  { nome: 'Kauê Batista', matricula: '202300418', status: 'Presente', pontos: 840 },
  { nome: 'Thiago Rafael', matricula: '202300418', status: 'Presente', pontos: 830 },
  { nome: 'Alessandra Conceição', matricula: '202300418', status: 'Presente', pontos: 830 },
  { nome: 'Monique Farias', matricula: '202300418', status: 'Presente', pontos: 820 },
  { nome: 'Oziel Coelho ', matricula: '202300418', status: 'Presente', pontos: 820 },

]

const navItems: Array<{ view: EduPointsView; label: string; icon: string; path: string }> = [
  { view: 'director', label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
  { view: 'home', label: 'Inicio', icon: 'home', path: '/inicio' },
  { view: 'nfc', label: 'Chamada NFC', icon: 'nfc', path: '/chamada' },
  { view: 'attendance', label: 'Presencas', icon: 'analytics', path: '/presencas' },
]

const socket = io('http://localhost:3333', { autoConnect: false })

function getResponseArray<T>(data: unknown): T[] {
  return Array.isArray(data) ? data : []
}

function keepPreviousWhenEmpty<T>(data: unknown) {
  const next = getResponseArray<T>(data)
  return (previous: T[]) => (next.length > 0 ? next : previous)
}

function initials(nome: string) {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
}

function StatusChip({ status }: { status: AttendanceStatus }) {
  const className = status === 'Presente' ? 'success' : status === 'Falta' ? 'danger' : 'pending'

  return (
    <span className={`status-chip ${className}`}>
      <span />
      {status}
    </span>
  )
}

export default function Dashboard({ view }: { view: EduPointsView }) {
  const [checkins, setCheckins] = useState<Checkin[]>(demoCheckins)
  const [alunosRisco, setAlunosRisco] = useState<AlunoRisco[]>(demoRisco)
  const [ranking, setRanking] = useState<AlunoRanking[]>(demoRanking)
  const [conectado, setConectado] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const professor = useMemo(() => JSON.parse(localStorage.getItem('professor') || '{}'), [])

  useEffect(() => {
    if (!token || token === 'edupoints-demo') {
      return
    }

    const headers = { Authorization: `Bearer ${token}` }

    axios.get(`${API_URL}/checkin/risco`, { headers })
      .then((res) => setAlunosRisco(keepPreviousWhenEmpty<AlunoRisco>(res.data)))
      .catch(() => setAlunosRisco((previous) => (previous.length > 0 ? previous : demoRisco)))

    axios.get(`${API_URL}/turmas`, { headers })
      .then((turmasResponse) => {
        const turmas = getResponseArray<Turma>(turmasResponse.data)
        const primeiraTurma = turmas[0]

        if (!primeiraTurma?.id) {
          return null
        }

        return axios.get(`${API_URL}/alunos/ranking/${primeiraTurma.id}`, { headers })
      })
      .then((rankingResponse) => {
        if (rankingResponse) {
          setRanking(keepPreviousWhenEmpty<AlunoRanking>(rankingResponse.data))
        }
      })
      .catch(() => setRanking((previous) => (previous.length > 0 ? previous : demoRanking)))

    socket.connect()
    socket.on('connect', () => setConectado(true))
    socket.on('disconnect', () => setConectado(false))
    socket.on('presenca:nova', (data) => {
      const novaPresenca: Checkin = {
        aluno: {
          id: data.aluno.id,
          nome: data.aluno.nome,
          pontos: data.aluno.pontos,
          turma: data.aluno.turma?.nome || 'Turma',
        },
        emRisco: data.emRisco || false,
        horario: data.data || new Date().toISOString(),
      }

      setCheckins((prev) => [novaPresenca, ...prev].slice(0, 20))
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('presenca:nova')
      socket.disconnect()
    }
  }, [token])

  const totalHoje = checkins.length + 1280
  const presencaGeral = Math.round((attendanceRows.filter((row) => row.status !== 'Falta').length / attendanceRows.length) * 100)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('professor')
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="side-nav">
        <div className="side-brand">EduPoints</div>
        <div className="profile-block">
          <div className="avatar">DA</div>
          <div>
            <strong>{professor?.perfil || 'Diretoria Academica'}</strong>
            <span>Admin Console</span>
          </div>
        </div>
        <nav>
          {navItems.map((item) => (
            <button
              className={view === item.view ? 'active' : ''}
              key={item.view}
              onClick={() => navigate(item.path)}
              type="button"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="main-pane">
        <header className="topbar">
          <div>
            <button className="mobile-icon-button" type="button" aria-label="Menu">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <strong>EduPoints</strong>
            <span className={`live-pill ${conectado || token === 'edupoints-demo' ? 'online' : ''}`}>
              <span />
              {conectado || token === 'edupoints-demo' ? 'Live: Campus Central' : 'Conectando'}
            </span>
          </div>
          <div className="topbar-user">
            <span>{professor?.nome || 'Prof. Ricardo Silva'}</span>
            <button className="icon-button" onClick={handleLogout} type="button" aria-label="Sair">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </header>

        {view === 'director' ? (
          <DirectorDashboard
            totalHoje={totalHoje}
            alunosRisco={alunosRisco}
            ranking={ranking}
            checkins={checkins}
          />
        ) : null}
        {view === 'home' ? <HomeView navigate={navigate} handleLogout={handleLogout} /> : null}
        {view === 'nfc' ? <NfcView token={token} /> : null}
        {view === 'attendance' ? <AttendanceView presencaGeral={presencaGeral} /> : null}
      </div>

      <nav className="bottom-nav">
        {navItems.map((item) => (
          <button
            className={view === item.view ? 'active' : ''}
            key={item.view}
            onClick={() => navigate(item.path)}
            type="button"
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <small>{item.label}</small>
          </button>
        ))}
      </nav>
    </div>
  )
}

function DirectorDashboard({
  totalHoje,
  alunosRisco,
  ranking,
  checkins,
}: {
  totalHoje: number
  alunosRisco: AlunoRisco[]
  ranking: AlunoRanking[]
  checkins: Checkin[]
}) {
  return (
    <main className="content-grid">
      <section className="summary-grid">
        <MetricCard label="Check-ins hoje" value={totalHoje.toLocaleString('pt-BR')} tone="primary" detail="+12% vs ontem" icon="trending_up" />
        <MetricCard label="Alunos em risco" value={alunosRisco.length.toString()} tone="danger" detail="Acao requerida" icon="warning" />
        <MetricCard label="Total cadastrado" value="3.500" tone="neutral" detail="98% ativos" icon="person" />
      </section>

      <section className="director-layout">
        <div className="panel monitor-panel">
          <div className="section-title">
            <h2>Monitoramento</h2>
            <span>NFC Live</span>
          </div>
          <div className="feed-list">
            {checkins.map((checkin) => (
              <article className={checkin.emRisco ? 'feed-item alert' : 'feed-item'} key={`${checkin.aluno.id}-${checkin.horario}`}>
                <div className="feed-icon">
                  <span className="material-symbols-outlined">{checkin.emRisco ? 'error' : 'nfc'}</span>
                </div>
                <div>
                  <strong>{checkin.aluno.nome}</strong>
                <span>{checkin.aluno.turma} • {new Date(checkin.horario).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <i />
            </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-title">
            <h2>Ranking de Turmas</h2>
          </div>
          <div className="ranking-list">
            {ranking.length > 0 ? (
              ranking.slice(0, 4).map((aluno, index) => (
                <article className={`rank-card rank-${index + 1}`} key={aluno.id}>
                  <span className="material-symbols-outlined">workspace_premium</span>
                  <div>
                    <strong>{aluno.turma?.nome || aluno.nome}</strong>
                    <small>{aluno.pontos} pontos acumulados</small>
                  </div>
                  <b>{index + 1}º</b>
                </article>
              ))
            ) : (
              <p className="empty-state">Nenhum ranking encontrado.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="section-title">
            <h2>Faltas Criticas</h2>
            <span className="danger-text">Busca ativa</span>
          </div>
          <div className="risk-list">
            {alunosRisco.length > 0 ? (
              alunosRisco.map((aluno) => (
                <article key={aluno.id}>
                  <div className="avatar danger">{initials(aluno.nome)}</div>
                  <div>
                    <strong>{aluno.nome}</strong>
                    <span>{aluno.turma?.nome || 'Turma'} • 3 faltas consecutivas</span>
                  </div>
                  <button type="button">Notificar</button>
                </article>
              ))
            ) : (
              <p className="empty-state">Nenhum aluno com faltas criticas.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function MetricCard({ label, value, detail, tone, icon }: { label: string; value: string; detail: string; tone: 'primary' | 'danger' | 'neutral'; icon: string }) {
  return (
    <article className={`metric-card ${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>
        <span className="material-symbols-outlined">{icon}</span>
        {detail}
      </span>
    </article>
  )
}

function HomeView({ navigate, handleLogout }: { navigate: (path: string) => void; handleLogout: () => void }) {
  return (
    <main className="home-view">
      <section className="hero-copy">
        <h1>Ola, Professor</h1>
        <p>Pronto para gerenciar suas turmas hoje?</p>
      </section>

      <section className="action-grid">
        <button className="action-card" onClick={() => navigate('/chamada')} type="button">
          <span className="circle-icon nfc-glow material-symbols-outlined">nfc</span>
          <strong>Registrar Presenca</strong>
          <p>Inicie a leitura dos cartoes NFC dos alunos para validacao automatica.</p>
        </button>
        <button className="action-card secondary" onClick={() => navigate('/presencas')} type="button">
          <span className="circle-icon material-symbols-outlined">analytics</span>
          <strong>Ver Presencas</strong>
          <p>Consulte historico, relatorios de faltas e estatisticas da turma.</p>
        </button>
      </section>

      <section className="campus-strip">
        <img src={heroAsset} alt="Camadas abstratas do sistema EduPoints" />
        <div>
          <span>Sistema ativo</span>
          <strong>Escola Municipal • Bloco B</strong>
        </div>
      </section>

      <button className="logout-button" onClick={handleLogout} type="button">
        <span className="material-symbols-outlined">logout</span>
        Sair
      </button>
    </main>
  )
}

function NfcView({ token }: { token: string | null }) {
  const [codigoManual, setCodigoManual] = useState('')
  const [registrando, setRegistrando] = useState(false)

  const swalTheme = {
    background: '#1d2027',
    color: '#e1e2ec',
    confirmButtonColor: '#4d8eff',
    cancelButtonColor: '#424754',
  }

  const confirmarPresenca = async (aluno: AlunoEncontrado, codigo: string, origem: 'NFC' | 'Código') => {
    const detalhes = [
      `${origem}: ${codigo}`,
      `Aluno: ${aluno.nome}`,
      aluno.matricula ? `Matrícula: ${aluno.matricula}` : '',
      aluno.turma?.nome ? `Turma: ${aluno.turma.nome}` : '',
    ].filter(Boolean).join('\n')

    const resultado = await Swal.fire({
      ...swalTheme,
      title: 'Confirmar presença?',
      text: detalhes,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Registrar presença',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })

    return resultado.isConfirmed
  }

  const registrarPresenca = async (codigo: string, origem: 'NFC' | 'Código') => {
    const codigoNormalizado = codigo.trim()

    if (!codigoNormalizado) {
      await Swal.fire({
        ...swalTheme,
        title: 'Código obrigatório',
        text: 'Informe o código do aluno ou use a leitura NFC.',
        icon: 'warning',
      })
      return
    }

    if (token === 'edupoints-demo') {
      const confirmado = await confirmarPresenca(
        { nome: 'Erick Saraiva', matricula: '202600145', turma: { nome: 'Matemática' } },
        codigoNormalizado,
        origem,
      )

      if (confirmado) {
        await Swal.fire({
          ...swalTheme,
          title: 'Presença registrada!',
          text: 'Modo demo: Erick Saraiva recebeu +10 pontos.',
          icon: 'success',
        })
        setCodigoManual('')
      }
      return
    }

    setRegistrando(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const alunoResponse = await axios.get(
        `http://localhost:3333/alunos/tag/${encodeURIComponent(codigoNormalizado)}`,
        { headers },
      )

      const confirmado = await confirmarPresenca(alunoResponse.data, codigoNormalizado, origem)

      if (!confirmado) {
        return
      }

      await axios.post(
        'http://localhost:3333/checkin',
        { tag_nfc: codigoNormalizado, disciplinaId: 1 },
        { headers },
      )

      await Swal.fire({
        ...swalTheme,
        title: 'Presença registrada!',
        text: `${alunoResponse.data.nome} recebeu +10 pontos.`,
        icon: 'success',
      })
      setCodigoManual('')
    } catch (error) {
      const mensagem = axios.isAxiosError(error)
        ? error.response?.data?.erro || 'Erro ao registrar presença.'
        : 'Erro ao registrar presença.'

      await Swal.fire({
        ...swalTheme,
        title: 'Não foi possível registrar',
        text: mensagem,
        icon: 'error',
      })
    } finally {
      setRegistrando(false)
    }
  }

  const solicitarTagNfc = async () => {
    const resultado = await Swal.fire({
      ...swalTheme,
      title: 'Tag NFC aproximada',
      input: 'text',
      inputLabel: 'Confirme o código lido na tag',
      inputPlaceholder: 'Ex: 04A1B2C3D4',
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => value.trim() ? null : 'Informe o código da tag.',
    })

    if (resultado.isConfirmed && resultado.value) {
      await registrarPresenca(resultado.value, 'NFC')
    }
  }

  return (
    <main className="nfc-view">
      <section className="hero-copy center">
        <h1>Registro de Presenca</h1>
        <p>Aproxime a tag do aluno</p>
      </section>

      <button className="nfc-button" type="button" aria-label="Escanear NFC" onClick={solicitarTagNfc} disabled={registrando}>
        <span className="material-symbols-outlined">nfc</span>
      </button>

      <section className="scan-result panel">
        <div className="avatar">LO</div>
        <div>
          <strong>Lucas Oliveira</strong>
          <span><span className="material-symbols-outlined">check_circle</span> Check-in realizado</span>
        </div>
        <b>+10 pts</b>
      </section>

      <section className="mini-stats">
        <MetricCard label="Presentes" value="24/30" tone="primary" detail="Aula em curso" icon="groups" />
        <MetricCard label="Tempo restante" value="12:45" tone="neutral" detail="Fisica II" icon="schedule" />
      </section>

      <section className="manual-actions">
        <h2>Registro manual</h2>
        <div className="nfc-code-form">
          <div className="input-shell">
            <span className="material-symbols-outlined">badge</span>
            <input
              value={codigoManual}
              onChange={(event) => setCodigoManual(event.target.value)}
              placeholder="Código do aluno ou tag NFC"
            />
          </div>
          <button type="button" onClick={() => registrarPresenca(codigoManual, 'Código')} disabled={registrando}>
            <span className="material-symbols-outlined">person_search</span>
            {registrando ? 'Registrando...' : 'Confirmar código'}
          </button>
        </div>
        <button type="button"><span className="material-symbols-outlined">history_edu</span>Justificar falta</button>
      </section>
    </main>
  )
}

function AttendanceView({ presencaGeral }: { presencaGeral: number }) {
  return (
    <main className="attendance-view">
      <section className="class-header">
        <div>
          <h1>Ciência da Computação</h1>
          <p>7º periodo - Noturno</p>
          <div>
            <span><span className="material-symbols-outlined">calendar_today</span>13 de Maio, 2026</span>
            <span><span className="material-symbols-outlined">schedule</span>08:00 - 10:00</span>
          </div>
        </div>
        <article className="panel progress-card">
          <p>Presenca geral</p>
          <strong>{presencaGeral}%</strong>
          <span>+2% vs ultima aula</span>
        </article>
      </section>

      <section className="filter-row">
        <button className="active" type="button">Todos ({attendanceRows.length})</button>
        <button type="button">Presentes (3)</button>
        <button type="button">Faltas (1)</button>
        <button type="button">Justificadas (1)</button>
      </section>

      <section className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Estudante</th>
              <th>Matricula</th>
              <th>Status</th>
              <th>Pontos</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRows.map((row) => (
              <tr key={row.matricula}>
                <td>
                  <div className="student-cell">
                    <div className="avatar">{initials(row.nome)}</div>
                    <strong>{row.nome}</strong>
                  </div>
                </td>
                <td>{row.matricula}</td>
                <td><StatusChip status={row.status} /></td>
                <td>{row.pontos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
