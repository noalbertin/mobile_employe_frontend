// app/(tabs)/stats.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar,
  TouchableOpacity, ActivityIndicator, ScrollView, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { getEmployes, getStats } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const W = Dimensions.get('window').width - 40;

export default function StatsScreen() {
  const { theme, isDark } = useTheme();

  const [stats,     setStats]     = useState({ total: 0, min: 0, max: 0 });
  const [employes,  setEmployes]  = useState<any[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [loading,   setLoading]   = useState(true);
  const insets = useSafeAreaInsets();

  // Dynamic chart config based on theme
  const chartConfig = {
    backgroundGradientFrom: theme.surface,
    backgroundGradientTo:   theme.bg,
    decimalPlaces: 0,
    color:      (o = 1) => `rgba(96,165,250,${o})`,
    labelColor: (o = 1) => isDark ? `rgba(148,163,184,${o})` : `rgba(71,85,105,${o})`,
    propsForBackgroundLines: { stroke: theme.border, strokeWidth: 1 },
    barPercentage: 0.55,
  };

  useEffect(() => {
    const load = () =>
      Promise.all([getStats(), getEmployes()])
        .then(([s, e]) => { setStats(s.data); setEmployes(e.data); })
        .finally(() => setLoading(false));

    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const barData = {
    labels: ['Total', 'Min', 'Max'],
    datasets: [{ data: [stats.total, stats.min, stats.max] }],
  };

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6'];

  const rawPie = employes.slice(0, 6).filter(e => Number(e.salaire) > 0);
  const pieData = rawPie.length > 0
    ? rawPie.map((e, i) => ({
        name: e.nom.split(' ')[0],
        population: Number(e.salaire),
        color: COLORS[i % COLORS.length],
        legendFontColor: isDark ? '#94a3b8' : '#475569',
        legendFontSize: 12,
      }))
    : [{ name: 'Aucune donnée', population: 1, color: theme.border, legendFontColor: theme.textSub, legendFontSize: 12 }];

  if (loading) return (
    <View style={[s.loadWrap, { backgroundColor: theme.bg }]}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );

  return (
    <View style={[s.safe, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Ionicons name="stats-chart" size={26} color="#3b82f6" style={{ marginRight: 10 }} />
            <View>
              <Text style={[s.title, { color: theme.text }]}>Statistiques</Text>
              <Text style={[s.sub, { color: theme.textMuted }]}>Vue d'ensemble des salaires</Text>
            </View>
          </View>
        </View>

        {/* KPI Cards */}
        <View style={s.kpiRow}>
          <KpiCard icon={<FontAwesome5 name="money-bill-wave" size={18} color="#3b82f6" />} label="Masse salariale" value={stats.total} color="#3b82f6" theme={theme} />
          <KpiCard icon={<Ionicons name="trending-down"       size={20} color="#22c55e" />} label="Salaire min"     value={stats.min}   color="#22c55e" theme={theme} />
          <KpiCard icon={<Ionicons name="trending-up"         size={20} color="#f59e0b" />} label="Salaire max"     value={stats.max}   color="#f59e0b" theme={theme} />
        </View>

        {/* Chart toggle */}
        <View style={[s.chartCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[s.cardTitle, { color: theme.text }]}>Visualisation</Text>
          <View style={[s.toggle, { backgroundColor: theme.toggleBg }]}>
            <TouchableOpacity style={[s.tab, chartType === 'bar' && s.tabOn]} onPress={() => setChartType('bar')}>
              <Ionicons name="bar-chart" size={14} color={chartType === 'bar' ? '#fff' : theme.textSub} style={{ marginRight: 5 }} />
              <Text style={[s.tabTxt, { color: chartType === 'bar' ? '#fff' : theme.textSub }]}>Histogramme</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.tab, chartType === 'pie' && s.tabOn]} onPress={() => setChartType('pie')}>
              <Ionicons name="pie-chart" size={14} color={chartType === 'pie' ? '#fff' : theme.textSub} style={{ marginRight: 5 }} />
              <Text style={[s.tabTxt, { color: chartType === 'pie' ? '#fff' : theme.textSub }]}>Camembert</Text>
            </TouchableOpacity>
          </View>

          {chartType === 'bar' ? (
            <BarChart
              data={barData} width={W - 32} height={220} yAxisLabel="" yAxisSuffix=""
              chartConfig={chartConfig} fromZero showValuesOnTopOfBars withInnerLines={false} style={s.chart}
            />
          ) : (
            <PieChart
              data={pieData}
              width={W - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute={false}
              hasLegend={true}
              style={s.chart}
            />
          )}
        </View>

        {/* Ranking */}
        {employes.length > 0 && (
          <View style={[s.rankCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={s.rankHeader}>
              <MaterialCommunityIcons name="trophy-outline" size={18} color="#f59e0b" style={{ marginRight: 8 }} />
              <Text style={[s.cardTitle, { color: theme.text }]}>Classement des salaires</Text>
            </View>
            {[...employes].sort((a, b) => b.salaire - a.salaire).map((emp, i) => {
              const pct = stats.max > 0 ? (emp.salaire / stats.max) * 100 : 0;
              const clr = i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : '#3b82f6';
              return (
                <View key={emp.numEmp} style={s.rankRow}>
                  <Text style={[s.rankNum, { color: clr }]}>{i + 1}</Text>
                  <View style={s.rankInfo}>
                    <View style={s.rankTop}>
                      <Text style={[s.rankName, { color: theme.text }]}>{emp.nom}</Text>
                      <Text style={[s.rankSal, { color: clr }]}>{Number(emp.salaire).toLocaleString('fr-FR')}</Text>
                    </View>
                    <View style={[s.barWrap, { backgroundColor: theme.barBg }]}>
                      <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: clr }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

function KpiCard({ icon, label, value, color, theme }: any) {
  return (
    <View style={[kpi.card, { borderTopColor: color, backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={kpi.iconWrap}>{icon}</View>
      <Text style={[kpi.label, { color: theme.textSub }]}>{label}</Text>
      <Text style={[kpi.value, { color }]}>{Number(value).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1 },
  scroll:  { padding: 20, paddingBottom: 40 },
  loadWrap:{ flex: 1, justifyContent: 'center', alignItems: 'center' },

  header:    { marginBottom: 20 },
  headerLeft:{ flexDirection: 'row', alignItems: 'center' },
  title:     { fontSize: 26, fontWeight: '800' },
  sub:       { fontSize: 13, marginTop: 4 },

  kpiRow:    { flexDirection: 'row', gap: 8, marginBottom: 16 },

  chartCard: { borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  toggle:    { flexDirection: 'row', borderRadius: 10, padding: 3, marginBottom: 16 },
  tab:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8 },
  tabOn:     { backgroundColor: '#3b82f6' },
  tabTxt:    { fontSize: 12, fontWeight: '600' },
  chart:     { borderRadius: 12 },

  rankCard:  { borderRadius: 20, padding: 16, borderWidth: 1 },
  rankHeader:{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  rankRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  rankNum:   { fontSize: 16, fontWeight: '800', width: 24, marginRight: 12 },
  rankInfo:  { flex: 1 },
  rankTop:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  rankName:  { fontSize: 13, fontWeight: '600' },
  rankSal:   { fontSize: 13, fontWeight: '700' },
  barWrap:   { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill:   { height: 6, borderRadius: 3 },
});

const kpi = StyleSheet.create({
  card:    { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', borderTopWidth: 3, borderWidth: 1 },
  iconWrap:{ marginBottom: 8 },
  label:   { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 },
  value:   { fontSize: 16, fontWeight: '800' },
});