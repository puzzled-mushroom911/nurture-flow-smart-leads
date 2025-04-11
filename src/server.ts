import express, { Request, Response, NextFunction, Router } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
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
app.use(express.static(path.join(process.cwd(), 'dist')));

// GHL OAuth routes
router.post('/ghl/auth', (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(authHandler(req, res)).catch(next);
});

router.get('/ghl/callback', (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(callbackHandler(req, res)).catch(next);
});

// GHL Webhook route
router.post('/api/webhooks/ghl', (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(webhookHandler(req, res)).catch(next);
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