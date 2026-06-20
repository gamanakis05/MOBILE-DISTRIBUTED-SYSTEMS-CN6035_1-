import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/UI';
import { Colors, Spacing, BorderRadius } from '../utils/theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim())    e.email    = 'Το email είναι υποχρεωτικό.';
    if (!password.trim()) e.password = 'Ο κωδικός είναι υποχρεωτικός.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password.trim());
      navigation.goBack();
    } catch (err) {
      Alert.alert('Αποτυχία Σύνδεσης', err.response?.data?.message || 'Λανθασμένα στοιχεία.');
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
            <Ionicons name="film" size={40} color={Colors.textLight} />
          </View>
          <Text style={styles.title}>TheatreApp</Text>
          <Text style={styles.subtitle}>Κάνε κράτηση για την παράστασή σου</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
          />
          <Input
            label="Κωδικός"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="password"
            error={errors.password}
          />
          <Button title="Σύνδεση" onPress={handleLogin} loading={loading} style={styles.loginBtn} />
          <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>
              Δεν έχεις λογαριασμό;{' '}
              <Text style={styles.registerHighlight}>Εγγραφή</Text>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title:    { fontSize: 30, fontWeight: '800', color: Colors.textLight, letterSpacing: 1 },
  subtitle: { fontSize: 14, color: Colors.disabled, marginTop: 6, textAlign: 'center' },
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
  loginBtn:         { marginTop: Spacing.sm },
  registerLink:     { alignItems: 'center', marginTop: Spacing.md, paddingVertical: Spacing.sm },
  registerText:     { color: Colors.textSecondary, fontSize: 14 },
  registerHighlight:{ color: Colors.accent, fontWeight: '700' },
});
