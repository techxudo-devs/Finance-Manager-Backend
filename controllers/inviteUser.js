import Invite from "../models/inviteModel.js";
import User from "../models/userModel.js";
import ConnectionRequest from "../models/connectionRequestModel.js";
import jwt from "jsonwebtoken";
import { buildInviteLink, buildInviteWhatsappMessage, sendInviteEmail, sendConnectionRequestEmail } from "../config/mailer.js";

const normalizePhoneNumber = (phone) => {
    if (typeof phone !== "string") {
        return "";
    }

    const trimmedPhone = phone.trim();
    const normalizedPhone = trimmedPhone.startsWith("+")
        ? `+${trimmedPhone.slice(1).replace(/\D/g, "")}`
        : `+${trimmedPhone.replace(/\D/g, "")}`;

    return /^\+\d{8,15}$/.test(normalizedPhone) ? normalizedPhone : "";
};

export const inviteUser = async (req, res) => {
    try {
        const { emails, phoneNumbers, channel = "email" } = req.body;
        const requester = req.user;

        if (channel === "email" && (!emails || !Array.isArray(emails) || emails.length === 0)) {
            return res.status(400).json({ message: "Emails are required" });
        }

        if (channel === "whatsapp" && (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0)) {
            return res.status(400).json({ message: "Phone numbers are required" });
        }

        const results = [];

        if (channel === "email") {
            for (const email of emails) {
                const normalizedEmail = email?.trim().toLowerCase();
                const recipient = await User.findOne({ email: normalizedEmail });

                if (recipient) {
                    if (recipient._id.equals(requester._id)) {
                        results.push({ contact: normalizedEmail, status: "❌ You cannot invite yourself" });
                        continue;
                    }

                    const isAlreadyConnected = requester.invitedUsers.some(userId => userId.equals(recipient._id))
                        || recipient.invitedUsers.some(userId => userId.equals(requester._id));

                    if (isAlreadyConnected) {
                        results.push({ contact: normalizedEmail, status: "🤝 Already connected" });
                        continue;
                    }

                    const existingRequest = await ConnectionRequest.findOne({
                        requester: requester._id,
                        recipient: recipient._id,
                        status: "pending"
                    });

                    if (existingRequest) {
                        results.push({ contact: normalizedEmail, status: "⏳ Request already pending" });
                        continue;
                    }

                    await ConnectionRequest.create({
                        requester: requester._id,
                        recipient: recipient._id,
                    });

                    await sendConnectionRequestEmail(normalizedEmail, requester.name);
                    results.push({ contact: normalizedEmail, status: "✅ Connection request sent successfully" });
                } else {
                    const rawJwtToken = jwt.sign({ email: normalizedEmail, channel }, process.env.JWT_SECRET, { expiresIn: "7d" });

                    await Invite.findOneAndUpdate(
                        { email: normalizedEmail, invitedBy: requester._id, channel: "email" },
                        {
                            channel: "email",
                            email: normalizedEmail,
                            phone: null,
                            token: rawJwtToken,
                            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        },
                        { upsert: true, new: true }
                    );

                    const fullInviteLink = buildInviteLink(rawJwtToken);
                    await sendInviteEmail(normalizedEmail, requester.name, fullInviteLink);
                    results.push({ contact: normalizedEmail, status: "✅ Invitation sent to new user" });
                }
            }
        } else {
            for (const rawPhoneNumber of phoneNumbers) {
                const normalizedPhone = normalizePhoneNumber(rawPhoneNumber);

                if (!normalizedPhone) {
                    results.push({ contact: rawPhoneNumber, status: "❌ Invalid WhatsApp number" });
                    continue;
                }

                const rawJwtToken = jwt.sign({ phone: normalizedPhone, channel }, process.env.JWT_SECRET, { expiresIn: "7d" });

                await Invite.findOneAndUpdate(
                    { phone: normalizedPhone, invitedBy: requester._id, channel: "whatsapp" },
                    {
                        channel: "whatsapp",
                        email: null,
                        phone: normalizedPhone,
                        token: rawJwtToken,
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    },
                    { upsert: true, new: true }
                );

                const fullInviteLink = buildInviteLink(rawJwtToken);
                const whatsappMessage = buildInviteWhatsappMessage(requester.name, fullInviteLink);
                const whatsappUrl = `https://wa.me/${normalizedPhone.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;

                results.push({
                    contact: normalizedPhone,
                    status: "✅ WhatsApp invitation ready",
                    whatsappUrl
                });
            }
        }

        res.json({ message: "Process completed", results });
    } catch (error) {
        console.error("❌ Invite error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const getPendingInvites = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const query = { invitedBy: req.user._id };

        const totalInvites = await Invite.countDocuments(query);
        const invites = await Invite.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const pendingInviteUsers = invites.map(invite => ({
            _id: invite._id,
            name: 'Invited User',
            email: invite.email || invite.phone,
            phone: invite.phone || "",
            channel: invite.channel,
            contact: invite.email || invite.phone,
            profileImage: 'https://images.unsplash.com/photo-1615109398623-88346a601842?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=500',
            connectionStatus: 'Pending (Unregistered)'
        }));

        res.status(200).json({
            invites: pendingInviteUsers,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalInvites / limit),
                totalInvites: totalInvites
            }
        });
    } catch (error) {
        console.error("Error fetching pending invites:", error);
        res.status(500).json({ message: "Failed to fetch pending invites." });
    }
};

export const deletePendingInvite = async (req, res) => {
    try {
        const { inviteId } = req.params;
        const invite = await Invite.findOne({ _id: inviteId, invitedBy: req.user._id });

        if (!invite) {
            return res.status(404).json({ message: "Invite not found or you don't have permission to delete it." });
        }

        await Invite.deleteOne({ _id: inviteId });
        res.status(200).json({ message: "Invitation has been cancelled." });
    } catch (error) {
        res.status(500).json({ message: "Failed to cancel invitation." });
    }
};
