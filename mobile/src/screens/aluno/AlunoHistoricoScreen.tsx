import { useCallback, useMemo, useState } from 'react'
import { RefreshControl, ScrollView, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { api, mensagemErro } from '../../services/api'
import { Card, Empty, Loading, Screen, Subtitle, Title, colors } from '../../components/Ui'

type Presenca = { id: string; data: string; status: 'presente' | 'falta' | 'justificada' }

export default function AlunoHistoricoScreen() {
  const [items, setItems] = useState<Presenca[]>([]); const [loading, setLoading] = useState(true); const [erro, setErro] = useState('')
  const carregar = useCallback(async () => { setErro(''); try { const { data } = await api.get<{ presencas: Presenca[] }>('/alunos/me/presencas?periodo=todos'); setItems(data.presencas) } catch (e) { setErro(mensagemErro(e)) } finally { setLoading(false) } }, [])
  useFocusEffect(useCallback(() => { setLoading(true); void carregar() }, [carregar]))
  const frequencia = useMemo(() => items.length ? Math.round(items.filter((i) => i.status !== 'falta').length / items.length * 100) : 0, [items])
  if (loading) return <Screen><Loading texto="Carregando seu histórico..." /></Screen>
  return <Screen><Title>Minha frequência</Title><Subtitle>Somente os seus registros são exibidos.</Subtitle><Card><Text style={{ color: colors.text, fontSize: 38, fontWeight: '900' }}>{frequencia}%</Text><Text style={{ color: colors.muted }}>frequência geral</Text></Card>{erro ? <Empty texto={erro} /> : <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={carregar} />} style={{ marginTop: 8 }}>{items.length === 0 ? <Empty texto="Nenhum registro encontrado." /> : items.map((item) => <View key={item.id} style={{ backgroundColor: colors.card, borderRadius: 14, padding: 16, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: colors.text }}>{new Date(item.data).toLocaleDateString('pt-BR')}</Text><Text style={{ color: item.status === 'falta' ? colors.danger : colors.success, fontWeight: '800' }}>{item.status}</Text></View>)}</ScrollView>}</Screen>
}
