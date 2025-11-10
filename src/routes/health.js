// src/routes/health.js
import express from "express";
import { getLogger } from "../utils/logger.js";

const router = express.Router();
const logger = getLogger("health");

router.get("/", (req, res) => {
  const timestamp = new Date().toISOString();
  logger.info("Health check requested", { timestamp, ip: req.ip });
  res.status(200).json({
    status: "ok",
    message: "Application is up and running",
    timestamp,
    version: "1.0.0", // opcional, útil para Maersk
  });
});

export default router;
