import { useEffect, useState } from 'react'
import { Alert, Text } from 'react-native'
import { api, mensagemErro } from '../../services/api'
import { Button, Card, Screen, Subtitle, Title, colors } from '../../components/Ui'

async function carregarNfc() {
  const modulo = await import('react-native-nfc-manager')
  return { manager: modulo.default, tech: modulo.NfcTech }
}

export default function ProfessorNfcScreen() {
  const [lendo, setLendo] = useState(false)
  const [ultimo, setUltimo] = useState<any>(null)
  const [nfcDisponivel, setNfcDisponivel] = useState(true)

  useEffect(() => {
    let ativo = true
    let manager: Awaited<ReturnType<typeof carregarNfc>>['manager'] | null = null

    carregarNfc()
      .then(async (nfc) => {
        manager = nfc.manager
        await manager.start()
      })
      .catch(() => {
        if (ativo) setNfcDisponivel(false)
      })

    return () => {
      ativo = false
      if (manager) void manager.cancelTechnologyRequest()
    }
  }, [])

  const ler = async () => {
    setLendo(true)
    let manager: Awaited<ReturnType<typeof carregarNfc>>['manager'] | null = null
    try {
      const nfc = await carregarNfc()
      manager = nfc.manager
      await manager.requestTechnology([nfc.tech.Ndef, nfc.tech.NfcA])
      const tag = await manager.getTag()
      if (!tag?.id) throw new Error('Tag sem identificador')
      const codigo = Array.isArray(tag.id)
        ? tag.id.map((b: number) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
        : String(tag.id)
      const { data } = await api.post('/checkin', { tag_nfc: codigo })
      setUltimo(data.aluno)
      Alert.alert('Presença registrada', data.aluno.nome)
    } catch (e: any) {
      if (e.response) Alert.alert('Não foi possível registrar', mensagemErro(e))
      else Alert.alert('NFC indisponível', 'Use uma build nativa para testar a leitura NFC.')
    } finally {
      setLendo(false)
      if (manager) void manager.cancelTechnologyRequest()
    }
  }

  return <Screen><Title>Leitura NFC</Title><Subtitle>{nfcDisponivel ? 'Aproxime a tag do aluno. Esta tela existe somente na navegação do professor.' : 'A leitura NFC requer uma build nativa e não funciona no Expo Go.'}</Subtitle><Button title={lendo ? 'Aguardando tag...' : 'Iniciar leitura'} disabled={lendo || !nfcDisponivel} onPress={ler} />{ultimo && <Card><Text style={{ color: colors.muted }}>Último registro</Text><Text style={{ color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 6 }}>{ultimo.nome}</Text><Text style={{ color: colors.primary }}>{ultimo.pontos} pontos</Text></Card>}</Screen>
}
