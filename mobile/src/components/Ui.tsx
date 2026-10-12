import { PropsWithChildren } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export const colors = { bg: '#060D1E', card: '#121A33', border: '#243252', primary: '#5A95FF', text: '#E2E7F2', muted: '#AAB2C5', danger: '#FF8A82', success: '#65D39A' }

export function Screen({ children }: PropsWithChildren) { return <View style={styles.screen}>{children}</View> }
export function Title({ children }: PropsWithChildren) { return <Text style={styles.title}>{children}</Text> }
export function Subtitle({ children }: PropsWithChildren) { return <Text style={styles.subtitle}>{children}</Text> }
export function Card({ children }: PropsWithChildren) { return <View style={styles.card}>{children}</View> }
export function Loading({ texto = 'Carregando...' }: { texto?: string }) { return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.subtitle}>{texto}</Text></View> }
export function Empty({ texto }: { texto: string }) { return <View style={styles.center}><Text style={styles.subtitle}>{texto}</Text></View> }
export function Button({ title, onPress, danger = false, disabled = false }: { title: string; onPress: () => void; danger?: boolean; disabled?: boolean }) { return <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.button, danger && styles.danger, disabled && styles.disabled]}><Text style={styles.buttonText}>{title}</Text></TouchableOpacity> }

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 22 }, title: { color: colors.text, fontSize: 30, fontWeight: '900', marginTop: 12 }, subtitle: { color: colors.muted, fontSize: 16, marginTop: 8, lineHeight: 23 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 18, marginTop: 14 }, center: { padding: 30, alignItems: 'center' },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 14 }, danger: { backgroundColor: '#7B3035' }, disabled: { opacity: 0.5 }, buttonText: { color: '#07152F', fontSize: 17, fontWeight: '800' },
})

