import express from 'express';
import dotenv from 'dotenv';
import { checkJwt, handleAuthError } from './middleware/auth.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3007;

// Health endpoint protegido
app.get('/health', checkJwt, (req, res) => {
  res.json({
    status: 'ok',
    message: 'Application is up and running',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

// Middleware para rutas no definidas
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Middleware global de errores
app.use(handleAuthError);

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
