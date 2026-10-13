import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587", 10),
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetEmail = async (email: string, resetUrl: string) => {
  const senderEmail = process.env.EMAIL_USER || "no-reply@bora-sync.com";

  try {
    await transporter.sendMail({
      from: `"Bora-Sync" <${senderEmail}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #6b46c1;">You requested a password reset</h2>
          <p>Click the button below to reset your password. This link will expire in 15 minutes:</p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #6b46c1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #718096; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending email via Nodemailer:", error);
    throw new Error("Could not send reset password email.");
  }
};