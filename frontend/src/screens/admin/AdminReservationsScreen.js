import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, Alert, TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Badge, Divider, EmptyState } from '../../components/UI';
import { Colors, Spacing, BorderRadius } from '../../utils/theme';

const STATUS_CONFIG = {
  confirmed: { label: 'Επιβεβαιωμένη', color: Colors.success },
  pending:   { label: 'Εκκρεμής',      color: Colors.warning },
  cancelled: { label: 'Ακυρωμένη',     color: Colors.error },
};

const fmt = (iso) => new Date(iso).toLocaleDateString('el-GR', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });

export default function AdminReservationsScreen() {
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/reservations');
      setReservations(data.data || []);
    } catch {
      Alert.alert('Σφάλμα', 'Αδυναμία φόρτωσης.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = (res) => {
    const options = ['confirmed', 'pending', 'cancelled']
      .filter(s => s !== res.status)
      .map(s => ({
        text: STATUS_CONFIG[s].label,
        onPress: async () => {
          try {
            await api.put(`/admin/reservations/${res.reservation_id}`, { status: s });
            fetchData();
          } catch {
            Alert.alert('Σφάλμα', 'Αδυναμία ενημέρωσης.');
          }
        },
      }));

    Alert.alert('Αλλαγή Κατάστασης', 'Επίλεξε νέα κατάσταση:', [
      ...options,
      { text: 'Άκυρο', style: 'cancel' },
    ]);
  };

  const handleDelete = (res) => {
    Alert.alert('Διαγραφή Κράτησης', 'Θέλεις σίγουρα να διαγράψεις αυτή την κράτηση;', [
      { text: 'Άκυρο', style: 'cancel' },
      {
        text: 'Διαγραφή',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/reservations/${res.reservation_id}`);
            fetchData();
          } catch {
            Alert.alert('Σφάλμα', 'Αδυναμία διαγραφής.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const sc = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.showTitle} numberOfLines={1}>{item.show_title}</Text>
            <Text style={styles.theatreName}>{item.theatre_name}</Text>
          </View>
          <Badge label={sc.label} color={sc.color} />
        </View>

        <Divider style={{ marginVertical: 8 }} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{item.user_name}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="mail-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>{item.user_email}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{fmt(item.starts_at)} {fmtTime(item.starts_at)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="business-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{item.hall}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.amount}>€{parseFloat(item.total_amount).toFixed(2)}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleStatusChange(item)}>
              <Ionicons name="swap-horizontal-outline" size={15} color={Colors.secondary} />
              <Text style={styles.actionText}>Κατάσταση</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]} onPress={() => handleDelete(item)}>
              <Ionicons name="trash-outline" size={15} color={Colors.error} />
              <Text style={[styles.actionText, { color: Colors.error }]}>Διαγραφή</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.accent} /></View>;

  return (
    <FlatList
      data={reservations}
      keyExtractor={i => String(i.reservation_id)}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      style={{ backgroundColor: Colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[Colors.accent]} />}
      ListEmptyComponent={<EmptyState message="Δεν βρέθηκαν κρατήσεις." icon={null} />}
      ListHeaderComponent={<Text style={styles.listHeader}>{reservations.length} κρατήσεις</Text>}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  listHeader: { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.sm, fontWeight: '600' },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop:     { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  showTitle:   { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  theatreName: { fontSize: 12, color: Colors.textSecondary },
  detailsGrid: { gap: 5, marginBottom: Spacing.sm },
  detailItem:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText:  { fontSize: 12, color: Colors.textSecondary, flex: 1 },
  cardFooter:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amount:      { fontSize: 16, fontWeight: '800', color: Colors.accent },
  actions:     { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.secondary + '10',
  },
  dangerBtn:  { backgroundColor: Colors.error + '10' },
  actionText: { fontSize: 12, fontWeight: '600', color: Colors.secondary },
});
