// components/EmployeForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type Employe = { numEmp: number; nom: string; nbJours: number; tauxJournal: number; salaire: number };
type Props = {
  visible: boolean;
  employe: Employe | null;
  onSave: (data: { nom: string; nbJours: number; tauxJournal: number }) => void;
  onClose: () => void;
};

export default function EmployeForm({ visible, employe, onSave, onClose }: Props) {
  const { theme } = useTheme();

  const [nom,         setNom]         = useState('');
  const [nbJours,     setNbJours]     = useState('');
  const [tauxJournal, setTauxJournal] = useState('');

  useEffect(() => {
    if (employe) {
      setNom(employe.nom);
      setNbJours(String(employe.nbJours));
      setTauxJournal(String(employe.tauxJournal));
    } else {
      setNom(''); setNbJours(''); setTauxJournal('');
    }
  }, [employe, visible]);

  const salaire = (parseInt(nbJours || '0') * parseInt(tauxJournal || '0')).toLocaleString('fr-FR', { minimumFractionDigits: 2 });
  const valid   = nom.trim() && nbJours && tauxJournal;

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[s.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[s.sheet, { backgroundColor: theme.bg, borderColor: theme.surface }]}>
          <View style={[s.handle, { backgroundColor: theme.border }]} />

          {/* Title */}
          <View style={s.titleRow}>
            <Ionicons
              name={employe ? 'pencil' : 'person-add'}
              size={20} color="#3b82f6"
              style={{ marginRight: 8 }}
            />
            <Text style={[s.title, { color: theme.text }]}>{employe ? "Modifier l'employé" : 'Nouvel employé'}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Field icon="person-outline"   label="Nom complet"     value={nom}         onChangeText={setNom}         placeholder="ex : Dupont Jean"  theme={theme} />
            <Field icon="calendar-outline" label="Nombre de jours" value={nbJours}     onChangeText={setNbJours}     placeholder="ex : 22"    keyboardType="decimal-pad" theme={theme} />
            <Field icon="cash-outline"     label="Taux journalier" value={tauxJournal} onChangeText={setTauxJournal} placeholder="ex : 2500"  keyboardType="decimal-pad" theme={theme} />

            {/* Salaire preview */}
            <View style={[s.preview, { backgroundColor: theme.isDark ? '#1e3a5f' : '#eff6ff', borderColor: theme.isDark ? '#1d4ed8' : '#bfdbfe' }]}>
              <View style={s.previewLeft}>
                <MaterialCommunityIcons name="calculator-variant" size={18} color="#93c5fd" />
                <Text style={[s.previewLabel, { color: theme.isDark ? '#93c5fd' : '#2563eb' }]}>Salaire calculé</Text>
              </View>
              <Text style={[s.previewValue, { color: theme.isDark ? '#60a5fa' : '#1d4ed8' }]}>{salaire}</Text>
            </View>

            <View style={s.row}>
              <TouchableOpacity style={[s.btnCancel, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={onClose} activeOpacity={0.8}>
                <Ionicons name="close" size={16} color={theme.textSub} style={{ marginRight: 6 }} />
                <Text style={[s.btnCancelTxt, { color: theme.textSub }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btnSave, !valid && s.btnDisabled]}
                onPress={() => valid && onSave({ nom: nom.trim(), nbJours: parseFloat(nbJours), tauxJournal: parseFloat(tauxJournal) })}
                activeOpacity={0.85}
              >
                <Ionicons name={employe ? 'checkmark' : 'add'} size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={s.btnSaveTxt}>{employe ? 'Modifier' : 'Ajouter'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ icon, label, theme, ...props }: any) {
  return (
    <View style={f.wrap}>
      <Text style={[f.label, { color: theme.textSub }]}>{label}</Text>
      <View style={[f.inputRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
        <Ionicons name={icon} size={16} color={theme.textMuted} style={{ marginRight: 10 }} />
        <TextInput
          style={[f.input, { color: theme.text }]}
          placeholderTextColor={theme.textMuted}
          {...props}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay:     { flex: 1, justifyContent: 'flex-end' },
  sheet:       { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, borderTopWidth: 1 },
  handle:      { width: 44, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  titleRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title:       { fontSize: 20, fontWeight: '700' },
  preview:     { borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderWidth: 1 },
  previewLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  previewLabel:{ fontSize: 13, fontWeight: '600' },
  previewValue:{ fontSize: 18, fontWeight: '800' },
  row:         { flexDirection: 'row', gap: 12 },
  btnCancel:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 14, borderWidth: 1 },
  btnCancelTxt:{ fontWeight: '600', fontSize: 15 },
  btnSave:     { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 14, backgroundColor: '#3b82f6' },
  btnSaveTxt:  { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnDisabled: { opacity: 0.4 },
});

const f = StyleSheet.create({
  wrap:     { marginBottom: 16 },
  label:    { fontSize: 11, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1 },
  input:    { flex: 1, fontSize: 15 },
});