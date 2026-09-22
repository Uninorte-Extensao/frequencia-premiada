import { useCallback, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useAuth } from '../../contexts/AuthContext'
import { api, mensagemErro } from '../../services/api'
import { Empty, Loading, Screen, Subtitle, Title, colors } from '../../components/Ui'

type Turma = { id: string; nome: string }

export default function ProfessorHomeScreen({ navigation }: any) {
  const { sessao } = useAuth(); const [turmas, setTurmas] = useState<Turma[]>([]); const [loading, setLoading] = useState(true); const [erro, setErro] = useState('')
  const carregar = useCallback(async () => { setLoading(true); setErro(''); try { const { data } = await api.get<Turma[]>('/turmas'); setTurmas(data) } catch (e) { setErro(mensagemErro(e)) } finally { setLoading(false) } }, [])
  useFocusEffect(useCallback(() => { void carregar() }, [carregar]))
  if (sessao?.perfil !== 'professor') return null
  return <Screen><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><View><Title>Olá, {sessao.usuario.nome}</Title><Subtitle>Selecione uma turma para iniciar a chamada.</Subtitle></View><TouchableOpacity onPress={() => navigation.navigate('ProfessorPerfil')}><Text style={{ color: colors.primary, fontWeight: '800' }}>Perfil</Text></TouchableOpacity></View>{loading ? <Loading texto="Carregando turmas..." /> : erro ? <Empty texto={erro} /> : <ScrollView style={{ marginTop: 14 }}>{turmas.length === 0 ? <Empty texto="Nenhuma turma cadastrada." /> : turmas.map((turma) => <TouchableOpacity key={turma.id} onPress={() => navigation.navigate('Chamada', { turma })} style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 20, marginBottom: 12 }}><Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{turma.nome}</Text><Text style={{ color: colors.muted, marginTop: 6 }}>Abrir chamada →</Text></TouchableOpacity>)}</ScrollView>}</Screen>
}

