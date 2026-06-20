import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, ActivityIndicator, RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useOfflineCache } from '../hooks/useOfflineCache';
import { Card, EmptyState } from '../components/UI';
import { Colors, Spacing, BorderRadius } from '../utils/theme';

export default function TheatresScreen({ navigation }) {
  const [search,     setSearch]     = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetcher = useCallback(
    () => api.get('/theatres').then(r => r.data.data || []),
    []
  );

  const { data: allTheatres, loading, error, isOffline, refresh } =
    useOfflineCache('cache_theatres', fetcher);

  const theatres = allTheatres
    ? search
      ? allTheatres.filter(t =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.location.toLowerCase().includes(search.toLowerCase())
        )
      : allTheatres
    : [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderTheatre = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('TheatreDetail', {
        theatreId: item.theatre_id,
        theatreName: item.name,
      })}
    >
      <View style={styles.cardLeft}>
        <View style={styles.iconBox}>
          <Ionicons name="business" size={28} color={Colors.accent} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={13} color={Colors.textSecondary} />
            <Text style={styles.location}>{item.location}</Text>
          </View>
          {item.description ? (
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.cardRight}>
        <Ionicons name="chevron-forward" size={20} color={Colors.accent} />
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Φόρτωση θεάτρων...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Αναζήτηση θεάτρου ή τοποθεσίας..."
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

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color={Colors.textLight} />
          <Text style={styles.offlineText}>Offline — εμφάνιση αποθηκευμένων δεδομένων</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={theatres}
        keyExtractor={i => String(i.theatre_id)}
        renderItem={renderTheatre}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.accent]}
          />
        }
        ListEmptyComponent={<EmptyState message="Δεν βρέθηκαν θέατρα." icon={null} />}
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

  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xl },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  cardLeft:  { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cardRight: { paddingLeft: Spacing.sm },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info:        { flex: 1 },
  name:        { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 3 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  location:    { fontSize: 12, color: Colors.textSecondary },
  description: { fontSize: 12, color: Colors.textSecondary, lineHeight: 16 },

  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  offlineText: { color: Colors.textLight, fontSize: 12, fontWeight: '600' },
  errorBanner: { backgroundColor: Colors.error + '18', padding: Spacing.md, marginHorizontal: Spacing.md, borderRadius: BorderRadius.sm },
  errorText:   { color: Colors.error, textAlign: 'center', fontSize: 13 },
});
