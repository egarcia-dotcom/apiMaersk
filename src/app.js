import express from 'express';
import dotenv from 'dotenv';
import { checkJwt, handleAuthError } from './middleware/auth.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3007;

// Middleware global para capturar errores de auth
app.use(handleAuthError);

// Health endpoint protegido
app.get('/health', checkJwt, (req, res) => {
  res.json({
    status: 'ok',
    message: 'Application is up and running',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

// Endpoint público
app.get('/', (req, res) => {
  res.send('API funcionando');
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
