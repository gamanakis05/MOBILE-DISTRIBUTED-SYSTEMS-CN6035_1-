import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { Badge, Divider } from '../components/UI';
import { Colors, Spacing, BorderRadius } from '../utils/theme';

const formatDate = (iso) => new Date(iso).toLocaleDateString('el-GR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});
const formatTime = (iso) => new Date(iso).toLocaleTimeString('el-GR', {
  hour: '2-digit', minute: '2-digit',
});

export default function ShowDetailScreen({ route, navigation }) {
  const { showId } = route.params;
  const [show,      setShow]      = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [showRes, stRes] = await Promise.all([
          api.get(`/shows/${showId}`),
          api.get('/showtimes', { params: { showId } }),
        ]);
        const showData = showRes.data.data || showRes.data;
        setShow(showData);
        setShowtimes(stRes.data.data || stRes.data || []);
        navigation.setOptions({ title: showData.title });
      } catch {
        setError('Αδυναμία φόρτωσης παράστασης.');
      } finally {
        setLoading(false);
      }
    })();
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
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error || 'Παράσταση δεν βρέθηκε.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="film" size={44} color={Colors.textLight} />
        </View>
        <Text style={styles.title}>{show.title}</Text>
        <View style={styles.theatreRow}>
          <Ionicons name="location-sharp" size={14} color={Colors.disabled} />
          <Text style={styles.theatre}>{show.theatre_name} — {show.theatre_location}</Text>
        </View>
        <View style={styles.badges}>
          <Badge label={show.age_rating} color={Colors.accent} />
          <View style={styles.durationBadge}>
            <Ionicons name="time-outline" size={12} color={Colors.disabled} />
            <Text style={styles.durationText}>{show.duration} λεπτά</Text>
          </View>
        </View>
      </View>

      {/* Description */}
      {show.description ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Περιγραφή</Text>
          <Text style={styles.description}>{show.description}</Text>
        </View>
      ) : null}

      <Divider />

      {/* Showtimes */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="calendar-outline" size={18} color={Colors.textPrimary} />
          <Text style={styles.sectionTitle}>Διαθέσιμες Ημερομηνίες</Text>
        </View>

        {showtimes.length === 0 ? (
          <View style={styles.noShowtimes}>
            <Ionicons name="calendar-outline" size={32} color={Colors.disabled} />
            <Text style={styles.noShowtimesText}>Δεν υπάρχουν διαθέσιμες ημερομηνίες.</Text>
          </View>
        ) : (
          showtimes.map((st) => (
            <TouchableOpacity
              key={st.showtime_id}
              style={styles.showtimeCard}
              onPress={() => navigation.navigate('Booking', {
                showtimeId: st.showtime_id,
                showTitle: show.title,
              })}
              activeOpacity={0.8}
            >
              <View style={styles.showtimeLeft}>
                <Text style={styles.showtimeDate}>{formatDate(st.starts_at)}</Text>
                <View style={styles.showtimeMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={12} color={Colors.secondary} />
                    <Text style={styles.metaText}>{formatTime(st.starts_at)}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="business-outline" size={12} color={Colors.secondary} />
                    <Text style={styles.metaText}>{st.hall}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.showtimeArrow}>
                <Text style={styles.bookText}>Κράτηση</Text>
                <Ionicons name="arrow-forward-circle" size={22} color={Colors.accent} />
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
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  errorText: { color: Colors.error, fontSize: 15, marginTop: Spacing.sm },

  hero: {
    backgroundColor: Colors.primary,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title:      { fontSize: 24, fontWeight: '800', color: Colors.textLight, textAlign: 'center', marginBottom: 8 },
  theatreRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.md },
  theatre:    { fontSize: 13, color: Colors.disabled, textAlign: 'center' },
  badges:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  durationText:  { fontSize: 13, color: Colors.disabled },

  section:          { padding: Spacing.lg },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionTitle:     { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  description:      { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },

  noShowtimes:     { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  noShowtimesText: { color: Colors.textSecondary, fontStyle: 'italic' },

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
  showtimeLeft: { flex: 1 },
  showtimeDate: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  showtimeMeta: { flexDirection: 'row', gap: Spacing.md },
  metaItem:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:     { fontSize: 13, color: Colors.secondary },
  showtimeArrow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: Spacing.md },
  bookText:      { color: Colors.accent, fontWeight: '700', fontSize: 13 },
});
