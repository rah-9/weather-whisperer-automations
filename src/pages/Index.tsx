
import React, { useState } from 'react';
import WeatherForm from '../components/WeatherForm';
import WeatherDisplay from '../components/WeatherDisplay';
import Navbar from '../components/Navbar';
import AuthWrapper from '../components/AuthWrapper';

const Index = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-400">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Weather Intelligence Hub
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Get real-time weather data with AI-powered insights, automated email reports, and intelligent recommendations for your daily activities
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-blue-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Real-time Weather Data</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                <span>Email Automation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                <span>Secure Data Storage</span>
              </div>
            </div>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
              <div className="order-1">
                <WeatherForm 
                  onWeatherData={setWeatherData}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </div>
              
              {weatherData && (
                <div className="order-2">
                  <WeatherDisplay weatherData={weatherData} />
                </div>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center text-white">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌤️</span>
                </div>
                <h3 className="font-semibold mb-2">Live Weather Data</h3>
                <p className="text-sm text-blue-100">Real-time weather conditions from reliable global sources</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center text-white">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="font-semibold mb-2">AI Insights</h3>
                <p className="text-sm text-blue-100">Smart recommendations powered by Google Gemini AI</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center text-white">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📧</span>
                </div>
                <h3 className="font-semibold mb-2">Email Reports</h3>
                <p className="text-sm text-blue-100">Automated weather reports delivered to your inbox</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default Index;
