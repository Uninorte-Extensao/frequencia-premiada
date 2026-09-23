import { useCallback, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useAuth } from '../../contexts/AuthContext'
import { api, mensagemErro } from '../../services/api'
import { Empty, Loading, Screen, Subtitle, Title, colors } from '../../components/Ui'

type Posicao = { id: string; nomePublico: string; pontos: number }

export default function AlunoRankingScreen() {
  const { sessao } = useAuth(); const [items, setItems] = useState<Posicao[]>([]); const [loading, setLoading] = useState(true); const [erro, setErro] = useState('')
  const carregar = useCallback(async () => { if (sessao?.perfil !== 'aluno') return; setLoading(true); setErro(''); try { const { data } = await api.get<Posicao[]>(`/alunos/ranking/${sessao.usuario.turmaId}`); setItems(data) } catch (e) { setErro(mensagemErro(e)) } finally { setLoading(false) } }, [sessao])
  useFocusEffect(useCallback(() => { void carregar() }, [carregar]))
  return <Screen><Title>Ranking da turma</Title><Subtitle>Identidades exibidas por apelido ou iniciais.</Subtitle>{loading ? <Loading /> : erro ? <Empty texto={erro} /> : <ScrollView>{items.map((item, index) => <View key={item.id} style={{ backgroundColor: colors.card, borderRadius: 14, padding: 16, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: colors.text, fontWeight: '800' }}>{index + 1}. {item.nomePublico}</Text><Text style={{ color: colors.primary, fontWeight: '900' }}>{item.pontos} pts</Text></View>)}</ScrollView>}</Screen>
}

