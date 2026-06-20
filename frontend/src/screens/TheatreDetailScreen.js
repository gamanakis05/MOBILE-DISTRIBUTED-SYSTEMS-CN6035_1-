import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { Badge, EmptyState, Divider } from '../components/UI';
import { Colors, Spacing, BorderRadius } from '../utils/theme';

export default function TheatreDetailScreen({ route, navigation }) {
  const { theatreId, theatreName } = route.params;
  const [theatre, setTheatre] = useState(null);
  const [shows,   setShows]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    navigation.setOptions({ title: theatreName || 'Θέατρο' });
    const fetch = async () => {
      try {
        const [tRes, sRes] = await Promise.all([
          api.get(`/theatres/${theatreId}`),
          api.get('/shows', { params: { theatreId } }),
        ]);
        setTheatre(tRes.data.data);
        setShows(sRes.data.data || []);
      } catch {
        setError('Αδυναμία φόρτωσης.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [theatreId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderShow = ({ item }) => (
    <TouchableOpacity
      style={styles.showCard}
      onPress={() => navigation.navigate('ShowDetail', { showId: item.show_id })}
      activeOpacity={0.8}
    >
      <View style={styles.showLeft}>
        <View style={styles.showIconBox}>
          <Ionicons name="film-outline" size={22} color={Colors.accent} />
        </View>
        <View style={styles.showInfo}>
          <Text style={styles.showTitle}>{item.title}</Text>
          <View style={styles.showMeta}>
            <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.showDuration}>{item.duration} λεπτά</Text>
            <Badge label={item.age_rating} color={Colors.secondary} />
          </View>
          {item.description ? (
            <Text style={styles.showDesc} numberOfLines={2}>{item.description}</Text>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.accent} />
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={shows}
      keyExtractor={i => String(i.show_id)}
      renderItem={renderShow}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={() => (
        <>
          {/* Theatre hero */}
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="business" size={40} color={Colors.textLight} />
            </View>
            <Text style={styles.heroName}>{theatre?.name}</Text>
            <View style={styles.heroLocationRow}>
              <Ionicons name="location-sharp" size={14} color={Colors.disabled} />
              <Text style={styles.heroLocation}>{theatre?.location}</Text>
            </View>
            {theatre?.description && (
              <Text style={styles.heroDesc}>{theatre.description}</Text>
            )}
            <View style={styles.heroContacts}>
              {theatre?.phone && (
                <View style={styles.contactItem}>
                  <Ionicons name="call-outline" size={14} color={Colors.disabled} />
                  <Text style={styles.contactText}>{theatre.phone}</Text>
                </View>
              )}
              {theatre?.email && (
                <View style={styles.contactItem}>
                  <Ionicons name="mail-outline" size={14} color={Colors.disabled} />
                  <Text style={styles.contactText}>{theatre.email}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Ionicons name="film-outline" size={18} color={Colors.textPrimary} />
            <Text style={styles.sectionTitle}>Παραστάσεις</Text>
            <Text style={styles.sectionCount}>({shows.length})</Text>
          </View>
        </>
      )}
      ListEmptyComponent={
        <EmptyState message="Δεν υπάρχουν παραστάσεις για αυτό το θέατρο." icon={null} />
      }
    />
  );
}

const styles = StyleSheet.create({
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
  heroName:        { fontSize: 22, fontWeight: '800', color: Colors.textLight, textAlign: 'center', marginBottom: 6 },
  heroLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.sm },
  heroLocation:    { fontSize: 13, color: Colors.disabled },
  heroDesc:        { fontSize: 13, color: Colors.disabled, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.sm },
  heroContacts:    { flexDirection: 'row', gap: Spacing.lg, flexWrap: 'wrap', justifyContent: 'center' },
  contactItem:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactText:     { fontSize: 12, color: Colors.disabled },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  sectionCount: { fontSize: 14, color: Colors.textSecondary },

  listContent: { paddingBottom: Spacing.xl, backgroundColor: Colors.background },

  showCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  showLeft:    { flexDirection: 'row', flex: 1, alignItems: 'center' },
  showIconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  showInfo:     { flex: 1 },
  showTitle:    { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  showMeta:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 },
  showDuration: { fontSize: 12, color: Colors.textSecondary },
  showDesc:     { fontSize: 12, color: Colors.textSecondary, lineHeight: 16 },
});
