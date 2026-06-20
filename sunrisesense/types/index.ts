export type Quality = 'Good' | 'Average' | 'Poor';

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  label?: string;
  notificationsEnabled: boolean;
  notifyEveningBefore: boolean;
  notifyMorningOf: boolean;
  qualityThreshold: Quality;
}

export interface SunEvent {
  type: 'sunrise' | 'sunset';
  time: string;
  quality: Quality;
  cloudCover: number;
  precipitationProbability: number;
  visibility: number;
  weatherCode: number;
  description: string;
}

export interface DayForecast {
  date: string;
  sunrise: SunEvent;
  sunset: SunEvent;
}

export interface ForecastData {
  location: Location;
  forecasts: DayForecast[];
  fetchedAt: string;
}
