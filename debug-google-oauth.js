// Debug script to check Google OAuth setup
const https = require('https');
const querystring = require('querystring');

// Check if environment variables are set
console.log('=== Google OAuth Debug ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Not set');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Not set');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ Not set');

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.log('\n❌ ERROR: Google OAuth credentials not set in .env file');
  console.log('Please update your .env file with actual Google Cloud Console credentials');
  process.exit(1);
}

console.log('\n=== Testing Google OAuth Token Exchange ===');

// Test token exchange with a mock code (this will fail but shows if the setup is correct)
const postData = querystring.stringify({
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  code: 'mock_code_for_testing',
  grant_type: 'authorization_code',
  redirect_uri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`,
});

const options = {
  hostname: 'oauth2.googleapis.com',
  port: 443,
  path: '/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData),
  },
};

const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Status Message:', res.statusMessage);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Response:', response);
      
      if (response.error === 'invalid_grant') {
        console.log('\n✅ GOOD: The error "invalid_grant" is expected with a mock code');
        console.log('This means your Google OAuth setup is correct!');
        console.log('The client ID and secret are valid.');
      } else if (response.error === 'invalid_client') {
        console.log('\n❌ ERROR: Invalid client credentials');
        console.log('Check your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
      } else {
        console.log('\n🤔 Unexpected response:', response);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request failed:', e.message);
});

req.write(postData);
req.end();

console.log('\nSending test request to Google OAuth token endpoint...');