
/**
 * Weather API integration using WeatherAPI.com
 * This is a demo implementation - in production, use environment variables for API keys
 */

const WEATHER_API_KEY = 'demo_key'; // Replace with your actual API key
const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';

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
 * Fetch weather data for a given city
 */
export const fetchWeatherData = async (city: string): Promise<WeatherData> => {
  console.log(`Fetching weather data for: ${city}`);
  
  // For demo purposes, return mock data
  // In production, uncomment the API call below
  
  /*
  const url = `${WEATHER_API_BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}&aqi=yes`;
  
  try {
    const response = await fetch(url);
    
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
  */
  
  // Mock data for demonstration
  const mockWeatherData: WeatherData = {
    location: {
      name: city,
      region: 'Demo Region',
      country: 'Demo Country',
      lat: 0,
      lon: 0
    },
    current: {
      temp_c: Math.round(Math.random() * 30 + 5), // Random temp between 5-35°C
      temp_f: 0, // Will be calculated
      condition: {
        text: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'][Math.floor(Math.random() * 5)],
        icon: ''
      },
      wind_mph: Math.round(Math.random() * 15),
      wind_kph: 0,
      humidity: Math.round(Math.random() * 100),
      air_quality: {
        pm2_5: Math.round(Math.random() * 50 + 5), // Random AQI between 5-55
        pm10: Math.round(Math.random() * 100 + 10),
        us_epa_index: Math.floor(Math.random() * 6) + 1
      }
    }
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log('Mock weather data generated:', mockWeatherData);
  return mockWeatherData;
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
