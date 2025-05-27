
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
import { Mail, Database, Send } from 'lucide-react';

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

  const user = useUser();
  const supabase = useSupabaseClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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
      // Fetch weather data using the weather API utility
      const weatherData = await fetchWeatherData(formData.city);
      
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

      console.log('Enriched data for storage:', enrichedData);

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

      // Send email with AI commentary
      try {
        await sendWeatherEmail(supabase, weatherData, formData.fullName, formData.email);
        console.log('Email sent successfully');
        toast.success('Weather data collected and email sent successfully!');
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        toast.success('Weather data collected successfully! (Email sending may have failed)');
      }

      onWeatherData(enrichedData);
      
      // Clear form
      setFormData({ fullName: '', email: '', city: '' });
      
    } catch (error) {
      console.error('Error processing form:', error);
      toast.error('Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-xl bg-white/95 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Database className="w-6 h-6 text-blue-600" />
          Weather Data Collection
        </CardTitle>
        <p className="text-gray-600">Enter your details to get personalized weather insights</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
              Full Name *
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className={`transition-all ${errors.fullName ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
            />
            {errors.fullName && (
              <p className="text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
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
              className={`transition-all ${errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium text-gray-700">
              City *
            </Label>
            <Input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Enter your city"
              className={`transition-all ${errors.city ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
            />
            {errors.city && (
              <p className="text-sm text-red-600">{errors.city}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Get Weather Data & Send Email
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WeatherForm;
