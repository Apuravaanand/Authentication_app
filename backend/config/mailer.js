import Brevo from "@getbrevo/brevo";

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

export const sendEmail = async (to, subject, otp) => {
  const email = {
    sender: { email: process.env.EMAIL_FROM, name: "Auth App" },
    to: [{ email: to }],
    subject,
    htmlContent: `
      <h3>Email Verification</h3>
      <p>Your OTP is:</p>
      <h2>${otp}</h2>
      <p>Valid for 5 minutes.</p>
    `,
  };

  return await apiInstance.sendTransacEmail(email);
};
