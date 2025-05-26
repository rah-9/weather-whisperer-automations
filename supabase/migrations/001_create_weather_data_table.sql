
-- Create weather_data table
CREATE TABLE weather_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  email_valid BOOLEAN NOT NULL,
  temperature DECIMAL NOT NULL,
  condition TEXT NOT NULL,
  aqi TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own weather data" ON weather_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own weather data" ON weather_data
  FOR SELECT USING (auth.uid() = user_id);
