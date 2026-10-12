import AsyncStorage from '@react-native-async-storage/async-storage'
import { Sessao, sessaoValida } from '../types/session'

const SESSION_KEY = '@edupoints:sessao'
const LEGACY_KEYS = ['token', 'aluno', 'professor', 'perfil']

export async function salvarSessao(sessao: Sessao) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessao))
}

export async function lerSessao() {
  try {
    const json = await AsyncStorage.getItem(SESSION_KEY)
    if (!json) return null
    const sessao: unknown = JSON.parse(json)
    if (!sessaoValida(sessao)) {
      await limparSessaoArmazenada()
      return null
    }
    return sessao
  } catch {
    await limparSessaoArmazenada()
    return null
  }
}

export async function limparSessaoArmazenada() {
  await AsyncStorage.multiRemove([SESSION_KEY, ...LEGACY_KEYS])
}

