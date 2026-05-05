import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
});

const INVITE_BASE_URL = "https://finance-manage-kappa.vercel.app/register";

export const buildInviteLink = (token) => `${INVITE_BASE_URL}?token=${token}`;

export const buildInviteWhatsappMessage = (inviterName, inviteLink) => `Hello,

${inviterName} has invited you to join Finantic Dashboard, a professional platform for managing and collaborating on financial transactions with clarity and control.

To accept this invitation and create your account, open the secure registration link below:
${inviteLink}

This invitation link expires in 7 days.

POWERED BY TECHXUDO`;

export const sendInviteEmail = async (to, inviterName, inviteLink) => { // This function now expects the full URL
  try {
    console.log("📧 Preparing invite for:", to);
    console.log("Full invite URL received by mailer:", inviteLink);

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to,
      subject: "You're invited to Finance Dashboard 🎉",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation to Finantic Dashboard</title>
</head>
<body style="margin: 0; padding: 0; font-family: "Poppins", 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
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
                                Financial Management Platform
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                                You've Been Invited
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #333333;">
                                <strong style="color: #1a1a1a;">${inviterName}</strong> has invited you to join Finantic Dashboard. Our platform provides comprehensive financial management tools and insights to help you track, analyze, and optimize your finances.
                            </p>
                            
                            <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.6; color: #333333;">
                                To accept this invitation and create your account, please click the button below:
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 0 0 30px 0;">
                                        <a href="${inviteLink}" style="display: inline-block; padding: 14px 40px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; border-radius: 6px; letter-spacing: 0.2px;">
                                            Accept Invitation
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Info Box -->
                            <div style="margin: 0 0 25px 0; padding: 16px; background-color: #f8f9fa; border-left: 3px solid #2563eb; border-radius: 4px;">
                                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #555555;">
                                    <strong style="color: #1a1a1a;">Getting Started:</strong><br>
                                    This invitation link will expire in 7 days. Once you create your account, you'll have immediate access to all dashboard features.
                                </p>
                            </div>
                            
                            <!-- Alternative Link -->
                            <p style="margin: 0; font-size: 13px; color: #666666; line-height: 1.6;">
                                If the button above doesn't work, please copy and paste this link into your browser:
                            </p>
                            <p style="margin: 10px 0 0 0; font-size: 13px; color: #2563eb; word-break: break-all; line-height: 1.6;">
                                ${inviteLink}
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
                                If you did not expect this invitation, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`

    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
};

export const sendShareNotificationEmail = async (recipientEmail, sharerName, shareTitle, shareCategory) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: recipientEmail,
      subject: `💰 Payment Shared: You've been added to "${shareTitle}"`,
      html: `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Share Email Preview</title>
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
                                Payment Notification
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                                Payment Shared With You
                            </h2>
                            
                            <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.6; color: #333333;">
                                <strong style="color: #1a1a1a;">${sharerName}</strong> has shared a payment with you on Finantic Dashboard.
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
                                            ${shareTitle}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-size: 14px; color: #666666;">
                                            <strong>Category:</strong>
                                        </td>
                                        <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a;">
                                            ${shareCategory}
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 0 0 25px 0;">
                                        <a href="https://finance-manage-kappa.vercel.app/login" style="display: inline-block; padding: 14px 40px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; border-radius: 6px; letter-spacing: 0.2px;">
                                            View in Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666; text-align: center;">
                                Log in to your dashboard to view complete payment details and manage your shared transactions.
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
                                This is an automated notification. Please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`
    });

    console.log(`Share notification sent to ${recipientEmail}`);
  } catch (error) {
    console.error(`Error sending share notification to ${recipientEmail}: `, error);
  }
};

export const sendConnectionRequestEmail = async (to, requesterName) => {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to,
      subject: `🤝 ${requesterName} wants to connect on Finantic`,
      html: `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connection Request Email Preview</title>
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
                                Connection Request
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                                New Connection Request
                            </h2>
                            
                            <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.6; color: #333333;">
                                <strong style="color: #1a1a1a;">${requesterName}</strong> has sent you a connection request on Finantic.
                            </p>
                            
                            <!-- Info Box -->
                            <div style="margin: 0 0 30px 0; padding: 20px; background-color: #f8f9fa; border-left: 3px solid #2563eb; border-radius: 4px;">
                                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #555555;">
                                    <strong style="color: #1a1a1a;">What's Next?</strong><br>
                                    Log in to your dashboard to review this request. You can accept or decline the connection from your notifications.
                                </p>
                            </div>
                            
                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 0 0 25px 0;">
                                        <a href="https://finance-manage-kappa.vercel.app/login" style="display: inline-block; padding: 14px 40px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; border-radius: 6px; letter-spacing: 0.2px;">
                                            View Request
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666; text-align: center;">
                                Connect with others to share payments and collaborate on financial management.
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
                                This is an automated notification. Please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`
    };
    await transporter.sendMail(mailOptions);
    console.log(`✅ Connection request email sent to: ${to}`);
  } catch (error) {
    console.error("❌ Error sending connection email:", error);
    throw error;
  }
};
