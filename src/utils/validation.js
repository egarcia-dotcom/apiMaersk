// src/utils/validation.js

export const validateBookingPayload = (payload) => {
  // Campos básicos obligatorios
  if (!payload.uniqueIdentifier) return "Missing uniqueIdentifier";
  if (typeof payload.uniqueIdentifier !== "string" || payload.uniqueIdentifier.length !== 36)
    return "uniqueIdentifier must be a 36-character GUID";

  if (!payload.carrierBookingNumber) return "Missing carrierBookingNumber";
  if (typeof payload.carrierBookingNumber !== "string" || payload.carrierBookingNumber.length > 20)
    return "carrierBookingNumber too long (max 20 chars)";

  if (!payload.transactionType) return "Missing transactionType";
  if (!["01", "02", "03"].includes(payload.transactionType))
    return "Invalid transactionType. Must be '01', '02' or '03'";

  // Fechas
  const dateFields = ["issuedDatetime", "createTimestamp", "updateTimestamp"];
  for (const field of dateFields) {
    if (payload[field] && isNaN(Date.parse(payload[field]))) {
      return `Invalid date format for ${field}`;
    }
  }

  // Parties
  if (!payload.parties || !Array.isArray(payload.parties) || payload.parties.length === 0)
    return "At least one party is required";
  for (const partyObj of payload.parties) {
    if (!partyObj.partyFunction) return "Each party must have a partyFunction";
    if (!partyObj.party || !partyObj.party.partyCode || !partyObj.party.partyName)
      return "Each party must have partyCode and partyName";
  }

  // WorkProcesses
  if (!payload.workProcesses || !Array.isArray(payload.workProcesses))
    return "workProcesses must be an array";
  
  // Transport info
  if (!payload.transportPlan) return "Missing transportPlan";
  if (!payload.transportPlan.transportMode) return "Missing transportMode in transportPlan";

  // Booking cargo
  if (!payload.totalBookedGrossWeight || isNaN(payload.totalBookedGrossWeight))
    return "Missing or invalid totalBookedGrossWeight";
  if (!payload.totalBookedNetWeight || isNaN(payload.totalBookedNetWeight))
    return "Missing or invalid totalBookedNetWeight";
  if (!payload.totalBookedItemQuantity || isNaN(payload.totalBookedItemQuantity))
    return "Missing or invalid totalBookedItemQuantity";

  // Rate
  if (!payload.rate || !payload.rate.totalAmount || !payload.rate.isoCurrencyCode)
    return "Missing rate totalAmount or isoCurrencyCode";

  // Opcionales adicionales: softCodedValues, deadlines, instructions
  // Se pueden agregar validaciones si se requiere que existan

  return null; // Payload válido
};
