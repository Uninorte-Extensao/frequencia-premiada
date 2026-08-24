import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = 'https://tavern-buzz-helpless.ngrok-free.dev'

export default function LoginScreen({ navigation }: any) {
  const [matricula, setMatricula] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)

  const onLogin = async () => {
    if (!matricula || !senha) return Alert.alert('Atenção', 'Preencha matrícula e senha.')
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/alunos/login`, { matricula, senha })
      await AsyncStorage.setItem('token', response.data.token)
      await AsyncStorage.setItem('aluno', JSON.stringify(response.data.aluno))
      navigation.replace('MainTabs')
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.erro || 'Falha ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>EduPoints</Text>
      <Text style={styles.subtitle}>Gestão de presença inteligente</Text>
      <View style={styles.card}>
        <Text style={styles.label}>MATRÍCULA</Text>
        <TextInput style={styles.input} placeholder="ALUNO001" placeholderTextColor="#6E7890" value={matricula} onChangeText={setMatricula} autoCapitalize="characters" />
        <Text style={styles.label}>SENHA</Text>
        <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#6E7890" value={senha} onChangeText={setSenha} secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={onLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#0b1938" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060D1E', justifyContent: 'center', padding: 24 },
  brand: { color: '#B6CBFF', fontSize: 48, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#AAB2C5', fontSize: 18, textAlign: 'center', marginBottom: 32 },
  card: { backgroundColor: '#11182F', borderColor: '#253352', borderWidth: 1, borderRadius: 22, padding: 18 },
  label: { color: '#A4AEC6', fontWeight: '700', marginBottom: 8, marginTop: 8 },
  input: { backgroundColor: '#171F34', borderWidth: 1, borderColor: '#2D3959', borderRadius: 12, color: '#D7E1FF', padding: 14, marginBottom: 8 },
  button: { marginTop: 18, backgroundColor: '#5A95FF', borderRadius: 14, padding: 16, alignItems: 'center' },
  buttonText: { color: '#03163E', fontSize: 32, fontWeight: '700' },
})
