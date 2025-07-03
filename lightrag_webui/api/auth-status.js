export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      auth_configured: false,
      access_token: 'demo-token-' + Date.now(),
      auth_mode: 'disabled',
      message: 'Demo mode - no authentication required',
      webui_title: 'Augentik Dashboard',
      webui_description: 'Audit Intelligence Platform'
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
