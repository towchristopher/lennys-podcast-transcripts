import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocations } from '../../hooks/useLocations';
import { useForecast } from '../../hooks/useForecast';
import { SunEventCard } from '../../components/SunEventCard';
import { DayForecastCard } from '../../components/DayForecastCard';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

export default function HomeScreen() {
  const { locations, loading: locationsLoading } = useLocations();
  const [activeIndex, setActiveIndex] = useState(0);

  const activeLocation = locations[activeIndex] ?? null;
  const { forecast, loading: forecastLoading, error, refresh } = useForecast(activeLocation);

  const loading = locationsLoading || forecastLoading;
  const today = forecast?.forecasts[0];

  if (!locationsLoading && locations.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Locations Yet</Text>
          <Text style={styles.emptySubtitle}>Add a location to see sunrise and sunset forecasts</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/locations')}
          >
            <Text style={styles.addButtonText}>Add Location</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>SunriseSense</Text>

        {locations.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationPills}>
            {locations.map((loc, idx) => (
              <TouchableOpacity
                key={loc.id}
                style={[styles.pill, idx === activeIndex && styles.activePill]}
                onPress={() => setActiveIndex(idx)}
              >
                <Ionicons name="location" size={12} color={idx === activeIndex ? Colors.sunrise : Colors.textSecondary} />
                <Text style={[styles.pillText, idx === activeIndex && styles.activePillText]}>
                  {loc.label ?? loc.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={forecastLoading && !!forecast}
            onRefresh={refresh}
            tintColor={Colors.sunrise}
          />
        }
      >
        {loading && !forecast && (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={Colors.sunrise} />
            <Text style={styles.loadingText}>Fetching forecast...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorState}>
            <Ionicons name="cloud-offline" size={48} color={Colors.poor} />
            <Text style={styles.errorTitle}>Unable to load forecast</Text>
            <Text style={styles.errorSubtitle}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {today && !error && (
          <>
            <Text style={styles.sectionLabel}>Today</Text>
            <View style={styles.todayEvents}>
              <SunEventCard event={today.sunrise} type="sunrise" />
              <SunEventCard event={today.sunset} type="sunset" />
            </View>

            {forecast!.forecasts.length > 1 && (
              <>
                <Text style={styles.sectionLabel}>7-Day Forecast</Text>
                {forecast!.forecasts.map((day, idx) => (
                  <DayForecastCard key={day.date} forecast={day} isToday={idx === 0} />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  appTitle: {
    ...Typography.h1,
    color: Colors.sunrise,
    marginBottom: Spacing.sm,
  },
  locationPills: {
    flexDirection: 'row',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  activePill: {
    borderColor: Colors.sunrise + '66',
    backgroundColor: Colors.sunrise + '11',
  },
  pillText: {
    ...Typography.caption,
  },
  activePillText: {
    color: Colors.sunrise,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: Platform.OS === 'web' ? '100%' : undefined,
  },
  sectionLabel: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    color: Colors.textSecondary,
  },
  todayEvents: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  loadingState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.caption,
  },
  errorState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    ...Typography.h3,
    textAlign: 'center',
  },
  errorSubtitle: {
    ...Typography.caption,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.sunrise,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  retryText: {
    ...Typography.body,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h2,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: Colors.sunrise,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  addButtonText: {
    ...Typography.body,
    fontWeight: '600',
  },
});
