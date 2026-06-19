export const Colors = {
  sunrise: '#FF6B35',
  sunset: '#C45BAA',
  good: '#4CAF50',
  average: '#FF9800',
  poor: '#F44336',
  background: '#0A0A1A',
  surface: '#1A1A2E',
  card: '#16213E',
  text: '#FFFFFF',
  textSecondary: '#A0AEC0',
  border: '#2D3748',
};

export const Typography = {
  hero: { fontSize: 48, fontWeight: '700' as const, color: Colors.text },
  h1: { fontSize: 28, fontWeight: '700' as const, color: Colors.text },
  h2: { fontSize: 22, fontWeight: '600' as const, color: Colors.text },
  h3: { fontSize: 18, fontWeight: '600' as const, color: Colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: Colors.text },
  caption: { fontSize: 13, fontWeight: '400' as const, color: Colors.textSecondary },
  small: { fontSize: 11, fontWeight: '500' as const, color: Colors.textSecondary },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};
