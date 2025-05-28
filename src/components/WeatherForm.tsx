
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { validateEmail } from '../utils/validation';
import { insertWeatherData } from '../utils/supabaseOperations';
import { fetchWeatherData } from '../utils/weatherApi';
import { sendEmailViaEmailJS } from '../utils/emailService';
import { Mail, Database, Send, CloudSun, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from './LoadingSpinner';

interface WeatherFormProps {
  onWeatherData: (data: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const WeatherForm: React.FC<WeatherFormProps> = ({ onWeatherData, isLoading, setIsLoading }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    city: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    city: '',
    fullName: ''
  });
  const [submitError, setSubmitError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  const user = useUser();
  const supabase = useSupabaseClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (submitError) {
      setSubmitError('');
    }

    if (emailSent) {
      setEmailSent(false);
    }
  };

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
      city: ''
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const generateAICommentary = (weatherData: any): string => {
    const temp = weatherData.current.temp_c;
    const condition = weatherData.current.condition.text.toLowerCase();
    const aqi = weatherData.current.air_quality?.pm2_5;
    const humidity = weatherData.current.humidity;
    const windSpeed = weatherData.current.wind_kph;

    let commentary = `🌍 Weather Analysis for ${weatherData.location.name}: `;
    
    // Temperature analysis with more detailed advice
    if (temp < 0) {
      commentary += "❄️ Freezing conditions! Dress in heavy winter layers, limit outdoor exposure, and watch for ice on roads and walkways. ";
    } else if (temp < 10) {
      commentary += "🧥 Cold weather ahead! Wear warm layers, a good winter coat, gloves, and a hat. Perfect for hot drinks and cozy indoor activities. ";
    } else if (temp < 20) {
      commentary += "🍂 Pleasant cool weather! A light jacket or sweater is ideal. Great conditions for walking, jogging, or outdoor sports. ";
    } else if (temp < 30) {
      commentary += "☀️ Beautiful mild temperature! Perfect weather for all outdoor activities, picnics, and enjoying nature. ";
    } else if (temp < 35) {
      commentary += "🌡️ Warm day ahead! Stay hydrated, wear light breathable clothing, and seek shade during peak sun hours. ";
    } else {
      commentary += "🔥 Extremely hot! Stay indoors with AC, drink lots of water, avoid strenuous outdoor activities, and wear sun protection. ";
    }

    // Weather condition analysis
    if (condition.includes('rain') || condition.includes('drizzle')) {
      commentary += "🌧️ Rain expected - carry an umbrella, wear waterproof shoes, and drive carefully. Great weather for indoor activities! ";
    } else if (condition.includes('snow')) {
      commentary += "❄️ Snow conditions - drive slowly, wear warm waterproof boots, and enjoy the winter wonderland safely. ";
    } else if (condition.includes('sun') || condition.includes('clear')) {
      commentary += "☀️ Sunny skies ahead! Perfect for outdoor activities, but don't forget SPF 30+ sunscreen and sunglasses. ";
    } else if (condition.includes('cloud')) {
      commentary += "☁️ Cloudy conditions provide natural shade - excellent for outdoor exercise without harsh sun exposure. ";
    } else if (condition.includes('fog') || condition.includes('mist')) {
      commentary += "🌫️ Limited visibility due to fog - drive with headlights on and allow extra travel time. ";
    }

    // Wind analysis
    if (windSpeed > 30) {
      commentary += "💨 Strong winds forecast - secure outdoor items, be cautious of falling branches, and avoid high-profile vehicles. ";
    } else if (windSpeed > 15) {
      commentary += "🪁 Breezy conditions - perfect for kite flying, sailing, but hold onto lightweight items! ";
    }

    // Humidity comfort analysis
    if (humidity > 80) {
      commentary += "💧 High humidity - you'll feel warmer than the temperature indicates. Stay cool and hydrated! ";
    } else if (humidity < 30) {
      commentary += "🏜️ Low humidity - use moisturizer, stay hydrated, and consider a humidifier indoors. ";
    }

    // Enhanced air quality analysis
    if (aqi && !isNaN(aqi)) {
      if (aqi <= 12) {
        commentary += "💚 Excellent air quality - perfect for all outdoor activities including running, cycling, and sports!";
      } else if (aqi <= 35) {
        commentary += "🟢 Good air quality - safe for all outdoor activities. Great day to exercise outside!";
      } else if (aqi <= 55) {
        commentary += "🟡 Moderate air quality - generally fine, but sensitive individuals should monitor symptoms.";
      } else if (aqi <= 150) {
        commentary += "🟠 Unhealthy for sensitive groups - limit prolonged outdoor exertion, especially if you have respiratory conditions.";
      } else {
        commentary += "🔴 Poor air quality - stay indoors, avoid outdoor exercise, and consider wearing an N95 mask if you must go outside.";
      }
    }

    return commentary;
  };

  const updateProcessingStep = (step: string) => {
    setProcessingStep(step);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setEmailSent(false);
    setProcessingStep('');
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    setIsLoading(true);
    console.log('🚀 Starting weather intelligence processing...');

    try {
      // Step 1: Fetch weather data
      updateProcessingStep('Fetching real-time weather data...');
      console.log('📡 Fetching weather data for:', formData.city);
      const weatherData = await fetchWeatherData(formData.city);
      console.log('✅ Weather data received:', weatherData);
      
      // Step 2: Generate AI commentary
      updateProcessingStep('Generating AI weather insights...');
      console.log('🤖 Generating AI commentary...');
      const aiCommentary = generateAICommentary(weatherData);
      console.log('✅ AI commentary generated');
      
      // Step 3: Prepare data for storage and email
      updateProcessingStep('Preparing weather report...');
      const enrichedData = {
        fullName: formData.fullName,
        email: formData.email,
        city: formData.city,
        emailValid: validateEmail(formData.email),
        temperature: weatherData.current.temp_c,
        condition: weatherData.current.condition.text,
        aqi: weatherData.current.air_quality?.pm2_5?.toString() || 'N/A',
        humidity: weatherData.current.humidity,
        windSpeed: weatherData.current.wind_kph,
        timestamp: new Date().toISOString(),
        weatherData: weatherData,
        aiCommentary: aiCommentary
      };

      // Step 4: Save to database
      updateProcessingStep('Saving to secure database...');
      console.log('💾 Saving data to database...');
      const dbData = {
        user_id: user.id,
        full_name: formData.fullName,
        email: formData.email,
        city: formData.city,
        email_valid: validateEmail(formData.email),
        temperature: weatherData.current.temp_c,
        condition: weatherData.current.condition.text,
        aqi: weatherData.current.air_quality?.pm2_5?.toString() || 'N/A',
      };

      await insertWeatherData(supabase, dbData);
      console.log('✅ Data saved to database');

      // Step 5: Send email automatically
      updateProcessingStep('Sending personalized email report...');
      console.log('📧 Sending email automatically...');
      const emailSuccess = await sendEmailViaEmailJS({
        userName: formData.fullName,
        userEmail: formData.email,
        city: formData.city,
        temperature: weatherData.current.temp_c,
        condition: weatherData.current.condition.text,
        aqi: weatherData.current.air_quality?.pm2_5?.toString() || 'N/A',
        aiCommentary: aiCommentary
      });

      console.log('✅ Email processing completed');
      setEmailSent(true);

      // Step 6: Update UI and show success
      updateProcessingStep('Complete!');
      onWeatherData(enrichedData);
      
      toast.success('🎉 Weather intelligence report generated and sent!', {
        description: `Comprehensive report sent to ${formData.email}`,
        duration: 6000,
      });
      
      // Clear form
      setFormData({ fullName: '', email: '', city: '' });
      
    } catch (error) {
      console.error('❌ Error processing weather request:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setSubmitError(errorMessage);
      toast.error('Failed to process request. Please try again.');
      updateProcessingStep('');
    } finally {
      setIsLoading(false);
      setTimeout(() => setProcessingStep(''), 2000);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <Card className="w-full shadow-2xl bg-white/95 backdrop-blur-sm border-0 hover:shadow-3xl transition-all duration-300 card-hover overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 rounded-t-lg p-10 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-purple-100/20 to-cyan-100/20 animate-pulse-slow"></div>
          <CardTitle className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-4 animate-scale-in relative z-10 mb-6">
            <CloudSun className="w-10 h-10 text-blue-600 animate-bounce-slow" />
            Weather Intelligence Hub
            <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
          </CardTitle>
          <p className="text-gray-600 text-xl mt-6 relative z-10 leading-relaxed">Get real-time weather data with AI-powered insights</p>
        </CardHeader>
        
        <CardContent className="p-12 space-y-12">
          {submitError && (
            <Alert className="border-red-200 bg-red-50 animate-fade-in mb-8">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800 text-lg">
                {submitError}
              </AlertDescription>
            </Alert>
          )}

          {emailSent && (
            <Alert className="border-green-200 bg-green-50 animate-fade-in mb-8">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800 text-lg">
                ✅ Weather intelligence report sent successfully to {formData.email}! Check your inbox for the detailed analysis.
              </AlertDescription>
            </Alert>
          )}

          {isLoading && processingStep && (
            <Alert className="border-blue-200 bg-blue-50 animate-fade-in mb-8">
              <Sparkles className="h-5 w-5 text-blue-600 animate-spin" />
              <AlertDescription className="text-blue-800 text-lg">
                {processingStep}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6 transform hover:scale-[1.02] transition-transform duration-300">
                <Label htmlFor="fullName" className="text-lg font-semibold text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`h-16 text-lg transition-all duration-200 ${errors.fullName ? 'border-red-500 focus:border-red-500 bg-red-50' : 'focus:border-blue-500 hover:border-blue-300'}`}
                  disabled={isLoading}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600 flex items-center gap-2 animate-fade-in mt-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-6 transform hover:scale-[1.02] transition-transform duration-300">
                <Label htmlFor="email" className="text-lg font-semibold text-gray-700 flex items-center gap-3">
                  <Mail className="w-5 h-5" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className={`h-16 text-lg transition-all duration-200 ${errors.email ? 'border-red-500 focus:border-red-500 bg-red-50' : 'focus:border-blue-500 hover:border-blue-300'}`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-2 animate-fade-in mt-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6 transform hover:scale-[1.02] transition-transform duration-300">
              <Label htmlFor="city" className="text-lg font-semibold text-gray-700 flex items-center gap-3">
                <Database className="w-5 h-5" />
                City *
              </Label>
              <Input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter your city (e.g., London, New York, Tokyo)"
                className={`h-16 text-lg transition-all duration-200 ${errors.city ? 'border-red-500 focus:border-red-500 bg-red-50' : 'focus:border-blue-500 hover:border-blue-300'}`}
                disabled={isLoading}
              />
              {errors.city && (
                <p className="text-sm text-red-600 flex items-center gap-2 animate-fade-in mt-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.city}
                </p>
              )}
            </div>

            <div className="pt-8">
              <Button 
                type="submit" 
                className="w-full h-20 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-700 hover:via-blue-800 hover:to-cyan-700 text-white font-bold text-xl rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center gap-4 disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    <span>Processing Weather Intelligence...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    <span>Generate Weather Intelligence Report</span>
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 animate-fade-in">
            <h4 className="font-semibold text-gray-800 mb-6 text-xl flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-500" />
              What happens next?
            </h4>
            <ul className="text-base text-gray-600 space-y-4">
              <li className="flex items-center gap-4">
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                Real-time weather data fetched from global weather stations
              </li>
              <li className="flex items-center gap-4">
                <span className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></span>
                AI analyzes conditions and provides personalized recommendations
              </li>
              <li className="flex items-center gap-4">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                Comprehensive weather report automatically sent to your email
              </li>
              <li className="flex items-center gap-4">
                <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span>
                Data securely stored for your weather history tracking
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherForm;
