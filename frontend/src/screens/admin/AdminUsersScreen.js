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

export default function AdminUsersScreen() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editUser,   setEditUser]   = useState(null); // user being edited
  const [saving,     setSaving]     = useState(false);
  const [editForm,   setEditForm]   = useState({ name: '', email: '', role: 'user', password: '' });

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.data || []);
    } catch {
      Alert.alert('Σφάλμα', 'Αδυναμία φόρτωσης χρηστών.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({ name: user.name, email: user.email, role: user.role, password: '' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {};
      if (editForm.name  !== editUser.name)  payload.name  = editForm.name;
      if (editForm.email !== editUser.email) payload.email = editForm.email;
      if (editForm.role  !== editUser.role)  payload.role  = editForm.role;
      if (editForm.password)                 payload.password = editForm.password;

      await api.put(`/admin/users/${editUser.user_id}`, payload);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      Alert.alert('Σφάλμα', err.response?.data?.message || 'Αδυναμία αποθήκευσης.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (user) => {
    Alert.alert(
      'Διαγραφή Χρήστη',
      `Θέλεις σίγουρα να διαγράψεις τον "${user.name}";`,
      [
        { text: 'Άκυρο', style: 'cancel' },
        {
          text: 'Διαγραφή',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/admin/users/${user.user_id}`);
              fetchUsers();
            } catch (err) {
              Alert.alert('Σφάλμα', err.response?.data?.message || 'Αδυναμία διαγραφής.');
            }
          },
        },
      ]
    );
  };

  const renderUser = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardEmail}>{item.email}</Text>
          <Text style={styles.cardDate}>Εγγραφή: {new Date(item.created_at).toLocaleDateString('el-GR')}</Text>
        </View>
        <Badge
          label={item.role === 'admin' ? 'Admin' : 'User'}
          color={item.role === 'admin' ? Colors.accent : Colors.secondary}
        />
      </View>
      <Divider style={{ marginVertical: 8 }} />
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
          <Ionicons name="create-outline" size={16} color={Colors.secondary} />
          <Text style={styles.actionBtnText}>Επεξεργασία</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={16} color={Colors.error} />
          <Text style={[styles.actionBtnText, { color: Colors.error }]}>Διαγραφή</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.accent} /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <FlatList
        data={users}
        keyExtractor={i => String(i.user_id)}
        renderItem={renderUser}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} colors={[Colors.accent]} />}
        ListEmptyComponent={<EmptyState message="Δεν βρέθηκαν χρήστες." icon={null} />}
        ListHeaderComponent={<Text style={styles.listHeader}>{users.length} χρήστες</Text>}
      />

      {/* Edit Modal */}
      <Modal visible={!!editUser} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditUser(null)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Επεξεργασία Χρήστη</Text>
            <TouchableOpacity onPress={() => setEditUser(null)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.fieldLabel}>Όνομα</Text>
            <TextInput style={styles.fieldInput} value={editForm.name} onChangeText={v => setEditForm(p => ({ ...p, name: v }))} />
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput style={styles.fieldInput} value={editForm.email} onChangeText={v => setEditForm(p => ({ ...p, email: v }))} keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.fieldLabel}>Ρόλος</Text>
            <View style={styles.roleToggle}>
              {['user', 'admin'].map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleBtn, editForm.role === r && styles.roleBtnActive]}
                  onPress={() => setEditForm(p => ({ ...p, role: r }))}
                >
                  <Text style={[styles.roleBtnText, editForm.role === r && styles.roleBtnTextActive]}>{r === 'admin' ? 'Admin' : 'User'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>Νέος Κωδικός (προαιρετικό)</Text>
            <TextInput style={styles.fieldInput} value={editForm.password} onChangeText={v => setEditForm(p => ({ ...p, password: v }))} secureTextEntry placeholder="Αφήστε κενό για να μην αλλάξει" />
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setEditUser(null)}>
              <Text style={styles.cancelModalText}>Άκυρο</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveModalBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveModalText}>Αποθήκευση</Text>}
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: Colors.textLight },
  cardInfo:   { flex: 1 },
  cardName:   { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  cardEmail:  { fontSize: 12, color: Colors.textSecondary },
  cardDate:   { fontSize: 11, color: Colors.disabled },
  cardActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.secondary + '10',
  },
  actionBtnDanger:  { backgroundColor: Colors.error + '10' },
  actionBtnText:    { fontSize: 13, fontWeight: '600', color: Colors.secondary },

  // Modal
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modalTitle:  { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  modalBody:   { flex: 1, padding: Spacing.lg },
  fieldLabel:  { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6, marginTop: Spacing.md },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  roleToggle: { flexDirection: 'row', gap: Spacing.sm },
  roleBtn: {
    flex: 1,
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  roleBtnActive:     { backgroundColor: Colors.accent, borderColor: Colors.accent },
  roleBtnText:       { fontWeight: '600', color: Colors.textSecondary },
  roleBtnTextActive: { color: Colors.textLight },
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cancelModalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelModalText: { fontWeight: '700', color: Colors.textSecondary },
  saveModalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accent,
    alignItems: 'center',
  },
  saveModalText: { fontWeight: '700', color: Colors.textLight },
});
