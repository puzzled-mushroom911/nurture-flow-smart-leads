import express, { Request, Response, NextFunction, Router } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authHandler from './api/ghl/auth';
import callbackHandler from './api/ghl/callback';
import webhookHandler from './api/webhooks/ghl';
import axios from 'axios';

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

// Test GHL OAuth callback route
router.get('/auth/callback', async (req: Request, res: Response) => {
  try {
    console.log('Received GHL callback:', req.query);
    const { code, state, error, error_description } = req.query;
    
    if (error) {
      console.error('OAuth Error:', error, error_description);
      return res.status(400).send(`
        <h1>Authentication Error</h1>
        <p>Error: ${error}</p>
        <p>Description: ${error_description || 'No description provided'}</p>
      `);
    }
    
    if (!code) {
      return res.status(400).send(`
        <h1>Error: No code provided</h1>
        <p>The authorization server did not return an authorization code.</p>
      `);
    }
    
    // Log environment variables
    console.log('GHL_CLIENT_ID configured:', process.env.GHL_CLIENT_ID ? 'Yes' : 'No');
    console.log('GHL_CLIENT_SECRET configured:', process.env.GHL_CLIENT_SECRET ? 'Yes' : 'No');
    console.log('GHL_REDIRECT_URI:', process.env.GHL_REDIRECT_URI);
    
    // Exchange code for token
    const tokenPayload = {
      client_id: process.env.GHL_CLIENT_ID,
      client_secret: process.env.GHL_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code as string,
      redirect_uri: process.env.GHL_REDIRECT_URI
    };
    
    console.log('Token request payload:', JSON.stringify(tokenPayload, null, 2));
    
    const response = await axios.post('https://services.leadconnectorhq.com/oauth/token', tokenPayload, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Token exchange successful!');
    
    res.redirect('/dashboard?integration=success');
  } catch (error: any) {
    console.error('Token exchange error:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    
    return res.status(500).send(`
      <h1>Authentication Failed</h1>
      <p>Error: ${error.response?.data?.error_description || error.message}</p>
      <pre>${JSON.stringify(error.response?.data || {}, null, 2)}</pre>
    `);
  }
});

// Test route for starting auth flow
router.get('/start-auth', (req: Request, res: Response) => {
  const state = Math.random().toString(36).substring(2, 15);
  const authUrl = `https://marketplace.gohighlevel.com/oauth/chooselocation?client_id=${process.env.GHL_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.GHL_REDIRECT_URI || '')}&scope=contacts.readonly+contacts.write&state=${state}`;
  console.log('Authorization URL:', authUrl);
  res.redirect(authUrl);
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