import { type FormEvent, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

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
      navigate('/dashboard')
    } catch {
      setErro('E-mail ou senha inválidos.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="brand-stack">
          <div className="brand-mark nfc-glow">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div>
            <h1>EduPoints</h1>
            <p>Gestão de presença inteligente para instituições modernas</p>
          </div>
        </div>

        <form className="glass-panel login-card" onSubmit={handleLogin}>
          <label className="field">
            <span>E-mail</span>
            <div className="input-shell">
              <span className="material-symbols-outlined">mail</span>
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
              <span className="material-symbols-outlined">lock</span>
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
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>

        <p className="login-footnote">Acesso restrito a colaboradores</p>
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
