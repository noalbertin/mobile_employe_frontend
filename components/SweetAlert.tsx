// components/SweetAlert.tsx
import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type IconConfig = { bg: string; name: any; color: string };

const TYPES: Record<string, IconConfig> = {
  success: { bg: '#22c55e', name: 'checkmark',         color: '#fff' },
  error:   { bg: '#ef4444', name: 'close',              color: '#fff' },
  warning: { bg: '#f59e0b', name: 'warning',            color: '#fff' },
  info:    { bg: '#3b82f6', name: 'information-circle', color: '#fff' },
};

type Props = {
  visible: boolean;
  type?: string;
  title: string;
  message?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export default function SweetAlert({ visible, type = 'info', title, message, onConfirm, onCancel }: Props) {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(0.6)).current;
  const opac  = useRef(new Animated.Value(0)).current;
  const cfg   = TYPES[type] ?? TYPES.info;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 }),
        Animated.timing(opac,  { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.6);
      opac.setValue(0);
    }
  }, [visible]);

  const hasCancel = !!onCancel;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <View style={[s.overlay, { backgroundColor: theme.overlay }]}>
        <Animated.View style={[
          s.card,
          {
            opacity: opac,
            transform: [{ scale }],
            backgroundColor: theme.cardBg,
            borderColor: theme.border,
          }
        ]}>

          {/* Icon circle */}
          <View style={[s.circle, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.name} size={32} color={cfg.color} />
          </View>

          <Text style={[s.title, { color: theme.text }]}>{title}</Text>
          {message ? <Text style={[s.msg, { color: theme.textSub }]}>{message}</Text> : null}

          <View style={[s.btnRow, hasCancel && s.btnRowDouble]}>
            {hasCancel && (
              <TouchableOpacity style={[s.btnCancel, { backgroundColor: theme.surfaceAlt }]} onPress={onCancel} activeOpacity={0.85}>
                <Ionicons name="close" size={15} color={theme.textSub} style={{ marginRight: 5 }} />
                <Text style={[s.btnCancelTxt, { color: theme.textSub }]}>Annuler</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[s.btn, { backgroundColor: cfg.bg }, hasCancel && s.btnFlex]}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={s.btnTxt}>OK</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    width: 300, borderRadius: 22,
    paddingVertical: 32, paddingHorizontal: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5, shadowRadius: 24, elevation: 20,
    borderWidth: 1,
  },
  circle:       { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  title:        { fontSize: 20, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  msg:          { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 4 },

  btnRow:       { marginTop: 20, flexDirection: 'row', justifyContent: 'center' },
  btnRowDouble: { gap: 10, width: '100%' },

  btn:          { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 50, minWidth: 140, justifyContent: 'center' },
  btnFlex:      { flex: 1, minWidth: 0, paddingHorizontal: 16 },
  btnTxt:       { color: '#fff', fontWeight: '700', fontSize: 16 },

  btnCancel:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 50 },
  btnCancelTxt: { fontWeight: '600', fontSize: 15 },
});