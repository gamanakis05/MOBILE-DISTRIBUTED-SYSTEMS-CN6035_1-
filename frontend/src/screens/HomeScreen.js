import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, ActivityIndicator, RefreshControl,
  TouchableOpacity, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useOfflineCache } from '../hooks/useOfflineCache';
import { Card, Badge, EmptyState } from '../components/UI';
import { Colors, Spacing, BorderRadius } from '../utils/theme';
import { testConnection } from '../utils/connectionTest';

export default function HomeScreen({ navigation }) {
  const [search,          setSearch]          = useState('');
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);

  const theatresFetcher = useCallback(
    () => api.get('/theatres').then(r => r.data.data || []),
    []
  );
  const showsFetcher = useCallback(
    () => {
      const params = {};
      if (search)          params.title     = search;
      if (selectedTheatre) params.theatreId = selectedTheatre;
      return api.get('/shows', { params }).then(r => r.data.data || []);
    },
    [search, selectedTheatre]
  );

  const {
    data: theatres, loading: theatresLoading,
  } = useOfflineCache('cache_theatres', theatresFetcher);

  const {
    data: shows, loading: showsLoading, error,
    isOffline, refresh,
  } = useOfflineCache(`cache_shows_${search}_${selectedTheatre}`, showsFetcher);

  const loading    = theatresLoading || showsLoading;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleConnectionTest = async () => {
    setTestingConnection(true);
    const result = await testConnection();
    setTestingConnection(false);
    
    if (result.success) {
      alert(`✅ Σύνδεση επιτυχής!\n\n${result.message}\nTheatres: ${result.theatresCount}`);
    } else {
      alert(`❌ Σφάλμα σύνδεσης!\n\n${result.message}\n\n${result.suggestions ? 'Προτάσεις:\n' + result.suggestions.join('\n') : ''}`);
    }
  };

  const renderTheatreFilter = () => (
    <View style={styles.filterWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
        bounces={false}
      >
        {/* "Όλα" chip */}
        <TouchableOpacity
          style={[styles.filterChip, !selectedTheatre && styles.filterChipActive]}
          onPress={() => setSelectedTheatre(null)}
          activeOpacity={0.75}
        >
          <Text style={[styles.filterChipText, !selectedTheatre && styles.filterChipTextActive]}>
            Όλα
          </Text>
        </TouchableOpacity>

        {theatres.map(t => {
          const isActive = selectedTheatre === t.theatre_id;
          return (
            <TouchableOpacity
              key={t.theatre_id}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setSelectedTheatre(isActive ? null : t.theatre_id)}
              activeOpacity={0.75}
            >
              <Text
                style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {t.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderShow = ({ item }) => (
    <Card
      style={styles.showCard}
      onPress={() => navigation.navigate('ShowDetail', { showId: item.show_id })}
    >
      <View style={styles.showHeader}>
        <View style={styles.showInfo}>
          <Text style={styles.showTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.theatreRow}>
            <Ionicons name="location-sharp" size={12} color={Colors.secondary} />
            <Text style={styles.theatreName}>{item.theatre_name}</Text>
          </View>
          <Text style={styles.location}>{item.theatre_location}</Text>
        </View>
        <View style={styles.showMeta}>
          <Badge label={item.age_rating} color={Colors.secondary} />
          <View style={styles.durationRow}>
            <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.duration}>{item.duration} λεπτά</Text>
          </View>
        </View>
      </View>
      {item.description && (
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      )}
      <View style={styles.bookBtn}>
        <Ionicons name="ticket-outline" size={14} color={Colors.accent} />
        <Text style={styles.bookBtnText}>Κράτηση Θέσης</Text>
        <Ionicons name="arrow-forward" size={14} color={Colors.accent} />
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Φόρτωση παραστάσεων...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Αναζήτηση παράστασης..."
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter bar */}
      {renderTheatreFilter()}

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color={Colors.textLight} />
          <Text style={styles.offlineText}>Offline — εμφάνιση αποθηκευμένων δεδομένων</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <View style={styles.errorContent}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.testButton} 
              onPress={handleConnectionTest}
              disabled={testingConnection}
            >
              {testingConnection ? (
                <ActivityIndicator size="small" color={Colors.textLight} />
              ) : (
                <>
                  <Ionicons name="wifi-outline" size={14} color={Colors.textLight} />
                  <Text style={styles.testButtonText}>Test Connection</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={shows}
        keyExtractor={i => String(i.show_id)}
        renderItem={renderShow}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.accent]} />
        }
        ListEmptyComponent={<EmptyState message="Δεν βρέθηκαν παραστάσεις." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.background },
  centered:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  loadingText: { marginTop: Spacing.md, color: Colors.textSecondary, fontSize: 14 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },

  // ── Filter bar ──────────────────────────────────────────────
  filterWrapper: {
    // Ορίζουμε σταθερό ύψος ώστε να μην "πηδάει" η λίστα
    height: 48,
    marginBottom: 4,
  },
  filterContent: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    // Δεν βάζουμε flexDirection: 'row' — το ScrollView horizontal το κάνει αυτόματα
  },
  filterChip: {
    // maxWidth ώστε τα μεγάλα ονόματα να κόβονται με "..." και όχι να εξαφανίζονται
    maxWidth: 160,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    // Εξασφαλίζουμε ότι το chip δεν συρρικνώνεται
    flexShrink: 0,
  },
  filterChipActive:     { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    // Εμποδίζουμε το wrap
    flexShrink: 1,
  },
  filterChipTextActive: { color: Colors.textLight },

  // ── Show cards ───────────────────────────────────────────────
  list:       { padding: Spacing.md, paddingTop: Spacing.sm },
  showCard:   { marginBottom: Spacing.md },
  showHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  showInfo:    { flex: 1, marginRight: Spacing.md },
  showTitle:   { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  theatreRow:  { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 2 },
  theatreName: { fontSize: 13, color: Colors.secondary, fontWeight: '600' },
  location:    { fontSize: 12, color: Colors.textSecondary },
  showMeta:    { alignItems: 'flex-end', gap: 6 },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  duration:    { fontSize: 12, color: Colors.textSecondary },
  description: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: Spacing.sm },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '0d',
    borderRadius: BorderRadius.sm,
    padding: 10,
    marginTop: Spacing.xs,
  },
  bookBtnText:  { color: Colors.accent, fontWeight: '700', fontSize: 13 },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  offlineText: { color: Colors.textLight, fontSize: 12, fontWeight: '600' },
  errorBanner:  { backgroundColor: Colors.error + '18', padding: Spacing.md, marginHorizontal: Spacing.md, borderRadius: BorderRadius.sm },
  errorContent: { alignItems: 'center', gap: Spacing.sm },
  errorText:    { color: Colors.error, textAlign: 'center', fontSize: 13 },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.error + '30',
    borderRadius: BorderRadius.sm,
  },
  testButtonText: { color: Colors.textLight, fontSize: 11, fontWeight: '600' },
});
