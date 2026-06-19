import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocations } from '../../hooks/useLocations';
import { useForecast } from '../../hooks/useForecast';
import { DayForecastCard } from '../../components/DayForecastCard';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { Quality } from '../../types';

const QUALITY_OPTIONS: Quality[] = ['Good', 'Average', 'Poor'];

export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locations, updateLocation, removeLocation } = useLocations();
  const navigation = useNavigation();

  const location = locations.find((l) => l.id === id) ?? null;
  const { forecast, loading, error, refresh } = useForecast(location);

  const [editingLabel, setEditingLabel] = useState(false);
  const [labelText, setLabelText] = useState(location?.label ?? '');

  useEffect(() => {
    if (location) {
      navigation.setOptions({ title: location.label ?? location.name });
    }
  }, [location, navigation]);

  const saveLabel = () => {
    if (!location) return;
    updateLocation(location.id, { label: labelText.trim() || undefined });
    setEditingLabel(false);
  };

  const handleDelete = () => {
    Alert.alert('Remove Location', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          if (location) removeLocation(location.id);
          router.back();
        },
      },
    ]);
  };

  if (!location) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>Location not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Label</Text>
          {editingLabel ? (
            <View style={styles.labelEditRow}>
              <TextInput
                style={styles.labelInput}
                value={labelText}
                onChangeText={setLabelText}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={saveLabel}
              />
              <TouchableOpacity onPress={saveLabel}>
                <Ionicons name="checkmark-circle" size={28} color={Colors.good} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingLabel(false)}>
                <Ionicons name="close-circle" size={28} color={Colors.poor} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.labelRow} onPress={() => { setLabelText(location.label ?? ''); setEditingLabel(true); }}>
              <Text style={styles.labelValue}>{location.label ?? location.name}</Text>
              <Ionicons name="pencil" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
          <Text style={styles.coords}>
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        </View>

        {Platform.OS !== 'web' && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Notifications</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Enable Alerts</Text>
              <Switch
                value={location.notificationsEnabled}
                onValueChange={(v) => updateLocation(location.id, { notificationsEnabled: v })}
                trackColor={{ false: Colors.border, true: Colors.sunrise + '66' }}
                thumbColor={location.notificationsEnabled ? Colors.sunrise : Colors.textSecondary}
              />
            </View>
            {location.notificationsEnabled && (
              <>
                <View style={styles.divider} />
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Evening Before</Text>
                  <Switch
                    value={location.notifyEveningBefore}
                    onValueChange={(v) => updateLocation(location.id, { notifyEveningBefore: v })}
                    trackColor={{ false: Colors.border, true: Colors.sunrise + '66' }}
                    thumbColor={location.notifyEveningBefore ? Colors.sunrise : Colors.textSecondary}
                  />
                </View>
                <View style={styles.divider} />
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>1hr Before Sunrise</Text>
                  <Switch
                    value={location.notifyMorningOf}
                    onValueChange={(v) => updateLocation(location.id, { notifyMorningOf: v })}
                    trackColor={{ false: Colors.border, true: Colors.sunrise + '66' }}
                    thumbColor={location.notifyMorningOf ? Colors.sunrise : Colors.textSecondary}
                  />
                </View>
                <View style={styles.divider} />
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Min. Quality</Text>
                  <View style={styles.qualityPicker}>
                    {QUALITY_OPTIONS.map((q) => (
                      <TouchableOpacity
                        key={q}
                        style={[styles.qualityOption, location.qualityThreshold === q && styles.qualityOptionActive]}
                        onPress={() => updateLocation(location.id, { qualityThreshold: q })}
                      >
                        <Text style={[styles.qualityOptionText, location.qualityThreshold === q && styles.qualityOptionTextActive]}>
                          {q}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        <Text style={styles.forecastHeader}>7-Day Forecast</Text>

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.sunrise} />
          </View>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {forecast?.forecasts.map((day, idx) => (
          <DayForecastCard key={day.date} forecast={day} isToday={idx === 0} />
        ))}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color={Colors.poor} />
          <Text style={styles.deleteText}>Remove Location</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: Platform.OS === 'web' ? '100%' : undefined,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  notFound: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    ...Typography.small,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelValue: {
    ...Typography.h3,
    flex: 1,
  },
  labelEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  labelInput: {
    flex: 1,
    ...Typography.h3,
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.sunrise,
    paddingVertical: 4,
  },
  coords: {
    ...Typography.small,
    marginTop: Spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  settingLabel: {
    ...Typography.body,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  qualityPicker: {
    flexDirection: 'row',
    gap: 4,
  },
  qualityOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qualityOptionActive: {
    backgroundColor: Colors.sunrise,
    borderColor: Colors.sunrise,
  },
  qualityOptionText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  qualityOptionTextActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  forecastHeader: {
    ...Typography.h3,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  errorBox: {
    backgroundColor: Colors.poor + '22',
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.poor + '44',
  },
  errorText: {
    ...Typography.caption,
    color: Colors.poor,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.poor,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  retryText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.poor + '44',
    backgroundColor: Colors.poor + '11',
  },
  deleteText: {
    ...Typography.body,
    color: Colors.poor,
    fontWeight: '600',
  },
});
