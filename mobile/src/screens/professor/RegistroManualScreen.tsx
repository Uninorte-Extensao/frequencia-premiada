import { useState } from 'react'
import { Alert, StyleSheet, Text, TextInput } from 'react-native'
import { api, mensagemErro } from '../../services/api'
import { Button, Screen, Subtitle, Title, colors } from '../../components/Ui'

export default function RegistroManualScreen({ navigation }: any) {
  const [codigo, setCodigo] = useState(''); const [salvando, setSalvando] = useState(false)
  const salvar = async () => { if (!codigo.trim()) return Alert.alert('Atenção', 'Informe o UID da tag do aluno.'); setSalvando(true); try { const { data } = await api.post('/checkin', { tag_nfc: codigo.trim() }); Alert.alert('Presença registrada', data.aluno.nome, [{ text: 'OK', onPress: () => navigation.goBack() }]) } catch (e) { Alert.alert('Não foi possível registrar', mensagemErro(e)) } finally { setSalvando(false) } }
  return <Screen><Title>Registro manual</Title><Subtitle>Use esta opção autorizada quando a leitura NFC não estiver disponível.</Subtitle><Text style={styles.label}>UID da tag ou código cadastrado</Text><TextInput style={styles.input} value={codigo} onChangeText={setCodigo} autoCapitalize="characters" /><Button title={salvando ? 'Registrando...' : 'Confirmar presença'} disabled={salvando} onPress={salvar} /></Screen>
}
const styles = StyleSheet.create({ label: { color: colors.muted, fontWeight: '700', marginTop: 24 }, input: { color: colors.text, backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 8 } })

