import { Quality } from '../types';

const THUNDERSTORM_CODES = new Set([95, 96, 99]);
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);
const HEAVY_RAIN_CODES = new Set([65, 67, 82]);

export function scoreSunEvent(
  cloudCover: number,
  precipProb: number,
  visibility: number,
  weatherCode: number
): Quality {
  if (
    THUNDERSTORM_CODES.has(weatherCode) ||
    SNOW_CODES.has(weatherCode) ||
    HEAVY_RAIN_CODES.has(weatherCode)
  ) {
    return 'Poor';
  }

  if (
    cloudCover >= 20 &&
    cloudCover <= 70 &&
    precipProb < 20 &&
    visibility > 10000
  ) {
    return 'Good';
  }

  if (
    cloudCover >= 10 &&
    cloudCover <= 80 &&
    precipProb < 50 &&
    visibility > 5000
  ) {
    return 'Average';
  }

  return 'Poor';
}

export function getQualityDescription(quality: Quality, type: 'sunrise' | 'sunset'): string {
  const event = type === 'sunrise' ? 'sunrise' : 'sunset';

  if (quality === 'Good') {
    return type === 'sunrise'
      ? 'Partly cloudy skies with thin clouds near the horizon make for a vivid display'
      : 'Scattered clouds will catch and amplify the warm evening colors beautifully';
  }

  if (quality === 'Average') {
    return type === 'sunrise'
      ? 'Some color expected, though clouds may partially obscure the full display'
      : `Decent ${event} with some color, but heavy cloud cover may mute the palette`;
  }

  return type === 'sunrise'
    ? 'Conditions not ideal — either too clear or too overcast for vibrant colors'
    : 'Poor viewing conditions — heavy cloud cover or precipitation will obscure the sunset';
}
