
/**
 * Weather API integration using WeatherAPI.com
 */

import { supabase } from "@/integrations/supabase/client";

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    pressure_mb: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    vis_km: number;
    uv: number;
    air_quality?: {
      pm2_5: number;
      pm10: number;
      us_epa_index: number;
      gb_defra_index: number;
    };
  };
}

/**
 * Fetch weather data for a given city using the backend
 */
export const fetchWeatherData = async (city: string): Promise<WeatherData> => {
  console.log(`🌍 Fetching comprehensive weather data for: ${city}`);
  
  if (!city || city.trim().length === 0) {
    throw new Error('City name is required');
  }
  
  try {
    // Use Supabase client to call the edge function
    const { data, error } = await supabase.functions.invoke('weather-api', {
      body: { city: city.trim() }
    });

    if (error) {
      console.error('Weather API error:', error);
      if (error.message?.includes('not found')) {
        throw new Error(`City "${city}" not found. Please check the spelling and try again.`);
      }
      throw new Error('Failed to fetch weather data. Please check the city name and try again.');
    }

    if (!data) {
      throw new Error('No weather data received');
    }

    // Validate the response structure
    if (!data.location || !data.current) {
      console.error('Invalid weather data structure:', data);
      throw new Error('Invalid weather data received');
    }
    
    console.log('✅ Weather data successfully received:', {
      location: data.location.name,
      temperature: data.current.temp_c,
      condition: data.current.condition.text,
      aqi: data.current.air_quality?.pm2_5 || 'N/A'
    });
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching weather data:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to fetch weather data. Please check your internet connection and try again.');
  }
};

/**
 * Format weather data for display
 */
export const formatWeatherDisplay = (data: WeatherData) => {
  const { location, current } = data;
  
  return {
    location: `${location.name}, ${location.region}, ${location.country}`,
    temperature: `${current.temp_c}°C (${current.temp_f}°F)`,
    condition: current.condition.text,
    humidity: `${current.humidity}%`,
    windSpeed: `${current.wind_kph} km/h (${current.wind_mph} mph)`,
    pressure: `${current.pressure_mb} mb`,
    visibility: `${current.vis_km} km`,
    uvIndex: current.uv,
    feelsLike: `${current.feelslike_c}°C`,
    airQuality: current.air_quality?.pm2_5 || 'N/A',
    cloudCover: `${current.cloud}%`,
    localTime: location.localtime
  };
};

/**
 * Format weather data for email template
 */
export const formatWeatherForEmail = (data: WeatherData, userName: string): string => {
  const { location, current } = data;
  const aqi = current.air_quality?.pm2_5 || 'N/A';
  
  return `Hi ${userName},

Thanks for using Weather Intelligence Hub!

Here's the current weather for ${location.name}, ${location.region}:

🌡️ TEMPERATURE
• Current: ${current.temp_c}°C (${current.temp_f}°F)
• Feels like: ${current.feelslike_c}°C

☁️ CONDITIONS
• Weather: ${current.condition.text}
• Humidity: ${current.humidity}%
• Cloud Cover: ${current.cloud}%

💨 WIND & PRESSURE
• Wind Speed: ${current.wind_kph} km/h
• Pressure: ${current.pressure_mb} mb
• Visibility: ${current.vis_km} km

🌬️ AIR QUALITY
• PM2.5: ${aqi}
• UV Index: ${current.uv}

📍 LOCATION DETAILS
• City: ${location.name}
• Region: ${location.region}
• Country: ${location.country}
• Local Time: ${location.localtime}

Stay safe and weather-aware!

Best regards,
Weather Intelligence Hub Team`;
};
