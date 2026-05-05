import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Invite from "../models/inviteModel.js";
import nodemailer from "nodemailer";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password, token: inviteToken } = req.body;
        const profileImagePath = req.file ? req.file.path : null;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let status = "pending";
        let invitedById = null;
        let inviter = null;

        if (inviteToken) {
            const invite = await Invite.findOne({ token: inviteToken });

            if (!invite) {
                return res.status(400).json({ message: "This invitation link is invalid or has expired." });
            }

            if (invite.channel === "email" && invite.email?.toLowerCase() !== email.toLowerCase()) {
                return res.status(400).json({ message: "This invitation is not for this email address." });
            }

            status = "accepted";
            invitedById = invite.invitedBy;
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImage: profileImagePath,
            status,
            invitedBy: invitedById,
        });

        if (user && invitedById) {
            await User.findByIdAndUpdate(invitedById, {
                $addToSet: { invitedUsers: user._id }
            });

            await Invite.deleteOne({ token: inviteToken });
        }

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
            to: user.email,
            subject: "Welcome to Finantic Dashboard 🎉",
            html: `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Finantic Dashboard</title>
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
                                Welcome to Your Finantic
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                                Welcome, ${user.name}!
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #333333;">
                                Thank you for joining Finantic Dashboard. Your account has been successfully created, and you're ready to start managing your finances with our comprehensive suite of tools.
                            </p>
                            
                            <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.6; color: #333333;">
                                Our platform is designed to help you track expenses, manage budgets, and make informed financial decisions with ease.
                            </p>
                            
                            <!-- Info Box -->
                            <div style="margin: 0 0 30px 0; padding: 20px; background-color: #f8f9fa; border-left: 3px solid #2563eb; border-radius: 4px;">
                                <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">
                                    Getting Started
                                </p>
                                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #555555;">
                                    Log in to your dashboard to explore features, set up your financial accounts, and customize your experience. Our intuitive interface makes it easy to get up and running quickly.
                                </p>
                            </div>
                            
                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 0 0 30px 0;">
                                        <a href="https://finance-manage-kappa.vercel.app/login" style="display: inline-block; padding: 14px 40px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; border-radius: 6px; letter-spacing: 0.2px;">
                                            Go to Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Features Section -->
                            <div style="margin: 0 0 25px 0; padding: 20px; background-color: #fafafa; border-radius: 6px;">
                                <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; text-align: center;">
                                    What You Can Do
                                </p>
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                        <td style="padding: 8px 0; font-size: 14px; color: #555555;">
                                            • Track and categorize expenses
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-size: 14px; color: #555555;">
                                            • Share payments with connections
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-size: 14px; color: #555555;">
                                            • View detailed financial insights
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-size: 14px; color: #555555;">
                                            • Manage budgets and goals
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666; text-align: center;">
                                Need help? Our support team is available to assist you at any time.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #fafafa; text-align: center; border-top: 1px solid #e5e5e5; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 8px 0; font-size: 14px; color: #666666;">
                                Best regards,
                            </p>
                            <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 500; color: #1a1a1a;">
                                Finantic Dashboard Team
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #999999;">
                                © 2025 Finantic Dashboard. All rights reserved.
                            </p>
                            <p style="margin: 15px 0 0 0; font-size: 12px; font-weight: 600; color: #666666; text-transform: uppercase;">
                                Powered by Techxudo
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
        });

        const authToken = jwt.sign(
            { _id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            token: authToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                status: user.status
            },
        });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Server error during registration." });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Email or Password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Email or Password" });

        // --- CORRECTED TOKEN CREATION ---
        const token = jwt.sign(
            { _id: user._id, email: user.email }, // Use `_id` to match the middleware
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                status: user.status
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: "Error logging out", error: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.name = req.body.name || user.name;
        if (req.file) {
            user.profileImage = req.file.path;
        }
        const updatedUser = await user.save();
        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                profileImage: updatedUser.profileImage,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUserDashboard = (req, res) => {
    res.json({
        message: "Welcome to Dashboard",
        user: req.user,
    });
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found with this email" });
        }

        // Generate reset token
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const resetTokenExpires = Date.now() + 3600000; // 1 hour

        // Save reset token and expiry in user document
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpires;
        await user.save();

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Send email with reset link
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: user.email,
            subject: "Password Reset Request",
            html: `
            <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Email Preview</title>
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
                                Password Reset Request
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">
                                Hello ${user.name},
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #333333;">
                                We received a request to reset the password for your Finantic Dashboard account.
                            </p>
                            
                            <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.6; color: #333333;">
                                To reset your password, click the button below:
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 0 0 30px 0;">
                                        <a href="${resetLink}" style="display: inline-block; padding: 14px 40px; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; border-radius: 6px; letter-spacing: 0.2px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Security Info Box -->
                            <div style="margin: 0 0 25px 0; padding: 20px; background-color: #fff8e1; border-left: 3px solid #ffa726; border-radius: 4px;">
                                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #555555;">
                                    <strong style="color: #1a1a1a;">Security Notice:</strong><br>
                                    This password reset link will expire in 1 hour for your security. If you did not request this password reset, please ignore this email and your password will remain unchanged.
                                </p>
                            </div>
                            
                            <!-- Alternative Link -->
                            <p style="margin: 0 0 10px 0; font-size: 13px; color: #666666; line-height: 1.6;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0 0 25px 0; font-size: 13px; color: #2563eb; word-break: break-all; line-height: 1.6;">
                                ${resetLink}
                            </p>
                            
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                                If you need additional assistance, please contact our support team.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #fafafa; text-align: center; border-top: 1px solid #e5e5e5; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 8px 0; font-size: 14px; color: #666666;">
                                Best regards,
                            </p>
                            <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: 500; color: #1a1a1a;">
                                Finantic Dashboard Team
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #999999;">
                                © 2025 Finantic Dashboard. All rights reserved.
                            </p>
                            <p style="margin: 15px 0 0 0; font-size: 12px; font-weight: 600; color: #666666; text-transform: uppercase;">
                                Powered by Techxudo
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
        });

        res.status(200).json({
            message: "Password reset link has been sent to your email",
            resetToken
        });
    } catch (error) {
        console.error("Error in forgot password:", error);
        res.status(500).json({ message: "Server error during forgot password process" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user's password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({
            message: "Password has been reset successfully"
        });
    } catch (error) {
        console.error("Error in reset password:", error);
        res.status(500).json({ message: "Server error during password reset" });
    }
};

export const removeConnection = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const userToRemoveId = req.params.userId;

        if (loggedInUserId.equals(userToRemoveId)) {
            return res.status(400).json({ message: "You cannot remove yourself." });
        }

        // --- STEP 1: Dono users ko ek doosre ki 'invitedUsers' list se hatayein ---
        // (Yeh pehle jaisa hi hai)
        await User.findByIdAndUpdate(loggedInUserId, {
            $pull: { invitedUsers: userToRemoveId }
        });

        await User.findByIdAndUpdate(userToRemoveId, {
            $pull: { invitedUsers: loggedInUserId }
        });

        // --- STEP 2: 'invitedBy' field ko handle karein (NAYA LOGIC) ---

        // Check karein ke kya logged-in user, doosre user ka inviter tha
        await User.updateOne(
            { _id: userToRemoveId, invitedBy: loggedInUserId },
            { $set: { invitedBy: null } }
        );

        // Check karein ke kya doosra user, logged-in user ka inviter tha
        await User.updateOne(
            { _id: loggedInUserId, invitedBy: userToRemoveId },
            { $set: { invitedBy: null } }
        );

        res.status(200).json({ message: "Connection successfully removed." });
    } catch (error) {
        console.error("Error removing connection:", error);
        res.status(500).json({ message: "Error occurred while removing connection." });
    }
};
