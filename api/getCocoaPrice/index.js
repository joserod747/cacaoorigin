module.exports = async function (context, req) {
  try {
    const apiKey = process.env.COMMODITY_API_KEY;
    const response = await fetch(
      'https://api.commoditypriceapi.com/v2/latest?symbols=CC',
      {
        headers: { 'x-api-key': apiKey }
      }
    );
    const data = await response.json();

    if (data && data.data && data.data.CC) {
      context.res = {
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
    } else {
      context.res = {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, price: null, raw: data })
      };
    }
  } catch (error) {
    context.res = {
      status: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
