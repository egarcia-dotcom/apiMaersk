// src/routes/ack.js
import express from "express";
import { sendAck } from "../services/ackService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const payload = req.body;

  // Aquí puedes pasar token y consumerKey reales cuando los tengas
  const result = await sendAck({ ...payload });

  res.status(200).json(result);
});

export default router;
