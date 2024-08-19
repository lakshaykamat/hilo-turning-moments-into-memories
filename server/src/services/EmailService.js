const nodemailer = require("nodemailer");

class EmailService {
  #transporter; // Private class field

  constructor() {
    this.#transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Private method to generate OTP
  #generateOtp(length = 6) {
    let otp = "";
    const characters = "0123456789";
    for (let i = 0; i < length; i++) {
      otp += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return otp;
  }

  // Private method to generate basic HTML content
  #generateHtmlContent(name, otp) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP Code</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #FAFAFA;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #09090B;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #27272A;
          }
          .header h1 {
            margin: 10px 0 0 0;
            color: #FAFAFA;
            font-size: 28px;
            font-weight: 600;
          }
          .logo {
            width: 100px;
            height: auto;
            margin: 0 auto;
          }
          .content {
            font-size: 16px;
            line-height: 1.8;
            color: #FAFAFA;
            padding-top: 20px;
          }
          .otp {
            font-size: 26px;
            font-weight: 700;
            text-align: center;
            padding: 15px;
            background-color: #27272A;
            border-radius: 8px;
            margin: 20px 0;
            border-style: dashed;
            color: #FAFAFA;
            letter-spacing: 2px;
          }
          .footer {
            text-align: center;
            padding-top: 30px;
            font-size: 14px;
            color: #999;
            border-top: 1px solid #27272A;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <!-- Inline SVG Logo -->
            <div class="logo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#FAFAFA">
                <!-- Replace this SVG with your actual logo -->
                <circle cx="50" cy="50" r="50"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="30" font-family="Arial" fill="#09090B">SM</text>
              </svg>
            </div>
            <h1>Welcome to SyncMedia</h1>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>We are delighted to have you on board. To finalize your registration, please use the following One-Time Password (OTP) to verify your email address:</p>
            <div class="otp">${otp}</div>
            <p>Please note that this OTP is valid for the next 10 minutes. For your security, do not share this code with anyone.</p>
            <p>If you did not request this, please disregard this email.</p>
            <p>Kind regards,<br>SyncMedia Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 SyncMedia. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>`;
  }

  #formatMailOptions(to, subject, html) {
    return {
      from: `Lakshay Kamat <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };
  }
  // Public method
  async sendEmail(to, subject, name) {
    const otp = this.#generateOtp(); // Generate a new OTP
    const htmlContent = this.#generateHtmlContent(name, otp);
    const mailOptions = this.#formatMailOptions(to, subject, htmlContent);

    try {
      const info = await this.#transporter.sendMail(mailOptions);
      console.log("Email sent: " + info.response);
      return { name, email: to, otp };
    } catch (error) {
      console.error("Error sending email: ", error);
    }
  }
}

module.exports = EmailService;
