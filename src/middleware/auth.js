// src/middleware/auth.js
import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
dotenv.config();

// Middleware OAuth2 JWT
export const checkJwt = auth({
  audience: process.env.AUDIENCE,
  issuerBaseURL: process.env.ISSUER,
});

// Middleware global para manejar errores de autenticación
export const handleAuthError = (err, req, res, next) => {
  // Si es un error de autenticación de JWT
  if (err && (err.status === 401 || err.name === 'UnauthorizedError')) {
    return res.status(401).json({ error: 'Invalid or missing token' });
  }

  // Para cualquier otro error, pasarlo al siguiente middleware
  next(err);
};
