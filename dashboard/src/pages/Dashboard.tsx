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

type TurmaRanking = {
  id: string
  nome: string
  pontos: number
  totalAlunos?: number
}

type AlunoEncontrado = {
  id?: string
  nome: string
  matricula?: string
  pontos?: number
  turma?: { nome: string }
}

type AttendanceStatus = 'Presente' | 'Falta' | 'Justificada'
type AttendanceFilter = 'Todos' | AttendanceStatus

const demoCheckins: Checkin[] = [
  { aluno: { id: 1, nome: 'Ricardo Santos', pontos: 340, turma: 'Engenharia de Software' }, emRisco: false, horario: '2026-05-13T09:41:00' },
  { aluno: { id: 2, nome: 'Ana Julia Oliveira', pontos: 328, turma: 'Arquitetura' }, emRisco: false, horario: '2026-05-13T09:40:00' },
  { aluno: { id: 3, nome: 'Daniel Ferreira', pontos: 82, turma: 'Direito' }, emRisco: true, horario: '2026-05-13T09:39:00' },
  { aluno: { id: 4, nome: 'Elisa Ribeiro', pontos: 301, turma: 'Economia' }, emRisco: false, horario: '2026-05-13T09:38:00' },
]

const demoRanking: TurmaRanking[] = [
  { id: 'eng-computacao-a', nome: 'Eng. Computacao A', pontos: 980, totalAlunos: 32 },
  { id: 'medicina-4b', nome: 'Medicina 4B', pontos: 942, totalAlunos: 28 },
  { id: 'psicologia-noite', nome: 'Psicologia Noite', pontos: 918, totalAlunos: 30 },
  { id: 'direito-2a', nome: 'Direito 2A', pontos: 874, totalAlunos: 27 },
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

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined notranslate${className ? ` ${className}` : ''}`} translate="no" aria-hidden="true">
      {name}
    </span>
  )
}

export default function Dashboard({ view }: { view: EduPointsView }) {
  const [checkins, setCheckins] = useState<Checkin[]>(demoCheckins)
  const [alunosRisco, setAlunosRisco] = useState<AlunoRisco[]>(demoRisco)
  const [ranking, setRanking] = useState<TurmaRanking[]>(demoRanking)
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

    axios.get(`${API_URL}/turmas/ranking`, { headers })
      .then((res) => setRanking(keepPreviousWhenEmpty<TurmaRanking>(res.data)))
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
    <div className="app-shell notranslate" translate="no">
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
              <Icon name={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="main-pane">
        <header className="topbar">
          <div>
            <button className="mobile-icon-button" type="button" aria-label="Menu">
              <Icon name="menu" />
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
              <Icon name="logout" />
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
            <Icon name={item.icon} />
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
  ranking: TurmaRanking[]
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
                  <Icon name={checkin.emRisco ? 'error' : 'nfc'} />
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
              ranking.slice(0, 4).map((turma, index) => (
                <article className={`rank-card rank-${index + 1}`} key={turma.id}>
                  <Icon name="workspace_premium" />
                  <div>
                    <strong>{turma.nome}</strong>
                    <small>
                      {turma.pontos} pontos acumulados
                      {turma.totalAlunos ? ` • ${turma.totalAlunos} alunos` : ''}
                    </small>
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
        <Icon name={icon} />
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
          <Icon name="nfc" className="circle-icon nfc-glow" />
          <strong>Registrar Presenca</strong>
          <p>Inicie a leitura dos cartoes NFC dos alunos para validacao automatica.</p>
        </button>
        <button className="action-card secondary" onClick={() => navigate('/presencas')} type="button">
          <Icon name="analytics" className="circle-icon" />
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
        <Icon name="logout" />
        Sair
      </button>
    </main>
  )
}

function NfcView({ token }: { token: string | null }) {
  const [codigoManual, setCodigoManual] = useState('')
  const [registrando, setRegistrando] = useState(false)
  const [justificando, setJustificando] = useState(false)

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

  const justificarFalta = async () => {
    const resultado = await Swal.fire({
      ...swalTheme,
      title: 'Justificar falta',
      input: 'text',
      inputValue: codigoManual,
      inputLabel: 'Codigo ou matricula do aluno',
      inputPlaceholder: 'Ex: 202600145',
      showCancelButton: true,
      confirmButtonText: 'Buscar aluno',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => value.trim() ? null : 'Informe o codigo do aluno.',
    })

    if (!resultado.isConfirmed || !resultado.value) {
      return
    }

    const codigoNormalizado = String(resultado.value).trim()

    if (token === 'edupoints-demo') {
      await Swal.fire({
        ...swalTheme,
        title: 'Falta justificada!',
        text: 'Modo demo: a justificativa foi registrada para Erick Saraiva.',
        icon: 'success',
      })
      setCodigoManual('')
      return
    }

    setJustificando(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const alunoResponse = await axios.get(
        `${API_URL}/alunos/tag/${encodeURIComponent(codigoNormalizado)}`,
        { headers },
      )
      const aluno = alunoResponse.data as AlunoEncontrado

      if (!aluno.id) {
        throw new Error('Aluno sem identificador.')
      }

      const detalhes = [
        `Aluno: ${aluno.nome}`,
        aluno.matricula ? `Matricula: ${aluno.matricula}` : '',
        aluno.turma?.nome ? `Turma: ${aluno.turma.nome}` : '',
      ].filter(Boolean).join('\n')

      const confirmacao = await Swal.fire({
        ...swalTheme,
        title: 'Confirmar justificativa?',
        text: detalhes,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Justificar falta',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
      })

      if (!confirmacao.isConfirmed) {
        return
      }

      await axios.post(
        `${API_URL}/presencas/justificada`,
        { alunoId: aluno.id, data: new Date().toISOString() },
        { headers },
      )

      await Swal.fire({
        ...swalTheme,
        title: 'Falta justificada!',
        text: `${aluno.nome} foi marcado como falta justificada.`,
        icon: 'success',
      })
      setCodigoManual('')
    } catch (error) {
      const mensagem = axios.isAxiosError(error)
        ? error.response?.data?.erro || 'Erro ao justificar falta.'
        : 'Erro ao justificar falta.'

      await Swal.fire({
        ...swalTheme,
        title: 'Nao foi possivel justificar',
        text: mensagem,
        icon: 'error',
      })
    } finally {
      setJustificando(false)
    }
  }

  return (
    <main className="nfc-view">
      <section className="nfc-header">
        <div>
          <span>Chamada NFC</span>
          <h1>Registro de Presenca</h1>
          <p>Preencha o codigo do aluno para validar a presenca e atualizar o painel da aula.</p>
        </div>
        <div className="nfc-session-chip">
          <Icon name="edit_note" />
          Registro manual
        </div>
      </section>

      <section className="nfc-dashboard-layout">
        <section className="panel manual-actions manual-actions-primary">
          <div className="section-title">
            <h2>Registro manual</h2>
            <span>Prioritario</span>
          </div>

          <div className="manual-form-copy">
            <Icon name="badge" />
            <div>
              <strong>Identificacao do aluno</strong>
              <span>Digite o codigo de matricula ou codigo NFC informado pelo aluno.</span>
            </div>
          </div>

          <div className="nfc-code-form">
            <label className="field">
              <span>Codigo do aluno</span>
              <div className="input-shell">
                <Icon name="badge" />
                <input
                  value={codigoManual}
                  onChange={(event) => setCodigoManual(event.target.value)}
                  placeholder="Ex: 202600145"
                />
              </div>
            </label>
            <button type="button" onClick={() => registrarPresenca(codigoManual, 'Código')} disabled={registrando}>
              <Icon name="person_search" />
              {registrando ? 'Registrando...' : 'Registrar presenca'}
            </button>
          </div>

          <button type="button" onClick={justificarFalta} disabled={justificando}>
            <Icon name="history_edu" />
            {justificando ? 'Justificando...' : 'Justificar falta'}
          </button>
        </section>

        <aside className="nfc-side-panel">
          <section className="mini-stats">
            <MetricCard label="Presentes" value="24/30" tone="primary" detail="Aula em curso" icon="groups" />
            <MetricCard label="Tempo restante" value="12:45" tone="neutral" detail="Fisica II" icon="schedule" />
          </section>

          <section className="panel nfc-class-summary">
            <div>
              <span>Turma</span>
              <strong>Fisica II</strong>
            </div>
            <div>
              <span>Sala</span>
              <strong>Bloco B - 204</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>Em andamento</strong>
            </div>
          </section>
        </aside>
      </section>
    </main>
  )
}

function AttendanceView({ presencaGeral }: { presencaGeral: number }) {
  const [filtroAtivo, setFiltroAtivo] = useState<AttendanceFilter>('Todos')
  const filtros: AttendanceFilter[] = ['Todos', 'Presente', 'Falta', 'Justificada']
  const linhasFiltradas = filtroAtivo === 'Todos'
    ? attendanceRows
    : attendanceRows.filter((row) => row.status === filtroAtivo)

  const labels: Record<AttendanceFilter, string> = {
    Todos: 'Todos',
    Presente: 'Presentes',
    Falta: 'Faltas',
    Justificada: 'Justificadas',
  }

  const contarFiltro = (filtro: AttendanceFilter) => (
    filtro === 'Todos'
      ? attendanceRows.length
      : attendanceRows.filter((row) => row.status === filtro).length
  )

  return (
    <main className="attendance-view">
      <section className="class-header">
        <div>
          <h1>Ciência da Computação</h1>
          <p>7º periodo - Noturno</p>
          <div>
            <span><Icon name="calendar_today" />13 de Maio, 2026</span>
            <span><Icon name="schedule" />08:00 - 10:00</span>
          </div>
        </div>
        <article className="panel progress-card">
          <p>Presenca geral</p>
          <strong>{presencaGeral}%</strong>
          <span>+2% vs ultima aula</span>
        </article>
      </section>

      <section className="filter-row">
        {filtros.map((filtro) => (
          <button
            className={filtroAtivo === filtro ? 'active' : ''}
            key={filtro}
            onClick={() => setFiltroAtivo(filtro)}
            type="button"
          >
            {labels[filtro]} ({contarFiltro(filtro)})
          </button>
        ))}
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
            {linhasFiltradas.map((row) => (
              <tr key={`${row.matricula}-${row.nome}`}>
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
        {linhasFiltradas.length === 0 ? (
          <p className="empty-state">Nenhuma presença encontrada para este filtro.</p>
        ) : null}
      </section>
    </main>
  )
}
