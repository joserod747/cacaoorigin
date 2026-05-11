const fetch = require('node-fetch');
const { upsert } = require('../db');

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://cacaoorigin.com',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = { status: 200, headers: CORS }; return;
  }

  try {
    const apiKey = process.env.COMMODITY_API_KEY;
    const response = await fetch(
      'https://api.commoditypriceapi.com/v2/rates/latest?symbols=CC',
      { headers: { 'x-api-key': apiKey } }
    );
    const data = await response.json();
    const price = data?.rates?.CC || null;

    if (price) {
      // Auto-save to price history in Cosmos DB
      await upsert('priceHistory', {
        id: String(Date.now()),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        price: price,
        source: 'API',
        timestamp: Date.now()
      });
    }

    context.res = {
      status: 200,
      headers: CORS,
      body: { success: price !== null, price, timestamp: new Date().toISOString() }
    };
  } catch (err) {
    context.res = {
      status: 200,
      headers: CORS,
      body: { success: false, price: null, error: err.message }
    };
  }
};
