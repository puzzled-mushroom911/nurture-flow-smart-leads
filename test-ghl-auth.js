import axios from 'axios';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize dotenv
config();

async function testGHLAuth() {
  console.log('Testing GHL Authentication');
  console.log('--------------------------');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('GHL_CLIENT_ID:', process.env.GHL_CLIENT_ID ? 'Set ✅' : 'Not Set ❌');
  console.log('GHL_CLIENT_SECRET:', process.env.GHL_CLIENT_SECRET ? 'Set ✅' : 'Not Set ❌');
  console.log('GHL_REDIRECT_URI:', process.env.GHL_REDIRECT_URI);
  
  // Generate authorization URL
  const state = Math.random().toString(36).substring(2, 15);
  const authUrl = `https://marketplace.gohighlevel.com/oauth/chooselocation?client_id=${process.env.GHL_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.GHL_REDIRECT_URI)}&scope=contacts.readonly+contacts.write&state=${state}`;
  
  console.log('\nAuthorization URL:');
  console.log(authUrl);
  
  console.log('\nInstructions:');
  console.log('1. Open the URL above in your browser');
  console.log('2. Complete the authorization flow');
  console.log('3. You will be redirected to your callback URL with a code parameter');
  console.log('4. Look for the code in the URL (e.g., code=abc123)');
  console.log('5. Use this code with the exchange-token.js script to get access tokens');
  
  console.log('\nNote: If you see "The token in Authorization header is not valid!" error,');
  console.log('it typically means one of the following:');
  console.log('- Your client ID or client secret is incorrect');
  console.log('- Your redirect URI does not match what\'s configured in GHL');
  console.log('- Your GHL app does not have the right permissions');
}

testGHLAuth(); 