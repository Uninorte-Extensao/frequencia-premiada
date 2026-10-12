import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, ScrollView, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { api, mensagemErro } from '../../services/api'
import { Button, Card, Empty, Loading, Screen, Subtitle, Title, colors } from '../../components/Ui'

type Presenca = { id: string; data: string; status: string; aluno: { nome: string; matricula: string } }

export default function ChamadaScreen({ route, navigation }: any) {
  const { turma } = route.params; const [items, setItems] = useState<Presenca[]>([]); const [loading, setLoading] = useState(true); const [encerrando, setEncerrando] = useState(false); const [segundos, setSegundos] = useState(0)
  useEffect(() => { const id = setInterval(() => setSegundos((s) => s + 1), 1000); return () => clearInterval(id) }, [])
  const carregar = useCallback(async () => { setLoading(true); try { const { data } = await api.get<Presenca[]>(`/checkin/turma/${turma.id}`); setItems(data.filter((p) => new Date(p.data).toDateString() === new Date().toDateString())) } catch (e) { Alert.alert('Falha de conexão', mensagemErro(e)) } finally { setLoading(false) } }, [turma.id])
  useFocusEffect(useCallback(() => { void carregar() }, [carregar]))
  const presentes = useMemo(() => items.filter((p) => p.status === 'presente'), [items])
  const tempo = `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`
  const encerrar = () => Alert.alert('Encerrar chamada?', 'Os alunos sem registro hoje receberão falta.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Encerrar', style: 'destructive', onPress: async () => { setEncerrando(true); try { const { data } = await api.post('/checkin/encerrar', { turmaId: turma.id }); Alert.alert('Chamada encerrada', data.message); navigation.goBack() } catch (e) { Alert.alert('Erro', mensagemErro(e)) } finally { setEncerrando(false) } } }])
  return <Screen><Title>{turma.nome}</Title><Subtitle>Tempo da chamada: {tempo}</Subtitle><Card><Text style={{ color: colors.text, fontSize: 28, fontWeight: '900' }}>{presentes.length}</Text><Text style={{ color: colors.muted }}>alunos presentes hoje</Text></Card><View style={{ flexDirection: 'row', gap: 10 }}><View style={{ flex: 1 }}><Button title="Ler NFC" onPress={() => navigation.navigate('ProfessorNfc', { turma })} /></View><View style={{ flex: 1 }}><Button title="Registro manual" onPress={() => navigation.navigate('RegistroManual', { turma })} /></View></View>{loading ? <Loading /> : <ScrollView style={{ marginTop: 12 }}>{presentes.length === 0 ? <Empty texto="Nenhuma presença registrada nesta chamada." /> : presentes.map((p) => <View key={p.id} style={{ backgroundColor: colors.card, borderRadius: 12, padding: 14, marginTop: 8 }}><Text style={{ color: colors.text, fontWeight: '800' }}>{p.aluno.nome}</Text><Text style={{ color: colors.muted }}>{p.aluno.matricula}</Text></View>)}</ScrollView>}<Button title={encerrando ? 'Encerrando...' : 'Encerrar chamada'} disabled={encerrando} danger onPress={encerrar} /></Screen>
}

