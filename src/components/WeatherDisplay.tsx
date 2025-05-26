
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WeatherDisplayProps {
  weatherData: any;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData }) => {
  const getAQIStatus = (aqi: number) => {
    if (aqi <= 12) return { text: 'Good', color: 'bg-green-500' };
    if (aqi <= 35) return { text: 'Moderate', color: 'bg-yellow-500' };
    if (aqi <= 55) return { text: 'Unhealthy for Sensitive', color: 'bg-orange-500' };
    if (aqi <= 150) return { text: 'Unhealthy', color: 'bg-red-500' };
    return { text: 'Very Unhealthy', color: 'bg-purple-500' };
  };

  const aqiStatus = typeof weatherData.aqi === 'number' ? getAQIStatus(weatherData.aqi) : null;

  return (
    <Card className="w-full shadow-xl bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Weather Summary for {weatherData.city}
        </CardTitle>
        <p className="text-gray-600">Data collected at {new Date(weatherData.timestamp).toLocaleString()}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800">Temperature</h3>
            <p className="text-3xl font-bold text-blue-600">{weatherData.temperature}°C</p>
          </div>
          
          <div className="text-center p-4 bg-cyan-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800">Condition</h3>
            <p className="text-xl font-semibold text-cyan-600">{weatherData.condition}</p>
          </div>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Air Quality Index</h3>
          <div className="flex items-center justify-center gap-2">
            <p className="text-2xl font-bold text-gray-700">
              {typeof weatherData.aqi === 'number' ? weatherData.aqi.toFixed(1) : weatherData.aqi}
            </p>
            {aqiStatus && (
              <Badge className={`${aqiStatus.color} text-white`}>
                {aqiStatus.text}
              </Badge>
            )}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">User Information</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Name:</span> {weatherData.fullName}</p>
            <p><span className="font-medium">Email:</span> {weatherData.email}</p>
            <p><span className="font-medium">Email Valid:</span> 
              <Badge className={weatherData.emailValid ? 'bg-green-500 ml-2' : 'bg-red-500 ml-2'}>
                {weatherData.emailValid ? 'Valid' : 'Invalid'}
              </Badge>
            </p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready for Database Storage</h3>
          <p className="text-sm text-gray-600">
            This data structure is ready to be stored in your Supabase database and used for automated email sending.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherDisplay;
