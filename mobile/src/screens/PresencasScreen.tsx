import React, { useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
import { API_URL } from '../config/api'

type StatusPresenca = 'presente' | 'falta' | 'justificada'

type Presenca = {
  id: number | string
  status: StatusPresenca
  data: string
  aluno?: {
    nome?: string
    matricula?: string
    curso?: string
  }
}

type Filtro = 'todos' | StatusPresenca

const demoPresencas: Presenca[] = [
  {
    id: '1',
    status: 'presente',
    data: '2026-05-13T08:04:00',
    aluno: {
      nome: 'Gabriel Ferreira',
      matricula: '2024-0012',
      curso: 'Engenharia de Software',
    },
  },
  {
    id: '2',
    status: 'presente',
    data: '2026-05-13T08:04:00',
    aluno: {
      nome: 'Mariana Lima',
      matricula: '2024-0842',
      curso: 'Ciência de Dados',
    },
  },
  {
    id: '3',
    status: 'falta',
    data: '2026-05-13T08:04:00',
    aluno: {
      nome: 'Roberto Souza',
      matricula: '2024-0155',
      curso: 'Inteligência Artificial',
    },
  },
  {
    id: '4',
    status: 'justificada',
    data: '2026-05-13T08:04:00',
    aluno: {
      nome: 'Ana Clara Costa',
      matricula: '2024-1002',
      curso: 'Sistemas de Informação',
    },
  },
]

function iniciais(nome: string) {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
}

function corAvatar(index: number) {
  const cores = ['#4038d1', '#6b3d16', '#272a31', '#2f855a']
  return cores[index % cores.length]
}

export default function PresencasScreen({ navigation }: any) {
  const [presencas, setPresencas] = useState<Presenca[]>(demoPresencas)
  const [carregando, setCarregando] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState<string | number | null>(null)

  useFocusEffect(
    useCallback(() => {
      carregarPresencas()
    }, []),
  )

  const carregarPresencas = async () => {
    setCarregando(true)

    try {
      const token = await AsyncStorage.getItem('token')

      const response = await axios.get(`${API_URL}/checkin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data?.length) {
        setPresencas(response.data)
      } else {
        setPresencas(demoPresencas)
      }
    } catch (error) {
      console.error('Erro ao buscar presenças:', error)
      setPresencas(demoPresencas)
    } finally {
      setCarregando(false)
    }
  }

  const contadores = useMemo(() => {
    const total = presencas.length

    const presentes = presencas.filter(
      (item) => item.status === 'presente',
    ).length

    const faltas = presencas.filter(
      (item) => item.status === 'falta',
    ).length

    const justificadas = presencas.filter(
      (item) => item.status === 'justificada',
    ).length

    return {
      total,
      presentes,
      faltas,
      justificadas,
    }
  }, [presencas])

  const presencasFiltradas = useMemo(() => {
    let lista = presencas

    if (filtro !== 'todos') {
      lista = lista.filter((item) => item.status === filtro)
    }

    if (busca.trim()) {
      lista = lista.filter((item) => {
        const nome = item.aluno?.nome || ''
        const matricula = item.aluno?.matricula || ''

        return `${nome} ${matricula}`
          .toLowerCase()
          .includes(busca.toLowerCase())
      })
    }

    return lista
  }, [presencas, filtro, busca])

  const presencaGeral = contadores.total
    ? Math.round(
        ((contadores.presentes + contadores.justificadas) /
          contadores.total) *
          100,
      )
    : 0

  const filtros: Array<{ id: Filtro; label: string }> = [
    {
      id: 'todos',
      label: `Todos (${contadores.total})`,
    },
    {
      id: 'presente',
      label: `Presentes (${contadores.presentes})`,
    },
    {
      id: 'falta',
      label: `Faltas (${contadores.faltas})`,
    },
    {
      id: 'justificada',
      label: `Justificadas (${contadores.justificadas})`,
    },
  ]

  const renderStatus = (status: StatusPresenca) => {
    const label =
      status === 'presente'
        ? 'Presente'
        : status === 'falta'
        ? 'Falta'
        : 'Justificada'

    const style =
      status === 'presente'
        ? styles.statusPresente
        : status === 'falta'
        ? styles.statusFalta
        : styles.statusJustificada

    return (
      <View style={[styles.statusChip, style]}>
        <Text style={styles.statusText}>{label}</Text>
      </View>
    )
  }

  const confirmarPresencaManual = () => {
    if (!selecionado) {
      Alert.alert('Atenção', 'Selecione um aluno.')
      return
    }

    Alert.alert(
      'Sucesso',
      'Presença manual registrada com sucesso!',
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topbar}>
        <TouchableOpacity
          style={styles.topbarIcon}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.topbarIconText}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.brand}>EduPoints</Text>

        <TouchableOpacity
          style={styles.topbarIcon}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.topbarIconText}>◎</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.classHeader}>
          <Text style={styles.classTitle}>
            Presença Manual
          </Text>

          <Text style={styles.classSubtitle}>
            Gerencie a frequência dos alunos
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            Presença Geral
          </Text>

          <Text style={styles.summaryValue}>
            {presencaGeral}%
          </Text>

          <Text style={styles.summaryTrend}>
            ↗ +2% vs última aula
          </Text>
        </View>

        <TextInput
          style={styles.search}
          placeholder="Buscar aluno por nome ou matrícula..."
          placeholderTextColor="#5E6883"
          value={busca}
          onChangeText={setBusca}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          style={styles.filterScroll}
        >
          {filtros.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.filterButton,
                filtro === item.id &&
                  styles.filterButtonActive,
              ]}
              onPress={() => setFiltro(item.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  filtro === item.id &&
                    styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {carregando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={colors.primaryContainer}
            />
          </View>
        ) : (
          presencasFiltradas.map((item, index) => {
            const nome =
              item.aluno?.nome || 'Aluno Desconhecido'

            const matricula =
              item.aluno?.matricula || 'Sem matrícula'

            const curso =
              item.aluno?.curso || 'Curso não informado'

            return (
              <TouchableOpacity
                key={String(item.id)}
                style={[
                  styles.card,
                  selecionado === item.id &&
                    styles.selected,
                ]}
                onPress={() => setSelecionado(item.id)}
              >
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor:
                        corAvatar(index),
                    },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {iniciais(nome)}
                  </Text>
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.nome}>
                    {nome}
                  </Text>

                  <Text style={styles.curso}>
                    {curso}
                  </Text>

                  <Text style={styles.freq}>
                    Matrícula: {matricula}
                  </Text>
                </View>

                <View>
                  <Text style={styles.badge}>
                    {matricula}
                  </Text>

                  <View style={{ marginTop: 10 }}>
                    {renderStatus(item.status)}
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        )}

        <TouchableOpacity
          style={styles.confirm}
          onPress={confirmarPresencaManual}
        >
          <Text style={styles.confirmText}>
            Confirmar Presença
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Checkin')}
      >
        <Text style={styles.fabIcon}>▣</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const colors = {
  background: '#10131a',
  surface: '#1d2027',
  surfaceLow: '#191b23',
  surfaceHigh: '#272a31',
  primary: '#adc6ff',
  primaryContainer: '#4d8eff',
  onPrimaryContainer: '#00285d',
  onSurface: '#e1e2ec',
  onSurfaceVariant: '#c2c6d6',
  outlineVariant: '#424754',
  success: '#4ade80',
  error: '#ffb4ab',
  tertiary: '#ffb786',
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topbar: {
    height: 64,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: '#171a22',
    flexDirection: 'row',
    alignItems: 'center',
  },
  topbarIcon: {
    width: 34,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topbarIconText: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: '700',
  },
  brand: {
    flex: 1,
    color: colors.primary,
    fontSize: 32,
    fontWeight: '900',
    marginLeft: 12,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 140,
  },
  classHeader: {
    marginBottom: 28,
  },
  classTitle: {
    color: colors.onSurface,
    fontSize: 38,
    fontWeight: '900',
  },
  classSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 20,
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 24,
    marginBottom: 24,
  },
  summaryLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 16,
    fontWeight: '800',
  },
  summaryValue: {
    color: colors.primary,
    fontSize: 54,
    fontWeight: '900',
    marginTop: 8,
  },
  summaryTrend: {
    color: colors.success,
    marginTop: 6,
    fontSize: 15,
    fontWeight: '700',
  },
  search: {
    backgroundColor: '#0F172C',
    borderWidth: 1,
    borderColor: '#293655',
    borderRadius: 14,
    color: '#C9D4F8',
    padding: 14,
    fontSize: 18,
    marginBottom: 18,
  },
  filterScroll: {
    marginBottom: 24,
  },
  filterContent: {
    gap: 12,
    paddingRight: 20,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.onSurfaceVariant,
    fontWeight: '700',
  },
  filterTextActive: {
    color: colors.onPrimaryContainer,
  },
  loadingContainer: {
    paddingVertical: 60,
  },
  card: {
    backgroundColor: '#111A31',
    borderWidth: 1,
    borderColor: '#263453',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selected: {
    borderWidth: 2,
    borderColor: '#9CBEFF',
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
  },
  cardInfo: {
    flex: 1,
  },
  nome: {
    color: '#DEE5FB',
    fontSize: 22,
    fontWeight: '800',
  },
  curso: {
    color: '#B0B9D3',
    fontSize: 16,
    marginTop: 4,
  },
  freq: {
    color: '#A7B6DB',
    fontSize: 14,
    marginTop: 6,
  },
  badge: {
    color: '#AFC2F3',
    backgroundColor: '#273A63',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '700',
  },
  confirm: {
    backgroundColor: '#9BC0FF',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 18,
  },
  confirmText: {
    color: '#0B2159',
    fontWeight: '900',
    fontSize: 22,
  },
  statusChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statusPresente: {
    backgroundColor: 'rgba(74,222,128,0.14)',
    borderColor: 'rgba(74,222,128,0.24)',
  },
  statusFalta: {
    backgroundColor: 'rgba(255,180,171,0.14)',
    borderColor: 'rgba(255,180,171,0.28)',
  },
  statusJustificada: {
    backgroundColor: 'rgba(173,198,255,0.14)',
    borderColor: 'rgba(173,198,255,0.28)',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  fabIcon: {
    color: colors.onPrimaryContainer,
    fontSize: 32,
    fontWeight: '900',
  },
})