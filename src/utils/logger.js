// src/utils/logger.js
import winston from "winston";

export const getLogger = (label) => {
  return winston.createLogger({
    level: "info",
    defaultMeta: { label },
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [new winston.transports.Console()],
  });
};
