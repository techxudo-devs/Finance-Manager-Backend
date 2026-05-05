import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    channel: {
        type: String,
        enum: ["email", "whatsapp"],
        default: "email",
        required: true,
    },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, default: Date.now, expires: "7d" },
}, { timestamps: true });

inviteSchema.pre("validate", function (next) {
    if (this.channel === "email" && !this.email) {
        return next(new Error("Email is required for email invitations."));
    }

    if (this.channel === "whatsapp" && !this.phone) {
        return next(new Error("Phone is required for WhatsApp invitations."));
    }

    next();
});

inviteSchema.index({ email: 1 }, { sparse: true }); // Add index for email for faster lookups
inviteSchema.index({ phone: 1 }, { sparse: true }); // Add index for phone for faster lookups
inviteSchema.index({ invitedBy: 1 }); // Add index for invitedBy for faster lookups

export default mongoose.model("Invite", inviteSchema);
