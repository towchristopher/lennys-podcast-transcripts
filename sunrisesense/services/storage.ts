import AsyncStorage from '@react-native-async-storage/async-storage';
import { Location } from '../types';

const LOCATIONS_KEY = '@sunrisesense:locations';

export async function getLocations(): Promise<Location[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Location[];
  } catch {
    return [];
  }
}

export async function saveLocations(locations: Location[]): Promise<void> {
  await AsyncStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
}

export async function addLocation(location: Location): Promise<Location[]> {
  const locations = await getLocations();
  const updated = [...locations, location];
  await saveLocations(updated);
  return updated;
}

export async function updateLocation(id: string, updates: Partial<Location>): Promise<Location[]> {
  const locations = await getLocations();
  const updated = locations.map((loc) => (loc.id === id ? { ...loc, ...updates } : loc));
  await saveLocations(updated);
  return updated;
}

export async function removeLocation(id: string): Promise<Location[]> {
  const locations = await getLocations();
  const updated = locations.filter((loc) => loc.id !== id);
  await saveLocations(updated);
  return updated;
}
