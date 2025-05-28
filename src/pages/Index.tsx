
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
      <div className="min-h-screen wavy-background bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-400 relative">
        {/* Floating particles */}
        <div className="floating-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>

        <Navbar />
        
        <div className="container mx-auto px-4 py-12 space-y-16">
          {/* Hero Section with improved spacing */}
          <div className="text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 drop-shadow-lg animate-glow">
              Weather Intelligence Hub
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Get real-time weather data with AI-powered insights, automated email reports, and intelligent recommendations for your daily activities
            </p>
            
            {/* Feature badges with spacing */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-blue-100">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 animate-scale-in">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse-slow"></span>
                <span className="font-medium">Real-time Weather Data</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 animate-scale-in">
                <span className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse-slow"></span>
                <span className="font-medium">AI-Powered Analysis</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 animate-scale-in">
                <span className="w-3 h-3 bg-purple-400 rounded-full animate-pulse-slow"></span>
                <span className="font-medium">Automatic Email Reports</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 animate-scale-in">
                <span className="w-3 h-3 bg-pink-400 rounded-full animate-pulse-slow"></span>
                <span className="font-medium">Secure Data Storage</span>
              </div>
            </div>
          </div>
          
          {/* Main Content Section with improved spacing */}
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
              {/* Form Section */}
              <div className="order-1 animate-slide-up">
                <WeatherForm 
                  onWeatherData={setWeatherData}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </div>
              
              {/* Results Section with proper spacing */}
              {weatherData && (
                <div className="order-2 animate-fade-in result-section-spacing">
                  <WeatherDisplay weatherData={weatherData} />
                </div>
              )}
            </div>
          </div>

          {/* Features Section with enhanced spacing */}
          <div className="mt-24 max-w-6xl mx-auto animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
              Why Choose Weather Intelligence Hub?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center text-white card-hover">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                  <span className="text-3xl">🌤️</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Live Weather Data</h3>
                <p className="text-blue-100 leading-relaxed">
                  Get accurate, real-time weather conditions from reliable global weather stations and satellites
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center text-white card-hover">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">AI-Powered Insights</h3>
                <p className="text-blue-100 leading-relaxed">
                  Smart recommendations and personalized weather advice powered by advanced AI technology
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center text-white card-hover">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-slow">
                  <span className="text-3xl">📧</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Automatic Email Reports</h3>
                <p className="text-blue-100 leading-relaxed">
                  Receive detailed weather reports automatically delivered to your email inbox
                </p>
              </div>
            </div>
          </div>

          {/* How it works section */}
          <div className="mt-24 max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto text-white font-bold text-lg">1</div>
                <h4 className="text-white font-semibold">Enter Details</h4>
                <p className="text-blue-100 text-sm">Provide your name, email, and city</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto text-white font-bold text-lg">2</div>
                <h4 className="text-white font-semibold">Fetch Data</h4>
                <p className="text-blue-100 text-sm">We get real-time weather information</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto text-white font-bold text-lg">3</div>
                <h4 className="text-white font-semibold">AI Analysis</h4>
                <p className="text-blue-100 text-sm">AI generates personalized insights</p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto text-white font-bold text-lg">4</div>
                <h4 className="text-white font-semibold">Auto Email</h4>
                <p className="text-blue-100 text-sm">Report sent automatically to your inbox</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default Index;
