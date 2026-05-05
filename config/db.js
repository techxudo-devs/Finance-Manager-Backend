import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error("MONGO_URI is missing from the backend .env file");
        }

        const conn = await mongoose.connect(mongoUri);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        if (error.message.includes("querySrv ENOTFOUND")) {
            console.error("MongoDB connection failed: the Atlas hostname in MONGO_URI could not be found.");
            console.error("Update Finance-Manager-Backend/.env with the exact connection string copied from MongoDB Atlas.");
            console.error(`Current host: ${process.env.MONGO_URI?.split("@")[1]?.split("/")[0] || "unknown"}`);
        } else {
            console.error(`MongoDB connection failed: ${error.message}`);
        }
        process.exit(1);
    }
};

export default connectDB;
