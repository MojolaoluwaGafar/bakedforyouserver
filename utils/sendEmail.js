require("dotenv").config();
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
  });

  try {
    await transporter.sendMail({
      from: `"BakedForYou" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent to", to);
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw new Error("Failed to send email.");
  }
};

module.exports = sendEmail;
