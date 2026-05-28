const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const SENDER = "SLOT EASY <onboarding@resend.dev>";
const fetch = globalThis.fetch || require("node-fetch");

const jsonHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function buildEmailHtml(booking) {
  const fullName = escapeHtml(booking.full_name);
  const service = escapeHtml(booking.service);
  const appointmentDate = formatDate(booking.appointment_date);
  const appointmentTime = escapeHtml(booking.appointment_time);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #0d9488; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">SLOT EASY</h1>
        <p style="color: #ccfbf1; margin: 5px 0; font-size: 14px;">ENT Hospital Appointment System</p>
      </div>
      <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #0d9488; margin-top: 0;">Appointment Confirmed</h2>
        <p style="font-size: 16px; color: #374151;">Dear <strong>${fullName}</strong>,</p>
        <p style="font-size: 14px; color: #4b5563;">Your appointment has been successfully booked. Please find the details below:</p>

        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #0d9488; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px;"><strong style="color: #0d9488;">Hospital:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: right;">SLOT EASY ENT Hospital</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px;"><strong style="color: #0d9488;">Service:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: right;">${service}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px;"><strong style="color: #0d9488;">Date:</strong></td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: right;">${appointmentDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 14px;"><strong style="color: #0d9488;">Time:</strong></td>
              <td style="padding: 10px 0; font-size: 14px; text-align: right;">${appointmentTime}</td>
            </tr>
          </table>
        </div>

        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; font-size: 13px; color: #92400e;"><strong>Cancellation Policy:</strong> You can cancel your appointment for free up to 24 hours before the scheduled time. Late cancellations may incur charges.</p>
        </div>

        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0; font-size: 14px; color: #065f46;"><strong>Location:</strong> Hyderabad, Telangana</p>
          <p style="margin: 5px 0; font-size: 14px; color: #065f46;"><strong>Support:</strong> 9876543210</p>
          <p style="margin: 5px 0; font-size: 14px; color: #065f46;"><strong>Email:</strong> support@sloteasy.in</p>
        </div>

        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0d9488;">
          <p style="margin: 0; font-size: 13px; color: #0c4a6e;"><strong>Tip:</strong> Please arrive 10 minutes early for your appointment. Bring your ID and any recent medical reports.</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">2026 SLOT EASY ENT Hospital. All rights reserved.</p>
          <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0 0;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </div>
  `;
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

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return jsonResponse(500, {
      ok: false,
      message: "Email service not configured. Please check environment variables.",
    });
  }

  let booking;
  try {
    booking = JSON.parse(event.body || "{}");
  } catch (error) {
    return jsonResponse(400, { ok: false, message: "Invalid JSON request body" });
  }

  if (!booking.email || !booking.full_name) {
    return jsonResponse(400, {
      ok: false,
      message: "Missing required fields: email, full_name",
    });
  }

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: SENDER,
        to: [booking.email],
        reply_to: booking.email,
        subject: "Your SLOT EASY Appointment is Confirmed",
        html: buildEmailHtml(booking),
      }),
    });

    const responseData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API Error:", responseData);
      return jsonResponse(resendResponse.status, {
        ok: false,
        message: responseData.message || "Failed to send email",
        error: responseData,
      });
    }

    console.log(`Email sent to ${booking.email}`);
    return jsonResponse(200, {
      ok: true,
      message: "Confirmation email sent successfully!",
      data: responseData,
    });
  } catch (error) {
    console.error("Server Error:", error.message);
    return jsonResponse(500, {
      ok: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
