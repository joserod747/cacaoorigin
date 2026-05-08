const fetch = require('node-fetch');

module.exports = async function (context, req) {
  const apiKey = process.env.COMMODITY_API_KEY;

  try {
    const response = await fetch(
      'https://api.commoditypriceapi.com/v2/latest?symbols=CC',
      { headers: { 'x-api-key': apiKey } }
    );
    const data = await response.json();
    const price = data?.data?.CC?.price || null;

    context.res = {
      status: 200,
      body: {
        success: price !== null,
        price: price,
        timestamp: new Date().toISOString()
      }
    };
  } catch (err) {
    context.res = {
      status: 200,
      body: {
        success: false,
        price: null,
        error: err.message
      }
    };
  }
};
