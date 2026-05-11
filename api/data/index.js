const { getAll, upsert, remove } = require('../db');

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://cacaoorigin.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

const VALID = ['leads', 'suppliers', 'quotes', 'supplierQuotes', 'orders', 'priceHistory'];

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = { status: 200, headers: CORS }; return;
  }

  const collection = req.params.collection;
  if (!VALID.includes(collection)) {
    context.res = { status: 400, headers: CORS, body: { error: 'Invalid collection' } }; return;
  }

  try {
    if (req.method === 'GET') {
      const items = await getAll(collection);
      context.res = { status: 200, headers: CORS, body: { success: true, data: items } };

    } else if (req.method === 'POST' || req.method === 'PUT') {
      const item = req.body;
      if (!item) { context.res = { status: 400, headers: CORS, body: { error: 'No body' } }; return; }
      const saved = await upsert(collection, item);
      context.res = { status: 200, headers: CORS, body: { success: true, data: saved } };

    } else if (req.method === 'DELETE') {
      const id = req.params.id;
      if (!id) { context.res = { status: 400, headers: CORS, body: { error: 'No id' } }; return; }
      await remove(collection, id);
      context.res = { status: 200, headers: CORS, body: { success: true } };

    } else {
      context.res = { status: 405, headers: CORS, body: { error: 'Method not allowed' } };
    }
  } catch (err) {
    context.log('DB error:', err.message);
    context.res = { status: 500, headers: CORS, body: { success: false, error: err.message } };
  }
};
