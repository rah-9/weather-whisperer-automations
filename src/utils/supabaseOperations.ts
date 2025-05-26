
import { SupabaseClient } from '@supabase/supabase-js';

export interface WeatherDataInsert {
  user_id: string;
  full_name: string;
  email: string;
  city: string;
  email_valid: boolean;
  temperature: number;
  condition: string;
  aqi: string;
}

export const insertWeatherData = async (
  supabase: SupabaseClient,
  data: WeatherDataInsert
) => {
  const { data: insertedData, error } = await supabase
    .from('weather_data')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error inserting weather data:', error);
    throw new Error('Failed to save weather data');
  }

  return insertedData;
};

export const sendWeatherEmail = async (
  supabase: SupabaseClient,
  weatherData: any,
  userName: string,
  userEmail: string
) => {
  const { data, error } = await supabase.functions.invoke('send-weather-email', {
    body: {
      weatherData,
      userName,
      userEmail,
    },
  });

  if (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }

  return data;
};
