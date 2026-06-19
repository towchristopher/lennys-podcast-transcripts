import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Location, DayForecast, Quality } from '../types';

const QUALITY_RANK: Record<Quality, number> = { Good: 3, Average: 2, Poor: 1 };

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

function meetsThreshold(quality: Quality, threshold: Quality): boolean {
  return QUALITY_RANK[quality] >= QUALITY_RANK[threshold];
}

function notificationPrefix(locationId: string): string {
  return `sunrisesense-${locationId}`;
}

export async function cancelNotificationsForLocation(locationId: string): Promise<void> {
  if (Platform.OS === 'web') return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const prefix = notificationPrefix(locationId);

  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(prefix))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

export async function scheduleNotificationsForLocation(
  location: Location,
  forecasts: DayForecast[]
): Promise<void> {
  if (Platform.OS === 'web') return;
  if (!location.notificationsEnabled) {
    await cancelNotificationsForLocation(location.id);
    return;
  }

  await cancelNotificationsForLocation(location.id);

  const now = new Date();
  const prefix = notificationPrefix(location.id);

  for (const forecast of forecasts) {
    const sunriseTime = new Date(forecast.sunrise.time);
    const sunsetTime = new Date(forecast.sunset.time);

    if (location.notifyEveningBefore && meetsThreshold(forecast.sunrise.quality, location.qualityThreshold)) {
      const eveningBefore = new Date(sunriseTime);
      eveningBefore.setDate(eveningBefore.getDate() - 1);
      eveningBefore.setHours(20, 0, 0, 0);

      if (eveningBefore > now) {
        await Notifications.scheduleNotificationAsync({
          identifier: `${prefix}-sunrise-evening-${forecast.date}`,
          content: {
            title: `Tomorrow's Sunrise: ${forecast.sunrise.quality}`,
            body: forecast.sunrise.description,
            data: { locationId: location.id, type: 'sunrise', date: forecast.date },
          },
          trigger: { date: eveningBefore },
        });
      }
    }

    if (location.notifyMorningOf && meetsThreshold(forecast.sunrise.quality, location.qualityThreshold)) {
      const morningAlert = new Date(sunriseTime.getTime() - 60 * 60 * 1000);

      if (morningAlert > now) {
        await Notifications.scheduleNotificationAsync({
          identifier: `${prefix}-sunrise-morning-${forecast.date}`,
          content: {
            title: `Sunrise in 1 hour: ${forecast.sunrise.quality}`,
            body: forecast.sunrise.description,
            data: { locationId: location.id, type: 'sunrise', date: forecast.date },
          },
          trigger: { date: morningAlert },
        });
      }
    }

    if (location.notifyEveningBefore && meetsThreshold(forecast.sunset.quality, location.qualityThreshold)) {
      const sunsetEvening = new Date(sunsetTime);
      sunsetEvening.setHours(8, 0, 0, 0);

      if (sunsetEvening > now && sunsetEvening < sunsetTime) {
        await Notifications.scheduleNotificationAsync({
          identifier: `${prefix}-sunset-morning-${forecast.date}`,
          content: {
            title: `Tonight's Sunset: ${forecast.sunset.quality}`,
            body: forecast.sunset.description,
            data: { locationId: location.id, type: 'sunset', date: forecast.date },
          },
          trigger: { date: sunsetEvening },
        });
      }
    }

    if (location.notifyMorningOf && meetsThreshold(forecast.sunset.quality, location.qualityThreshold)) {
      const sunsetAlert = new Date(sunsetTime.getTime() - 60 * 60 * 1000);

      if (sunsetAlert > now) {
        await Notifications.scheduleNotificationAsync({
          identifier: `${prefix}-sunset-hour-${forecast.date}`,
          content: {
            title: `Sunset in 1 hour: ${forecast.sunset.quality}`,
            body: forecast.sunset.description,
            data: { locationId: location.id, type: 'sunset', date: forecast.date },
          },
          trigger: { date: sunsetAlert },
        });
      }
    }
  }
}
