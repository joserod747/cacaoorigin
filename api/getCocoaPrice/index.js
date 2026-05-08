const fetch = require('node-fetch');

module.exports = async function (context, req) {
  const apiKey = process.env.COMMODITY_API_KEY;

  try {
    const response = await fetch(
      'https://api.commoditypriceapi.com/v2/latest?symbols=CC',
      { headers: { 'x-api-key': apiKey } }
    );
    const data = await response.json();

    context.res = {
      status: 200,
      body: {
        success: data?.data?.CC?.price ? true : false,
        price: data?.data?.CC?.price || null,
        raw: data,
        timestamp: new Date().toISOString()
      }
    };
  } catch (err) {
    context.res = {
      status: 200,
      body: {
        success: false,
        price: null,
        error: err.message,
        stack: err.stack
      }
    };
  }
};
