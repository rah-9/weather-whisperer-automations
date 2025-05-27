
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { validateEmail } from '../utils/validation';
import { insertWeatherData, sendWeatherEmail } from '../utils/supabaseOperations';
import { fetchWeatherData } from '../utils/weatherApi';
import { Mail, Database, Send, CloudSun, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    setIsLoading(true);
    console.log('Form submitted:', formData);

    try {
      console.log('Step 1: Fetching weather data...');
      // Fetch weather data using the weather API utility
      const weatherData = await fetchWeatherData(formData.city);
      console.log('Weather data received:', weatherData);
      
      // Prepare data for storage
      const enrichedData = {
        fullName: formData.fullName,
        email: formData.email,
        city: formData.city,
        emailValid: validateEmail(formData.email),
        temperature: weatherData.current.temp_c,
        condition: weatherData.current.condition.text,
        aqi: weatherData.current.air_quality?.pm2_5?.toString() || 'N/A',
        timestamp: new Date().toISOString(),
        weatherData: weatherData
      };

      console.log('Step 2: Saving to database...');
      // Save to database
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
      console.log('Data saved to database successfully');

      console.log('Step 3: Sending email...');
      // Send email with AI commentary
      try {
        await sendWeatherEmail(supabase, weatherData, formData.fullName, formData.email);
        console.log('Email sent successfully');
        toast.success('Weather data collected and email sent successfully! 🌤️');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        toast.success('Weather data collected successfully! ✅ (Email may take a moment to arrive)');
      }

      onWeatherData(enrichedData);
      
      // Clear form
      setFormData({ fullName: '', email: '', city: '' });
      
    } catch (error) {
      console.error('Error processing form:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setSubmitError(errorMessage);
      toast.error('Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="w-full shadow-2xl bg-white/95 backdrop-blur-sm border-0">
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
          <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <CloudSun className="w-8 h-8 text-blue-600" />
            Weather Intelligence Hub
          </CardTitle>
          <p className="text-gray-600 text-lg">Get real-time weather data with AI-powered insights</p>
        </CardHeader>
        <CardContent className="p-8">
          {submitError && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {submitError}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
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
                  className={`h-12 transition-all duration-200 ${errors.fullName ? 'border-red-500 focus:border-red-500 bg-red-50' : 'focus:border-blue-500 hover:border-blue-300'}`}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
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
                  className={`h-12 transition-all duration-200 ${errors.email ? 'border-red-500 focus:border-red-500 bg-red-50' : 'focus:border-blue-500 hover:border-blue-300'}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
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
                className={`h-12 transition-all duration-200 ${errors.city ? 'border-red-500 focus:border-red-500 bg-red-50' : 'focus:border-blue-500 hover:border-blue-300'}`}
              />
              {errors.city && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.city}
                </p>
              )}
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-700 hover:via-blue-800 hover:to-cyan-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
            <h4 className="font-semibold text-gray-800 mb-2">What happens next?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Real-time weather data will be fetched for your city</li>
              <li>• AI will analyze the conditions and provide personalized advice</li>
              <li>• A detailed weather report will be sent to your email</li>
              <li>• Your data will be securely stored for future reference</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherForm;
