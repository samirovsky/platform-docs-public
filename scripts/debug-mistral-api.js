/**
 * Mistral API Debug Script
 * Tests the API key and connection to Mistral API
 */

const axios = require('axios');

async function testMistralAPI() {
  console.log('🔍 Testing Mistral API Connection...');
  console.log('====================================');
  
  // Test 1: Check if API key is set
  console.log('\n1. Checking API key...');
  if (!process.env.MISTRAL_API_KEY) {
    console.log('❌ MISTRAL_API_KEY is not set in environment');
    console.log('Please set it and try again:');
    console.log('export MISTRAL_API_KEY=your_api_key_here');
    return;
  }
  console.log('✅ API key is set');
  
  // Test 2: Try to call Mistral API
  console.log('\n2. Testing Mistral API endpoint...');
  try {
    const response = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.3,
        max_tokens: 10
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        timeout: 10000
      }
    );
    
    console.log('✅ Mistral API connection successful!');
    console.log('Response:', response.data.choices[0].message.content);
    
  } catch (error) {
    console.log('❌ Mistral API connection failed');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('🔑 Authentication failed - Invalid API key');
      } else if (error.response.status === 403) {
        console.log('🚫 Forbidden - API key may be revoked or expired');
      } else if (error.response.status === 404) {
        console.log('🔍 Endpoint not found - URL may be incorrect');
      } else {
        console.log('❓ Unexpected error:', error.response.statusText);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.log('🌐 No response received from Mistral API');
      console.log('This could be a network issue or the API endpoint is down');
    } else {
      // Something happened in setting up the request
      console.log('🚨 Request setup error:', error.message);
    }
  }
  
  console.log('\n📋 Troubleshooting Steps:');
  console.log('1. Verify your API key is correct');
  console.log('2. Check Mistral API status: https://status.mistral.ai');
  console.log('3. Test with a different model if available');
  console.log('4. Check your network connection');
  console.log('5. Verify you have sufficient API credits');
}

// Run the test
testMistralAPI().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});