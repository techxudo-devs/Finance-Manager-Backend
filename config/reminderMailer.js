import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendReminderEmail = async ({ subject, email, amount, currency, message }) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: "💳 Payment Reminder",
    html: `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Reminder Email Preview</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px 40px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                            <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.3px;">
                                Finantic Dashboard
                            </h1>
                            <p style="margin: 0; font-size: 14px; color: #666666;">
                                Payment Reminder
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                                Payment Due
                            </h2>
                            
                            <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.6; color: #333333;">
                                This is a friendly reminder that you have a pending payment.
                            </p>
                            
                            <!-- Payment Details Box -->
                            <div style="margin: 0 0 30px 0; padding: 20px; background-color: #f8f9fa; border: 1px solid #e5e5e5; border-radius: 6px;">
                                <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">
                                    Payment Details
                                </p>
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                        <td style="padding: 8px 0; font-size: 14px; color: #666666; width: 100px;">
                                            <strong>Title:</strong>
                                        </td>
                                        <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a;">
                                            ${subject}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-size: 14px; color: #666666;">
                                            <strong>Amount:</strong>
                                        </td>
                                        <td style="padding: 8px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">
                                            ${currency} ${amount}
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Message Box -->
                            <div style="margin: 0 0 30px 0; padding: 16px; background-color: #f8f9fa; border-left: 3px solid #2563eb; border-radius: 4px;">
                                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #555555;">
                                    <strong style="color: #1a1a1a;">Message:</strong><br>
                                    ${message}
                                </p>
                            </div>
                            
                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 0 0 25px 0;">
                                        <a href="https://finance-manage-kappa.vercel.app/login" style="display: inline-block; padding: 14px 40px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; border-radius: 6px; letter-spacing: 0.2px;">
                                            View Payment
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666; text-align: center;">
                                Log in to your dashboard to complete this payment.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #fafafa; text-align: center; border-top: 1px solid #e5e5e5; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 8px 0; font-size: 14px; color: #666666;">
                                Finantic Dashboard Team
                            </p>
                            <p style="margin: 0 0 15px 0; font-size: 12px; color: #999999;">
                                © 2025 Finantic Dashboard. All rights reserved.
                            </p>
                            <p style="margin: 0 0 15px 0; font-size: 12px; font-weight: 600; color: #666666; text-transform: uppercase;">
                                Powered by Techxudo
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #999999;">
                                This is an automated reminder. If you have already completed this payment, please disregard this email.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `,
  };
  return transporter.sendMail(mailOptions);
};

export default sendReminderEmail;
