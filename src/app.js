require('dotenv').config();
const express = require('express');
const { auth } = require('express-oauth2-jwt-bearer');

const app = express();
const port = process.env.PORT || 3000;

// Middleware OAuth2 usando Azure AD JWT
const checkJwt = auth({
  audience: process.env.AUDIENCE,
  issuerBaseURL: process.env.ISSUER,
});

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
