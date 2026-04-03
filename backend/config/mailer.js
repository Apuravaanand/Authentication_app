import fetch from "node-fetch";

export const sendOtpEmail = async (toEmail, otp, type = "verify") => {
  const subject = type === "reset" ? "Password Reset OTP" : "Email Verification OTP";
  const html = `<p>Your OTP is: <strong>${otp}</strong></p>`;

  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  if (!apiKey) {
    console.error("BREVO_API_KEY missing");
    return;
  }
  if (!fromEmail) {
    console.error("EMAIL_FROM missing or not verified in Brevo");
    return;
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Auth App", email: fromEmail },
        to: [{ email: toEmail }],
        subject,
        htmlContent: html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Email send failed:", data);
    } else {
      console.log("OTP email sent to", toEmail);
    }
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
};
