// Vercel Serverless Function for Chatbot
// Deployed at: /api/chat

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Specific chatbot responses for each question type
const chatbotResponses = {
  timings: `SLOT EASY ENT Hospital is open Monday to Saturday, 9 AM to 6 PM. We are closed on Sundays. Feel free to book your appointment during these hours!`,
  
  location: `We are located in Hyderabad, Telangana. Call us at 9876543210 for exact directions. We're ready to welcome you! 🏥`,
  
  services: `We offer comprehensive ENT services:\n\n• Ear Checkup - ₹500\n• Nose Allergy Care - ₹600\n• Throat Consultation - ₹500\n• Full ENT Assessment - ₹1000\n• Hearing Test - ₹800\n\nWould you like to book any of these services?`,
  
  booking: `Simply fill the booking form on this page and choose your preferred date and time slot! You'll get instant confirmation via email. It's that easy! 🎯`,
  
  cancellation: `We offer free cancellation up to 24 hours before your appointment. This gives you flexibility in managing your schedule.`,
  
  default: `For more information please call us at 9876543210 or fill the booking form to schedule an appointment. We're here to help! 😊`,
  
  welcome: `Hello! 👋 Welcome to SLOT EASY ENT Hospital. How can I help you today?`
};

// Function to match question variations and return specific response
function getResponse(userMessage) {
  const msg = userMessage.toLowerCase().trim();
  
  // TIMINGS patterns - match "timing", "timings", "hours", "when", "open", "close"
  if (/\b(timing|timings|hour|hours|when|open|close|operation)\b/.test(msg)) {
    return chatbotResponses.timings;
  }
  
  // LOCATION patterns
  if (/\b(location|locations|where|address|located|direction|directions|city|place)\b/.test(msg)) {
    return chatbotResponses.location;
  }
  
  // SERVICES patterns
  if (/\b(service|services|offer|offers|provide|provides|treatment|treatments|procedure|procedures|what can you|what do you)\b/.test(msg)) {
    return chatbotResponses.services;
  }
  
  // BOOKING patterns
  if (/\b(book|booking|appointment|appointments|schedule|schedules|reserve|reserves|how to book|how do i book)\b/.test(msg)) {
    return chatbotResponses.booking;
  }
  
  // CANCELLATION patterns
  if (/\b(cancel|cancellation|cancellations|refund|refunds|postpone|postpones|reschedule|reschedules|free cancel|free cancellation)\b/.test(msg)) {
    return chatbotResponses.cancellation;
  }
  
  // No match found
  return null;
}

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        ok: false,
        message: "Missing or invalid 'message' field"
      });
    }

    // Try pattern matching first for specific responses
    const patternResponse = getResponse(message);
    if (patternResponse) {
      console.log(`✅ Pattern matched response for: "${message.substring(0, 50)}..."`);
      return res.json({
        ok: true,
        message: patternResponse,
        mode: "pattern"
      });
    }

    // Try Gemini API with enhanced system prompt
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
- Full ENT Assessment: ₹1000
- Hearing Test: ₹800

CANCELLATION POLICY:
Free cancellation up to 24 hours before appointment.

TONE: Be friendly, professional, helpful, and encouraging. Keep responses concise and relevant.
Always encourage booking appointments when appropriate.`;

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
          const aiMessage = responseData.candidates?.[0]?.content?.parts?.[0]?.text || 
                           chatbotResponses.default;
          console.log(`✅ Gemini API response for: "${message.substring(0, 50)}..."`);
          return res.json({
            ok: true,
            message: aiMessage,
            mode: "gemini"
          });
        }
      } catch (geminiError) {
        console.log("⚠️ Gemini API unavailable, using default response");
      }
    } else {
      console.warn("⚠️ GEMINI_API_KEY not configured, using pattern matching only");
    }

    // Fallback to default response
    console.log(`✅ Default response for: "${message.substring(0, 50)}..."`);
    return res.json({
      ok: true,
      message: chatbotResponses.default,
      mode: "default"
    });

  } catch (error) {
    console.error("❌ Chat Error:", error.message);
    res.status(500).json({
      ok: false,
      message: "Internal server error",
      error: error.message
    });
  }
}
