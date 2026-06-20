import React, { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, ActivityIndicator, RefreshControl,
  TouchableOpacity, ScrollView,
} from 'react-native';
import api from '../services/api';
import { Card, Badge, EmptyState } from '../components/UI';
import { Colors, Spacing, BorderRadius } from '../utils/theme';

export default function HomeScreen({ navigation }) {
  const [shows,      setShows]      = useState([]);
  const [theatres,   setTheatres]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [error,  setError]  = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const params = {};
      if (search)          params.title     = search;
      if (selectedTheatre) params.theatreId = selectedTheatre;

      const [showsRes, theatresRes] = await Promise.all([
        api.get('/shows', { params }),
        api.get('/theatres'),
      ]);
      setShows(showsRes.data.data);
      setTheatres(theatresRes.data.data);
    } catch (err) {
      setError('Αδυναμία φόρτωσης δεδομένων.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedTheatre]);

  useEffect(() => {
    const timer = setTimeout(fetchData, 300); // debounce search
    return () => clearTimeout(timer);
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderTheatreFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterRow}
      contentContainerStyle={styles.filterContent}
    >
      <TouchableOpacity
        style={[styles.filterChip, !selectedTheatre && styles.filterChipActive]}
        onPress={() => setSelectedTheatre(null)}
      >
        <Text style={[styles.filterChipText, !selectedTheatre && styles.filterChipTextActive]}>
          Όλα
        </Text>
      </TouchableOpacity>
      {theatres.map(t => (
        <TouchableOpacity
          key={t.theatre_id}
          style={[styles.filterChip, selectedTheatre === t.theatre_id && styles.filterChipActive, { maxWidth: 160 }]}
          onPress={() => setSelectedTheatre(
            selectedTheatre === t.theatre_id ? null : t.theatre_id
          )}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedTheatre === t.theatre_id && styles.filterChipTextActive,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {t.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderShow = ({ item }) => (
    <Card
      style={styles.showCard}
      onPress={() => navigation.navigate('ShowDetail', { showId: item.show_id })}
    >
      <View style={styles.showHeader}>
        <View style={styles.showInfo}>
          <Text style={styles.showTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.theatreName}>📍 {item.theatre_name}</Text>
          <Text style={styles.location}>{item.theatre_location}</Text>
        </View>
        <View style={styles.showMeta}>
          <Badge label={item.age_rating} color={Colors.secondary} />
          <Text style={styles.duration}>⏱ {item.duration} λεπτά</Text>
        </View>
      </View>
      {item.description && (
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      )}
      <View style={styles.bookBtn}>
        <Text style={styles.bookBtnText}>Κράτηση Θέσης →</Text>
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
        <Ionicons name="search" size={16} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Αναζήτηση παράστασης..."
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close" size={14} color={Colors.textSecondary} style={styles.clearSearch} />
          </TouchableOpacity>
        )}
      </View>

      {renderTheatreFilter()}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={shows}
        keyExtractor={i => String(i.show_id)}
        renderItem={renderShow}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.accent]} />}
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
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon:  { fontSize: 16, marginRight: Spacing.sm },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  clearSearch: { fontSize: 14, color: Colors.textSecondary, paddingLeft: Spacing.sm },

  filterRow:    { maxHeight: 48 },
  filterContent: { paddingHorizontal: Spacing.md, gap: Spacing.sm, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  filterChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterChipText:       { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  filterChipTextActive: { color: Colors.textLight },

  list: { padding: Spacing.md, paddingTop: Spacing.sm },

  showCard: { marginBottom: Spacing.md },
  showHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  showInfo: { flex: 1, marginRight: Spacing.md },
  showTitle:   { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  theatreName: { fontSize: 13, color: Colors.secondary, fontWeight: '600', marginBottom: 2 },
  location:    { fontSize: 12, color: Colors.textSecondary },
  showMeta:    { alignItems: 'flex-end', gap: 6 },
  duration:    { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  description: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: Spacing.sm },
  bookBtn: {
    backgroundColor: Colors.primary + '11',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  bookBtnText: { color: Colors.accent, fontWeight: '700', fontSize: 14 },
  errorBanner: { backgroundColor: Colors.error + '18', padding: Spacing.md, marginHorizontal: Spacing.md, borderRadius: BorderRadius.sm },
  errorText:   { color: Colors.error, textAlign: 'center', fontSize: 13 },
});
