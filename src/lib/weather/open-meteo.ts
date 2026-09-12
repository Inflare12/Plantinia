export interface PlantWeatherAdvisory {
  location: string;
  temperatureC: number;
  humidityPct: number;
  uvIndex: number;
  windSpeedKmH: number;
  condition: string;
  fungalRisk: 'low' | 'moderate' | 'high';
  wateringAdvice: string;
  frostAlert: boolean;
  heatAlert: boolean;
}

export async function getPlantWeatherAdvisory(
  lat = 28.6139,
  lon = 77.2090,
  locationName = 'New Delhi'
): Promise<PlantWeatherAdvisory> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code,uv_index`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      throw new Error(`Weather fetch failed: ${res.status}`);
    }

    const data = await res.json();
    const current = data.current;

    const temp = current.temperature_2m ?? 24;
    const humidity = current.relative_humidity_2m ?? 65;
    const wind = current.wind_speed_10m ?? 8;
    const uv = current.uv_index ?? 5;

    // Determine conditions
    let fungalRisk: 'low' | 'moderate' | 'high' = 'low';
    if (humidity > 80 && temp >= 18 && temp <= 28) {
      fungalRisk = 'high';
    } else if (humidity > 65) {
      fungalRisk = 'moderate';
    }

    let wateringAdvice = 'Normal watering schedule recommended.';
    if (temp > 32 || humidity < 35) {
      wateringAdvice = 'High evaporation rate: check outdoor and container plants twice today.';
    } else if (humidity > 80) {
      wateringAdvice = 'High moisture retention: delay watering to prevent root edema and fungal growth.';
    }

    const frostAlert = temp <= 5;
    const heatAlert = temp >= 38;

    return {
      location: locationName,
      temperatureC: Math.round(temp),
      humidityPct: Math.round(humidity),
      uvIndex: Math.round(uv),
      windSpeedKmH: Math.round(wind),
      condition: temp > 28 ? 'Sunny & Warm' : 'Mild & Clear',
      fungalRisk,
      wateringAdvice,
      frostAlert,
      heatAlert,
    };
  } catch {
    // Fallback if network is unavailable
    return {
      location: locationName,
      temperatureC: 25,
      humidityPct: 62,
      uvIndex: 6,
      windSpeedKmH: 10,
      condition: 'Clear & Mild',
      fungalRisk: 'moderate',
      wateringAdvice: 'Optimal conditions for watering in the early morning.',
      frostAlert: false,
      heatAlert: false,
    };
  }
}
