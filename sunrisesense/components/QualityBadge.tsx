import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Quality } from '../types';
import { Colors, Typography } from '../constants/theme';

interface Props {
  quality: Quality;
  size?: 'small' | 'large';
}

const QUALITY_CONFIG: Record<Quality, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  Good: { color: Colors.good, icon: 'checkmark-circle' },
  Average: { color: Colors.average, icon: 'remove-circle' },
  Poor: { color: Colors.poor, icon: 'close-circle' },
};

export function QualityBadge({ quality, size = 'small' }: Props) {
  const config = QUALITY_CONFIG[quality];
  const isLarge = size === 'large';

  return (
    <View style={[styles.badge, { backgroundColor: config.color + '22', borderColor: config.color + '44' }]}>
      <Ionicons
        name={config.icon}
        size={isLarge ? 18 : 14}
        color={config.color}
      />
      <Text style={[isLarge ? styles.labelLarge : styles.labelSmall, { color: config.color }]}>
        {quality}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  labelSmall: {
    ...Typography.small,
    fontWeight: '600',
  },
  labelLarge: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
