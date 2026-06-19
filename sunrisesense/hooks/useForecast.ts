import { useState, useEffect, useCallback, useRef } from 'react';
import { Location, ForecastData } from '../types';
import { getForecast } from '../services/forecast';

const CACHE_TTL_MS = 60 * 60 * 1000;

const memoryCache = new Map<string, ForecastData>();

export function useForecast(location: Location | null) {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<boolean>(false);

  const refresh = useCallback(async () => {
    if (!location) return;

    const cached = memoryCache.get(location.id);
    if (cached) {
      const age = Date.now() - new Date(cached.fetchedAt).getTime();
      if (age < CACHE_TTL_MS) {
        setForecast(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);
    abortRef.current = false;

    try {
      const data = await getForecast(location);
      if (!abortRef.current) {
        memoryCache.set(location.id, data);
        setForecast(data);
      }
    } catch (err) {
      if (!abortRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch forecast');
      }
    } finally {
      if (!abortRef.current) {
        setLoading(false);
      }
    }
  }, [location]);

  useEffect(() => {
    abortRef.current = false;
    refresh();
    return () => {
      abortRef.current = true;
    };
  }, [refresh]);

  return { forecast, loading, error, refresh };
}
