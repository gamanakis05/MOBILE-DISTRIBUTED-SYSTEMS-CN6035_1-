import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/UI';
import { Colors, Spacing, BorderRadius } from '../utils/theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [password2, setPassword2] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim())           e.name      = 'Το όνομα είναι υποχρεωτικό.';
    if (!email.trim())          e.email     = 'Το email είναι υποχρεωτικό.';
    if (password.length < 6)    e.password  = 'Τουλάχιστον 6 χαρακτήρες.';
    if (password !== password2) e.password2 = 'Οι κωδικοί δεν ταιριάζουν.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Σφάλμα', err.response?.data?.message || 'Σφάλμα εγγραφής.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Ionicons name="person-add" size={36} color={Colors.textLight} />
          </View>
          <Text style={styles.title}>Δημιουργία Λογαριασμού</Text>
        </View>

        <View style={styles.form}>
          <Input label="Ονοματεπώνυμο" value={name} onChangeText={setName}
            placeholder="Όνομα Επώνυμο" autoComplete="name" error={errors.name} />
          <Input label="Email" value={email} onChangeText={setEmail}
            placeholder="your@email.com" keyboardType="email-address"
            autoCapitalize="none" autoComplete="email" error={errors.email} />
          <Input label="Κωδικός" value={password} onChangeText={setPassword}
            placeholder="Τουλάχιστον 6 χαρακτήρες" secureTextEntry error={errors.password} />
          <Input label="Επιβεβαίωση Κωδικού" value={password2} onChangeText={setPassword2}
            placeholder="Επανάληψη κωδικού" secureTextEntry error={errors.password2} />

          <Button title="Εγγραφή" onPress={handleRegister} loading={loading} style={styles.registerBtn} />

          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>
              Έχεις ήδη λογαριασμό;{' '}
              <Text style={styles.loginHighlight}>Σύνδεση</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  scroll:    { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
  header:    { alignItems: 'center', marginBottom: Spacing.xl },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textLight, textAlign: 'center' },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  registerBtn:    { marginTop: Spacing.sm },
  loginLink:      { alignItems: 'center', marginTop: Spacing.md, paddingVertical: Spacing.sm },
  loginText:      { color: Colors.textSecondary, fontSize: 14 },
  loginHighlight: { color: Colors.accent, fontWeight: '700' },
});
