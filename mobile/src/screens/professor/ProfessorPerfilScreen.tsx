import { Text } from 'react-native'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Card, Screen, Subtitle, Title, colors } from '../../components/Ui'

export default function ProfessorPerfilScreen() {
  const { sessao, sair } = useAuth(); if (sessao?.perfil !== 'professor') return null
  return <Screen><Title>Perfil do professor</Title><Subtitle>Conta atualmente autenticada.</Subtitle><Card><Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{sessao.usuario.nome}</Text><Text style={{ color: colors.muted, marginTop: 8 }}>{sessao.usuario.email}</Text><Text style={{ color: colors.muted, marginTop: 6 }}>Perfil: professor</Text></Card><Button title="Sair do aplicativo" danger onPress={() => void sair()} /></Screen>
}

