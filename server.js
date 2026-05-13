const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = 3001;
const RESEND_API_KEY = "re_2eT4buW2_6GaiBxhnL5GmUigTq7ny38At";
const GEMINI_API_KEY = "AIzaSyBZI7O2Vv4y-Nrs-9VTh612J-9f1_kDpnE";

// Hospital Information Context
const HOSPITAL_INFO = {
  name: "SLOT EASY ENT Hospital",
  location: "Hyderabad, Telangana",
  phone: "9876543210",
  email: "support@sloteasy.in",
  timings: "Monday to Saturday, 9:00 AM to 6:00 PM",
  services: {
    "Ear Checkup": "₹500",
    "Nose Allergy Care": "₹600",
    "Throat Consultation": "₹500",
    "Full ENT Assessment": "₹1000",
    "Hearing Test": "₹800"
  },
  cancellationPolicy: "Free cancellation up to 24 hours before appointment"
};

// Middleware
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5500", "http://127.0.0.1:5500", "file://"],
  methods: ["POST", "OPTIONS"],
  credentials: true
}));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "Email server running", timestamp: new Date().toISOString() });
});

// POST /send-email endpoint
app.post("/send-email", async (req, res) => {
  try {
    const booking = req.body;

    // Validate required fields
    if (!booking.email || !booking.full_name) {
      return res.status(400).json({
        ok: false,
        message: "Missing required fields: email, full_name"
      });
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0d9488; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">SLOT EASY</h1>
          <p style="color: #ccfbf1; margin: 5px 0; font-size: 14px;">ENT Hospital Appointment System</p>
        </div>
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #0d9488; margin-top: 0;">✅ Appointment Confirmed!</h2>
          <p style="font-size: 16px; color: #374151;">Dear <strong>${booking.full_name}</strong>,</p>
          <p style="font-size: 14px; color: #4b5563;">Your appointment has been successfully booked with us. Please find the details below:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #0d9488; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px;"><strong style="color: #0d9488;">Hospital:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: right;">SLOT EASY ENT Hospital</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px;"><strong style="color: #0d9488;">Service:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: right;">${booking.service}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px;"><strong style="color: #0d9488;">Date:</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: right;">${new Date(booking.appointment_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-size: 14px;"><strong style="color: #0d9488;">Time:</strong></td>
                <td style="padding: 10px 0; font-size: 14px; text-align: right;">${booking.appointment_time}</td>
              </tr>
            </table>
          </div>

          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; font-size: 13px; color: #92400e;">⚠️ <strong>Cancellation Policy:</strong> You can cancel your appointment for free up to 24 hours before the scheduled time. Late cancellations may incur charges.</p>
          </div>

          <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0; font-size: 14px; color: #065f46;"><strong>📍 Location:</strong> Hyderabad, Telangana</p>
            <p style="margin: 5px 0; font-size: 14px; color: #065f46;"><strong>📞 Support:</strong> 9876543210</p>
            <p style="margin: 5px 0; font-size: 14px; color: #065f46;"><strong>📧 Email:</strong> support@sloteasy.in</p>
          </div>

          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0d9488;">
            <p style="margin: 0; font-size: 13px; color: #0c4a6e;"><strong>💡 Tip:</strong> Please arrive 10 minutes early for your appointment. Bring your ID and any recent medical reports.</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">© 2026 SLOT EASY ENT Hospital. All rights reserved.</p>
            <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    `;

    // Call Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "SLOT EASY <onboarding@resend.dev>",
        to: "shivakomalmalyala06@gmail.com",
        replyTo: booking.email,
        subject: "Your SLOT EASY Appointment is Confirmed! ✅",
        html: emailHtml
      })
    });

    const responseData = await resendResponse.json();

    if (resendResponse.ok) {
      console.log(`✅ Email sent to ${booking.email}`);
      return res.json({
        ok: true,
        message: "Confirmation email sent successfully!",
        data: responseData
      });
    } else {
      console.error("❌ Resend API Error:", responseData);
      return res.status(resendResponse.status).json({
        ok: false,
        message: responseData.message || "Failed to send email",
        error: responseData
      });
    }
  } catch (error) {
    console.error("❌ Server Error:", error.message);
    res.status(500).json({
      ok: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

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

// POST /chat endpoint - Gemini AI Chatbot with Smart Fallback
app.post("/chat", async (req, res) => {
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
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    ok: false,
    message: "Server error",
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 SLOT EASY Server Running!`);
  console.log(`   📧 Email Endpoint: http://localhost:${PORT}/send-email`);
  console.log(`   🤖 Chat Endpoint: http://localhost:${PORT}/chat`);
  console.log(`   ✅ Status: http://localhost:${PORT}/`);
  console.log(`   🔑 CORS enabled for: http://localhost:5500`);
  console.log(`\n⏰ Server started at ${new Date().toLocaleTimeString()}\n`);
});