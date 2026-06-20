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

const EMPTY_FORM = { name: '', location: '', description: '', phone: '', email: '' };

export default function AdminTheatresScreen() {
  const [theatres,   setTheatres]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal,      setModal]      = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data } = await api.get('/theatres');
      setTheatres(data.data || []);
    } catch {
      Alert.alert('Σφάλμα', 'Αδυναμία φόρτωσης.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit   = (t) => { setEditTarget(t); setForm({ name: t.name, location: t.location, description: t.description || '', phone: t.phone || '', email: t.email || '' }); setModal(true); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.location.trim()) {
      Alert.alert('Σφάλμα', 'Όνομα και τοποθεσία είναι υποχρεωτικά.');
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await api.put(`/admin/theatres/${editTarget.theatre_id}`, form);
      } else {
        await api.post('/admin/theatres', form);
      }
      setModal(false);
      fetchData();
    } catch (err) {
      Alert.alert('Σφάλμα', err.response?.data?.message || 'Αδυναμία αποθήκευσης.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (t) => {
    Alert.alert('Διαγραφή Θεάτρου', `Διαγραφή "${t.name}"; Θα διαγραφούν και όλες οι παραστάσεις.`, [
      { text: 'Άκυρο', style: 'cancel' },
      {
        text: 'Διαγραφή',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/theatres/${t.theatre_id}`);
            fetchData();
          } catch (err) {
            Alert.alert('Σφάλμα', err.response?.data?.message || 'Αδυναμία διαγραφής.');
          }
        },
      },
    ]);
  };

  const F = ({ label, field, ...props }) => (
    <View style={{ marginBottom: Spacing.sm }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={form[field]}
        onChangeText={v => setForm(p => ({ ...p, [field]: v }))}
        placeholderTextColor={Colors.disabled}
        {...props}
      />
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>
          <Ionicons name="business" size={22} color={Colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardName}>{item.name}</Text>
          <View style={styles.locRow}>
            <Ionicons name="location-sharp" size={12} color={Colors.textSecondary} />
            <Text style={styles.cardLoc}>{item.location}</Text>
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
        data={theatres}
        keyExtractor={i => String(i.theatre_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[Colors.accent]} />}
        ListEmptyComponent={<EmptyState message="Δεν βρέθηκαν θέατρα." icon={null} />}
        ListHeaderComponent={
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <Ionicons name="add-circle-outline" size={18} color={Colors.textLight} />
            <Text style={styles.addBtnText}>Προσθήκη Θεάτρου</Text>
          </TouchableOpacity>
        }
      />

      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editTarget ? 'Επεξεργασία Θεάτρου' : 'Νέο Θέατρο'}</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: Spacing.lg }}>
            <F label="Όνομα *"       field="name"        placeholder="Εθνικό Θέατρο" />
            <F label="Τοποθεσία *"   field="location"    placeholder="Αθήνα, Οδός 1" />
            <F label="Περιγραφή"     field="description" placeholder="Σύντομη περιγραφή" multiline numberOfLines={3} style={{ height: 80, textAlignVertical: 'top' }} />
            <F label="Τηλέφωνο"      field="phone"       placeholder="210-0000000" keyboardType="phone-pad" />
            <F label="Email"         field="email"       placeholder="info@theatre.gr" keyboardType="email-address" autoCapitalize="none" />
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    padding: 12,
    marginBottom: Spacing.md,
    justifyContent: 'center',
  },
  addBtnText: { color: Colors.textLight, fontWeight: '700', fontSize: 15 },
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
  cardRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconBox:  { width: 44, height: 44, borderRadius: BorderRadius.sm, backgroundColor: Colors.accent + '15', alignItems: 'center', justifyContent: 'center' },
  cardName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  locRow:   { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardLoc:  { fontSize: 12, color: Colors.textSecondary },
  actions:  { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: BorderRadius.sm, backgroundColor: Colors.secondary + '10' },
  dangerBtn: { backgroundColor: Colors.error + '10' },
  actionText: { fontSize: 13, fontWeight: '600', color: Colors.secondary },

  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  modalTitle:  { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  fieldLabel:  { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  fieldInput:  { borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md, padding: 12, fontSize: 15, color: Colors.textPrimary, backgroundColor: Colors.surface },
  modalFooter: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  cancelBtn:   { flex: 1, padding: 14, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center' },
  cancelBtnText: { fontWeight: '700', color: Colors.textSecondary },
  saveBtn:       { flex: 1, padding: 14, borderRadius: BorderRadius.md, backgroundColor: Colors.accent, alignItems: 'center' },
  saveBtnText:   { fontWeight: '700', color: Colors.textLight },
});
