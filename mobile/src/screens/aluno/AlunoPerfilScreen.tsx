import { Text } from 'react-native'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Card, Screen, Subtitle, Title, colors } from '../../components/Ui'

export default function AlunoPerfilScreen() {
  const { sessao, sair } = useAuth(); if (sessao?.perfil !== 'aluno') return null
  return <Screen><Title>Meu perfil</Title><Subtitle>Informações da conta do aluno.</Subtitle><Card><Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{sessao.usuario.nome}</Text><Text style={{ color: colors.muted, marginTop: 8 }}>Matrícula: {sessao.usuario.matricula}</Text><Text style={{ color: colors.muted, marginTop: 6 }}>Perfil: aluno</Text></Card><Button title="Sair do aplicativo" danger onPress={() => void sair()} /></Screen>
}

