import express from 'express';
import { config } from 'dotenv';
import axios from 'axios';

// Initialize dotenv
config();

const app = express();
const PORT = 5173;

// Log environment variables for debugging
console.log('Environment Variables:');
console.log('GHL_CLIENT_ID:', process.env.GHL_CLIENT_ID ? '✅ Configured' : '❌ Missing');
console.log('GHL_CLIENT_SECRET:', process.env.GHL_CLIENT_SECRET ? '✅ Configured' : '❌ Missing');
console.log('GHL_REDIRECT_URI:', process.env.GHL_REDIRECT_URI);

// Simple home page
app.get('/', (req, res) => {
  res.send(`
    <h1>GHL Authentication Test</h1>
    <p>Click the button below to start the OAuth flow:</p>
    <a href="/start-auth" style="padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Start OAuth Flow</a>
    <hr>
    <h2>Environment Configuration:</h2>
    <ul>
      <li>Client ID: ${process.env.GHL_CLIENT_ID ? '✅ Configured' : '❌ Missing'}</li>
      <li>Client Secret: ${process.env.GHL_CLIENT_SECRET ? '✅ Configured' : '❌ Missing'}</li>
      <li>Redirect URI: ${process.env.GHL_REDIRECT_URI || 'Not configured'}</li>
    </ul>
    <p><strong>Important:</strong> Make sure the Redirect URI above matches exactly what's configured in your GHL developer portal.</p>
  `);
});

// Start authentication
app.get('/start-auth', (req, res) => {
  const state = Math.random().toString(36).substring(2, 15);
  
  // Store the state in session/cookie if needed for validation
  
  const authUrl = `https://marketplace.gohighlevel.com/oauth/chooselocation?client_id=${process.env.GHL_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.GHL_REDIRECT_URI)}&scope=contacts.readonly+contacts.write&state=${state}`;
  console.log('Authorization URL:', authUrl);
  res.redirect(authUrl);
});

// Handle callback
app.get('/auth/callback', async (req, res) => {
  console.log('Received callback with query params:', req.query);
  const { code, state, error, error_description } = req.query;
  
  if (error) {
    console.error('OAuth Error:', error, error_description);
    return res.status(400).send(`
      <h1>Authentication Error</h1>
      <p>Error: ${error}</p>
      <p>Description: ${error_description || 'No description provided'}</p>
      <a href="/" style="padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Try Again</a>
    `);
  }
  
  if (!code) {
    return res.status(400).send(`
      <h1>Error: No code provided</h1>
      <p>The authorization server did not return an authorization code.</p>
      <a href="/" style="padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Try Again</a>
    `);
  }
  
  try {
    console.log('Exchanging code for token...');
    console.log('Code:', code);
    console.log('Redirect URI:', process.env.GHL_REDIRECT_URI);
    
    // Exchange code for token
    const tokenPayload = {
      client_id: process.env.GHL_CLIENT_ID,
      client_secret: process.env.GHL_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.GHL_REDIRECT_URI
    };
    
    console.log('Token request payload:', JSON.stringify(tokenPayload, null, 2));
    
    const response = await axios.post('https://services.leadconnectorhq.com/oauth/token', tokenPayload, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Token exchange successful!');
    
    res.send(`
      <h1>Authentication Successful! ✅</h1>
      <p>Your GHL integration is working correctly.</p>
      <h2>Token Details:</h2>
      <pre>${JSON.stringify(response.data, null, 2)}</pre>
      <p><strong>Next Steps:</strong> Store these tokens securely and use them for API calls.</p>
      <a href="/" style="padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Start Over</a>
    `);
  } catch (error) {
    console.error('Token exchange error:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    
    res.status(500).send(`
      <h1>Authentication Failed ❌</h1>
      <p>Error: ${error.response?.data?.error_description || error.message}</p>
      <h2>Error Details:</h2>
      <pre>${JSON.stringify(error.response?.data || {}, null, 2)}</pre>
      <h2>Debugging Steps:</h2>
      <ol>
        <li>Check that your Client ID and Client Secret are correct</li>
        <li>Make sure your Redirect URI matches exactly what's in the GHL developer portal: ${process.env.GHL_REDIRECT_URI}</li>
        <li>Ensure your app is published for testing in the GHL marketplace</li>
        <li>Verify that you have the required scopes enabled</li>
      </ol>
      <a href="/" style="padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Try Again</a>
    `);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Test the OAuth flow by visiting: http://localhost:${PORT}`);
  console.log(`Redirect URI configured as: ${process.env.GHL_REDIRECT_URI}`);
}); 