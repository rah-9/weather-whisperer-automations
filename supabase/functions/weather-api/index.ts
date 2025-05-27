
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const city = url.searchParams.get('city')
    
    if (!city) {
      return new Response(
        JSON.stringify({ error: 'City parameter is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const weatherApiKey = Deno.env.get('WEATHER_API_KEY')
    
    if (!weatherApiKey) {
      throw new Error('Weather API key not configured')
    }

    const weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${encodeURIComponent(city)}&aqi=yes`
    
    console.log(`Fetching weather data for city: ${city}`)
    
    const weatherResponse = await fetch(weatherApiUrl)
    
    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text()
      console.error('Weather API error:', errorText)
      throw new Error(`Weather API error: ${weatherResponse.status} ${weatherResponse.statusText}`)
    }

    const weatherData = await weatherResponse.json()
    console.log('Weather data fetched successfully:', weatherData)

    return new Response(
      JSON.stringify(weatherData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in weather API function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
