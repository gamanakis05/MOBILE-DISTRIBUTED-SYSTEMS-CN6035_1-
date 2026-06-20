import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, Alert, TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Badge, EmptyState, Divider } from '../components/UI';
import { Colors, Spacing, BorderRadius } from '../utils/theme';

const formatDate = (iso) => new Date(iso).toLocaleDateString('el-GR', {
  day: 'numeric', month: 'long', year: 'numeric',
});
const formatTime = (iso) => new Date(iso).toLocaleTimeString('el-GR', {
  hour: '2-digit', minute: '2-digit',
});

const STATUS_CONFIG = {
  confirmed: { label: 'Επιβεβαιωμένη', color: Colors.success },
  pending:   { label: 'Εκκρεμής',      color: Colors.warning },
  cancelled: { label: 'Ακυρωμένη',     color: Colors.error },
};

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  // ✅ NO useLayoutEffect here — gear button is set in RootNavigator

  const fetchReservations = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/user/reservations');
      setReservations(data.data || data || []);
    } catch {
      if (reservations.length === 0) {
        Alert.alert('Σφάλμα', 'Αδυναμία φόρτωσης κρατήσεων.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchReservations();
    }, [fetchReservations])
  );

  const handleLogout = () => {
    Alert.alert('Αποσύνδεση', 'Θέλεις σίγουρα να αποσυνδεθείς;', [
      { text: 'Άκυρο', style: 'cancel' },
      { text: 'Αποσύνδεση', style: 'destructive', onPress: logout },
    ]);
  };

  const handleCancel = (reservationId, startsAt) => {
    const showDate = new Date(startsAt);
    const now = new Date();
    const hoursDiff = (showDate - now) / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      Alert.alert(
        'Αδυναμία Ακύρωσης',
        'Η ακύρωση επιτρέπεται μόνο τουλάχιστον 24 ώρες πριν την παράσταση.'
      );
      return;
    }

    Alert.alert('Ακύρωση Κράτησης', 'Θέλεις σίγουρα να ακυρώσεις αυτή την κράτηση;', [
      { text: 'Όχι', style: 'cancel' },
      {
        text: 'Ακύρωση',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/reservations/${reservationId}`);
            fetchReservations();
          } catch (err) {
            Alert.alert('Σφάλμα', err.response?.data?.message || 'Αδυναμία ακύρωσης.');
          }
        },
      },
    ]);
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
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.resDetail}>{formatDate(item.starts_at)} — {formatTime(item.starts_at)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="business-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.resDetail}>{item.hall}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.resDetail}>{item.duration} λεπτά</Text>
          </View>
        </View>

        <View style={styles.resFooter}>
          <Text style={styles.resAmount}>€{parseFloat(item.total_amount).toFixed(2)}</Text>
          {isFuture && !isCancelled && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handleCancel(item.reservation_id, item.starts_at)}
            >
              <Ionicons name="close-circle-outline" size={14} color={Colors.error} />
              <Text style={styles.cancelBtnText}>Ακύρωση</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Not logged in
  if (!user) {
    return (
      <View style={styles.notLoggedIn}>
        <Ionicons name="person-circle-outline" size={72} color={Colors.disabled} />
        <Text style={styles.notLoggedInText}>Δεν είσαι συνδεδεμένος</Text>
        <TouchableOpacity
          style={styles.loginCta}
          onPress={() => navigation.navigate('AuthStack', { screen: 'Login' })}
        >
          <Text style={styles.loginCtaText}>Σύνδεση / Εγγραφή</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* User header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {user?.role === 'admin' && (
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={12} color={Colors.textLight} />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.accentSoft} />
        </TouchableOpacity>
      </View>

      {/* Admin shortcut */}
      {user?.role === 'admin' && (
        <TouchableOpacity
          style={styles.adminShortcut}
          onPress={() => navigation.navigate('AdminDashboard')}
        >
          <Ionicons name="shield-outline" size={18} color={Colors.accent} />
          <Text style={styles.adminShortcutText}>Admin Panel</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.accent} />
        </TouchableOpacity>
      )}

      {/* Reservations header */}
      <View style={styles.reservationsHeader}>
        <Ionicons name="ticket-outline" size={16} color={Colors.textPrimary} />
        <Text style={styles.reservationsTitle}>Κρατήσεις μου</Text>
        <Text style={styles.reservationsCount}>({reservations.length})</Text>
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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchReservations(); }}
              colors={[Colors.accent]}
            />
          }
          ListEmptyComponent={
            <EmptyState message="Δεν έχεις κρατήσεις ακόμα." />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  notLoggedIn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  notLoggedInText: { fontSize: 17, color: Colors.textSecondary, marginVertical: Spacing.md },
  loginCta: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  loginCtaText: { color: Colors.textLight, fontWeight: '700', fontSize: 15 },

  profileHeader: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText:     { fontSize: 24, fontWeight: '800', color: Colors.textLight },
  userInfo:       { flex: 1 },
  userName:       { fontSize: 17, fontWeight: '700', color: Colors.textLight, marginBottom: 2 },
  userEmail:      { fontSize: 12, color: Colors.disabled },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: 4,
  },
  adminBadgeText: { color: Colors.textLight, fontSize: 11, fontWeight: '700' },
  logoutBtn:      { padding: Spacing.sm },

  adminShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.accent + '40',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  adminShortcutText: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.accent },

  reservationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    marginTop: Spacing.md,
  },
  reservationsTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  reservationsCount: { fontSize: 14, color: Colors.textSecondary },

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
  showTitle:   { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  theatreName: { fontSize: 12, color: Colors.textSecondary },
  resDivider:  { marginVertical: Spacing.sm },
  resDetails:  { gap: 5, marginBottom: Spacing.sm },
  detailRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resDetail:   { fontSize: 13, color: Colors.textSecondary },
  resFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  resAmount:     { fontSize: 18, fontWeight: '800', color: Colors.accent },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.error,
  },
  cancelBtnText: { color: Colors.error, fontWeight: '600', fontSize: 12 },
});
