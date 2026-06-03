import { type FormEvent, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Icon({ name }: { name: string }) {
  return (
    <span className="material-symbols-outlined notranslate" translate="no" aria-hidden="true">
      {name}
    </span>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const response = await axios.post('http://localhost:3333/auth/login', {
        email,
        senha,
      })

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('professor', JSON.stringify(response.data.professor))
      navigate('/inicio')
    } catch {
      setErro('E-mail ou senha inválidos.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-brand-panel">
          <div className="brand-stack">
            <div className="brand-mark nfc-glow">
              <Icon name="school" />
            </div>
            <div>
              <span className="brand-kicker">EduTech Campus</span>
              <h1>EduPoints</h1>
            </div>
          </div>

          <div className="login-statement">
            <p>Conecte presença, engajamento e desempenho em uma jornada acadêmica mais inteligente.</p>
            <span>Frequência com NFC, alertas de risco e pontuação em tempo real.</span>
          </div>

          <div className="login-highlights" aria-label="Destaques do sistema">
            <div>
              <strong>NFC</strong>
              <span>Chamada rápida</span>
            </div>
            <div>
              <strong>Live</strong>
              <span>Dados em tempo real</span>
            </div>
            <div>
              <strong>IA</strong>
              <span>Busca ativa</span>
            </div>
          </div>
        </div>

        <div className="login-access-panel">
          <form className="glass-panel login-card" onSubmit={handleLogin}>
            <div className="login-card-heading">
              <span>Acesso institucional</span>
              <h2>Entrar no painel</h2>
            </div>

            <label className="field">
              <span>E-mail</span>
              <div className="input-shell">
                <Icon name="mail" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nome@instituicao.edu"
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="field password-field">
              <span>
                Senha
                <a href="#" onClick={(event) => event.preventDefault()}>
                  Esqueceu a senha?
                </a>
              </span>
              <div className="input-shell">
                <Icon name="lock" />
                <input
                  type="password"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </label>

            {erro ? <p className="form-error">{erro}</p> : null}

            <button className="primary-action" type="submit" disabled={carregando}>
              <span>{carregando ? 'Entrando...' : 'Entrar'}</span>
              <Icon name="arrow_forward" />
            </button>
          </form>

          <p className="login-footnote">Acesso restrito a colaboradores</p>
        </div>
      </section>

      <footer className="login-footer">
        <p>© 2026 EduPoints</p>
        <p>Sistema de controle de frequência</p>
         
        <nav aria-label="Links institucionais">
          <a href="#" onClick={(event) => event.preventDefault()}>Políticas</a>
          <a href="#" onClick={(event) => event.preventDefault()}>Privacidade</a>
          <a href="#" onClick={(event) => event.preventDefault()}>Ajuda</a>
        </nav>
      </footer>
    </main>
  )
}
