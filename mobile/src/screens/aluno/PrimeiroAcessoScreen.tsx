import { useCallback, useEffect, useState } from 'react'
import { ScrollView, Text } from 'react-native'
import { useAuth } from '../../contexts/AuthContext'
import { api, mensagemErro } from '../../services/api'
import { Button, Card, Empty, Loading, Screen, Subtitle, Title, colors } from '../../components/Ui'
import { Aluno } from '../../types/session'

type Termos = {
  versao: string
  sistema: string
  responsavel: string
  contato: string
  decisao: string
  finalidade: string
  baseLegal: string
  dadosColetados: Array<{ dado: string; finalidade: string }>
  direitosDoTitular: string[]
}

export default function PrimeiroAcessoScreen() {
  const { atualizarAluno, sair } = useAuth()
  const [termos, setTermos] = useState<Termos | null>(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    setErro('')
    try {
      const { data } = await api.get<Termos>('/lgpd/info')
      setTermos(data)
    } catch (error) {
      setErro(mensagemErro(error))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void carregar() }, [carregar])

  const confirmar = async () => {
    if (!termos) return
    setSalvando(true)
    setErro('')
    try {
      const { data } = await api.post<{ aluno: Aluno }>('/lgpd/primeiro-acesso/ciencia', { ciente: true, versao: termos.versao })
      await atualizarAluno(data.aluno)
    } catch (error) {
      setErro(mensagemErro(error))
    } finally {
      setSalvando(false)
    }
  }

  if (loading) return <Screen><Loading texto="Carregando informações de privacidade..." /></Screen>
  if (!termos) return <Screen><Title>Não foi possível carregar</Title><Empty texto={erro || 'Verifique sua conexão.'} /><Button title="Tentar novamente" onPress={() => void carregar()} /><Button title="Sair" danger onPress={() => void sair()} /></Screen>

  return <Screen><ScrollView contentContainerStyle={{ paddingBottom: 28 }}><Title>Primeiro acesso</Title><Subtitle>Leia as informações antes de continuar. A navegação permanecerá bloqueada até sua ciência.</Subtitle><Card><Text style={{ color: colors.text, fontWeight: '900', fontSize: 18 }}>{termos.sistema}</Text><Text style={{ color: colors.muted, marginTop: 8 }}>Versão: {termos.versao}</Text><Text style={{ color: colors.muted, marginTop: 6 }}>Responsável: {termos.responsavel}</Text><Text style={{ color: colors.muted, marginTop: 6 }}>Contato: {termos.contato}</Text></Card><Card><Text style={{ color: colors.text, fontWeight: '800' }}>Finalidade</Text><Text style={{ color: colors.muted, marginTop: 8, lineHeight: 21 }}>{termos.finalidade}</Text><Text style={{ color: colors.muted, marginTop: 8 }}>{termos.baseLegal}</Text></Card><Card><Text style={{ color: colors.text, fontWeight: '800' }}>Dados utilizados</Text>{termos.dadosColetados.map((item) => <Text key={item.dado} style={{ color: colors.muted, marginTop: 8 }}>• {item.dado}: {item.finalidade}</Text>)}</Card><Card><Text style={{ color: colors.text, fontWeight: '800' }}>Seus direitos</Text>{termos.direitosDoTitular.map((direito) => <Text key={direito} style={{ color: colors.muted, marginTop: 8 }}>• {direito}</Text>)}</Card>{erro ? <Text style={{ color: colors.danger, marginTop: 14 }}>{erro}</Text> : null}<Button title={salvando ? 'Registrando...' : termos.decisao} disabled={salvando} onPress={() => void confirmar()} /><Button title="Sair sem continuar" danger onPress={() => void sair()} /></ScrollView></Screen>
}
