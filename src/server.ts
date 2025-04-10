import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authHandler from './api/ghl/auth';
import callbackHandler from './api/ghl/callback';
import webhookHandler from './api/webhooks/ghl';

// Initialize environment variables
dotenv.config();

// Create Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Setup middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (for the frontend)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../dist')));

// GHL OAuth routes
app.post('/ghl/auth', authHandler);
app.get('/ghl/callback', callbackHandler);

// GHL Webhook route
app.post('/api/webhooks/ghl', webhookHandler);

// Root route for testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nurture Flow Smart Leads API is running' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 