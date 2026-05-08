const { app } = require('@azure/functions');

app.http('getCocoaPrice', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'cocoa-price',
  handler: async (request, context) => {
    try {
      const apiKey = process.env.COMMODITY_API_KEY;
      const response = await fetch(
        'https://api.commoditypriceapi.com/v2/latest?symbols=CC',
        {
          headers: {
            'x-api-key': apiKey
          }
        }
      );
      const data = await response.json();
      context.log('API response:', JSON.stringify(data));

      if (data && data.data && data.data.CC) {
        return {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: true,
            price: data.data.CC.price,
            timestamp: new Date().toISOString()
          })
        };
      }
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, price: null, raw: data })
      };
    } catch (error) {
      return {
        status: 500,
        body: JSON.stringify({ success: false, error: error.message })
      };
    }
  }
});
