// src/app.js
import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "./.env", override: true });

import bookingRouter from "./routes/booking.js";
import ackRouter from "./routes/ack.js";
import healthRouter from "./routes/health.js";

const app = express();
app.use(express.json());

// Rutas
app.use("/booking", bookingRouter);
app.use("/ack", ackRouter);
app.use("/health", healthRouter); // Health endpoint obligatorio

// Puerto
const PORT = process.env.PORT || 3007;
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Server running on port ${PORT}`));
