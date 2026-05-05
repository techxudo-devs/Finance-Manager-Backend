import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import "./config/cron.js";

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`));
