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
      body: JSON.stringify({
        success: price !== null,
        price: price,
        timestamp: new Date().toISOString()
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  } catch (err) {
    context.res = {
      status: 200,
      body: JSON.stringify({ success: false, price: null, error: err.message }),
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    };
  }
};
