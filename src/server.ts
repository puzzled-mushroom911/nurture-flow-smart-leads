import express, { Request, Response, NextFunction, Router } from 'express';
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
const router = Router();
const PORT = process.env.PORT || 3000;

// Setup middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (for the frontend)
const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(path.join(__dirname, '../dist')));

// GHL OAuth routes
router.post('/ghl/auth', async (req: Request, res: Response) => {
  try {
    await authHandler(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/ghl/callback', async (req: Request, res: Response) => {
  try {
    await callbackHandler(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GHL Webhook route
router.post('/api/webhooks/ghl', async (req: Request, res: Response) => {
  try {
    await webhookHandler(req, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Root route for testing
router.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Nurture Flow Smart Leads API is running' });
});

// Use the router
app.use('/', router);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 