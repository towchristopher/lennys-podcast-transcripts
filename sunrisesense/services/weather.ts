const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  daily: {
    time: string[];
    sunrise: string[];
    sunset: string[];
  };
  hourly: {
    time: string[];
    cloud_cover: number[];
    precipitation_probability: number[];
    visibility: number[];
    weather_code: number[];
  };
}

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export async function fetchWeatherData(lat: number, lon: number): Promise<OpenMeteoResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    daily: 'sunrise,sunset',
    hourly: 'cloud_cover,precipitation_probability,visibility,weather_code',
    forecast_days: '7',
    timezone: 'auto',
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }
  return response.json() as Promise<OpenMeteoResponse>;
}

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({
    name: query,
    count: '10',
    language: 'en',
    format: 'json',
  });

  const response = await fetch(`${GEO_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status}`);
  }
  const data = await response.json() as { results?: GeocodingResult[] };
  return data.results ?? [];
}
