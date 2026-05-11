const { CosmosClient } = require('@azure/cosmos');

const client = new CosmosClient(process.env.COSMOS_CONNECTION);
const DB_NAME = 'cacaoorigin';

const CONTAINERS = ['leads', 'suppliers', 'quotes', 'supplierQuotes', 'orders', 'priceHistory'];

async function getContainer(name) {
  const { database } = await client.databases.createIfNotExists({ id: DB_NAME });
  const { container } = await database.containers.createIfNotExists({
    id: name,
    partitionKey: { paths: ['/id'] }
  });
  return container;
}

async function getAll(containerName) {
  const container = await getContainer(containerName);
  const { resources } = await container.items.readAll().fetchAll();
  return resources.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

async function upsert(containerName, item) {
  const container = await getContainer(containerName);
  item.id = item.id ? String(item.id) : String(Date.now());
  item.createdAt = item.createdAt || Date.now();
  item.updatedAt = Date.now();
  const { resource } = await container.items.upsert(item);
  return resource;
}

async function remove(containerName, id) {
  const container = await getContainer(containerName);
  await container.item(String(id), String(id)).delete();
}

module.exports = { getAll, upsert, remove };
