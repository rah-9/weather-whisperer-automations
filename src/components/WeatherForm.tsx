
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

    let commentary = `🌍 Weather Analysis for ${weatherData.location.name}: `;
    
    // Temperature analysis
    if (temp < 10) {
      commentary += "🧥 Cold weather ahead! Wear warm layers and stay cozy indoors. ";
    } else if (temp < 20) {
      commentary += "🍂 Pleasant cool weather! Perfect for outdoor activities with a light jacket. ";
    } else if (temp < 30) {
      commentary += "☀️ Beautiful mild temperature! Great conditions for all outdoor activities. ";
    } else {
      commentary += "🌡️ Hot weather! Stay hydrated and seek shade during peak hours. ";
    }

    // Weather condition analysis
    if (condition.includes('rain')) {
      commentary += "🌧️ Rain expected - carry an umbrella and drive carefully. ";
    } else if (condition.includes('sun') || condition.includes('clear')) {
      commentary += "☀️ Sunny skies! Perfect for outdoor fun, don't forget sunscreen. ";
    } else if (condition.includes('cloud')) {
      commentary += "☁️ Cloudy conditions provide natural shade for comfortable outdoor activities. ";
    }

    // Air quality analysis
    if (aqi && !isNaN(aqi)) {
      if (aqi <= 35) {
        commentary += "💚 Excellent air quality - perfect for all outdoor activities!";
      } else if (aqi <= 55) {
        commentary += "🟡 Moderate air quality - generally fine for outdoor activities.";
      } else {
        commentary += "🟠 Consider limiting prolonged outdoor activities due to air quality.";
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
      updateProcessingStep('Generating AI insights...');
      const aiCommentary = generateAICommentary(weatherData);
      
      // Step 3: Prepare data for storage
      updateProcessingStep('Preparing data...');
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
      updateProcessingStep('Saving to database...');
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

      // Step 5: Send email (fast method)
      updateProcessingStep('Sending email...');
      await sendEmailViaEmailJS({
        userName: formData.fullName,
        userEmail: formData.email,
        city: formData.city,
        temperature: weatherData.current.temp_c,
        condition: weatherData.current.condition.text,
        aqi: weatherData.current.air_quality?.pm2_5?.toString() || 'N/A',
        aiCommentary: aiCommentary
      });

      setEmailSent(true);
      updateProcessingStep('Complete!');
      onWeatherData(enrichedData);
      
      toast.success('🎉 Weather report generated and sent!', {
        description: `Report sent to ${formData.email}`,
        duration: 5000,
      });
      
      // Clear form
      setFormData({ fullName: '', email: '', city: '' });
      
    } catch (error) {
      console.error('❌ Error processing request:', error);
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
    <div className="space-y-8 animate-fade-in">
      <Card className="w-full shadow-xl bg-white/95 backdrop-blur-sm border-0 hover:shadow-2xl transition-all duration-300">
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg p-8">
          <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3 mb-4">
            <CloudSun className="w-8 h-8 text-blue-600" />
            Weather Intelligence Hub
            <Sparkles className="w-6 h-6 text-purple-500" />
          </CardTitle>
          <p className="text-gray-600 text-lg">Get real-time weather data with AI-powered insights</p>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          {submitError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800">
                {submitError}
              </AlertDescription>
            </Alert>
          )}

          {emailSent && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Weather report sent successfully to {formData.email}!
              </AlertDescription>
            </Alert>
          )}

          {isLoading && processingStep && (
            <Alert className="border-blue-200 bg-blue-50">
              <Sparkles className="h-5 w-5 text-blue-600 animate-spin" />
              <AlertDescription className="text-blue-800">
                {processingStep}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-base font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`h-12 text-base ${errors.fullName ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className={`h-12 text-base ${errors.email ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="city" className="text-base font-medium text-gray-700 flex items-center gap-2">
                <Database className="w-4 h-4" />
                City *
              </Label>
              <Input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter your city (e.g., London, New York, Tokyo)"
                className={`h-12 text-base ${errors.city ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              {errors.city && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.city}
                </p>
              )}
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Generate Weather Report</span>
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
            <h4 className="font-semibold text-gray-800 mb-4 text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              What happens next?
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Real-time weather data fetched instantly
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                AI analyzes conditions and provides recommendations
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Email report sent directly to your inbox
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Data securely stored for tracking
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherForm;
