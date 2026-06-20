import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, Alert, TouchableOpacity,
  RefreshControl, Modal, TextInput, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Divider, EmptyState } from '../../components/UI';
import { Colors, Spacing, BorderRadius } from '../../utils/theme';

const EMPTY_FORM = { show_id: '', starts_at: '', hall: '', total_seats: '100' };

const formatDatetime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('el-GR', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
};

export default function AdminShowtimesScreen() {
  const [showtimes,  setShowtimes]  = useState([]);
  const [shows,      setShows]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal,      setModal]      = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [stRes, showsRes] = await Promise.all([
        api.get('/showtimes'),
        api.get('/shows'),
      ]);
      setShowtimes(stRes.data.data || []);
      setShows(showsRes.data.data || []);
    } catch {
      Alert.alert('Σφάλμα', 'Αδυναμία φόρτωσης δεδομένων.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit   = (st) => {
    setEditTarget(st);
    // Format datetime as "YYYY-MM-DD HH:MM" for the input
    const d = new Date(st.starts_at);
    const pad = n => String(n).padStart(2, '0');
    const formatted = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setForm({
      show_id:     String(st.show_id),
      starts_at:   formatted,
      hall:        st.hall,
      total_seats: String(st.total_seats),
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.show_id || !form.starts_at.trim() || !form.hall.trim()) {
      Alert.alert('Σφάλμα', 'Παράσταση, ημερομηνία και αίθουσα είναι υποχρεωτικά.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        show_id:     parseInt(form.show_id),
        starts_at:   form.starts_at.trim(),
        hall:         form.hall.trim(),
        total_seats: parseInt(form.total_seats) || 100,
      };
      if (editTarget) {
        await api.put(`/admin/showtimes/${editTarget.showtime_id}`, payload);
      } else {
        await api.post('/admin/showtimes', payload);
      }
      setModal(false);
      fetchData();
    } catch (err) {
      Alert.alert('Σφάλμα', err.response?.data?.message || 'Αδυναμία αποθήκευσης.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (st) => {
    Alert.alert(
      'Διαγραφή Προβολής',
      `Διαγραφή της προβολής "${st.show_title}" στις ${formatDatetime(st.starts_at)};`,
      [
        { text: 'Άκυρο', style: 'cancel' },
        {
          text: 'Διαγραφή',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/admin/showtimes/${st.showtime_id}`);
              fetchData();
            } catch (err) {
              Alert.alert('Σφάλμα', err.response?.data?.message || 'Αδυναμία διαγραφής.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>
          <Ionicons name="calendar-outline" size={22} color={Colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.show_title}</Text>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.cardDetail}>{formatDatetime(item.starts_at)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="business-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.cardDetail}>{item.hall}</Text>
          </View>
        </View>
        <View style={styles.seatsBadge}>
          <Ionicons name="people-outline" size={13} color={Colors.secondary} />
          <Text style={styles.seatsText}>{item.total_seats}</Text>
        </View>
      </View>
      <Divider style={{ marginVertical: 8 }} />
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
          <Ionicons name="create-outline" size={15} color={Colors.secondary} />
          <Text style={styles.actionText}>Επεξεργασία</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={15} color={Colors.error} />
          <Text style={[styles.actionText, { color: Colors.error }]}>Διαγραφή</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.accent} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <FlatList
        data={showtimes}
        keyExtractor={i => String(i.showtime_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(); }}
            colors={[Colors.accent]}
          />
        }
        ListEmptyComponent={<EmptyState message="Δεν βρέθηκαν προβολές." icon={null} />}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <Ionicons name="add-circle-outline" size={18} color={Colors.textLight} />
            <Text style={styles.addBtnText}>Προσθήκη Προβολής</Text>
          </TouchableOpacity>
        }
      />

      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editTarget ? 'Επεξεργασία Προβολής' : 'Νέα Προβολή'}</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: Spacing.lg }}>
            {/* Show picker */}
            <Text style={styles.fieldLabel}>Παράσταση *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.sm }}>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                {shows.map(s => {
                  const isActive = String(form.show_id) === String(s.show_id);
                  return (
                    <TouchableOpacity
                      key={s.show_id}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => setForm(p => ({ ...p, show_id: String(s.show_id) }))}
                    >
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]} numberOfLines={1}>{s.title}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Text style={styles.fieldLabel}>Ημερομηνία & Ώρα * (YYYY-MM-DD HH:MM)</Text>
            <TextInput
              style={styles.fieldInput}
              value={form.starts_at}
              onChangeText={v => setForm(p => ({ ...p, starts_at: v }))}
              placeholder="2026-07-01 20:00"
              placeholderTextColor={Colors.disabled}
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>Αίθουσα *</Text>
            <TextInput
              style={styles.fieldInput}
              value={form.hall}
              onChangeText={v => setForm(p => ({ ...p, hall: v }))}
              placeholder="π.χ. Κεντρική Σκηνή"
              placeholderTextColor={Colors.disabled}
            />

            <Text style={styles.fieldLabel}>Σύνολο Θέσεων</Text>
            <TextInput
              style={styles.fieldInput}
              value={form.total_seats}
              onChangeText={v => setForm(p => ({ ...p, total_seats: v }))}
              keyboardType="numeric"
              placeholder="100"
              placeholderTextColor={Colors.disabled}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
              <Text style={styles.cancelBtnText}>Άκυρο</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.saveBtnText}>Αποθήκευση</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  addBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.accent, borderRadius: BorderRadius.md, padding: 12, marginBottom: Spacing.md, justifyContent: 'center' },
  addBtnText: { color: Colors.textLight, fontWeight: '700', fontSize: 15 },

  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  iconBox: { width: 44, height: 44, borderRadius: BorderRadius.sm, backgroundColor: Colors.accent + '15', alignItems: 'center', justifyContent: 'center' },
  cardTitle:  { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  detailRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  cardDetail: { fontSize: 12, color: Colors.textSecondary },
  seatsBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.secondary + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.full },
  seatsText:  { fontSize: 13, fontWeight: '700', color: Colors.secondary },

  actions:   { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: BorderRadius.sm, backgroundColor: Colors.secondary + '10' },
  dangerBtn: { backgroundColor: Colors.error + '10' },
  actionText: { fontSize: 13, fontWeight: '600', color: Colors.secondary },

  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  modalTitle:  { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  fieldLabel:  { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6, marginTop: 2 },
  fieldInput:  { borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: 12, fontSize: 15, color: Colors.textPrimary, backgroundColor: Colors.surface, marginBottom: Spacing.sm },
  chip:          { paddingHorizontal: 12, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface, maxWidth: 180 },
  chipActive:    { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText:      { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.textLight },

  modalFooter: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  cancelBtn:   { flex: 1, padding: 14, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  cancelBtnText: { fontWeight: '700', color: Colors.textSecondary },
  saveBtn:       { flex: 1, padding: 14, borderRadius: BorderRadius.md, backgroundColor: Colors.accent, alignItems: 'center' },
  saveBtnText:   { fontWeight: '700', color: Colors.textLight },
});
