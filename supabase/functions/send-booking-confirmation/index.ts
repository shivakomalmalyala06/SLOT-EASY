import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

type BookingPayload = {
  id?: number | string | null;
  full_name?: string;
  email?: string;
  service?: string;
  appointment_date?: string;
  appointment_time?: string;
  status?: string;
};

function buildHtmlEmail(payload: Required<BookingPayload>) {
  return `
    <div style="margin:0; padding:0; background:#f2f8f8; font-family: Arial, Helvetica, sans-serif; color:#1f2a37;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f8f8; padding:20px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px; background:#ffffff; border:1px solid #d7e9e8; border-radius:14px; overflow:hidden;">
              <tr>
                <td style="background:#0f8b8d; padding:20px 18px; text-align:center;">
                  <div style="display:inline-block; background:#ffffff; color:#0f8b8d; border-radius:999px; padding:8px 14px; font-weight:700; font-size:12px; letter-spacing:0.7px;">
                    SLOT EASY
                  </div>
                  <h1 style="margin:12px 0 4px; color:#ffffff; font-size:24px; line-height:1.2;">Appointment Confirmed</h1>
                  <p style="margin:0; color:#dff6f5; font-size:14px;">SLOT EASY ENT Hospital</p>
                </td>
              </tr>
              <tr>
                <td style="padding:22px 18px 16px;">
                  <p style="margin:0 0 14px; font-size:15px; line-height:1.6;">
                    Hi <strong>${payload.full_name}</strong>, your appointment has been successfully booked.
                  </p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7fcfc; border:1px solid #d7eceb; border-radius:12px; padding:12px;">
                    <tr>
                      <td style="padding:8px 0; font-size:14px;"><strong>Patient name:</strong> ${payload.full_name}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0; font-size:14px;"><strong>Service booked:</strong> ${payload.service}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0; font-size:14px;"><strong>Appointment date:</strong> ${payload.appointment_date}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0; font-size:14px;"><strong>Appointment time:</strong> ${payload.appointment_time}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0; font-size:14px;"><strong>Status:</strong> ${payload.status}</td>
                    </tr>
                  </table>
                  <p style="margin:16px 0 0; font-size:13px; line-height:1.6; color:#295455; background:#e9f8f8; border:1px solid #cfeeee; border-radius:10px; padding:10px 12px;">
                    Free cancellation 24 hours before your appointment.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="border-top:1px solid #e2efef; padding:16px 18px; background:#fbfefe;">
                  <p style="margin:0 0 6px; font-size:13px; color:#355556;"><strong>SLOT EASY ENT Hospital</strong></p>
                  <p style="margin:0 0 4px; font-size:13px; color:#4c6667;">Hyderabad, Telangana</p>
                  <p style="margin:0 0 10px; font-size:13px; color:#4c6667;">Support: +91 9876543210</p>
                  <p style="margin:0; font-size:12px; color:#6b8081;">SLOT EASY - Fast, friendly, and trusted appointment booking.</p>
                </td>
              </tr>
            </table>
            <p style="margin:10px 0 0; font-size:11px; color:#6f8485;">This is an automated confirmation email from SLOT EASY.</p>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function buildTextEmail(payload: Required<BookingPayload>) {
  return `
SLOT EASY ENT Hospital - Appointment Confirmed

Patient name: ${payload.full_name}
Service booked: ${payload.service}
Appointment date: ${payload.appointment_date}
Appointment time: ${payload.appointment_time}
Status: ${payload.status}

Hospital: SLOT EASY ENT Hospital
Location: Hyderabad, Telangana
Support phone: 9876543210

Free cancellation 24 hours before your appointment.
  `.trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      status: 405,
      headers: CORS_HEADERS,
    });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ message: "Missing RESEND_API_KEY secret." }), {
        status: 500,
        headers: CORS_HEADERS,
      });
    }

    const body = (await req.json()) as BookingPayload;
    const full_name = String(body.full_name || "").trim();
    const email = String(body.email || "").trim();
    const service = String(body.service || "").trim();
    const appointment_date = String(body.appointment_date || "").trim();
    const appointment_time = String(body.appointment_time || "").trim();
    const status = String(body.status || "pending").trim();

    if (!full_name || !email || !service || !appointment_date || !appointment_time) {
      return new Response(JSON.stringify({ message: "Missing required booking fields." }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    const html = buildHtmlEmail({
      id: body.id || null,
      full_name,
      email,
      service,
      appointment_date,
      appointment_time,
      status,
    });
    const text = buildTextEmail({
      id: body.id || null,
      full_name,
      email,
      service,
      appointment_date,
      appointment_time,
      status,
    });

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SLOT EASY <onboarding@resend.dev>",
        to: [email],
        subject: "Your SLOT EASY appointment is confirmed",
        html,
        text,
      }),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      return new Response(
        JSON.stringify({
          message: resendData?.message || "Failed to send confirmation email.",
          provider_error: resendData,
        }),
        { status: 502, headers: CORS_HEADERS },
      );
    }

    return new Response(
      JSON.stringify({
        message: "Confirmation email sent successfully.",
        resend_id: resendData?.id || null,
      }),
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: error instanceof Error ? error.message : "Unexpected function error.",
      }),
      { status: 500, headers: CORS_HEADERS },
    );
  }
});
