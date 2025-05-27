
/**
 * Weather API integration using WeatherAPI.com
 */

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_mph: number;
    wind_kph: number;
    humidity: number;
    air_quality?: {
      pm2_5: number;
      pm10: number;
      us_epa_index: number;
    };
  };
}

/**
 * Fetch weather data for a given city using the backend
 */
export const fetchWeatherData = async (city: string): Promise<WeatherData> => {
  console.log(`Fetching weather data for: ${city}`);
  
  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Weather API response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data. Please check the city name and try again.');
  }
};

/**
 * Format weather data for email template
 */
export const formatWeatherForEmail = (data: WeatherData, userName: string): string => {
  const { location, current } = data;
  const aqi = current.air_quality?.pm2_5 || 'N/A';
  
  return `Hi ${userName},

Thanks for submitting your details.

Here's the current weather for ${location.name}:

- Temperature: ${current.temp_c}°C
- Condition: ${current.condition.text}
- AQI: ${aqi}

Stay safe and take care!

Thanks,
Weather Automation System`;
};
