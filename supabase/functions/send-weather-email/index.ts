
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

    // Get AI commentary
    const aiCommentary = await generateAICommentary(weatherData)

    // Prepare email content
    const emailContent = `Hi ${userName},

Thanks for submitting your details.

Here's the current weather for ${weatherData.city}:

- Temperature: ${weatherData.temperature}°C
- Condition: ${weatherData.condition}
- AQI: ${weatherData.aqi}

${aiCommentary}

Stay safe and take care!

Thanks,
Weather Automation System`

    // Send email (using Resend API)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.log('Email would be sent to:', userEmail)
      console.log('Email content:', emailContent)
      return new Response(
        JSON.stringify({ success: true, message: 'Email logged (no API key configured)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Weather System <weather@yourdomain.com>',
        to: [userEmail],
        subject: `Weather Summary for ${weatherData.city}`,
        text: emailContent,
      }),
    })

    if (!emailResponse.ok) {
      throw new Error(`Email API error: ${emailResponse.status}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
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

async function generateAICommentary(weatherData: any): Promise<string> {
  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      return generateBasicCommentary(weatherData)
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful weather assistant. Provide a brief, friendly commentary about the weather conditions and air quality. Keep it under 2 sentences and include practical advice.'
          },
          {
            role: 'user',
            content: `Current weather: Temperature ${weatherData.temperature}°C, Condition: ${weatherData.condition}, AQI: ${weatherData.aqi}. Provide a brief commentary with advice.`
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      return generateBasicCommentary(weatherData)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || generateBasicCommentary(weatherData)

  } catch (error) {
    console.error('AI commentary error:', error)
    return generateBasicCommentary(weatherData)
  }
}

function generateBasicCommentary(weatherData: any): string {
  const aqi = parseFloat(weatherData.aqi)
  const temp = parseFloat(weatherData.temperature)

  if (isNaN(aqi)) {
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
