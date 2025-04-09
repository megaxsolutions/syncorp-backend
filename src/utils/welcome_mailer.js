import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();


const sendEmail = async (fullname, email, subject, employee_id, password) => {
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="font-size: 24px; color: #333; text-align: center;">Welcome to Syncorp!</h2>
        <p style="font-size: 16px; color: #333;">Dear ${fullname},</p>
        <p style="font-size: 16px; color: #333;">
          We are excited to have you on board and look forward to working with you. Below are your login credentials to access our internal system:
        </p>
        <ul style="font-size: 16px; color: #333; list-style-type: none; padding: 0;">
          <li><strong>Employee ID:</strong> ${employee_id}</li>
          <li><strong>Temporary Password:</strong> ${password}</li>
        </ul>
        <p style="font-size: 16px; color: #333;">
          Please log in at <a href="[System URL]" style="color: #007BFF;">[System URL]</a>.
        </p>
        <p style="font-size: 16px; color: #333;">
          Once again, welcome to the team! We look forward to your contributions and success at Syncorp.
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
