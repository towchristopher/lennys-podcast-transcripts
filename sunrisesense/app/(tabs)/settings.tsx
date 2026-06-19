import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocations } from '../../hooks/useLocations';
import { requestNotificationPermissions, scheduleNotificationsForLocation, cancelNotificationsForLocation } from '../../services/notifications';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { Quality } from '../../types';

const QUALITY_OPTIONS: Quality[] = ['Good', 'Average', 'Poor'];

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SettingRow({
  icon,
  label,
  subtitle,
  right,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  right: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={Colors.sunrise} />
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{label}</Text>
          {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {right}
    </View>
  );
}

export default function SettingsScreen() {
  const { locations, updateLocation } = useLocations();
  const [notifPermission, setNotifPermission] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      requestNotificationPermissions().then(setNotifPermission);
    }
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermissions();
    setNotifPermission(granted);
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings to receive sunrise and sunset alerts.',
        [
          { text: 'Cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const toggleLocationNotifications = async (locationId: string, enabled: boolean) => {
    await updateLocation(locationId, { notificationsEnabled: enabled });
    const location = locations.find((l) => l.id === locationId);
    if (!location) return;

    if (enabled && notifPermission) {
      // Notifications will be scheduled next forecast refresh
    } else {
      await cancelNotificationsForLocation(locationId);
    }
  };

  const setQualityThreshold = async (locationId: string, threshold: Quality) => {
    await updateLocation(locationId, { qualityThreshold: threshold });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
      >
        {Platform.OS !== 'web' && (
          <>
            <SectionHeader title="Notifications" />
            <View style={styles.card}>
              <SettingRow
                icon="notifications"
                label="Notification Permission"
                subtitle={notifPermission ? 'Granted' : 'Not granted'}
                right={
                  notifPermission ? (
                    <Ionicons name="checkmark-circle" size={22} color={Colors.good} />
                  ) : (
                    <TouchableOpacity style={styles.grantButton} onPress={handleRequestPermission}>
                      <Text style={styles.grantButtonText}>Grant</Text>
                    </TouchableOpacity>
                  )
                }
              />
            </View>
          </>
        )}

        {locations.length > 0 && (
          <>
            <SectionHeader title="Per-Location Notifications" />
            {locations.map((location) => (
              <View key={location.id} style={styles.card}>
                <Text style={styles.locationName}>{location.label ?? location.name}</Text>

                <SettingRow
                  icon="notifications-outline"
                  label="Enable Notifications"
                  right={
                    <Switch
                      value={location.notificationsEnabled}
                      onValueChange={(v) => toggleLocationNotifications(location.id, v)}
                      trackColor={{ false: Colors.border, true: Colors.sunrise + '66' }}
                      thumbColor={location.notificationsEnabled ? Colors.sunrise : Colors.textSecondary}
                    />
                  }
                />

                {location.notificationsEnabled && (
                  <>
                    <View style={styles.divider} />
                    <SettingRow
                      icon="moon-outline"
                      label="Evening Before Alert"
                      subtitle="8pm the night before"
                      right={
                        <Switch
                          value={location.notifyEveningBefore}
                          onValueChange={(v) => updateLocation(location.id, { notifyEveningBefore: v })}
                          trackColor={{ false: Colors.border, true: Colors.sunrise + '66' }}
                          thumbColor={location.notifyEveningBefore ? Colors.sunrise : Colors.textSecondary}
                        />
                      }
                    />
                    <View style={styles.divider} />
                    <SettingRow
                      icon="alarm-outline"
                      label="Morning Alert"
                      subtitle="1 hour before sunrise"
                      right={
                        <Switch
                          value={location.notifyMorningOf}
                          onValueChange={(v) => updateLocation(location.id, { notifyMorningOf: v })}
                          trackColor={{ false: Colors.border, true: Colors.sunrise + '66' }}
                          thumbColor={location.notifyMorningOf ? Colors.sunrise : Colors.textSecondary}
                        />
                      }
                    />
                    <View style={styles.divider} />
                    <View style={styles.row}>
                      <View style={styles.rowLeft}>
                        <Ionicons name="filter-outline" size={20} color={Colors.sunrise} />
                        <View style={styles.rowText}>
                          <Text style={styles.rowLabel}>Notify When Quality Is</Text>
                          <Text style={styles.rowSubtitle}>Minimum quality threshold</Text>
                        </View>
                      </View>
                      <View style={styles.qualityPicker}>
                        {QUALITY_OPTIONS.map((q) => (
                          <TouchableOpacity
                            key={q}
                            style={[
                              styles.qualityOption,
                              location.qualityThreshold === q && styles.qualityOptionActive,
                            ]}
                            onPress={() => setQualityThreshold(location.id, q)}
                          >
                            <Text
                              style={[
                                styles.qualityOptionText,
                                location.qualityThreshold === q && styles.qualityOptionTextActive,
                              ]}
                            >
                              {q}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </>
                )}
              </View>
            ))}
          </>
        )}

        <SectionHeader title="About" />
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Weather Data</Text>
            <Text style={styles.aboutValue}>Open-Meteo (free)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Forecast Range</Text>
            <Text style={styles.aboutValue}>7 days</Text>
          </View>
        </View>
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
  sectionHeader: {
    ...Typography.small,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationName: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.sunrise,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    ...Typography.body,
  },
  rowSubtitle: {
    ...Typography.small,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  grantButton: {
    backgroundColor: Colors.sunrise,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  grantButtonText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
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
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  aboutLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  aboutValue: {
    ...Typography.body,
    fontWeight: '500',
  },
});
