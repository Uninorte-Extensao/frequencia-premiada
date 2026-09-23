import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import AlunoHomeScreen from '../screens/aluno/AlunoHomeScreen'
import AlunoHistoricoScreen from '../screens/aluno/AlunoHistoricoScreen'
import AlunoRankingScreen from '../screens/aluno/AlunoRankingScreen'
import AlunoPerfilScreen from '../screens/aluno/AlunoPerfilScreen'

const Tab = createBottomTabNavigator()

export default function AlunoNavigator() {
  return <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: '#121A33', borderTopColor: '#243252' }, tabBarActiveTintColor: '#5A95FF', tabBarInactiveTintColor: '#AAB2C5' }}>
    <Tab.Screen name="AlunoInicio" component={AlunoHomeScreen} options={{ title: 'Início' }} />
    <Tab.Screen name="AlunoHistorico" component={AlunoHistoricoScreen} options={{ title: 'Frequência' }} />
    <Tab.Screen name="AlunoRanking" component={AlunoRankingScreen} options={{ title: 'Ranking' }} />
    <Tab.Screen name="AlunoPerfil" component={AlunoPerfilScreen} options={{ title: 'Perfil' }} />
  </Tab.Navigator>
}

