import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, Alert, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Button, Divider } from '../components/UI';
import { Colors, Spacing, BorderRadius } from '../utils/theme';

const formatDate = (iso) => new Date(iso).toLocaleDateString('el-GR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});
const formatTime = (iso) => new Date(iso).toLocaleTimeString('el-GR', {
  hour: '2-digit', minute: '2-digit',
});

export default function BookingScreen({ route, navigation }) {
  const { showtimeId, showTitle } = route.params;
  const { user } = useAuth();

  const [showtime,   setShowtime]   = useState(null);
  const [categories, setCategories] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [stRes, seatsRes] = await Promise.all([
          api.get(`/showtimes/${showtimeId}`),
          api.get('/seats', { params: { showtimeId } }),
        ]);
        setShowtime(stRes.data.data || stRes.data);
        const cats = seatsRes.data.data || seatsRes.data || [];
        setCategories(cats);
        const q = {};
        cats.forEach(c => { q[c.category_id] = 0; });
        setQuantities(q);
      } catch {
        Alert.alert('Σφάλμα', 'Αδυναμία φόρτωσης.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [showtimeId]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      Alert.alert(
        'Απαιτείται Σύνδεση',
        'Πρέπει να συνδεθείς για να κάνεις κράτηση.',
        [
          { text: 'Σύνδεση', onPress: () => navigation.navigate('AuthStack', { screen: 'Login' }) },
          { text: 'Άκυρο',   onPress: () => navigation.goBack(), style: 'cancel' },
        ]
      );
    }
  }, [loading, user]);

  const adjustQty = (catId, delta, max) => {
    setQuantities(prev => ({
      ...prev,
      [catId]: Math.max(0, Math.min(max, (prev[catId] || 0) + delta)),
    }));
  };

  const totalAmount  = categories.reduce((sum, cat) => sum + (quantities[cat.category_id] || 0) * parseFloat(cat.price), 0);
  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleSubmit = async () => {
    if (totalTickets === 0) {
      Alert.alert('Προσοχή', 'Επίλεξε τουλάχιστον ένα εισιτήριο.');
      return;
    }
    const items = categories
      .filter(c => quantities[c.category_id] > 0)
      .map(c => ({ categoryId: c.category_id, quantity: quantities[c.category_id] }));

    setSubmitting(true);
    try {
      await api.post('/reservations', { showtimeId, items });
      Alert.alert(
        'Επιτυχής Κράτηση',
        `Η κράτησή σου καταχωρήθηκε.\nΣύνολο: €${totalAmount.toFixed(2)}`,
        [{ text: 'Οκ', onPress: () => {
          const tabNav = navigation.getParent('ShowsTab')?.getParent() || navigation.getParent();
          navigation.popToTop();
          tabNav?.navigate('ProfileTab');
        }}]
      );
    } catch (err) {
      Alert.alert('Σφάλμα', err.response?.data?.message || 'Σφάλμα κράτησης.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Show info header */}
      <View style={styles.header}>
        <Text style={styles.showTitle}>{showTitle}</Text>
        {showtime && (
          <View style={styles.headerMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={Colors.disabled} />
              <Text style={styles.metaText}>{formatDate(showtime.starts_at)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={Colors.disabled} />
              <Text style={styles.metaText}>{formatTime(showtime.starts_at)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="business-outline" size={14} color={Colors.disabled} />
              <Text style={styles.metaText}>{showtime.hall}</Text>
            </View>
          </View>
        )}
      </View>

      <Divider />

      {/* Seat categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="ticket-outline" size={18} color={Colors.textPrimary} />
          <Text style={styles.sectionTitle}>Επιλογή Θέσεων</Text>
        </View>

        {categories.map(cat => {
          const qty       = quantities[cat.category_id] || 0;
          const available = parseInt(cat.total_seats) - parseInt(cat.reserved_seats);
          const isFull    = available === 0;

          return (
            <View key={cat.category_id} style={[styles.categoryCard, isFull && styles.categoryCardFull]}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryPrice}>€{parseFloat(cat.price).toFixed(2)} / εισιτήριο</Text>
                <View style={styles.availRow}>
                  <Ionicons
                    name={isFull ? 'close-circle' : 'checkmark-circle'}
                    size={13}
                    color={isFull ? Colors.error : Colors.success}
                  />
                  <Text style={[styles.availText, isFull && styles.availTextFull]}>
                    {isFull ? 'Εξαντλήθηκε' : `${available} διαθέσιμες`}
                  </Text>
                </View>
              </View>

              <View style={styles.qtyControl}>
                <TouchableOpacity
                  style={[styles.qtyBtn, qty === 0 && styles.qtyBtnDisabled]}
                  onPress={() => adjustQty(cat.category_id, -1, available)}
                  disabled={qty === 0}
                >
                  <Ionicons name="remove" size={18} color={qty === 0 ? Colors.disabled : Colors.textLight} />
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{qty}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, isFull && styles.qtyBtnDisabled]}
                  onPress={() => adjustQty(cat.category_id, +1, available)}
                  disabled={isFull}
                >
                  <Ionicons name="add" size={18} color={isFull ? Colors.disabled : Colors.textLight} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      <Divider />

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Σύνολο εισιτηρίων</Text>
          <Text style={styles.summaryValue}>{totalTickets}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryTotalLabel}>Σύνολο πληρωμής</Text>
          <Text style={styles.summaryTotalAmount}>€{totalAmount.toFixed(2)}</Text>
        </View>
        <Button
          title={`Ολοκλήρωση Κράτησης — €${totalAmount.toFixed(2)}`}
          onPress={handleSubmit}
          loading={submitting}
          disabled={totalTickets === 0}
          style={styles.bookBtn}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { paddingBottom: Spacing.xl },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
  },
  showTitle:  { fontSize: 20, fontWeight: '800', color: Colors.textLight, marginBottom: Spacing.sm },
  headerMeta: { gap: 6 },
  metaItem:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText:   { fontSize: 13, color: Colors.disabled },

  section:          { padding: Spacing.lg },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionTitle:     { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  categoryCardFull: { opacity: 0.5 },
  categoryInfo:  { flex: 1 },
  categoryName:  { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  categoryPrice: { fontSize: 14, color: Colors.secondary, marginBottom: 4 },
  availRow:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  availText:     { fontSize: 12, color: Colors.success },
  availTextFull: { color: Colors.error },

  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: { backgroundColor: Colors.disabled },
  qtyValue: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, minWidth: 28, textAlign: 'center' },

  summary: { padding: Spacing.lg },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel:       { fontSize: 15, color: Colors.textSecondary },
  summaryValue:       { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  summaryTotalLabel:  { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  summaryTotalAmount: { fontSize: 22, fontWeight: '800', color: Colors.accent },
  bookBtn:            { marginTop: Spacing.md },
});
