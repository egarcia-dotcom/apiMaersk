// src/routes/booking.js
import express from "express";
import fs from "fs";
import path from "path";
import { getLogger } from "../utils/logger.js";
import { validateBookingPayload } from "../utils/validation.js";
import { processBooking } from "../services/bookingService.js";

const router = express.Router();
const logger = getLogger("booking");

// Almacenamiento local en JSON
const bookingsFile = path.resolve("src/bookings.json");
let receivedBookings = new Map();

// Cargar bookings guardados al iniciar
if (fs.existsSync(bookingsFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(bookingsFile, "utf-8"));
    for (const [key, value] of Object.entries(data)) {
      receivedBookings.set(key, value);
    }
  } catch (err) {
    logger.error("Error loading bookings.json", err);
  }
}

// Función para guardar en JSON local
const saveBookings = () => {
  const obj = Object.fromEntries(receivedBookings);
  fs.writeFileSync(bookingsFile, JSON.stringify(obj, null, 2));
};

// POST /booking - recibir booking y ACK inmediato
router.post("/", (req, res) => {
  const traceparent = req.headers.traceparent || "no-trace";
  const idempotenceKey = req.headers.idempotencekey;

  if (!idempotenceKey) {
    logger.warn("❌ Missing idempotenceKey", { traceparent });
    return res.status(400).json({ error: "Missing idempotenceKey" });
  }

  if (receivedBookings.has(idempotenceKey)) {
    logger.info("⚠️ Duplicate booking received", { traceparent, idempotenceKey });
    return res.status(200).json({ message: "Duplicate booking ignored" });
  }

  const payload = req.body;
  const validationError = validateBookingPayload(payload);
  if (validationError) {
    logger.warn("❌ Invalid payload", { traceparent, payload, error: validationError });
    return res.status(400).json({ error: validationError });
  }

  // Guardar booking en JSON
  receivedBookings.set(idempotenceKey, {
    payload,
    receivedAt: new Date().toISOString(),
    status: "received",
  });
  saveBookings();

  // Procesamiento asincrónico (no afecta la respuesta)
  processBooking(payload, idempotenceKey).catch((err) => {
    logger.error("Error processing booking", { traceparent, idempotenceKey, error: err });
  });

  // Respuesta ACK inmediata
  res.status(202).json({ message: "Booking received" });
});

// GET /booking - listar todos los bookings
router.get("/", (req, res) => {
  const traceparent = req.headers.traceparent || "no-trace";
  try {
    const allBookings = Array.from(receivedBookings.values()).map((b) => ({
      uniqueIdentifier: b.payload.uniqueIdentifier,
      carrierBookingNumber: b.payload.carrierBookingNumber,
      status: b.status,
      receivedAt: b.receivedAt,
      processedAt: b.processedAt || null,
    }));

    res.status(200).json(allBookings);
  } catch (err) {
    logger.error("Error fetching bookings", { traceparent, error: err });
    res.status(500).json({ error: "Error fetching bookings" });
  }
});

// GET /booking/:idempotenceKey - obtener booking por idempotenceKey
router.get("/:idempotenceKey", (req, res) => {
  const traceparent = req.headers.traceparent || "no-trace";
  const key = req.params.idempotenceKey;
  const booking = receivedBookings.get(key);

  if (!booking) {
    logger.warn("Booking not found", { traceparent, idempotenceKey: key });
    return res.status(404).json({ error: "Booking not found" });
  }

  res.status(200).json({
    uniqueIdentifier: booking.payload.uniqueIdentifier,
    carrierBookingNumber: booking.payload.carrierBookingNumber,
    status: booking.status,
    receivedAt: booking.receivedAt,
    processedAt: booking.processedAt || null,
  });
});

// GET /booking/status/:uniqueIdentifier - obtener estado por uniqueIdentifier
router.get("/status/:uniqueIdentifier", (req, res) => {
  const traceparent = req.headers.traceparent || "no-trace";
  const id = req.params.uniqueIdentifier;

  // Buscar en Map
  const booking = Array.from(receivedBookings.values()).find(
    (b) => b.payload.uniqueIdentifier === id
  );

  if (!booking) {
    logger.warn("Booking status not found", { traceparent, uniqueIdentifier: id });
    return res.status(404).json({ error: "Booking not found" });
  }

  res.status(200).json({
    uniqueIdentifier: booking.payload.uniqueIdentifier,
    carrierBookingNumber: booking.payload.carrierBookingNumber,
    status: booking.status,
    receivedAt: booking.receivedAt,
    processedAt: booking.processedAt || null,
  });
});

// DELETE /booking/:idempotenceKey - eliminar booking
router.delete("/:idempotenceKey", (req, res) => {
  const traceparent = req.headers.traceparent || "no-trace";
  const key = req.params.idempotenceKey;

  if (!receivedBookings.has(key)) {
    logger.warn("Booking to delete not found", { traceparent, idempotenceKey: key });
    return res.status(404).json({ error: "Booking not found" });
  }

  receivedBookings.delete(key);
  saveBookings();
  res.status(200).json({ message: "Booking deleted" });
});

export default router;
