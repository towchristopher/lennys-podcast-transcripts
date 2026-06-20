import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Location, ForecastData } from '../types';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { QualityBadge } from './QualityBadge';

interface Props {
  location: Location;
  forecast?: ForecastData;
  onPress: () => void;
  onDelete: () => void;
}

export function LocationCard({ location, forecast, onPress, onDelete }: Props) {
  const today = forecast?.forecasts[0];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.left}>
          <Ionicons name="location" size={18} color={Colors.sunrise} />
          <View style={styles.info}>
            <Text style={styles.name}>{location.label ?? location.name}</Text>
            {location.label && <Text style={styles.subname}>{location.name}</Text>}
          </View>
        </View>

        {today && (
          <View style={styles.qualities}>
            <View style={styles.qualityRow}>
              <Text style={styles.qLabel}>Rise</Text>
              <QualityBadge quality={today.sunrise.quality} />
            </View>
            <View style={styles.qualityRow}>
              <Text style={styles.qLabel}>Set</Text>
              <QualityBadge quality={today.sunset.quality} />
            </View>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {location.notificationsEnabled && (
          <Ionicons name="notifications" size={14} color={Colors.textSecondary} />
        )}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={18} color={Colors.poor} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  info: {
    flex: 1,
  },
  name: {
    ...Typography.body,
    fontWeight: '600',
  },
  subname: {
    ...Typography.small,
  },
  qualities: {
    gap: 4,
    alignItems: 'flex-end',
  },
  qualityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  qLabel: {
    ...Typography.small,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginLeft: Spacing.sm,
  },
});
