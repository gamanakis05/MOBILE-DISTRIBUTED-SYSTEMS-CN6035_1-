import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { Badge, Button, Divider } from '../components/UI';
import { Colors, Spacing, BorderRadius } from '../utils/theme';

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};
const formatTime = (iso) => new Date(iso).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });

export default function ShowDetailScreen({ route, navigation }) {
  const { showId } = route.params;
  const [show,      setShow]      = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [showRes, stRes] = await Promise.all([
          api.get(`/shows/${showId}`),
          api.get('/showtimes', { params: { showId } }),
        ]);
        setShow(showRes.data.data);
        setShowtimes(stRes.data.data);
        navigation.setOptions({ title: showRes.data.data.title });
      } catch {
        setError('Αδυναμία φόρτωσης παράστασης.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (error || !show) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Παράσταση δεν βρέθηκε.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={{ marginBottom: 8 }}>
          <Ionicons name="theater-masks" size={48} color={Colors.accent} />
        </View>
        <Text style={styles.title}>{show.title}</Text>
        <Text style={styles.theatre}>
          <Ionicons name="location" size={14} color={Colors.disabled} /> {show.theatre_name} — {show.theatre_location}
        </Text>
        <View style={styles.badges}>
          <Badge label={show.age_rating} color={Colors.accent} />
          <Badge label={<><Ionicons name="time" size={12} color={Colors.secondary} /> {show.duration} λεπτά</>} color={Colors.secondary} />
        </View>
      </View>

      {/* Description */}
      {show.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Περιγραφή</Text>
          <Text style={styles.description}>{show.description}</Text>
        </View>
      )}

      <Divider />

      {/* Showtimes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Διαθέσιμες Ημερομηνίες</Text>

        {showtimes.length === 0 ? (
          <Text style={styles.noShowtimes}>Δεν υπάρχουν διαθέσιμες ημερομηνίες.</Text>
        ) : (
          showtimes.map((st) => (
            <TouchableOpacity
              key={st.showtime_id}
              style={styles.showtimeCard}
              onPress={() => navigation.navigate('Booking', { showtimeId: st.showtime_id, showTitle: show.title })}
              activeOpacity={0.8}
            >
              <View style={styles.showtimeLeft}>
                <Text style={styles.showtimeDate}>{formatDate(st.starts_at)}</Text>
                <Text style={styles.showtimeTime}><Ionicons name="time" size={13} color={Colors.secondary} /> {formatTime(st.starts_at)}</Text>
                <Text style={styles.showtimeHall}><Ionicons name="door-open" size={13} color={Colors.secondary} /> {st.hall}</Text>
              </View>
              <View style={styles.showtimeRight}>
                <Text style={styles.bookArrow}>Κράτηση →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content:   { paddingBottom: Spacing.xl },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.error, fontSize: 15 },

  hero: {
    backgroundColor: Colors.primary,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emoji:   { fontSize: 56, marginBottom: Spacing.sm },
  title:   { fontSize: 26, fontWeight: '800', color: Colors.textLight, textAlign: 'center', marginBottom: Spacing.sm },
  theatre: { fontSize: 13, color: Colors.disabled, textAlign: 'center', marginBottom: Spacing.md },
  badges:  { flexDirection: 'row', gap: Spacing.sm },

  section:      { padding: Spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  description:  { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  noShowtimes:  { color: Colors.textSecondary, fontStyle: 'italic' },

  showtimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  showtimeLeft:  { flex: 1 },
  showtimeDate:  { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  showtimeTime:  { fontSize: 13, color: Colors.secondary, marginBottom: 2 },
  showtimeHall:  { fontSize: 12, color: Colors.textSecondary },
  showtimeRight: { paddingLeft: Spacing.md },
  bookArrow:     { color: Colors.accent, fontWeight: '700', fontSize: 14 },
});
