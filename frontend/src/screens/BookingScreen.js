import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, Alert, TouchableOpacity,
} from 'react-native';
import api from '../services/api';
import { Button, Divider } from '../components/UI';
import { Colors, Spacing, BorderRadius } from '../utils/theme';

const formatDate = (iso) => new Date(iso).toLocaleDateString('el-GR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});
const formatTime = (iso) => new Date(iso).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });

export default function BookingScreen({ route, navigation }) {
  const { showtimeId, showTitle } = route.params;

  const [showtime,   setShowtime]   = useState(null);
  const [categories, setCategories] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stRes, seatsRes] = await Promise.all([
          api.get(`/showtimes/${showtimeId}`),
          api.get('/seats', { params: { showtimeId } }),
        ]);
        setShowtime(stRes.data);
        setCategories(seatsRes.data);
        // Init quantities to 0
        const q = {};
        seatsRes.data.forEach(c => { q[c.category_id] = 0; });
        setQuantities(q);
      } catch {
        Alert.alert('Σφάλμα', 'Αδυναμία φόρτωσης.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showtimeId]);

  const adjustQty = (catId, delta, max) => {
    setQuantities(prev => ({
      ...prev,
      [catId]: Math.max(0, Math.min(max, (prev[catId] || 0) + delta)),
    }));
  };

  const totalAmount = categories.reduce((sum, cat) => {
    return sum + (quantities[cat.category_id] || 0) * parseFloat(cat.price);
  }, 0);

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
      const { data } = await api.post('/reservations', { showtimeId, items });
      Alert.alert(
        '✅ Επιτυχής Κράτηση!',
        `Η κράτησή σου καταχωρήθηκε.\nΣύνολο: €${totalAmount.toFixed(2)}`,
        [{ text: 'Οκ', onPress: () => navigation.navigate('Profile') }]
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Σφάλμα κράτησης.';
      Alert.alert('Σφάλμα', msg);
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
      {/* Show info */}
      <View style={styles.header}>
        <Text style={styles.showTitle}>{showTitle}</Text>
        {showtime && (
          <>
            <Text style={styles.date}>📅 {formatDate(showtime.starts_at)}</Text>
            <Text style={styles.time}>🕗 {formatTime(showtime.starts_at)} — 🏛 {showtime.hall}</Text>
          </>
        )}
      </View>

      <Divider />

      {/* Seat categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Επιλογή Θέσεων</Text>

        {categories.map(cat => {
          const qty       = quantities[cat.category_id] || 0;
          const available = parseInt(cat.available_seats);
          const isFull    = available === 0;

          return (
            <View key={cat.category_id} style={[styles.categoryCard, isFull && styles.categoryCardFull]}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryPrice}>€{parseFloat(cat.price).toFixed(2)} / εισιτήριο</Text>
                <Text style={[styles.categoryAvail, isFull && styles.categoryAvailFull]}>
                  {isFull ? 'Εξαντλήθηκε' : `${available} διαθέσιμες`}
                </Text>
              </View>

              <View style={styles.qtyControl}>
                <TouchableOpacity
                  style={[styles.qtyBtn, qty === 0 && styles.qtyBtnDisabled]}
                  onPress={() => adjustQty(cat.category_id, -1, available)}
                  disabled={qty === 0}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.qtyValue}>{qty}</Text>

                <TouchableOpacity
                  style={[styles.qtyBtn, isFull && styles.qtyBtnDisabled]}
                  onPress={() => adjustQty(cat.category_id, +1, available)}
                  disabled={isFull}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
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
          <Text style={styles.summaryLabel}>Εισιτήρια</Text>
          <Text style={styles.summaryValue}>{totalTickets}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryTotal}>Σύνολο</Text>
          <Text style={styles.summaryTotalAmount}>€{totalAmount.toFixed(2)}</Text>
        </View>

        <Button
          title={submitting ? 'Επεξεργασία...' : `Κράτηση — €${totalAmount.toFixed(2)}`}
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
  container:  { flex: 1, backgroundColor: Colors.background },
  content:    { paddingBottom: Spacing.xl },
  centered:   { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
  },
  showTitle: { fontSize: 20, fontWeight: '800', color: Colors.textLight, marginBottom: 6 },
  date:      { fontSize: 14, color: Colors.disabled, marginBottom: 2 },
  time:      { fontSize: 13, color: Colors.disabled },

  section:      { padding: Spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },

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
  categoryInfo:     { flex: 1 },
  categoryName:     { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  categoryPrice:    { fontSize: 14, color: Colors.secondary, marginBottom: 2 },
  categoryAvail:    { fontSize: 12, color: Colors.success },
  categoryAvailFull: { color: Colors.error },

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
  qtyBtnText: { color: Colors.textLight, fontSize: 20, fontWeight: '700', lineHeight: 22 },
  qtyValue:   { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, minWidth: 24, textAlign: 'center' },

  summary: { padding: Spacing.lg },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: { fontSize: 15, color: Colors.textSecondary },
  summaryValue: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  summaryTotal: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  summaryTotalAmount: { fontSize: 20, fontWeight: '800', color: Colors.accent },
  bookBtn: { marginTop: Spacing.md },
});
