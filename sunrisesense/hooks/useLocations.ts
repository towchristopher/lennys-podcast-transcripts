import { useState, useEffect, useCallback } from 'react';
import { Location } from '../types';
import * as storage from '../services/storage';

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.getLocations().then((locs) => {
      setLocations(locs);
      setLoading(false);
    });
  }, []);

  const addLocation = useCallback(async (location: Location) => {
    const updated = await storage.addLocation(location);
    setLocations(updated);
  }, []);

  const updateLocation = useCallback(async (id: string, updates: Partial<Location>) => {
    const updated = await storage.updateLocation(id, updates);
    setLocations(updated);
  }, []);

  const removeLocation = useCallback(async (id: string) => {
    const updated = await storage.removeLocation(id);
    setLocations(updated);
  }, []);

  return { locations, addLocation, updateLocation, removeLocation, loading };
}
