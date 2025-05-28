
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

    console.log(`Processing email request for: ${userEmail}`)
    console.log('Weather data received:', JSON.stringify(weatherData, null, 2))

    // Get AI commentary using Google Gemini
    const aiCommentary = await generateGeminiCommentary(weatherData)

    // Prepare email content following the exact format requested
    const emailContent = `Hi ${userName},

Thanks for submitting your details.

Here's the current weather for ${weatherData.location.name}:

- Temperature: ${weatherData.current.temp_c}°C
- Condition: ${weatherData.current.condition.text}
- AQI: ${weatherData.current.air_quality?.pm2_5 || 'N/A'}

${aiCommentary ? `AI Weather Insight: ${aiCommentary}` : ''}

Stay safe and take care!

Thanks,
Weather Intelligence Hub Team

---
This report was generated automatically based on real-time weather data.
Generated at: ${new Date().toLocaleString()}`

    // Send email using Resend API to the user's email address
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.log(`Email would be sent to: ${userEmail}`)
      console.log('Email content:', emailContent)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Email logged for ${userEmail} (no API key configured)`, 
          content: emailContent 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Sending email via Resend API to: ${userEmail}`)

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Weather Intelligence Hub <onboarding@resend.dev>',
        to: [userEmail], // Send to the user's actual email
        subject: `🌤️ Weather Intelligence Report for ${weatherData.location.name}`,
        text: emailContent,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Email API error:', errorText)
      
      // Log the email content for debugging
      console.log(`Email content that failed to send to ${userEmail}:`, emailContent)
      
      // Return success with fallback message
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Email processing completed for ${userEmail} (check logs for details)`,
          content: emailContent,
          error: errorText 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailResult = await emailResponse.json()
    console.log(`Email sent successfully to ${userEmail}:`, emailResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sent successfully to ${userEmail}`, 
        emailId: emailResult.id 
      }),
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

    const temp = weatherData.current.temp_c
    const condition = weatherData.current.condition.text
    const aqi = weatherData.current.air_quality?.pm2_5 || 'N/A'

    const prompt = `Based on the current weather conditions in ${weatherData.location.name}: 
    - Temperature: ${temp}°C
    - Weather: ${condition}
    - AQI: ${aqi}
    
    Provide a brief, practical weather commentary with outdoor activity recommendations. Focus on health and safety advice. Keep it under 2 sentences and friendly.`

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

  let commentary = ""
  
  if (temp < 10) {
    commentary += "Bundle up with warm clothes! "
  } else if (temp < 20) {
    commentary += "Perfect weather for a light jacket. "
  } else if (temp > 30) {
    commentary += "Stay hydrated and seek shade during peak hours. "
  } else {
    commentary += "Comfortable temperature for outdoor activities. "
  }

  if (condition.includes('rain')) {
    commentary += "Don't forget your umbrella!"
  } else if (condition.includes('sun')) {
    commentary += "Great day to enjoy some sunshine!"
  }

  if (aqi && !isNaN(aqi)) {
    if (aqi > 50) {
      commentary += " Air quality is moderate - limit prolonged outdoor exposure."
    } else {
      commentary += " Excellent air quality for outdoor activities!"
    }
  }

  return commentary
}
