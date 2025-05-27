
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Wind, Droplets, Eye, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';

interface WeatherDisplayProps {
  weatherData: any;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData }) => {
  const getAQIStatus = (aqi: number) => {
    if (aqi <= 12) return { text: 'Good', color: 'bg-green-500', textColor: 'text-green-800', bgColor: 'bg-green-50' };
    if (aqi <= 35) return { text: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-800', bgColor: 'bg-yellow-50' };
    if (aqi <= 55) return { text: 'Unhealthy for Sensitive', color: 'bg-orange-500', textColor: 'text-orange-800', bgColor: 'bg-orange-50' };
    if (aqi <= 150) return { text: 'Unhealthy', color: 'bg-red-500', textColor: 'text-red-800', bgColor: 'bg-red-50' };
    return { text: 'Very Unhealthy', color: 'bg-purple-500', textColor: 'text-purple-800', bgColor: 'bg-purple-50' };
  };

  const aqiValue = typeof weatherData.aqi === 'number' ? weatherData.aqi : parseFloat(weatherData.aqi);
  const aqiStatus = !isNaN(aqiValue) ? getAQIStatus(aqiValue) : null;

  return (
    <Card className="w-full shadow-2xl bg-white/95 backdrop-blur-sm border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-6">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <MapPin className="w-6 h-6 text-green-600" />
          Weather Intelligence Report
        </CardTitle>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Generated on {new Date(weatherData.timestamp).toLocaleString()}</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 space-y-8">
        {/* Location Header */}
        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{weatherData.city}</h2>
          <p className="text-gray-600">Live Weather Conditions</p>
        </div>

        {/* Main Weather Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 text-center">
            <Thermometer className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Temperature</h3>
            <p className="text-3xl font-bold text-blue-600">{weatherData.temperature}°C</p>
            <p className="text-sm text-gray-600 mt-1">{(weatherData.temperature * 9/5 + 32).toFixed(1)}°F</p>
          </div>
          
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-2xl border border-cyan-200 text-center">
            <Eye className="w-8 h-8 text-cyan-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Condition</h3>
            <p className="text-xl font-semibold text-cyan-600">{weatherData.condition}</p>
          </div>

          {weatherData.weatherData?.current?.wind_kph && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 text-center">
              <Wind className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Wind Speed</h3>
              <p className="text-2xl font-bold text-purple-600">{weatherData.weatherData.current.wind_kph} km/h</p>
              <p className="text-sm text-gray-600 mt-1">{weatherData.weatherData.current.wind_mph} mph</p>
            </div>
          )}

          {weatherData.weatherData?.current?.humidity && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 text-center">
              <Droplets className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Humidity</h3>
              <p className="text-2xl font-bold text-green-600">{weatherData.weatherData.current.humidity}%</p>
            </div>
          )}
        </div>

        {/* Air Quality Section */}
        <div className={`p-6 rounded-2xl border ${aqiStatus ? aqiStatus.bgColor + ' border-current' : 'bg-gray-50 border-gray-200'}`}>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Air Quality Index</h3>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-700">
                {!isNaN(aqiValue) ? aqiValue.toFixed(1) : weatherData.aqi}
              </p>
              <p className="text-sm text-gray-600">PM2.5</p>
            </div>
            {aqiStatus && (
              <Badge className={`${aqiStatus.color} text-white text-lg px-4 py-2`}>
                {aqiStatus.text}
              </Badge>
            )}
          </div>
        </div>

        {/* User Information */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Report Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Requested by</p>
              <p className="font-semibold text-gray-800">{weatherData.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-semibold text-gray-800">{weatherData.email}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Email Validation:</span>
            {weatherData.emailValid ? (
              <Badge className="bg-green-500 text-white flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Valid
              </Badge>
            ) : (
              <Badge className="bg-red-500 text-white flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Invalid
              </Badge>
            )}
          </div>
        </div>

        {/* Status Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-2xl text-center">
          <h3 className="text-xl font-semibold mb-2">✅ Report Generated Successfully</h3>
          <p className="text-blue-100">
            Weather data has been processed and stored. An AI-powered email report with personalized recommendations has been sent to your inbox.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherDisplay;
