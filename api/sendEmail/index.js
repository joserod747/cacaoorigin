const { app } = require('@azure/functions');
const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');

app.http('sendEmail', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'send-email',
  handler: async (request, context) => {
    if (request.method === 'OPTIONS') {
      return {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      };
    }
    try {
      const body = await request.json();
      const { to, subject, htmlContent, senderEmail } = body;
      const allowedSenders = [
        process.env.SENDER_EMAIL_1,
        process.env.SENDER_EMAIL_2
      ];
      if (!allowedSenders.includes(senderEmail)) {
        return { status: 403, body: JSON.stringify({ success: false, error: 'Sender not authorized' }) };
      }
      const credential = new ClientSecretCredential(
        process.env.AZURE_TENANT_ID,
        process.env.AZURE_CLIENT_ID,
        process.env.AZURE_CLIENT_SECRET
      );
      const authProvider = new TokenCredentialAuthenticationProvider(credential, {
        scopes: ['https://graph.microsoft.com/.default']
      });
      const client = Client.initWithMiddleware({ authProvider });
      const message = {
        subject,
        body: { contentType: 'HTML', content: htmlContent },
        toRecipients: Array.isArray(to)
          ? to.map(email => ({ emailAddress: { address: email } }))
          : [{ emailAddress: { address: to } }],
        from: { emailAddress: { address: senderEmail, name: 'CacaoOrigin' } }
      };
      await client.api(`/users/${senderEmail}/sendMail`).post({ message });
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true, message: 'Email sent successfully' })
      };
    } catch (error) {
      return {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, error: error.message })
      };
    }
  }
});
