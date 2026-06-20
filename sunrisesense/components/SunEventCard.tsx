import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SunEvent } from '../types';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { QualityBadge } from './QualityBadge';

interface Props {
  event: SunEvent;
  type: 'sunrise' | 'sunset';
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function SunEventCard({ event, type }: Props) {
  const isSunrise = type === 'sunrise';
  const accentColor = isSunrise ? Colors.sunrise : Colors.sunset;

  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons
            name={isSunrise ? 'sunny' : 'partly-sunny'}
            size={20}
            color={accentColor}
          />
          <Text style={styles.typeLabel}>{isSunrise ? 'Sunrise' : 'Sunset'}</Text>
        </View>
        <QualityBadge quality={event.quality} size="large" />
      </View>

      <Text style={[styles.time, { color: accentColor }]}>{formatTime(event.time)}</Text>

      <Text style={styles.description}>{event.description}</Text>

      <View style={styles.stats}>
        <StatItem icon="cloud" label="Cloud" value={`${event.cloudCover}%`} />
        <StatItem icon="rainy" label="Rain" value={`${event.precipitationProbability}%`} />
        <StatItem
          icon="eye"
          label="Visibility"
          value={event.visibility >= 1000 ? `${(event.visibility / 1000).toFixed(0)}km` : `${event.visibility}m`}
        />
      </View>
    </View>
  );
}

function StatItem({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={14} color={Colors.textSecondary} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeLabel: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  description: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statLabel: {
    ...Typography.small,
    marginRight: 2,
  },
  statValue: {
    ...Typography.small,
    color: Colors.text,
    fontWeight: '600',
  },
});
