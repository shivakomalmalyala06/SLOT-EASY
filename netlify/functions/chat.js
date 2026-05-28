const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const fetch = globalThis.fetch || require("node-fetch");

const jsonHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const chatbotResponses = {
  timings:
    "SLOT EASY ENT Hospital is open Monday to Saturday, 9 AM to 6 PM. We are closed on Sundays. Feel free to book your appointment during these hours!",
  location:
    "We are located in Hyderabad, Telangana. Call us at 9876543210 for exact directions. We are ready to welcome you!",
  services:
    "We offer comprehensive ENT services:\n\n- Ear Checkup - Rs. 500\n- Nose Allergy Care - Rs. 600\n- Throat Consultation - Rs. 500\n- Full ENT Assessment - Rs. 1000\n- Hearing Test - Rs. 800\n\nWould you like to book any of these services?",
  booking:
    "Simply fill the booking form on this page and choose your preferred date and time slot. You will get instant confirmation via email.",
  cancellation:
    "We offer free cancellation up to 24 hours before your appointment. This gives you flexibility in managing your schedule.",
  default:
    "For more information please call us at 9876543210 or fill the booking form to schedule an appointment. We are here to help!",
};

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  };
}

function getResponse(userMessage) {
  const msg = userMessage.toLowerCase().trim();

  if (/\b(timing|timings|hour|hours|when|open|close|operation)\b/.test(msg)) {
    return chatbotResponses.timings;
  }

  if (/\b(location|locations|where|address|located|direction|directions|city|place)\b/.test(msg)) {
    return chatbotResponses.location;
  }

  if (/\b(service|services|offer|offers|provide|provides|treatment|treatments|procedure|procedures|what can you|what do you)\b/.test(msg)) {
    return chatbotResponses.services;
  }

  if (/\b(book|booking|appointment|appointments|schedule|schedules|reserve|reserves|how to book|how do i book)\b/.test(msg)) {
    return chatbotResponses.booking;
  }

  if (/\b(cancel|cancellation|cancellations|refund|refunds|postpone|postpones|reschedule|reschedules|free cancel|free cancellation)\b/.test(msg)) {
    return chatbotResponses.cancellation;
  }

  return null;
}

async function getGeminiResponse(message) {
  if (!GEMINI_API_KEY) return null;

  const systemPrompt = `You are a friendly AI assistant for SLOT EASY ENT Hospital in Hyderabad, Telangana.

HOSPITAL DETAILS:
- Name: SLOT EASY ENT Hospital
- Location: Hyderabad, Telangana
- Phone: 9876543210
- Timings: Monday to Saturday, 9 AM to 6 PM (Closed Sundays)
- Email: support@sloteasy.in

SERVICES & PRICING:
- Ear Checkup: Rs. 500
- Nose Allergy Care: Rs. 600
- Throat Consultation: Rs. 500
- Full ENT Assessment: Rs. 1000
- Hearing Test: Rs. 800

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
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nPatient: ${message}\n\nAssistant:`,
              },
            ],
          },
        ],
      }),
    },
  );

  if (!geminiResponse.ok) return null;

  const responseData = await geminiResponse.json();
  return responseData.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

exports.handler = async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: jsonHeaders,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { ok: false, message: "Method not allowed" });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (error) {
    return jsonResponse(400, { ok: false, message: "Invalid JSON request body" });
  }

  const message = body.message;
  if (!message || typeof message !== "string") {
    return jsonResponse(400, {
      ok: false,
      message: "Missing or invalid 'message' field",
    });
  }

  const patternResponse = getResponse(message);
  if (patternResponse) {
    return jsonResponse(200, {
      ok: true,
      message: patternResponse,
      mode: "pattern",
    });
  }

  try {
    const aiMessage = await getGeminiResponse(message);
    if (aiMessage) {
      return jsonResponse(200, {
        ok: true,
        message: aiMessage,
        mode: "gemini",
      });
    }
  } catch (error) {
    console.warn("Gemini API unavailable, using default response:", error.message);
  }

  return jsonResponse(200, {
    ok: true,
    message: chatbotResponses.default,
    mode: "default",
  });
};
