import axios from 'axios';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize dotenv
config();

async function exchangeToken(code) {
  if (!code) {
    console.error('Error: No authorization code provided');
    console.log('Usage: node exchange-token.js CODE');
    return;
  }

  console.log('Exchanging Authorization Code for Tokens');
  console.log('--------------------------------------');
  
  try {
    // Make token exchange request
    const response = await axios.post('https://services.leadconnectorhq.com/oauth/token', {
      client_id: process.env.GHL_CLIENT_ID,
      client_secret: process.env.GHL_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.GHL_REDIRECT_URI
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Log the response
    console.log('\nToken Exchange Successful ✅');
    console.log('\nAccess Token:', response.data.access_token);
    console.log('Refresh Token:', response.data.refresh_token);
    console.log('Expires In:', response.data.expires_in, 'seconds');
    console.log('Location ID:', response.data.location_id);
    
    console.log('\nNext Steps:');
    console.log('1. Store these tokens securely');
    console.log('2. The access token will expire in', response.data.expires_in, 'seconds');
    console.log('3. Use the refresh token to get a new access token when it expires');
    
  } catch (error) {
    console.error('\nToken Exchange Failed ❌');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    
    console.log('\nPossible causes:');
    console.log('- The authorization code has expired (codes are valid for a short time only)');
    console.log('- The client ID or client secret is incorrect');
    console.log('- The redirect URI does not match what was used for authorization');
  }
}

// Get the code from command line arguments
const code = process.argv[2];
exchangeToken(code); 