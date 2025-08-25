const fetch = require('node-fetch');

async function testQuoteAPI() {
  try {
    console.log('Testing quote API...');
    
    // Test health check
    const healthResponse = await fetch('http://localhost:3000/api/health');
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test quotes endpoint
    const quotesResponse = await fetch('http://localhost:3000/api/quotes');
    const quotesData = await quotesResponse.json();
    console.log('Quotes data:', quotesData);
    
    // Test if we can create a quote
    const createQuoteResponse = await fetch('http://localhost:3000/api/quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Quote',
        description: 'Test quote description',
        businessId: 'test-business-id',
        status: 'draft',
        items: []
      })
    });
    
    if (createQuoteResponse.ok) {
      const createQuoteData = await createQuoteResponse.json();
      console.log('Created quote:', createQuoteData);
    } else {
      console.log('Failed to create quote:', createQuoteResponse.status, createQuoteResponse.statusText);
    }
    
  } catch (error) {
    console.error('Error testing quote API:', error.message);
  }
}

testQuoteAPI();