import mongoose from "mongoose";

let cachedConnection = global.__mongooseConnection || null;
let cachedPromise = global.__mongooseConnectionPromise || null;

const connectDB = async () => {
    try {
        if (cachedConnection) {
            return cachedConnection;
        }

        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error("MONGO_URI is missing from the backend .env file");
        }

        if (!cachedPromise) {
            cachedPromise = mongoose.connect(mongoUri);
            global.__mongooseConnectionPromise = cachedPromise;
        }

        const conn = await cachedPromise;
        cachedConnection = conn;
        global.__mongooseConnection = conn;

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        cachedPromise = null;
        global.__mongooseConnectionPromise = null;

        if (error.message.includes("querySrv ENOTFOUND")) {
            console.error("MongoDB connection failed: the Atlas hostname in MONGO_URI could not be found.");
            console.error("Update Finance-Manager-Backend/.env with the exact connection string copied from MongoDB Atlas.");
            console.error(`Current host: ${process.env.MONGO_URI?.split("@")[1]?.split("/")[0] || "unknown"}`);
        } else {
            console.error(`MongoDB connection failed: ${error.message}`);
        }

        if (process.env.VERCEL) {
            throw error;
        }

        process.exit(1);
    }
};

export default connectDB;
