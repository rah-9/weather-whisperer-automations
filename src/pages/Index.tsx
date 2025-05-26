
import React, { useState } from 'react';
import WeatherForm from '../components/WeatherForm';
import WeatherDisplay from '../components/WeatherDisplay';

const Index = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-400">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Weather Automation System
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Get personalized weather insights for your city with automated data collection and email summaries
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <WeatherForm 
            onWeatherData={setWeatherData}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
          
          {weatherData && (
            <WeatherDisplay weatherData={weatherData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
