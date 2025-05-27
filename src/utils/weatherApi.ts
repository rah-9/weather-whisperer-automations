
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
    // Use the correct Supabase function URL with city as query parameter
    const response = await fetch(`https://qinbteuulduxmyeavzgf.supabase.co/functions/v1/weather-api?city=${encodeURIComponent(city)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbmJ0ZXV1bGR1eG15ZWF2emdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNzQxNTQsImV4cCI6MjA2Mzg1MDE1NH0.Fi1umdY0m-vlP9foC7P61vdk8ENfSwbKuDrlKuISh3A`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbmJ0ZXV1bGR1eG15ZWF2emdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNzQxNTQsImV4cCI6MjA2Mzg1MDE1NH0.Fi1umdY0m-vlP9foC7P61vdk8ENfSwbKuDrlKuISh3A',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Weather API error response:', errorText);
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
