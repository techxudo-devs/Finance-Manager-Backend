import cron from "node-cron";
import nodemailer from "nodemailer";
import SchedulePayment from "../models/schedulePaymentModel.js";

if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.FROM_EMAIL_ALIAS) { }

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

let isProcessingDueSchedules = false;

cron.schedule("* * * * *", async () => {
    if (isProcessingDueSchedules) {
        return;
    }

    isProcessingDueSchedules = true;
    // console.log(`\n🕒 Cron job running at: ${new Date().toLocaleString()}`);

    const nowUTC = new Date();

    try {
        const payments = await SchedulePayment.find({
            status: "pending",
            scheduledDate: { $lte: nowUTC },
        }).populate([
            { path: 'createdBy', select: 'name email' },
            { path: 'scheduledFor', select: 'name email' }
        ]).lean();

        if (payments.length === 0) {
            return;
        }

        for (let payment of payments) {
            if (!payment.createdBy || !payment.scheduledFor) {
                continue;
            }

            const creator = payment.createdBy;
            const recipient = payment.scheduledFor;
            const formattedScheduledDate = new Date(payment.scheduledDate).toLocaleString();

            const fromAddress = `"${creator.name} (via Finantic)" <${process.env.FROM_EMAIL_ALIAS}>`;

            await transporter.sendMail({
                from: fromAddress,
                to: recipient.email,
                subject: `Scheduled Payment Reminder: ${payment.title}`,
                html: `
                    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scheduled Payment Reminder Email Preview</title>
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
                                Scheduled Payment Reminder
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                                Scheduled Payment Reminder
                            </h2>
                            
                            <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.6; color: #333333;">
                                <strong style="color: #1a1a1a;">${creator.name}</strong> has scheduled a payment reminder for you.
                            </p>
                            
                            <!-- Payment Details Box -->
                            <div style="margin: 0 0 30px 0; padding: 20px; background-color: #f8f9fa; border: 1px solid #e5e5e5; border-radius: 6px;">
                                <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.5px;">
                                    Payment Details
                                </p>
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                        <td style="padding: 8px 0; font-size: 14px; color: #666666; width: 140px;">
                                            <strong>Title:</strong>
                                        </td>
                                        <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a;">
                                            ${payment.title}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-size: 14px; color: #666666;">
                                            <strong>Scheduled For:</strong>
                                        </td>
                                        <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a;">
                                            ${formattedScheduledDate}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-size: 14px; color: #666666;">
                                            <strong>From:</strong>
                                        </td>
                                        <td style="padding: 8px 0; font-size: 14px; color: #1a1a1a;">
                                            ${creator.name}
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <!-- Message Box -->
                            <div style="margin: 0 0 30px 0; padding: 20px; background-color: #f8f9fa; border-left: 3px solid #2563eb; border-radius: 4px;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">
                                    Message from ${creator.name}:
                                </p>
                                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #555555;">
                                    ${payment.message || "Please remember to process the payment by the end of this week."}
                                </p>
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
                                Log in to your dashboard to view complete payment details.
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
                                This is an automated reminder sent on behalf of Michael Chen.
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

            console.log(`   - ✅ Email sent successfully for payment ID: ${payment._id}`);

            await SchedulePayment.updateOne(
                { _id: payment._id },
                { $set: { status: "done" } }
            );
        }
    } catch (err) {
        console.error("   - ❌ CRON JOB ERROR:", err);
    } finally {
        isProcessingDueSchedules = false;
    }
});
