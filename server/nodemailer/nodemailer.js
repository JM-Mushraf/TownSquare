import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

export const sendMail = async (ReciverMail) => {
  try {
    const verificationCode = generateVerificationCode();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.TEAM_EMAIL || "devchatapplication@gmail.com",
        pass: process.env.PASSWORD || "lrlp wbvm lhlx rmxc",
      },
    });

    await transporter.sendMail({
      from: '"🏙️ TownSquare Support Team 📬" <devchatapplication@gmail.com>',
      to: ReciverMail,
      subject: "TownSquare - Verify Your Email",
      text: `Welcome to TownSquare! 🚀\n\nYour verification code is: ${verificationCode}\n\nEnter this code to verify your account and start exploring your community.`,
      html: `<p>Welcome to <b>🏙️ TownSquare</b>! 🚀</p>
             <p>Your verification code is: <b>${verificationCode}</b></p>
             <p>Enter this code to verify your account and start connecting with your community.</p>
             <p>Need help? Contact our support team.</p>
             <p><b>TownSquare Team</b></p>`,
    });

    // console.log("Verification code sent successfully:", verificationCode);
    return verificationCode;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email");
  }
};
