import { fetchWeatherData } from './weather';
import { scoreSunEvent, getQualityDescription } from './scoring';
import { Location, DayForecast, ForecastData, SunEvent } from '../types';

function findClosestHourIndex(hourlyTimes: string[], targetTime: string): number {
  const target = new Date(targetTime).getTime();
  let closest = 0;
  let minDiff = Infinity;

  for (let i = 0; i < hourlyTimes.length; i++) {
    const diff = Math.abs(new Date(hourlyTimes[i]).getTime() - target);
    if (diff < minDiff) {
      minDiff = diff;
      closest = i;
    }
  }
  return closest;
}

export async function getForecast(location: Location): Promise<ForecastData> {
  const data = await fetchWeatherData(location.latitude, location.longitude);

  const forecasts: DayForecast[] = data.daily.time.map((date, dayIndex) => {
    const sunriseTime = data.daily.sunrise[dayIndex];
    const sunsetTime = data.daily.sunset[dayIndex];

    const sunriseHourIdx = findClosestHourIndex(data.hourly.time, sunriseTime);
    const sunsetHourIdx = findClosestHourIndex(data.hourly.time, sunsetTime);

    const sunriseData = {
      cloudCover: data.hourly.cloud_cover[sunriseHourIdx] ?? 50,
      precipProb: data.hourly.precipitation_probability[sunriseHourIdx] ?? 0,
      visibility: data.hourly.visibility[sunriseHourIdx] ?? 10000,
      weatherCode: data.hourly.weather_code[sunriseHourIdx] ?? 0,
    };

    const sunsetData = {
      cloudCover: data.hourly.cloud_cover[sunsetHourIdx] ?? 50,
      precipProb: data.hourly.precipitation_probability[sunsetHourIdx] ?? 0,
      visibility: data.hourly.visibility[sunsetHourIdx] ?? 10000,
      weatherCode: data.hourly.weather_code[sunsetHourIdx] ?? 0,
    };

    const sunriseQuality = scoreSunEvent(
      sunriseData.cloudCover,
      sunriseData.precipProb,
      sunriseData.visibility,
      sunriseData.weatherCode
    );

    const sunsetQuality = scoreSunEvent(
      sunsetData.cloudCover,
      sunsetData.precipProb,
      sunsetData.visibility,
      sunsetData.weatherCode
    );

    const sunrise: SunEvent = {
      type: 'sunrise',
      time: sunriseTime,
      quality: sunriseQuality,
      cloudCover: sunriseData.cloudCover,
      precipitationProbability: sunriseData.precipProb,
      visibility: sunriseData.visibility,
      weatherCode: sunriseData.weatherCode,
      description: getQualityDescription(sunriseQuality, 'sunrise'),
    };

    const sunset: SunEvent = {
      type: 'sunset',
      time: sunsetTime,
      quality: sunsetQuality,
      cloudCover: sunsetData.cloudCover,
      precipitationProbability: sunsetData.precipProb,
      visibility: sunsetData.visibility,
      weatherCode: sunsetData.weatherCode,
      description: getQualityDescription(sunsetQuality, 'sunset'),
    };

    return { date, sunrise, sunset };
  });

  return {
    location,
    forecasts,
    fetchedAt: new Date().toISOString(),
  };
}
