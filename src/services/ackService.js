// src/services/ackService.js
import { getLogger } from "../utils/logger.js";

const logger = getLogger("ackService");

export async function sendAck({
  uniqueIdentifier,
  uniqueIdentifierNonUuid = "",
  carrierBookingNumber,
  createTimestamp = new Date().toISOString(),
  transactionType = "100",
  partyFunction = "07",
  partyCode = "YOUR_SMDSCODE",
  statusCode = "100",
  statusName = "ACK",
  comment = "The order is created successfully",
  token = null,
  consumerKey = null,
}) {
  // Construir payload
  const ackPayload = {
    uniqueIdentifier,
    uniqueIdentifierNonUuid,
    carrierBooking: { carrierBookingNumber },
    createTimestamp,
    transactionType,
    parties: { partyFunction, partyCode },
    transportDocumentStatus: {
      transportDocumentStatusCode: statusCode,
      transportDocumentStatusName: statusName,
      comment,
    },
  };

  // Si no tenemos token/consumerKey, solo logueamos
  if (!token || !consumerKey) {
    logger.info("ACK payload prepared (no token provided)", ackPayload);
    return { status: "prepared", payload: ackPayload };
  }

  // Enviar al endpoint de Maersk
  const url = "https://api-stage.maersk.com/lsc/in/carrier-bookings/acknowledgements";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Consumer-Key": consumerKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ackPayload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Maersk ACK failed: ${response.status} ${text}`);
    }

    logger.info("ACK sent successfully", ackPayload);
    return { status: "sent", payload: ackPayload };
  } catch (err) {
    logger.error("Error sending ACK", { error: err.message, payload: ackPayload });
    return { status: "error", error: err.message, payload: ackPayload };
  }
}
