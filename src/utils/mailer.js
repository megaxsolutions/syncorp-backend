import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();


const sendEmail = async (email, subject, otp) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"SYNERGIST - " <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="text-align: center; color: #4CAF50;">Your OTP Code</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">
          Your OTP code is <strong style="color: #FF5722; font-size: 20px;">${otp}</strong>. 
          Use this code to complete your password reset process. This code will expire in 11 minutes.
        </p>
        <p style="font-size: 16px; color: #333;">
          If you did not request a password reset, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 14px; color: #777; text-align: center;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
