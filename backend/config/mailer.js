// backend/config/mailer.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, otp) => {
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP:</p>
      <h1>${otp}</h1>
      <p>Valid for 10 minutes.</p>
    `,
  });
};
