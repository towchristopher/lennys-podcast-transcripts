import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DayForecast, Quality } from '../types';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import { QualityBadge } from './QualityBadge';

interface Props {
  forecast: DayForecast;
  isToday: boolean;
}

function formatDate(dateStr: string, isToday: boolean): string {
  if (isToday) return 'Today';
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function DayForecastCard({ forecast, isToday }: Props) {
  return (
    <View style={[styles.card, isToday && styles.todayCard]}>
      <Text style={[styles.dateLabel, isToday && styles.todayLabel]}>
        {formatDate(forecast.date, isToday)}
      </Text>

      <View style={styles.events}>
        <EventRow
          label="Sunrise"
          time={formatTime(forecast.sunrise.time)}
          quality={forecast.sunrise.quality}
          color={Colors.sunrise}
        />
        <View style={styles.divider} />
        <EventRow
          label="Sunset"
          time={formatTime(forecast.sunset.time)}
          quality={forecast.sunset.quality}
          color={Colors.sunset}
        />
      </View>
    </View>
  );
}

function EventRow({
  label,
  time,
  quality,
  color,
}: {
  label: string;
  time: string;
  quality: Quality;
  color: string;
}) {
  return (
    <View style={styles.eventRow}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.eventLabel}>{label}</Text>
      <Text style={[styles.eventTime, { color }]}>{time}</Text>
      <QualityBadge quality={quality} />
    </View>
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
  },
  todayCard: {
    borderColor: Colors.sunrise + '44',
  },
  dateLabel: {
    ...Typography.caption,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  todayLabel: {
    color: Colors.sunrise,
  },
  events: {
    gap: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eventLabel: {
    ...Typography.caption,
    flex: 1,
  },
  eventTime: {
    ...Typography.caption,
    fontWeight: '600',
    minWidth: 55,
  },
});
