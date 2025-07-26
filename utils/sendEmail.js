const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // or your provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"BakedForYou" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to", to);
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw new Error("Failed to send email.");
  }
};

const getApprovalEmail = (name) => {
  return {
    subject: "Your Account Has Been Approved!",
    html: `
      <p>Hello ${name},</p>
      <p>Great news! Your account has been reviewed and approved by our admin team.</p>
      <p>You can now log in and start using BakedForYou.</p>
      <p>Welcome aboard 🍰</p>
      <br/>
      <p>BakedForYou Team</p>
      <a href="http://localhost:5173/signin" style="padding: 10px 20px; background: #4f46e5; color: white; border-radius: 5px;">Login Now</a>
    `,
  };
};

module.exports = { sendEmail, getApprovalEmail };

