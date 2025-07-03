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
      statuses: {
        processed: [
          {
            id: 'demo_audit_standard_1',
            content_summary: 'ISA 315 - Understanding the Entity and Its Environment',
            content_length: 15420,
            status: 'processed',
            created_at: '2025-01-07T10:00:00Z',
            updated_at: '2025-01-07T10:05:00Z',
            chunks_count: 12,
            file_path: 'audit_standards/isa_315.pdf'
          },
          {
            id: 'demo_audit_standard_2',
            content_summary: 'ISA 330 - Auditor\'s Responses to Assessed Risks',
            content_length: 18750,
            status: 'processed',
            created_at: '2025-01-07T10:10:00Z',
            updated_at: '2025-01-07T10:15:00Z',
            chunks_count: 15,
            file_path: 'audit_standards/isa_330.pdf'
          },
          {
            id: 'demo_audit_standard_3',
            content_summary: 'ISA 500 - Audit Evidence',
            content_length: 22100,
            status: 'processed',
            created_at: '2025-01-07T10:20:00Z',
            updated_at: '2025-01-07T10:25:00Z',
            chunks_count: 18,
            file_path: 'audit_standards/isa_500.pdf'
          }
        ],
        processing: [],
        pending: [],
        failed: []
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
