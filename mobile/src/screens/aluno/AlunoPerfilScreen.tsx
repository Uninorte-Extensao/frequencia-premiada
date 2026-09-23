import { useCallback, useState } from 'react'
import { Share, ScrollView, Text } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useAuth } from '../../contexts/AuthContext'
import { api, mensagemErro } from '../../services/api'
import { Aluno } from '../../types/session'
import { Button, Card, Empty, Loading, Screen, Subtitle, Title, colors } from '../../components/Ui'

const mascararMatricula = (matricula: string) => `${'*'.repeat(Math.max(4, matricula.length - 3))}${matricula.slice(-3)}`

export default function AlunoPerfilScreen() {
  const { sessao, sair } = useAuth()
  const [perfil, setPerfil] = useState<Aluno | null>(sessao?.perfil === 'aluno' ? sessao.usuario : null)
  const [loading, setLoading] = useState(true)
  const [exportando, setExportando] = useState(false)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    if (sessao?.perfil !== 'aluno') return
    setLoading(true)
    setErro('')
    try {
      const { data } = await api.get<Aluno>('/alunos/me')
      setPerfil(data)
    } catch (error) {
      setErro(mensagemErro(error))
    } finally {
      setLoading(false)
    }
  }, [sessao?.perfil])

  useFocusEffect(useCallback(() => { void carregar() }, [carregar]))

  const exportar = async () => {
    if (!perfil) return
    setExportando(true)
    setErro('')
    try {
      const { data } = await api.get(`/lgpd/alunos/${perfil.id}/dados`)
      await Share.share({ title: 'Meus dados — EduPoints', message: JSON.stringify(data, null, 2) })
    } catch (error) {
      setErro(mensagemErro(error))
    } finally {
      setExportando(false)
    }
  }

  if (sessao?.perfil !== 'aluno') return null
  if (loading && !perfil) return <Screen><Loading texto="Carregando seu perfil..." /></Screen>
  if (!perfil) return <Screen><Title>Meu perfil</Title><Empty texto={erro || 'Perfil indisponível.'} /><Button title="Tentar novamente" onPress={() => void carregar()} /></Screen>

  return <Screen><ScrollView contentContainerStyle={{ paddingBottom: 28 }}><Title>Meu perfil</Title><Subtitle>Dados reais da sua conta e informações de privacidade.</Subtitle>{erro ? <Card><Text style={{ color: colors.danger }}>{erro}</Text><Button title="Tentar novamente" onPress={() => void carregar()} /></Card> : null}<Card><Text style={{ color: colors.text, fontSize: 22, fontWeight: '900' }}>{perfil.apelido?.trim() || perfil.nome}</Text><Text style={{ color: colors.muted, marginTop: 8 }}>Matrícula: {mascararMatricula(perfil.matricula)}</Text><Text style={{ color: colors.muted, marginTop: 6 }}>Turma: {perfil.turma?.nome || 'Não informada'}</Text><Text style={{ color: colors.primary, marginTop: 8, fontSize: 18, fontWeight: '800' }}>{perfil.pontos} pontos</Text></Card><Card><Text style={{ color: colors.text, fontWeight: '800' }}>Privacidade</Text><Text style={{ color: colors.muted, marginTop: 8 }}>Termos: versão {perfil.termo_versao || 'não registrada'}</Text><Text style={{ color: colors.muted, marginTop: 6 }}>Contato: juliane.oliveira.pinto@gmail.com</Text><Button title={exportando ? 'Preparando dados...' : 'Baixar/compartilhar meus dados'} disabled={exportando} onPress={() => void exportar()} /></Card><Button title="Sair do aplicativo" danger onPress={() => void sair()} /></ScrollView></Screen>
}
