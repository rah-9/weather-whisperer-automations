
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

    // Get AI commentary using Google Gemini
    const aiCommentary = await generateGeminiCommentary(weatherData)

    // Prepare email content
    const emailContent = `Hi ${userName},

Thanks for submitting your details.

Here's the current weather for ${weatherData.location.name}:

- Temperature: ${weatherData.current.temp_c}°C
- Condition: ${weatherData.current.condition.text}
- Wind Speed: ${weatherData.current.wind_kph} kph
- Humidity: ${weatherData.current.humidity}%
- AQI: ${weatherData.current.air_quality?.pm2_5 || 'N/A'}

AI Weather Insight:
${aiCommentary}

Stay safe and take care!

Thanks,
Weather Automation System`

    // Send email using Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.log('Email would be sent to:', userEmail)
      console.log('Email content:', emailContent)
      return new Response(
        JSON.stringify({ success: true, message: 'Email logged (no API key configured)' }),
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
        from: 'Weather System <onboarding@resend.dev>',
        to: [userEmail],
        subject: `Weather Summary for ${weatherData.location.name}`,
        text: emailContent,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Email API error:', errorText)
      throw new Error(`Email API error: ${emailResponse.status}`)
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
      return generateBasicCommentary(weatherData)
    }

    const prompt = `Current weather conditions: Temperature ${weatherData.current.temp_c}°C, ${weatherData.current.condition.text}, Wind ${weatherData.current.wind_kph} kph, Humidity ${weatherData.current.humidity}%, AQI ${weatherData.current.air_quality?.pm2_5 || 'N/A'}. Provide a brief, friendly weather commentary with practical advice in 2-3 sentences.`

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
          maxOutputTokens: 150,
          temperature: 0.7,
        }
      }),
    })

    if (!response.ok) {
      console.error('Gemini API error:', response.status)
      return generateBasicCommentary(weatherData)
    }

    const data = await response.json()
    const commentary = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (commentary) {
      console.log('AI commentary generated successfully')
      return commentary.trim()
    } else {
      return generateBasicCommentary(weatherData)
    }

  } catch (error) {
    console.error('AI commentary error:', error)
    return generateBasicCommentary(weatherData)
  }
}

function generateBasicCommentary(weatherData: any): string {
  const aqi = weatherData.current.air_quality?.pm2_5
  const temp = weatherData.current.temp_c

  if (!aqi || isNaN(aqi)) {
    return "Weather data collected successfully. Have a great day!"
  }

  if (aqi <= 12) {
    return "The air quality is excellent today! Perfect conditions for outdoor activities."
  } else if (aqi <= 35) {
    return "The air quality is moderate. Generally safe for outdoor activities."
  } else if (aqi <= 55) {
    return "Air quality is unhealthy for sensitive groups. Consider limiting prolonged outdoor exposure."
  } else {
    return "Air quality is poor today. It's best to stay indoors and avoid strenuous outdoor activities."
  }
}
