import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Alert, TouchableOpacity, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Input, Button, Divider } from '../components/UI';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import api from '../services/api';

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [name,     setName]     = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [password2,setPassword2] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleUpdate = async () => {
    if (password && password !== password2) {
      Alert.alert('Σφάλμα', 'Οι κωδικοί δεν ταιριάζουν.');
      return;
    }
    if (password && password.length < 6) {
      Alert.alert('Σφάλμα', 'Τουλάχιστον 6 χαρακτήρες για τον κωδικό.');
      return;
    }

    setLoading(true);
    try {
      const payload = {};
      if (name.trim() && name !== user?.name) payload.name = name.trim();
      if (password) payload.password = password;

      if (Object.keys(payload).length === 0) {
        Alert.alert('Ενημέρωση', 'Δεν υπάρχουν αλλαγές για αποθήκευση.');
        return;
      }

      await api.put('/user/profile', payload);
      Alert.alert('Επιτυχία', 'Το προφίλ σου ενημερώθηκε.');
      setPassword('');
      setPassword2('');
    } catch (err) {
      Alert.alert('Σφάλμα', err.response?.data?.message || 'Αδυναμία ενημέρωσης.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Αποσύνδεση', 'Θέλεις σίγουρα να αποσυνδεθείς;', [
      { text: 'Άκυρο', style: 'cancel' },
      { text: 'Αποσύνδεση', style: 'destructive', onPress: logout },
    ]);
  };

  const SettingRow = ({ icon, label, value, onPress, danger = false }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={!onPress}>
      <View style={[styles.settingIconBox, danger && styles.settingIconBoxDanger]}>
        <Ionicons name={icon} size={18} color={danger ? Colors.error : Colors.secondary} />
      </View>
      <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>{label}</Text>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {onPress && <Ionicons name="chevron-forward" size={16} color={danger ? Colors.error : Colors.disabled} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Account info */}
      <Text style={styles.sectionLabel}>ΛΟΓΑΡΙΑΣΜΟΣ</Text>
      <View style={styles.sectionCard}>
        <SettingRow icon="person-outline"  label="Email" value={user?.email} />
        <Divider style={styles.rowDivider} />
        <SettingRow icon="shield-outline"  label="Ρόλος" value={user?.role === 'admin' ? 'Admin' : 'Χρήστης'} />
      </View>

      {/* Edit profile */}
      <Text style={styles.sectionLabel}>ΕΠΕΞΕΡΓΑΣΙΑ ΠΡΟΦΙΛ</Text>
      <View style={styles.sectionCard}>
        <View style={{ padding: Spacing.md }}>
          <Input
            label="Όνομα"
            value={name}
            onChangeText={setName}
            placeholder="Ονοματεπώνυμο"
          />
          <Input
            label="Νέος Κωδικός"
            value={password}
            onChangeText={setPassword}
            placeholder="Αφήστε κενό για να κρατήσετε τον τρέχοντα"
            secureTextEntry
          />
          {password.length > 0 && (
            <Input
              label="Επιβεβαίωση Κωδικού"
              value={password2}
              onChangeText={setPassword2}
              placeholder="Επανάληψη νέου κωδικού"
              secureTextEntry
            />
          )}
          <Button
            title="Αποθήκευση Αλλαγών"
            onPress={handleUpdate}
            loading={loading}
          />
        </View>
      </View>

      {/* Notifications */}
      <Text style={styles.sectionLabel}>ΕΙΔΟΠΟΙΗΣΕΙΣ</Text>
      <View style={styles.sectionCard}>
        <View style={styles.switchRow}>
          <View style={styles.settingIconBox}>
            <Ionicons name="notifications-outline" size={18} color={Colors.secondary} />
          </View>
          <Text style={styles.settingLabel}>Ειδοποιήσεις κρατήσεων</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ true: Colors.accent }}
            thumbColor={Colors.textLight}
          />
        </View>
      </View>

      {/* Danger zone */}
      <Text style={styles.sectionLabel}>ΛΟΙΠΑ</Text>
      <View style={styles.sectionCard}>
        <SettingRow icon="log-out-outline" label="Αποσύνδεση" onPress={handleLogout} danger />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { padding: Spacing.md, paddingBottom: Spacing.xxl },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: Spacing.md,
  },
  settingIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.secondary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconBoxDanger: { backgroundColor: Colors.error + '15' },
  settingLabel:       { flex: 1, fontSize: 15, color: Colors.textPrimary },
  settingLabelDanger: { color: Colors.error },
  settingValue:       { fontSize: 14, color: Colors.textSecondary },
  rowDivider:         { marginVertical: 0, marginHorizontal: Spacing.md },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.md,
  },
});
