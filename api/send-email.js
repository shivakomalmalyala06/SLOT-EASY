// Vercel Serverless Function for Email Sending
// Deployed at: /api/send-email

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

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
    const booking = req.body;

    // Validate required fields
    if (!booking.email || !booking.full_name) {
      return res.status(400).json({
        ok: false,
        message: "Missing required fields: email, full_name"
      });
    }

    // Validate API key
    if (!RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY is not configured");
      return res.status(500).json({
        ok: false,
        message: "Email service not configured. Please check environment variables."
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
}
