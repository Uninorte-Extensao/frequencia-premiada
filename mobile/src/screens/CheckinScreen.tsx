import React, { useEffect, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Keyboard, ScrollView,
  SafeAreaView, Modal, useWindowDimensions,
} from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import NfcManager, { NfcTech } from 'react-native-nfc-manager'

const API_URL = 'https://tavern-buzz-helpless.ngrok-free.dev'

type AlunoEncontrado = {
  nome: string
  matricula?: string
  pontos?: number
  turma?: { nome: string }
}

type UltimoCheckin = {
  nome: string
  aula: string
  pontos: number
}

export default function CheckinScreen({ navigation }: any) {
  const { width } = useWindowDimensions()
  const [nfcUid, setNfcUid] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [lendoNfc, setLendoNfc] = useState(false)
  const [modalManualVisivel, setModalManualVisivel] = useState(false)
  const [ultimoCheckin, setUltimoCheckin] = useState<UltimoCheckin | null>(null)
  const layoutCompacto = width < 430

  useEffect(() => {
    NfcManager.start().catch(() => {
      Alert.alert('Aviso', 'NFC não disponível neste dispositivo')
    })
    return () => { NfcManager.cancelTechnologyRequest().catch(() => null) }
  }, [])

  const confirmarRegistro = (aluno: AlunoEncontrado, codigo: string, origem: 'NFC' | 'Código') => {
    const turma = aluno.turma?.nome ? `\nTurma: ${aluno.turma.nome}` : ''
    const matricula = aluno.matricula ? `\nMatrícula: ${aluno.matricula}` : ''
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        'Confirmar presença',
        `${origem}: ${codigo}\nAluno: ${aluno.nome}${matricula}${turma}\n\nDeseja registrar a presença agora?`,
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Registrar', style: 'default', onPress: () => resolve(true) },
        ],
        { cancelable: true, onDismiss: () => resolve(false) }
      )
    })
  }

  const executarRegistro = async (codigo: string, origem: 'NFC' | 'Código' = 'Código') => {
    const codigoNormalizado = codigo.trim()
    if (!codigoNormalizado) {
      Alert.alert('Atenção', 'Informe o código do aluno ou use o NFC.')
      return
    }

    try {
      setCarregando(true)
      const token = await AsyncStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      // 1. Busca o aluno pela tag
      const alunoResponse = await axios.get(
        `${API_URL}/alunos/tag/${encodeURIComponent(codigoNormalizado)}`,
        { headers }
      )

      setCarregando(false)

      // 2. Confirma com o professor
      const confirmado = await confirmarRegistro(alunoResponse.data, codigoNormalizado, origem)
      if (!confirmado) return

      setCarregando(true)

      // 3. ✅ Faz o checkin UMA ÚNICA VEZ e captura a resposta
      const checkinResponse = await axios.post(
        `${API_URL}/checkin`,
        { tag_nfc: codigoNormalizado, disciplinaId: 1 },
        { headers }
      )

      // 4. ✅ Atualiza o card com dados reais
      setUltimoCheckin({
        nome: alunoResponse.data.nome,
        aula: alunoResponse.data.turma?.nome || 'Aula',
        pontos: checkinResponse.data.pontos,
      })

      Alert.alert('✅ Sucesso!', `Presença registrada para ${alunoResponse.data.nome}!`)
      setNfcUid('')
      setModalManualVisivel(false)
      Keyboard.dismiss()

    } catch (error: any) {
      const msg = error.response?.data?.erro || 'Erro ao registrar.'
      Alert.alert('❌ Erro', msg)
    } finally {
      setCarregando(false)
    }
  }

  const iniciarLeituraNFC = async () => {
    try {
      setLendoNfc(true)
      await NfcManager.requestTechnology([NfcTech.Ndef, NfcTech.NfcA])
      const tag = await NfcManager.getTag()
      if (tag?.id) {
        const tagHex = Array.isArray(tag.id)
          ? tag.id.map((b: number) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
          : String(tag.id)
        await executarRegistro(tagHex, 'NFC')
      }
    } catch (ex) {
      console.warn('Leitura cancelada ou erro:', ex)
      Alert.alert('Aviso', 'Leitura NFC cancelada ou indisponível.')
    } finally {
      setLendoNfc(false)
      NfcManager.cancelTechnologyRequest().catch(() => null)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.topbarIcon} onPress={() => navigation.goBack()}>
          <Text style={styles.topbarIconText}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.brand}>EduPoints</Text>
        <TouchableOpacity style={styles.topbarIcon} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.topbarIconText}>⌕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heading}>
          <Text style={styles.titulo}>Registro de Presença</Text>
          <Text style={styles.subtitulo}>
            {lendoNfc ? 'Aproxime o cartão agora...' : 'Aproxime a tag do aluno'}
          </Text>
        </View>

        <View style={styles.nfcStage}>
          <View style={styles.ringOuter} />
          <View style={styles.ringInner} />
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.nfcButton, lendoNfc && styles.nfcButtonActive]}
            onPress={iniciarLeituraNFC}
            disabled={carregando}
          >
            {lendoNfc || carregando
              ? <ActivityIndicator size="large" color="#ffffff" />
              : <Text style={styles.nfcIcon}>📡</Text>
            }
          </TouchableOpacity>
        </View>

        {/* ✅ Card só aparece após o primeiro check-in */}
        {ultimoCheckin && (
          <View style={[styles.successCard, layoutCompacto && styles.successCardCompact]}>
            <View style={[styles.personBadge, layoutCompacto && styles.personBadgeCompact]}>
              <Text style={styles.personIcon}>♙</Text>
            </View>

            <View style={styles.successInfo}>
              <Text
                style={[styles.studentName, layoutCompacto && styles.studentNameCompact]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.78}
              >
                {ultimoCheckin.nome}
              </Text>
              <Text style={[styles.successText, layoutCompacto && styles.successTextCompact]} numberOfLines={1}>
                ⊙ Check-in Realizado
              </Text>
            </View>

            <View style={[styles.pointsBlock, layoutCompacto && styles.pointsBlockCompact]}>
              <Text
                style={[styles.points, layoutCompacto && styles.pointsCompact]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
              >
                +{ultimoCheckin.pontos} pts
              </Text>
              <Text style={[styles.classText, layoutCompacto && styles.classTextCompact]} numberOfLines={2}>
                Aula: {ultimoCheckin.aula}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Presentes</Text>
            <Text style={styles.statPrimary}>24/30</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Tempo Restante</Text>
            <Text style={styles.statWarning}>12:45</Text>
          </View>
        </View>

        <View style={styles.manualSection}>
          <Text style={styles.manualTitle}>Ações Manuais</Text>
          <TouchableOpacity style={styles.manualButton} onPress={() => setModalManualVisivel(true)}>
            <Text style={styles.manualIcon}>♙⌕</Text>
            <Text style={styles.manualText}>Registro Manual</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => Alert.alert('Justificar falta', 'Fluxo de justificativa será aberto aqui.')}
          >
            <Text style={styles.manualIcon}>⚠</Text>
            <Text style={styles.manualText}>Justificar Falta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 EduPoints</Text>
          <Text style={styles.footerText}>sistema de frequência</Text>
          <View style={styles.footerLinks}>
            <Text style={styles.footerLink}>Políticas</Text>
            <Text style={styles.footerLink}>Privacidade</Text>
            <Text style={styles.footerLink}>Ajuda</Text>
          </View>
        </View>
      </ScrollView>

      <Modal transparent animationType="fade" visible={modalManualVisivel} onRequestClose={() => setModalManualVisivel(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Registro Manual</Text>
            <Text style={styles.modalSubtitle}>Informe o código ou UID da tag do aluno.</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o código"
              placeholderTextColor="#8c909f"
              value={nfcUid}
              onChangeText={setNfcUid}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => executarRegistro(nfcUid, 'Código')}
              disabled={carregando || lendoNfc}
            >
              {carregando
                ? <ActivityIndicator color="#00285d" />
                : <Text style={styles.confirmText}>Confirmar Código</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalManualVisivel(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const colors = {
  background: '#10131a', surface: '#1d2027', surfaceLow: '#191b23',
  primary: '#adc6ff', primaryContainer: '#4d8eff', onPrimaryContainer: '#00285d',
  onSurface: '#e1e2ec', onSurfaceVariant: '#c2c6d6', outlineVariant: '#424754',
  success: '#4ade80', tertiary: '#ffb786',
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  topbar: { height: 64, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: '#171a22', flexDirection: 'row', alignItems: 'center' },
  topbarIcon: { width: 34, height: 40, alignItems: 'center', justifyContent: 'center' },
  topbarIconText: { color: colors.primary, fontSize: 30, fontWeight: '700' },
  brand: { flex: 1, color: colors.primary, fontSize: 32, fontWeight: '900', marginLeft: 12 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 52, paddingBottom: 32 },
  heading: { alignItems: 'center' },
  titulo: { color: colors.onSurface, fontSize: 42, fontWeight: '800', lineHeight: 48, textAlign: 'center' },
  subtitulo: { color: colors.onSurfaceVariant, fontSize: 25, marginTop: 16, textAlign: 'center' },
  nfcStage: { height: 382, alignItems: 'center', justifyContent: 'center', marginTop: -6, marginBottom: -10 },
  ringOuter: { position: 'absolute', width: 492, height: 492, borderRadius: 246, borderWidth: 3, borderColor: 'rgba(173,198,255,0.13)' },
  ringInner: { position: 'absolute', width: 292, height: 292, borderRadius: 146, borderWidth: 3, borderColor: 'rgba(173,198,255,0.34)' },
  nfcButton: { width: 244, height: 244, borderRadius: 122, backgroundColor: '#6260dc', alignItems: 'center', justifyContent: 'center', shadowColor: colors.primaryContainer, shadowOpacity: 0.45, shadowRadius: 22, shadowOffset: { width: 0, height: 0 }, elevation: 8 },
  nfcButtonActive: { backgroundColor: colors.primaryContainer },
  nfcIcon: { color: '#ffffff', fontSize: 70, fontWeight: '900' },
  successCard: { minHeight: 148, borderRadius: 16, borderWidth: 1, borderColor: colors.outlineVariant, backgroundColor: 'rgba(29,32,39,0.78)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 36, paddingVertical: 22 },
  successCardCompact: { alignItems: 'flex-start', paddingHorizontal: 18, paddingVertical: 18 },
  personBadge: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: 'rgba(173,198,255,0.32)', backgroundColor: '#32353c', alignItems: 'center', justifyContent: 'center', marginRight: 24 },
  personBadgeCompact: { width: 54, height: 54, borderRadius: 27, marginRight: 14 },
  personIcon: { color: colors.primary, fontSize: 38, fontWeight: '800' },
  successInfo: { flex: 1, minWidth: 0 },
  studentName: { color: colors.onSurface, fontSize: 27, fontWeight: '900' },
  studentNameCompact: { fontSize: 21, lineHeight: 25 },
  successText: { color: colors.success, fontSize: 18, fontWeight: '900', marginTop: 8 },
  successTextCompact: { fontSize: 14, marginTop: 5 },
  pointsBlock: { alignItems: 'flex-end', flexShrink: 1, marginLeft: 12, maxWidth: 132 },
  pointsBlockCompact: { alignItems: 'flex-start', borderTopWidth: 1, borderTopColor: 'rgba(66,71,84,0.65)', flexBasis: '100%', marginLeft: 68, marginTop: 14, maxWidth: '100%', paddingTop: 12 },
  points: { color: colors.primary, fontSize: 36, fontWeight: '900' },
  pointsCompact: { fontSize: 27, lineHeight: 31 },
  classText: { color: colors.onSurfaceVariant, fontSize: 17, fontWeight: '800', marginTop: 6, textAlign: 'right' },
  classTextCompact: { fontSize: 14, lineHeight: 18, textAlign: 'left' },
  statsRow: { flexDirection: 'row', gap: 24, marginTop: 48 },
  statCard: { flex: 1, minHeight: 124, borderRadius: 16, borderWidth: 1, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceLow, justifyContent: 'center', padding: 24 },
  statLabel: { color: colors.onSurfaceVariant, fontSize: 16, fontWeight: '900', letterSpacing: 1.4, textTransform: 'uppercase' },
  statPrimary: { color: colors.primary, fontSize: 38, fontWeight: '900', marginTop: 4 },
  statWarning: { color: colors.tertiary, fontSize: 38, fontWeight: '900', marginTop: 4 },
  manualSection: { marginTop: 48 },
  manualTitle: { color: colors.onSurfaceVariant, fontSize: 18, fontWeight: '900', letterSpacing: 1.4, marginBottom: 24, textTransform: 'uppercase' },
  manualButton: { height: 88, borderRadius: 16, borderWidth: 1, borderColor: colors.outlineVariant, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 14 },
  manualIcon: { color: colors.primary, fontSize: 30, fontWeight: '900' },
  manualText: { color: colors.onSurface, fontSize: 24, fontWeight: '900' },
  footer: { alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(66,71,84,0.8)', marginHorizontal: -24, marginTop: 48, paddingVertical: 34 },
  footerText: { color: '#7d8291', fontSize: 17, fontWeight: '800' },
  footerLinks: { flexDirection: 'row', gap: 28, marginTop: 6 },
  footerLink: { color: '#8c909f', fontSize: 17, fontWeight: '800' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', borderRadius: 18, borderWidth: 1, borderColor: colors.outlineVariant, backgroundColor: colors.surface, padding: 24 },
  modalTitle: { color: colors.onSurface, fontSize: 26, fontWeight: '900' },
  modalSubtitle: { color: colors.onSurfaceVariant, fontSize: 16, marginTop: 8, marginBottom: 18 },
  input: { width: '100%', backgroundColor: colors.surfaceLow, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, padding: 16, color: colors.onSurface, fontSize: 18, marginBottom: 14, textAlign: 'center' },
  confirmButton: { minHeight: 54, borderRadius: 12, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  confirmText: { color: colors.onPrimaryContainer, fontSize: 17, fontWeight: '900' },
  cancelButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  cancelText: { color: colors.onSurfaceVariant, fontSize: 16, fontWeight: '800' },
})