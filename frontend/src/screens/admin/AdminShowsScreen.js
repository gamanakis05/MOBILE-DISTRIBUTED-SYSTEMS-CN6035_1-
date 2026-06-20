import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, Alert, TouchableOpacity,
  RefreshControl, Modal, TextInput, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { Badge, Divider, EmptyState } from '../../components/UI';
import { Colors, Spacing, BorderRadius } from '../../utils/theme';

const EMPTY_FORM = { theatre_id: '', title: '', description: '', duration: '', age_rating: 'ALL', poster_url: '' };
const AGE_RATINGS = ['ALL', '7+', '12+', '14+', '16+', '18+'];

export default function AdminShowsScreen() {
  const [shows,      setShows]      = useState([]);
  const [theatres,   setTheatres]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal,      setModal]      = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [showsRes, theatresRes] = await Promise.all([
        api.get('/shows'),
        api.get('/theatres'),
      ]);
      setShows(showsRes.data.data || []);
      setTheatres(theatresRes.data.data || []);
    } catch {
      Alert.alert('Σφάλμα', 'Αδυναμία φόρτωσης.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit   = (s) => {
    setEditTarget(s);
    setForm({
      theatre_id:  String(s.theatre_id),
      title:       s.title,
      description: s.description || '',
      duration:    String(s.duration),
      age_rating:  s.age_rating,
      poster_url:  s.poster_url || '',
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.duration || !form.theatre_id) {
      Alert.alert('Σφάλμα', 'Τίτλος, θέατρο και διάρκεια είναι υποχρεωτικά.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, duration: parseInt(form.duration), theatre_id: parseInt(form.theatre_id) };
      if (editTarget) {
        await api.put(`/admin/shows/${editTarget.show_id}`, payload);
      } else {
        await api.post('/admin/shows', payload);
      }
      setModal(false);
      fetchData();
    } catch (err) {
      Alert.alert('Σφάλμα', err.response?.data?.message || 'Αδυναμία αποθήκευσης.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (s) => {
    Alert.alert('Διαγραφή Παράστασης', `Διαγραφή "${s.title}";`, [
      { text: 'Άκυρο', style: 'cancel' },
      {
        text: 'Διαγραφή',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/shows/${s.show_id}`);
            fetchData();
          } catch (err) {
            Alert.alert('Σφάλμα', err.response?.data?.message || 'Αδυναμία.');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>
          <Ionicons name="film-outline" size={22} color={Colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardTheatre}>{item.theatre_name}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Badge label={item.age_rating} color={Colors.secondary} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Ionicons name="time-outline" size={11} color={Colors.textSecondary} />
            <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{item.duration} λεπτά</Text>
          </View>
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
        data={shows}
        keyExtractor={i => String(i.show_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[Colors.accent]} />}
        ListEmptyComponent={<EmptyState message="Δεν βρέθηκαν παραστάσεις." icon={null} />}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <Ionicons name="add-circle-outline" size={18} color={Colors.textLight} />
            <Text style={styles.addBtnText}>Προσθήκη Παράστασης</Text>
          </TouchableOpacity>
        }
      />

      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editTarget ? 'Επεξεργασία' : 'Νέα Παράσταση'}</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: Spacing.lg }}>
            {/* Theatre picker */}
            <Text style={styles.fieldLabel}>Θέατρο *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.sm }}>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                {theatres.map(t => (
                  <TouchableOpacity
                    key={t.theatre_id}
                    style={[styles.chip, String(form.theatre_id) === String(t.theatre_id) && styles.chipActive]}
                    onPress={() => setForm(p => ({ ...p, theatre_id: String(t.theatre_id) }))}
                  >
                    <Text style={[styles.chipText, String(form.theatre_id) === String(t.theatre_id) && styles.chipTextActive]}>{t.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.fieldLabel}>Τίτλος *</Text>
            <TextInput style={styles.fieldInput} value={form.title} onChangeText={v => setForm(p => ({ ...p, title: v }))} placeholder="Τίτλος παράστασης" placeholderTextColor={Colors.disabled} />

            <Text style={styles.fieldLabel}>Περιγραφή</Text>
            <TextInput style={[styles.fieldInput, { height: 80, textAlignVertical: 'top' }]} value={form.description} onChangeText={v => setForm(p => ({ ...p, description: v }))} placeholder="Σύντομη περιγραφή..." multiline numberOfLines={3} placeholderTextColor={Colors.disabled} />

            <Text style={styles.fieldLabel}>Διάρκεια (λεπτά) *</Text>
            <TextInput style={styles.fieldInput} value={form.duration} onChangeText={v => setForm(p => ({ ...p, duration: v }))} keyboardType="numeric" placeholder="120" placeholderTextColor={Colors.disabled} />

            <Text style={styles.fieldLabel}>Ηλικιακή Κατηγορία</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm }}>
              {AGE_RATINGS.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, form.age_rating === r && styles.chipActive]}
                  onPress={() => setForm(p => ({ ...p, age_rating: r }))}
                >
                  <Text style={[styles.chipText, form.age_rating === r && styles.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
              <Text style={styles.cancelBtnText}>Άκυρο</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Αποθήκευση</Text>}
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
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconBox: { width: 44, height: 44, borderRadius: BorderRadius.sm, backgroundColor: Colors.accent + '15', alignItems: 'center', justifyContent: 'center' },
  cardTitle:   { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  cardTheatre: { fontSize: 12, color: Colors.textSecondary },
  actions:  { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: BorderRadius.sm, backgroundColor: Colors.secondary + '10' },
  dangerBtn: { backgroundColor: Colors.error + '10' },
  actionText: { fontSize: 13, fontWeight: '600', color: Colors.secondary },

  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  modalTitle:  { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  fieldLabel:  { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6, marginTop: 2 },
  fieldInput:  { borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: 12, fontSize: 15, color: Colors.textPrimary, backgroundColor: Colors.surface, marginBottom: Spacing.sm },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  chipActive:    { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText:      { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.textLight },
  modalFooter: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  cancelBtn:   { flex: 1, padding: 14, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  cancelBtnText: { fontWeight: '700', color: Colors.textSecondary },
  saveBtn:       { flex: 1, padding: 14, borderRadius: BorderRadius.md, backgroundColor: Colors.accent, alignItems: 'center' },
  saveBtnText:   { fontWeight: '700', color: Colors.textLight },
});
