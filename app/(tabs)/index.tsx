// app/(tabs)/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, StatusBar,
  Dimensions, Platform, TextInput, LayoutAnimation,
  UIManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { getEmployes, getStats, addEmploye, updateEmploye, deleteEmploye } from '../../services/api';
import EmployeForm from '../../components/EmployeForm';
import SweetAlert from '../../components/SweetAlert';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

type Employe = {
  numEmp: number;
  nom: string;
  nbJours: number;
  tauxJournal: number;
  salaire: number;
};

type Stats = { total: number; min: number; max: number };

export default function EmployesScreen() {
  const { theme, isDark, toggle } = useTheme();

  const [employes, setEmployes]     = useState<Employe[]>([]);
  const [stats, setStats]           = useState<Stats>({ total: 0, min: 0, max: 0 });
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState<Employe | null>(null);
  const [alert, setAlert]           = useState<any>({ visible: false });
  const [search, setSearch]         = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const insets = useSafeAreaInsets();

  const fetchAll = useCallback(async () => {
    try {
      const [empRes, statRes] = await Promise.all([getEmployes(), getStats()]);
      setEmployes(empRes.data);
      setStats(statRes.data);
    } catch (err: any) {
      showAlert('error', 'Erreur réseau', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  const showAlert = (type: string, title: string, message?: string, onConfirm?: () => void, onCancel?: () => void) =>
    setAlert({ visible: true, type, title, message, onConfirm, onCancel });

  const closeAlert = () => {
    const cb = alert.onConfirm;
    setAlert({ visible: false });
    cb?.();
  };

  const cancelAlert = () => {
    const cb = alert.onCancel;
    setAlert({ visible: false });
    cb?.();
  };

  const handleSave = async (data: { nom: string; nbJours: number; tauxJournal: number }) => {
    try {
      if (editTarget) {
        await updateEmploye(editTarget.numEmp, data);
        showAlert('success', 'Modifié !', `${data.nom} a été mis à jour.`, () => {
          setShowForm(false); setEditTarget(null); fetchAll();
        });
      } else {
        await addEmploye(data);
        showAlert('success', 'Ajouté !', `${data.nom} a été ajouté.`, () => {
          setShowForm(false); fetchAll();
        });
      }
    } catch (err: any) {
      showAlert('error', 'Erreur', err.message);
    }
  };

  const handleDelete = (emp: Employe) => {
    showAlert(
      'warning',
      'Confirmation',
      `Supprimer ${emp.nom} ?`,
      async () => {
        try {
          await deleteEmploye(emp.numEmp);
          showAlert('success', 'Supprimé !', `${emp.nom} a été supprimé.`, fetchAll);
        } catch (err: any) {
          showAlert('error', 'Erreur', err.message);
        }
      },
      () => {},
    );
  };

  const handleEdit   = (emp: Employe) => { setEditTarget(emp); setShowForm(true); };

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-DZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);

  const filtered = employes.filter(e =>
    e.nom.toLowerCase().includes(search.toLowerCase())
  );

  // ─── ROW ─────────────────────────────────────────────────────────────────
  const renderItem = ({ item, index }: { item: Employe; index: number }) => {
    const isOpen = expandedId === item.numEmp;
    const pct    = stats.max > 0 ? (item.salaire / stats.max) * 100 : 0;

    return (
      <View style={[
        styles.row,
        index === 0 && styles.rowFirst,
        { borderColor: theme.border, backgroundColor: theme.surface },
      ]}>
        {/* Collapsed header */}
        <TouchableOpacity activeOpacity={0.8} onPress={() => toggleExpand(item.numEmp)}>
          <LinearGradient
            colors={[theme.rowFrom, theme.rowTo]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.rowHeader}
          >
            <View style={[styles.avatar, { backgroundColor: theme.avatarBg, borderColor: theme.border }]}>
              <Text style={styles.avatarText}>{getInitials(item.nom)}</Text>
            </View>

            <View style={styles.info}>
              <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{item.nom}</Text>
              <View style={styles.details}>
                <View style={styles.detailItem}>
                  <FontAwesome5 name="calendar-alt" size={10} color="#3b82f6" solid />
                  <Text style={[styles.detailText, { color: theme.textMuted }]}>{item.nbJours}j</Text>
                </View>
                <View style={styles.detailItem}>
                  <FontAwesome5 name="coins" size={10} color="#f59e0b" solid />
                  <Text style={[styles.detailText, { color: theme.textMuted }]}>{formatCurrency(item.tauxJournal)}/jr</Text>
                </View>
              </View>
            </View>

            <Text style={styles.salary}>{formatCurrency(item.salaire)}</Text>
            <Ionicons
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={16} color={theme.textSub}
              style={{ marginLeft: 8 }}
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Expanded body */}
        {isOpen && (
          <View style={[styles.rowBody, { backgroundColor: theme.bg, borderTopColor: theme.surface }]}>
            <View style={styles.expandSection}>
              <Text style={[styles.expandLabel, { color: theme.textSub }]}>Part du salaire max</Text>
              <View style={[styles.barWrap, { backgroundColor: theme.barBg }]}>
                <View style={[styles.barFill, { width: `${pct}%` as any }]} />
              </View>
              <Text style={styles.expandPct}>{Math.round(pct)}%</Text>
            </View>

            <View style={styles.expandGrid}>
              <DetailCell icon="calendar-alt"    label="Jours travaillés" value={`${item.nbJours} j`}                    color="#3b82f6" theme={theme} />
              <DetailCell icon="coins"           label="Taux journalier"  value={`${formatCurrency(item.tauxJournal)}`}  color="#f59e0b" theme={theme} />
              <DetailCell icon="money-bill-wave" label="Salaire brut"     value={`${formatCurrency(item.salaire)}`}      color="#22c55e" theme={theme} />
              <DetailCell icon="id-badge"        label="N° employé"       value={`#${item.numEmp}`}                      color="#a855f7" theme={theme} />
            </View>

            <View style={styles.expandActions}>
              <TouchableOpacity style={styles.btnEdit} onPress={() => handleEdit(item)} activeOpacity={0.7}>
                <Ionicons name="pencil" size={14} color="#fff" />
                <Text style={styles.btnActionText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDel} onPress={() => handleDelete(item)} activeOpacity={0.7}>
                <Ionicons name="trash" size={14} color="#fff" />
                <Text style={styles.btnActionText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // ─── HEADER ──────────────────────────────────────────────────────────────
  const ListHeader = () => (
    <>
      <LinearGradient colors={[theme.headerFrom, theme.headerTo]} style={styles.headerGradient}>
        {/* App bar */}
        <View style={styles.appBar}>
          <View style={styles.appBarLeft}>
            <View style={[styles.logoContainer, { backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.2)' }]}>
              <MaterialCommunityIcons name="briefcase-account" size={28} color={isDark ? '#3b82f6' : '#fff'} />
            </View>
            <View>
              <Text style={[styles.appTitle, { color: isDark ? '#f1f5f9' : '#fff' }]}>GestiPaie</Text>
              <Text style={[styles.appSub, { color: isDark ? '#64748b' : 'rgba(255,255,255,0.7)' }]}>Gestion des employés</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* 🌙 / ☀️ Toggle button */}
            <TouchableOpacity
              onPress={toggle}
              activeOpacity={0.8}
              style={[styles.btnTheme, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.25)' }]}
            >
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={18}
                color={isDark ? '#f59e0b' : '#fff'}
              />
            </TouchableOpacity>

            {/* + Nouveau */}
            <TouchableOpacity
              style={styles.btnAdd}
              onPress={() => { setEditTarget(null); setShowForm(true); }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.btnAddGradient}
              >
                <Ionicons name="add" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats preview */}
        <View style={[styles.statsPreview, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.15)' }]}>
          <View style={styles.statPreviewItem}>
            <Text style={[styles.statPreviewValue, { color: '#fff' }]}>{filtered.length}</Text>
            <Text style={[styles.statPreviewLabel, { color: isDark ? '#64748b' : 'rgba(255,255,255,0.7)' }]}>Employés</Text>
          </View>
          <View style={[styles.statPreviewDivider, { backgroundColor: isDark ? '#334155' : 'rgba(255,255,255,0.3)' }]} />
          <View style={styles.statPreviewItem}>
            <Text style={[styles.statPreviewValue, { color: '#fff' }]}>{formatCurrency(stats.total)}</Text>
            <Text style={[styles.statPreviewLabel, { color: isDark ? '#64748b' : 'rgba(255,255,255,0.7)' }]}>Masse salariale</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Search bar */}
      <View style={[styles.searchWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search" size={16} color={theme.textSub} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Rechercher un employé..."
          placeholderTextColor={theme.textSub}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.searchClear}>
            <Ionicons name="close-circle" size={16} color={theme.textSub} />
          </TouchableOpacity>
        )}
      </View>

      {filtered.length > 0 && (
        <View style={[styles.tableHead, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.thText, { flex: 2, color: theme.textSub }]}>Employé</Text>
          <Text style={[styles.thText, { flex: 1.2, textAlign: 'right', color: theme.textSub }]}>Salaire</Text>
          <View style={{ width: 28 }} />
        </View>
      )}
    </>
  );

  // ─── FOOTER ──────────────────────────────────────────────────────────────
  const ListFooter = () => (
    <View style={styles.footer}>
      <LinearGradient colors={[theme.surface, theme.surface2]} style={[styles.footerGradient, { borderColor: theme.border, borderWidth: 1 }]}>
        <StatCard icon={<FontAwesome5 name="chart-pie"        size={16} color="#3b82f6" solid />} label="Total"   value={stats.total} color="#3b82f6" theme={theme} />
        <StatCard icon={<Ionicons     name="arrow-down-circle" size={16} color="#22c55e" />}       label="Minimum" value={stats.min}   color="#22c55e" theme={theme} />
        <StatCard icon={<Ionicons     name="arrow-up-circle"   size={16} color="#f59e0b" />}       label="Maximum" value={stats.max}   color="#f59e0b" theme={theme} />
      </LinearGradient>
    </View>
  );

  // ─── EMPTY ───────────────────────────────────────────────────────────────
  const ListEmpty = () => (
    <View style={styles.empty}>
      <LinearGradient colors={[theme.surface, theme.surface2]} style={[styles.emptyGradient, { borderColor: theme.border }]}>
        <MaterialCommunityIcons name="account-search-outline" size={80} color={theme.border} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>{search ? 'Aucun résultat' : 'Aucun employé'}</Text>
        <Text style={[styles.emptySub, { color: theme.textSub }]}>
          {search
            ? `Aucun employé ne correspond à "${search}"`
            : 'Commencez par ajouter votre premier employé'}
        </Text>
        {!search && (
          <TouchableOpacity style={styles.emptyBtn} onPress={() => { setEditTarget(null); setShowForm(true); }}>
            <LinearGradient colors={['#3b82f6', '#2563eb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.emptyBtnGradient}>
              <Text style={styles.emptyBtnText}>Ajouter un employé</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );

  if (loading) return (
    <LinearGradient colors={[theme.bg, theme.surface]} style={styles.loadWrap}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={[styles.loadText, { color: theme.textSub }]}>Chargement des données...</Text>
    </LinearGradient>
  );

  return (
    <View style={[styles.safe, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerFrom} />
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.numEmp)}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={filtered.length > 0 ? ListFooter : null}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" colors={['#3b82f6']} />
        }
      />

      <EmployeForm
        visible={showForm}
        employe={editTarget}
        onSave={handleSave}
        onClose={() => { setShowForm(false); setEditTarget(null); }}
      />

      <SweetAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onConfirm={closeAlert}
        onCancel={alert.type === 'warning' && alert.onCancel ? cancelAlert : undefined}
      />
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function DetailCell({ icon, label, value, color, theme }: { icon: string; label: string; value: string; color: string; theme: any }) {
  return (
    <View style={[dc.cell, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <FontAwesome5 name={icon} size={13} color={color} solid />
      <Text style={[dc.label, { color: theme.textSub }]}>{label}</Text>
      <Text style={[dc.value, { color }]}>{value}</Text>
    </View>
  );
}

function StatCard({ icon, label, value, color, theme }: any) {
  return (
    <View style={[sc.card, { borderTopColor: color, backgroundColor: theme.bg }]}>
      <View style={sc.iconWrap}>{icon}</View>
      <Text style={[sc.label, { color: theme.textSub }]}>{label}</Text>
      <Text style={[sc.value, { color }]}>
        {new Intl.NumberFormat('fr-DZ', { minimumFractionDigits: 0 }).format(value)}
      </Text>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:     { flex: 1 },
  list:     { paddingBottom: 20 },
  loadWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadText: { marginTop: 12, fontSize: 16, fontWeight: '500' },

  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  appBar:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  appBarLeft:   { flexDirection: 'row', alignItems: 'center' },
  logoContainer:{ width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  appTitle:     { fontSize: 24, fontWeight: '800', letterSpacing: 0.5 },
  appSub:       { fontSize: 13, marginTop: 2 },

  btnTheme: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  btnAdd:       { borderRadius: 14, overflow: 'hidden', ...Platform.select({ ios: { shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }, android: { elevation: 8 } }) },
  btnAddGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  btnAddText:   { color: '#fff', fontWeight: '600', fontSize: 14 },

  statsPreview:       { flexDirection: 'row', borderRadius: 20, padding: 16 },
  statPreviewItem:    { flex: 1, alignItems: 'center' },
  statPreviewValue:   { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  statPreviewLabel:   { fontSize: 12, fontWeight: '500' },
  statPreviewDivider: { width: 1, marginHorizontal: 16 },

  searchWrap:  { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 16, marginBottom: 4, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, minHeight: 44 },
  searchIcon:  { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0, minWidth: 0 },
  searchClear: { padding: 4 },

  tableHead:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, marginHorizontal: 20, marginTop: 12, marginBottom: 6, borderRadius: 12, borderWidth: 1 },
  thText:      { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  row:         { marginHorizontal: 20, marginBottom: 8, borderRadius: 16, overflow: 'hidden', borderWidth: 1, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 2 } }) },
  rowFirst:    { marginTop: 8 },
  rowHeader:   { flexDirection: 'row', alignItems: 'center', padding: 12 },
  avatar:      { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1 },
  avatarText:  { fontSize: 14, fontWeight: '700', color: '#60a5fa' },
  info:        { flex: 1, marginRight: 8 },
  name:        { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  details:     { flexDirection: 'row', gap: 12 },
  detailItem:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText:  { fontSize: 11 },
  salary:      { fontSize: 13, fontWeight: '700', color: '#60a5fa' },

  rowBody:     { padding: 14, borderTopWidth: 1 },
  expandSection: { marginBottom: 12 },
  expandLabel:   { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 6 },
  barWrap:       { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  barFill:       { height: 6, borderRadius: 3, backgroundColor: '#3b82f6' },
  expandPct:     { fontSize: 11, color: '#3b82f6', fontWeight: '700', textAlign: 'right' },
  expandGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  expandActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  btnEdit:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, backgroundColor: '#1d4ed8' },
  btnDel:        { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, backgroundColor: '#7f1d1d' },
  btnActionText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  footer:         { marginHorizontal: 20, marginTop: 16, borderRadius: 24, overflow: 'hidden' },
  footerGradient: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 24 },

  empty:          { marginHorizontal: 20, marginTop: 40 },
  emptyGradient:  { padding: 32, borderRadius: 24, alignItems: 'center', borderWidth: 1 },
  emptyTitle:     { fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySub:       { fontSize: 14, marginTop: 8, textAlign: 'center' },
  emptyBtn:       { marginTop: 24, borderRadius: 12, overflow: 'hidden' },
  emptyBtnGradient: { paddingHorizontal: 20, paddingVertical: 12 },
  emptyBtnText:   { color: '#fff', fontWeight: '600', fontSize: 14 },
});

const dc = StyleSheet.create({
  cell:  { width: '47%', borderRadius: 12, padding: 12, alignItems: 'flex-start', gap: 4, borderWidth: 1 },
  label: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
  value: { fontSize: 13, fontWeight: '700' },
});

const sc = StyleSheet.create({
  card:    { flex: 1, padding: 14, borderRadius: 16, alignItems: 'center', borderTopWidth: 3 },
  iconWrap:{ marginBottom: 8 },
  label:   { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  value:   { fontSize: 12, fontWeight: '800', textAlign: 'center' },
});