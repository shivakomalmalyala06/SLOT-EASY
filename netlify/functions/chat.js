const fetch = require('node-fetch');

// Specific chatbot responses for common questions
const chatbotResponses = {
  timings: `🏥 SLOT EASY ENT Hospital is open Monday to Saturday, 9 AM to 6 PM. We are closed on Sundays. Feel free to book your appointment during these hours!`,
  
  location: `📍 We are located in Hyderabad, Telangana. Call us at 9876543210 for exact directions. We're ready to welcome you!`,
  
  services: `🩺 We offer comprehensive ENT services:
  
• 👂 Ear Checkup - ₹500
• 👃 Nose Allergy Care - ₹600
• 🗣️ Throat Consultation - ₹500
• 🩺 Full ENT Assessment - ₹1,000
• 🔊 Hearing Test - ₹800

All services include professional examination and consultation.`,
  
  booking: `📅 Simply fill the booking form on our website and choose your preferred date and time slot! You'll get instant confirmation via email. It's that easy! 🎯`,
  
  cancellation: `❌ We offer free cancellation up to 24 hours before your appointment. This gives you flexibility in managing your schedule. No questions asked!`,
  
  default: `For more information please call us at 9876543210 or fill the booking form to schedule an appointment. We're here to help! 😊`,
};

// Function to match question variations and return specific response
function getPatternResponse(userMessage) {
  const msg = userMessage.toLowerCase().trim();
  
  // TIMINGS patterns
  if (/\b(timing|timings|hour|hours|when|open|close|operation|available)\b/.test(msg)) {
    return chatbotResponses.timings;
  }
  
  // LOCATION patterns
  if (/\b(location|locations|where|address|located|direction|directions|city|place)\b/.test(msg)) {
    return chatbotResponses.location;
  }
  
  // SERVICES patterns
  if (/\b(service|services|offer|offers|provide|provides|treatment|treatments|procedure|procedures|what can you|what do you|cost|price|pricing)\b/.test(msg)) {
    return chatbotResponses.services;
  }
  
  // BOOKING patterns
  if (/\b(book|booking|appointment|appointments|schedule|schedules|reserve|reserves|how to book|how do i book)\b/.test(msg)) {
    return chatbotResponses.booking;
  }
  
  // CANCELLATION patterns
  if (/\b(cancel|cancellation|cancellations|refund|refunds|postpone|postpones|reschedule|reschedules|free cancel)\b/.test(msg)) {
    return chatbotResponses.cancellation;
  }
  
  // No pattern matched
  return null;
}

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, message: 'Method Not Allowed' })
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    if (!message || typeof message !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({
          ok: false,
          message: 'Missing or invalid message field'
        })
      };
    }

    // Try pattern matching first for quick responses
    const patternResponse = getPatternResponse(message);
    if (patternResponse) {
      console.log(`✅ Pattern matched response`);
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          message: patternResponse,
          mode: 'pattern'
        })
      };
    }

    // Try Gemini API for more complex questions
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (GEMINI_API_KEY) {
      try {
        const systemPrompt = `You are a friendly AI assistant for SLOT EASY ENT Hospital in Hyderabad, Telangana.

HOSPITAL DETAILS:
- Name: SLOT EASY ENT Hospital
- Location: Hyderabad, Telangana
- Phone: 9876543210
- Timings: Monday to Saturday, 9 AM to 6 PM (Closed Sundays)
- Email: support@sloteasy.in

SERVICES & PRICING:
- Ear Checkup: ₹500
- Nose Allergy Care: ₹600
- Throat Consultation: ₹500
- Full ENT Assessment: ₹1,000
- Hearing Test: ₹800

CANCELLATION POLICY:
Free cancellation up to 24 hours before appointment.

TONE: Be friendly, professional, helpful, and encouraging. Keep responses concise and relevant.`;

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `${systemPrompt}\n\nPatient: ${message}\n\nAssistant:`
                }]
              }]
            })
          }
        );

        if (geminiResponse.ok) {
          const responseData = await geminiResponse.json();
          const aiMessage = responseData.candidates?.[0]?.content?.parts?.[0]?.text || chatbotResponses.default;
          console.log(`✅ Gemini API response generated`);
          return {
            statusCode: 200,
            body: JSON.stringify({
              ok: true,
              message: aiMessage.trim(),
              mode: 'gemini'
            })
          };
        }
      } catch (geminiError) {
        console.log('⚠️ Gemini API unavailable, using default response');
      }
    }

    // Fallback to default response
    console.log(`✅ Default response used`);
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        message: chatbotResponses.default,
        mode: 'default'
      })
    };

  } catch (error) {
    console.error('❌ Chat Error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        message: 'Internal server error',
        error: error.message
      })
    };
  }
};