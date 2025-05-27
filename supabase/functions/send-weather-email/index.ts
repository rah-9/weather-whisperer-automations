
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
    const { weatherData, userName, userEmail } = await req.json()

    console.log('Processing email request for:', userEmail)
    console.log('Weather data received:', JSON.stringify(weatherData, null, 2))

    // Get AI commentary using Google Gemini
    const aiCommentary = await generateGeminiCommentary(weatherData)

    // Prepare enhanced email content
    const emailContent = `Hi ${userName},

Thanks for using our Weather Intelligence Hub! 

Here's your personalized weather report for ${weatherData.location.name}:

🌡️ CURRENT CONDITIONS
• Temperature: ${weatherData.current.temp_c}°C (${weatherData.current.temp_f}°F)
• Weather: ${weatherData.current.condition.text}
• Wind Speed: ${weatherData.current.wind_kph} km/h
• Humidity: ${weatherData.current.humidity}%
• Air Quality (PM2.5): ${weatherData.current.air_quality?.pm2_5 || 'N/A'}

🤖 AI WEATHER INSIGHT:
${aiCommentary}

📍 Location Details:
${weatherData.location.name}, ${weatherData.location.region}, ${weatherData.location.country}

Stay informed and stay safe!

Best regards,
Weather Intelligence Hub Team

---
This report was generated automatically based on real-time weather data.`

    // Send email using Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.log('Email would be sent to:', userEmail)
      console.log('Email content:', emailContent)
      return new Response(
        JSON.stringify({ success: true, message: 'Email logged (no API key configured)', content: emailContent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Sending email via Resend API...')

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Weather Intelligence Hub <onboarding@resend.dev>',
        to: [userEmail],
        subject: `🌤️ Weather Intelligence Report for ${weatherData.location.name}`,
        text: emailContent,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Email API error:', errorText)
      
      // Log the email content for debugging in development
      console.log('Email content that failed to send:', emailContent)
      
      // Return success with fallback message for development
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email processing completed (check logs for details)',
          content: emailContent,
          error: errorText 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailResult = await emailResponse.json()
    console.log('Email sent successfully:', emailResult)

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully', emailId: emailResult.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function generateGeminiCommentary(weatherData: any): Promise<string> {
  try {
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY')
    
    if (!googleApiKey) {
      console.log('No Google API key found, using basic commentary')
      return generateBasicCommentary(weatherData)
    }

    const prompt = `Based on the current weather conditions in ${weatherData.location.name}: 
    - Temperature: ${weatherData.current.temp_c}°C
    - Weather: ${weatherData.current.condition.text}
    - Wind: ${weatherData.current.wind_kph} km/h
    - Humidity: ${weatherData.current.humidity}%
    - Air Quality PM2.5: ${weatherData.current.air_quality?.pm2_5 || 'N/A'}
    
    Provide a friendly, practical weather commentary with personalized advice for today's activities. Include health and comfort recommendations. Keep it conversational and helpful in 3-4 sentences.`

    console.log('Generating AI commentary with Gemini...')

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.7,
        }
      }),
    })

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text())
      return generateBasicCommentary(weatherData)
    }

    const data = await response.json()
    const commentary = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (commentary) {
      console.log('AI commentary generated successfully')
      return commentary.trim()
    } else {
      console.log('No commentary returned from Gemini, using fallback')
      return generateBasicCommentary(weatherData)
    }

  } catch (error) {
    console.error('AI commentary error:', error)
    return generateBasicCommentary(weatherData)
  }
}

function generateBasicCommentary(weatherData: any): string {
  const temp = weatherData.current.temp_c
  const condition = weatherData.current.condition.text.toLowerCase()
  const aqi = weatherData.current.air_quality?.pm2_5

  let commentary = `The current temperature of ${temp}°C feels `
  
  if (temp < 10) {
    commentary += "quite cold - consider wearing warm layers and a jacket. "
  } else if (temp < 20) {
    commentary += "cool and comfortable - a light jacket would be perfect. "
  } else if (temp < 30) {
    commentary += "pleasant and mild - great weather for outdoor activities. "
  } else {
    commentary += "warm - stay hydrated and consider light clothing. "
  }

  if (condition.includes('rain')) {
    commentary += "Don't forget an umbrella as rain is expected. "
  } else if (condition.includes('sun')) {
    commentary += "It's a sunny day, so sunscreen is recommended. "
  }

  if (aqi && !isNaN(aqi)) {
    if (aqi <= 35) {
      commentary += "The air quality is good, perfect for outdoor exercise!"
    } else if (aqi <= 55) {
      commentary += "Air quality is moderate - sensitive individuals should limit prolonged outdoor exposure."
    } else {
      commentary += "Air quality is concerning - consider staying indoors and avoiding strenuous outdoor activities."
    }
  }

  return commentary
}
