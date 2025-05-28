
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
import { Mail, Database, Send, CloudSun, AlertCircle, CheckCircle } from 'lucide-react';
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

    let commentary = `Based on today's weather analysis for ${weatherData.location.name}: `;
    
    // Temperature analysis
    if (temp < 0) {
      commentary += "It's freezing cold! Bundle up with heavy winter clothing, avoid prolonged outdoor exposure, and watch for icy conditions. ";
    } else if (temp < 10) {
      commentary += "It's quite cold today. Wear warm layers, a good jacket, and consider gloves and a hat for comfort. ";
    } else if (temp < 20) {
      commentary += "Pleasant cool weather! A light jacket or sweater would be perfect. Great for outdoor activities with proper attire. ";
    } else if (temp < 30) {
      commentary += "Lovely mild temperature! Perfect weather for outdoor activities, walking, or exercising. ";
    } else if (temp < 35) {
      commentary += "It's quite warm today. Stay hydrated, wear light clothing, and consider indoor activities during peak hours. ";
    } else {
      commentary += "Extremely hot conditions! Stay indoors during peak hours, drink plenty of water, and avoid strenuous outdoor activities. ";
    }

    // Weather condition analysis
    if (condition.includes('rain') || condition.includes('drizzle')) {
      commentary += "Rain is expected, so don't forget your umbrella and waterproof clothing. ";
    } else if (condition.includes('snow')) {
      commentary += "Snow conditions present - drive carefully and wear appropriate footwear. ";
    } else if (condition.includes('sun') || condition.includes('clear')) {
      commentary += "Beautiful sunny weather! Perfect for outdoor activities, but don't forget sunscreen and sunglasses. ";
    } else if (condition.includes('cloud')) {
      commentary += "Cloudy skies provide natural shade - great for outdoor activities without harsh sun. ";
    } else if (condition.includes('fog') || condition.includes('mist')) {
      commentary += "Visibility may be reduced due to fog/mist - drive carefully and allow extra travel time. ";
    }

    // Wind analysis
    if (windSpeed > 30) {
      commentary += "Strong winds expected - secure loose items and be cautious of flying debris. ";
    } else if (windSpeed > 15) {
      commentary += "Moderate winds - great for flying kites but hold onto your hat! ";
    }

    // Humidity analysis
    if (humidity > 80) {
      commentary += "High humidity levels - you might feel warmer than the actual temperature suggests. ";
    } else if (humidity < 30) {
      commentary += "Low humidity - keep hydrated and consider using moisturizer for your skin. ";
    }

    // Air quality analysis
    if (aqi && !isNaN(aqi)) {
      if (aqi <= 12) {
        commentary += "Excellent air quality - perfect conditions for outdoor exercise and activities!";
      } else if (aqi <= 35) {
        commentary += "Good air quality - safe for all outdoor activities including jogging and cycling.";
      } else if (aqi <= 55) {
        commentary += "Moderate air quality - generally acceptable, but sensitive individuals should limit prolonged outdoor exposure.";
      } else if (aqi <= 150) {
        commentary += "Unhealthy air quality for sensitive groups - consider limiting time outdoors and avoiding strenuous activities.";
      } else {
        commentary += "Poor air quality - stay indoors, avoid outdoor exercise, and consider wearing a mask if you must go outside.";
      }
    }

    return commentary;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setEmailSent(false);
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    setIsLoading(true);
    console.log('🚀 Starting weather data processing...');

    try {
      // Step 1: Fetch weather data
      console.log('📡 Fetching weather data for:', formData.city);
      const weatherData = await fetchWeatherData(formData.city);
      console.log('✅ Weather data received:', weatherData);
      
      // Step 2: Generate AI commentary
      console.log('🤖 Generating AI commentary...');
      const aiCommentary = generateAICommentary(weatherData);
      console.log('✅ AI commentary generated');
      
      // Step 3: Prepare data for storage and email
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
      onWeatherData(enrichedData);
      
      toast.success('🎉 Weather data processed and email sent automatically!', {
        description: `Report sent to ${formData.email}`,
        duration: 5000,
      });
      
      // Clear form
      setFormData({ fullName: '', email: '', city: '' });
      
    } catch (error) {
      console.error('❌ Error processing weather request:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setSubmitError(errorMessage);
      toast.error('Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="w-full shadow-2xl bg-white/95 backdrop-blur-sm border-0 hover:shadow-3xl transition-all duration-300 card-hover">
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg p-8">
          <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3 animate-scale-in">
            <CloudSun className="w-8 h-8 text-blue-600" />
            Weather Intelligence Hub
          </CardTitle>
          <p className="text-gray-600 text-lg mt-4">Get real-time weather data with AI-powered insights</p>
        </CardHeader>
        
        <CardContent className="card-content-spaced">
          {submitError && (
            <Alert className="mb-8 border-red-200 bg-red-50 animate-fade-in">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {submitError}
              </AlertDescription>
            </Alert>
          )}

          {emailSent && (
            <Alert className="mb-8 border-green-200 bg-green-50 animate-fade-in">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Email sent successfully to {formData.email}! Check your inbox for the weather report.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3 transform hover:scale-[1.01] transition-transform duration-200">
                <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`h-14 transition-all duration-200 ${errors.fullName ? 'border-red-500 focus:border-red-500 bg-red-50' : 'focus:border-blue-500 hover:border-blue-300'}`}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-3 h-3" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-3 transform hover:scale-[1.01] transition-transform duration-200">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
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
                  className={`h-14 transition-all duration-200 ${errors.email ? 'border-red-500 focus:border-red-500 bg-red-50' : 'focus:border-blue-500 hover:border-blue-300'}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 transform hover:scale-[1.01] transition-transform duration-200">
              <Label htmlFor="city" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
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
                className={`h-14 transition-all duration-200 ${errors.city ? 'border-red-500 focus:border-red-500 bg-red-50' : 'focus:border-blue-500 hover:border-blue-300'}`}
              />
              {errors.city && (
                <p className="text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                  <AlertCircle className="w-3 h-3" />
                  {errors.city}
                </p>
              )}
            </div>

            <div className="pt-6">
              <Button 
                type="submit" 
                className="w-full h-16 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-700 hover:via-blue-800 hover:to-cyan-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    <span>Processing Weather Data...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Get Weather Intelligence & Send Report</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 animate-fade-in">
            <h4 className="font-semibold text-gray-800 mb-4 text-lg">What happens next?</h4>
            <ul className="text-sm text-gray-600 space-y-3">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Real-time weather data will be fetched for your city
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                AI will analyze the conditions and provide personalized advice
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                A detailed weather report will be automatically sent to your email
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Your data will be securely stored for future reference
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherForm;
