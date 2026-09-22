import { useCallback, useState } from 'react'
import { Text } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useAuth } from '../../contexts/AuthContext'
import { api, mensagemErro } from '../../services/api'
import { Card, Screen, Subtitle, Title, colors } from '../../components/Ui'

export default function AlunoHomeScreen() {
  const { sessao } = useAuth()
  const [pontos, setPontos] = useState(sessao?.perfil === 'aluno' ? sessao.usuario.pontos : 0)
  const [erro, setErro] = useState('')
  const atualizar = useCallback(async () => {
    if (sessao?.perfil !== 'aluno') return
    try { const { data } = await api.get('/alunos/me'); setPontos(data.pontos); setErro('') }
    catch (e) { setErro(mensagemErro(e)) }
  }, [sessao])
  useFocusEffect(useCallback(() => { void atualizar() }, [atualizar]))
  if (sessao?.perfil !== 'aluno') return null
  return <Screen><Text style={{ color: colors.primary, fontSize: 30, fontWeight: '900' }}>EduPoints</Text><Title>Olá, {sessao.usuario.nome}</Title><Subtitle>Acompanhe seus dados sem alterar registros de presença.</Subtitle><Card><Text style={{ color: colors.muted }}>Seus pontos</Text><Text style={{ color: colors.text, fontSize: 44, fontWeight: '900' }}>{pontos}</Text>{erro ? <Text style={{ color: colors.danger, marginTop: 8 }}>{erro}</Text> : null}</Card><Card><Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Matrícula</Text><Text style={{ color: colors.muted, marginTop: 6 }}>{sessao.usuario.matricula}</Text></Card></Screen>
}

