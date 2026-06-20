import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ExpoLocation from 'expo-location';
import { useLocations } from '../../hooks/useLocations';
import { useForecast } from '../../hooks/useForecast';
import { LocationCard } from '../../components/LocationCard';
import { searchLocations, GeocodingResult } from '../../services/weather';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { Location, ForecastData } from '../../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function LocationRow({
  location,
  onAdd,
}: {
  location: GeocodingResult;
  onAdd: (loc: GeocodingResult) => void;
}) {
  return (
    <TouchableOpacity style={styles.searchResult} onPress={() => onAdd(location)}>
      <Ionicons name="location-outline" size={18} color={Colors.sunrise} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{location.name}</Text>
        <Text style={styles.resultSub}>
          {[location.admin1, location.country].filter(Boolean).join(', ')}
        </Text>
      </View>
      <Ionicons name="add-circle" size={22} color={Colors.sunrise} />
    </TouchableOpacity>
  );
}

function AddLocationModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (loc: Omit<Location, 'id'>) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const found = await searchLocations(text);
      setResults(found);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleAdd = useCallback(
    (geo: GeocodingResult) => {
      onAdd({
        name: `${geo.name}${geo.admin1 ? `, ${geo.admin1}` : ''}, ${geo.country}`,
        latitude: geo.latitude,
        longitude: geo.longitude,
        notificationsEnabled: false,
        notifyEveningBefore: true,
        notifyMorningOf: true,
        qualityThreshold: 'Average',
      });
      setQuery('');
      setResults([]);
      onClose();
    },
    [onAdd, onClose]
  );

  const handleGPS = useCallback(async () => {
    setGpsLoading(true);
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Location permission is needed to use your current location.');
        return;
      }
      const pos = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Balanced });
      const [geo] = await ExpoLocation.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const name = [geo?.city, geo?.region, geo?.country].filter(Boolean).join(', ') || 'Current Location';
      onAdd({
        name,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        notificationsEnabled: false,
        notifyEveningBefore: true,
        notifyMorningOf: true,
        qualityThreshold: 'Average',
      });
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Could not get your location. Please try searching instead.');
    } finally {
      setGpsLoading(false);
    }
  }, [onAdd, onClose]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Location</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search city..."
            placeholderTextColor={Colors.textSecondary}
            value={query}
            onChangeText={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          {searching && <ActivityIndicator size="small" color={Colors.sunrise} />}
        </View>

        {Platform.OS !== 'web' && (
          <TouchableOpacity style={styles.gpsButton} onPress={handleGPS} disabled={gpsLoading}>
            {gpsLoading ? (
              <ActivityIndicator size="small" color={Colors.sunrise} />
            ) : (
              <Ionicons name="navigate" size={18} color={Colors.sunrise} />
            )}
            <Text style={styles.gpsText}>Use my current location</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <LocationRow location={item} onAdd={handleAdd} />}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            query.length >= 2 && !searching ? (
              <Text style={styles.noResults}>No results found</Text>
            ) : null
          }
        />
      </View>
    </Modal>
  );
}

export default function LocationsScreen() {
  const { locations, addLocation, removeLocation } = useLocations();
  const [showModal, setShowModal] = useState(false);
  const [forecastMap] = useState<Map<string, ForecastData>>(new Map());

  const handleAdd = useCallback(
    async (locData: Omit<Location, 'id'>) => {
      const location: Location = { ...locData, id: generateId() };
      await addLocation(location);
    },
    [addLocation]
  );

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('Remove Location', 'Are you sure you want to remove this location?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeLocation(id) },
      ]);
    },
    [removeLocation]
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LocationCard
            location={item}
            forecast={forecastMap.get(item.id)}
            onPress={() => {}}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No saved locations</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first location</Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
            <Ionicons name="add-circle" size={20} color={Colors.sunrise} />
            <Text style={styles.addButtonText}>Add Location</Text>
          </TouchableOpacity>
        }
      />

      <AddLocationModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAdd}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: Platform.OS === 'web' ? '100%' : undefined,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: Spacing.sm,
  },
  emptyText: {
    ...Typography.h3,
  },
  emptySubtext: {
    ...Typography.caption,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.sunrise + '44',
    borderStyle: 'dashed',
    marginTop: Spacing.sm,
  },
  addButtonText: {
    ...Typography.body,
    color: Colors.sunrise,
    fontWeight: '600',
  },
  modal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    paddingTop: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.h2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    margin: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    padding: 0,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.sunrise + '11',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.sunrise + '33',
  },
  gpsText: {
    ...Typography.body,
    color: Colors.sunrise,
    fontWeight: '600',
  },
  resultsList: {
    paddingHorizontal: Spacing.md,
  },
  searchResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    ...Typography.body,
    fontWeight: '500',
  },
  resultSub: {
    ...Typography.caption,
  },
  noResults: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingTop: Spacing.xl,
  },
});
