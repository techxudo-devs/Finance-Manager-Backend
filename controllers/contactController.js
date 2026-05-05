import Contact from "../models/contactModel.js";
import nodemailer from "nodemailer";

export const submitContact = async (req, res) => {
    try {
        const { name, email, type, message } = req.body;

        const newContact = await Contact.create({ name, email, type, message });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: email,
            to: process.env.SMTP_USER,
            subject: `New ${type} message from ${name}`,
            html: `
    <div style="
      font-family: Rockwell, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      background-color: #f9f9f9; 
      padding: 20px; 
      border-radius: 8px;
    ">
      <h2 style="color: #6667DD; margin-bottom: 10px;">New ${type} Message</h2>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Type:</strong> ${type}</p>
      <hr style="border:none; border-top:1px solid #ddd; margin:15px 0;" />
      <p style="font-size: 1rem; color: #555;">Message: ${message}</p>
      <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />
      <p style="font-size: 0.85rem; color:#888;">This is an automated email. Please do not reply directly.</p>
      <p style="font-size: 0.85rem; color:#666; font-weight:600; text-transform:uppercase; margin-top:12px;">Powered by Techxudo</p>
    </div>
  `
        });

        res.status(201).json({ message: "Message sent successfully", data: newContact });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
};
