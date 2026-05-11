const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://cacaoorigin.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

module.exports = async function (context, req) {
  if (req.method === 'OPTIONS') {
    context.res = { status: 200, headers: CORS }; return;
  }
  try {
    const { to, subject, htmlContent, senderEmail } = req.body;
    const allowed = [process.env.SENDER_EMAIL_1, process.env.SENDER_EMAIL_2];
    if (!allowed.includes(senderEmail)) {
      context.res = { status: 403, headers: CORS, body: { success: false, error: 'Sender not authorized' } };
      return;
    }
    const credential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID, process.env.AZURE_CLIENT_ID, process.env.AZURE_CLIENT_SECRET
    );
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ['https://graph.microsoft.com/.default']
    });
    const client = Client.initWithMiddleware({ authProvider });
    const message = {
      subject,
      body: { contentType: 'HTML', content: htmlContent },
      toRecipients: Array.isArray(to) ? to.map(e => ({ emailAddress: { address: e } })) : [{ emailAddress: { address: to } }],
      from: { emailAddress: { address: senderEmail, name: 'CacaoOrigin' } }
    };
    await client.api(`/users/${senderEmail}/sendMail`).post({ message });
    context.res = { status: 200, headers: CORS, body: { success: true } };
  } catch (err) {
    context.res = { status: 500, headers: CORS, body: { success: false, error: err.message } };
  }
};
