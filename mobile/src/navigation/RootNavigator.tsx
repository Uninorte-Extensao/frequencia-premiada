import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native'
import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import LoginScreen from '../screens/LoginScreen'
import AlunoNavigator from './AlunoNavigator'
import ProfessorNavigator from './ProfessorNavigator'

const Stack = createStackNavigator()

export default function RootNavigator() {
  const { sessao, carregando, aviso, limparAviso } = useAuth()
  useEffect(() => { if (aviso) Alert.alert('Sessão', aviso, [{ text: 'OK', onPress: limparAviso }]) }, [aviso])
  if (carregando) return <View style={styles.loading}><ActivityIndicator size="large" color="#5A95FF" /></View>
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!sessao && <Stack.Screen name="Public" component={LoginScreen} />}
        {sessao?.perfil === 'aluno' && <Stack.Screen name="Aluno" component={AlunoNavigator} />}
        {sessao?.perfil === 'professor' && <Stack.Screen name="Professor" component={ProfessorNavigator} />}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#060D1E' } })

