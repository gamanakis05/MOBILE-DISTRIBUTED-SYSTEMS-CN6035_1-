import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, Alert, TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button, Badge, EmptyState, Divider } from '../components/UI';
import { Colors, Spacing, BorderRadius } from '../utils/theme';

const formatDate = (iso) => new Date(iso).toLocaleDateString('el-GR', {
  day: 'numeric', month: 'long', year: 'numeric',
});
const formatTime = (iso) => new Date(iso).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });

const STATUS_CONFIG = {
  confirmed:  { label: 'Επιβεβαιωμένη', color: Colors.success },
  pending:    { label: 'Εκκρεμής',       color: Colors.warning },
  cancelled:  { label: 'Ακυρωμένη',     color: Colors.error },
};

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  const fetchReservations = useCallback(async () => {
    try {
      const { data } = await api.get('/user/reservations');
      setReservations(data);
    } catch {
      Alert.alert('Σφάλμα', 'Αδυναμία φόρτωσης κρατήσεων.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const handleLogout = () => {
    Alert.alert('Αποσύνδεση', 'Θέλεις σίγουρα να αποσυνδεθείς;', [
      { text: 'Άκυρο', style: 'cancel' },
      { text: 'Αποσύνδεση', style: 'destructive', onPress: logout },
    ]);
  };

  const handleCancel = (reservationId) => {
    Alert.alert(
      'Ακύρωση Κράτησης',
      'Θέλεις σίγουρα να ακυρώσεις αυτή την κράτηση;',
      [
        { text: 'Όχι', style: 'cancel' },
        {
          text: 'Ακύρωση',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/reservations/${reservationId}`);
              fetchReservations();
            } catch (err) {
              const msg = err.response?.data?.message || 'Αδυναμία ακύρωσης.';
              Alert.alert('Σφάλμα', msg);
            }
          },
        },
      ]
    );
  };

  const renderReservation = ({ item }) => {
    const sc          = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const isFuture    = new Date(item.starts_at) > new Date();
    const isCancelled = item.status === 'cancelled';

    return (
      <View style={styles.reservationCard}>
        <View style={styles.resHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.showTitle} numberOfLines={1}>{item.show_title}</Text>
            <Text style={styles.theatreName}>{item.theatre_name}</Text>
          </View>
          <Badge label={sc.label} color={sc.color} />
        </View>

        <Divider style={styles.resDivider} />

        <View style={styles.resDetails}>
          <Text style={styles.resDetail}>📅 {formatDate(item.starts_at)} — {formatTime(item.starts_at)}</Text>
          <Text style={styles.resDetail}>🏛 {item.hall}</Text>
          <Text style={styles.resDetail}>⏱ {item.duration} λεπτά</Text>
        </View>

        <View style={styles.resFooter}>
          <Text style={styles.resAmount}>€{parseFloat(item.total_amount).toFixed(2)}</Text>
          {isFuture && !isCancelled && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handleCancel(item.reservation_id)}
            >
              <Text style={styles.cancelBtnText}>Ακύρωση</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* User info header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Αποσύνδεση</Text>
        </TouchableOpacity>
      </View>

      {/* Reservations */}
      <View style={styles.reservationsHeader}>
        <Text style={styles.reservationsTitle}>Κρατήσεις μου</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: Spacing.xl }} />
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={i => String(i.reservation_id)}
          renderItem={renderReservation}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReservations(); }} colors={[Colors.accent]} />
          }
          ListEmptyComponent={
            <EmptyState
              message="Δεν έχεις κρατήσεις ακόμα.&#10;Κάνε κράτηση για μια παράσταση!"
              icon="🎟️"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  profileHeader: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: Colors.textLight },
  userName:   { fontSize: 20, fontWeight: '700', color: Colors.textLight, marginBottom: 4 },
  userEmail:  { fontSize: 13, color: Colors.disabled, marginBottom: Spacing.md },
  logoutBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.accentSoft,
  },
  logoutText: { color: Colors.accentSoft, fontWeight: '600', fontSize: 13 },

  reservationsHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  reservationsTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },

  list: { padding: Spacing.md, paddingBottom: Spacing.xl },

  reservationCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  resHeader:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  showTitle:   { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  theatreName: { fontSize: 12, color: Colors.textSecondary },
  resDivider:  { marginVertical: Spacing.sm },
  resDetails:  { gap: 4, marginBottom: Spacing.sm },
  resDetail:   { fontSize: 13, color: Colors.textSecondary },
  resFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  resAmount: { fontSize: 18, fontWeight: '800', color: Colors.accent },
  cancelBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  cancelBtnText: { color: Colors.error, fontWeight: '600', fontSize: 13 },
});
