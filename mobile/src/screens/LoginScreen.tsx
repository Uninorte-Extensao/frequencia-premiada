import { useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { api, mensagemErro } from '../services/api'
import { Perfil, Sessao } from '../types/session'

export default function LoginScreen() {
  const { entrar } = useAuth()
  const [perfil, setPerfil] = useState<Perfil>('aluno')
  const [identificador, setIdentificador] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)

  const selecionar = (novo: Perfil) => { setPerfil(novo); setIdentificador(''); setSenha('') }
  const login = async () => {
    if (!identificador.trim() || !senha) return Alert.alert('Atenção', 'Preencha todos os campos.')
    setLoading(true)
    try {
      if (perfil === 'aluno') {
        const { data } = await api.post('/alunos/login', { matricula: identificador.trim(), senha })
        await entrar({ perfil: 'aluno', token: data.token, usuario: data.aluno } as Sessao)
      } else {
        const { data } = await api.post('/auth/login', { email: identificador.trim().toLowerCase(), senha })
        await entrar({ perfil: 'professor', token: data.token, usuario: data.professor } as Sessao)
      }
    } catch (error) { Alert.alert('Não foi possível entrar', mensagemErro(error)) }
    finally { setLoading(false) }
  }

  return <View style={styles.container}>
    <Text style={styles.brand}>EduPoints</Text><Text style={styles.subtitle}>Acesso de alunos e professores</Text>
    <View style={styles.switch}><TouchableOpacity onPress={() => selecionar('aluno')} style={[styles.option, perfil === 'aluno' && styles.active]}><Text style={styles.optionText}>Aluno</Text></TouchableOpacity><TouchableOpacity onPress={() => selecionar('professor')} style={[styles.option, perfil === 'professor' && styles.active]}><Text style={styles.optionText}>Professor</Text></TouchableOpacity></View>
    <View style={styles.card}>
      <Text style={styles.label}>{perfil === 'aluno' ? 'MATRÍCULA' : 'E-MAIL'}</Text>
      <TextInput style={styles.input} autoCapitalize={perfil === 'aluno' ? 'characters' : 'none'} keyboardType={perfil === 'professor' ? 'email-address' : 'default'} value={identificador} onChangeText={setIdentificador} />
      <Text style={styles.label}>SENHA</Text><TextInput style={styles.input} secureTextEntry value={senha} onChangeText={setSenha} />
      <TouchableOpacity style={styles.button} disabled={loading} onPress={login}>{loading ? <ActivityIndicator color="#07152F" /> : <Text style={styles.buttonText}>Entrar como {perfil}</Text>}</TouchableOpacity>
    </View>
  </View>
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#060D1E', justifyContent: 'center', padding: 24 }, brand: { color: '#B6CBFF', fontSize: 46, fontWeight: '900', textAlign: 'center' }, subtitle: { color: '#AAB2C5', textAlign: 'center', fontSize: 17, marginBottom: 24 }, switch: { flexDirection: 'row', backgroundColor: '#121A33', borderRadius: 14, padding: 4, marginBottom: 14 }, option: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 11 }, active: { backgroundColor: '#3559A8' }, optionText: { color: '#E2E7F2', fontWeight: '800' }, card: { backgroundColor: '#11182F', borderColor: '#253352', borderWidth: 1, borderRadius: 20, padding: 18 }, label: { color: '#A4AEC6', fontWeight: '700', marginVertical: 8 }, input: { backgroundColor: '#171F34', borderWidth: 1, borderColor: '#2D3959', borderRadius: 12, color: '#D7E1FF', padding: 14 }, button: { marginTop: 18, backgroundColor: '#5A95FF', borderRadius: 14, padding: 16, alignItems: 'center' }, buttonText: { color: '#07152F', fontSize: 18, fontWeight: '800' } })
