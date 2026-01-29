import fetch from "node-fetch"; // npm install node-fetch

export const sendOtpEmail = async (toEmail, otp, type = "verify") => {
  const subject = type === "reset" ? "Password Reset OTP" : "Email Verification OTP";
  const html = `<p>Your OTP is: <strong>${otp}</strong></p>`;

  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is undefined!");
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev", // use your verified sender
        to: toEmail,
        subject,
        html,
      }),
    });

    const data = await res.json();
    console.log(`✅ OTP sent to ${toEmail}:`, data.id || data);
  } catch (err) {
    console.error("❌ OTP send failed:", err);
  }
};
