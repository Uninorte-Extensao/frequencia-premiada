import { createStackNavigator } from '@react-navigation/stack'
import ProfessorHomeScreen from '../screens/professor/ProfessorHomeScreen'
import ChamadaScreen from '../screens/professor/ChamadaScreen'
import ProfessorNfcScreen from '../screens/professor/ProfessorNfcScreen'
import RegistroManualScreen from '../screens/professor/RegistroManualScreen'
import ProfessorPerfilScreen from '../screens/professor/ProfessorPerfilScreen'

const Stack = createStackNavigator()

export default function ProfessorNavigator() {
  return <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#121A33' }, headerTintColor: '#E2E7F2' }}>
    <Stack.Screen name="ProfessorInicio" component={ProfessorHomeScreen} options={{ title: 'Minhas turmas', headerShown: false }} />
    <Stack.Screen name="Chamada" component={ChamadaScreen} options={{ title: 'Chamada' }} />
    <Stack.Screen name="ProfessorNfc" component={ProfessorNfcScreen} options={{ title: 'Leitura NFC' }} />
    <Stack.Screen name="RegistroManual" component={RegistroManualScreen} options={{ title: 'Registro manual' }} />
    <Stack.Screen name="ProfessorPerfil" component={ProfessorPerfilScreen} options={{ title: 'Perfil' }} />
  </Stack.Navigator>
}

