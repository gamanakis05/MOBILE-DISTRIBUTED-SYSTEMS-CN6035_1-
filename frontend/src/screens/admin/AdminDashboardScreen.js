import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Colors, Spacing, BorderRadius } from '../../utils/theme';

const SECTIONS = [
  { key: 'users',        label: 'Χρήστες',      icon: 'people',       screen: 'AdminUsers',        color: '#3b82f6' },
  { key: 'reservations', label: 'Κρατήσεις',    icon: 'ticket',       screen: 'AdminReservations', color: '#8b5cf6' },
  { key: 'theatres',     label: 'Θέατρα',        icon: 'business',     screen: 'AdminTheatres',     color: '#f59e0b' },
  { key: 'shows',        label: 'Παραστάσεις',   icon: 'film',         screen: 'AdminShows',        color: '#10b981' },
  { key: 'showtimes',    label: 'Προβολές',      icon: 'calendar',     screen: 'AdminShowtimes',    color: '#ef4444' },
];

export default function AdminDashboardScreen({ navigation }) {
  const [stats,      setStats]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const statFor = (key) => {
    if (!stats) return '—';
    return stats[key] ?? '—';
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} colors={[Colors.accent]} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={32} color={Colors.accent} />
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSub}>Διαχείριση εφαρμογής</Text>
      </View>

      {/* Revenue card */}
      {stats && (
        <View style={styles.revenueCard}>
          <Ionicons name="cash-outline" size={24} color={Colors.textLight} />
          <View style={{ flex: 1 }}>
            <Text style={styles.revenueLabel}>Συνολικά Έσοδα</Text>
            <Text style={styles.revenueAmount}>€{stats.revenue?.toFixed(2) ?? '0.00'}</Text>
          </View>
        </View>
      )}

      {/* Section cards */}
      <Text style={styles.gridTitle}>Διαχείριση</Text>
      <View style={styles.grid}>
        {SECTIONS.map(sec => (
          <TouchableOpacity
            key={sec.key}
            style={styles.sectionCard}
            onPress={() => navigation.navigate(sec.screen)}
            activeOpacity={0.8}
          >
            <View style={[styles.sectionIcon, { backgroundColor: sec.color + '20' }]}>
              <Ionicons name={sec.icon} size={28} color={sec.color} />
            </View>
            <Text style={styles.sectionCount}>{statFor(sec.key)}</Text>
            <Text style={styles.sectionLabel}>{sec.label}</Text>
            <View style={[styles.sectionArrow, { backgroundColor: sec.color }]}>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { padding: Spacing.md, paddingBottom: Spacing.xxl },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, marginTop: Spacing.sm },
  headerSub:   { fontSize: 14, color: Colors.textSecondary },

  revenueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  revenueLabel:  { fontSize: 13, color: Colors.textLight + 'cc' },
  revenueAmount: { fontSize: 28, fontWeight: '800', color: Colors.textLight },

  gridTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  sectionCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  sectionCount: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, marginBottom: 2 },
  sectionLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600', marginBottom: Spacing.sm },
  sectionArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
});
