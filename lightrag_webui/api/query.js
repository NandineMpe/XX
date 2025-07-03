export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { query } = req.body;
    
    // Demo audit responses
    const demoResponses = {
      'revenue recognition': 'Based on audit standards, revenue recognition requires proper documentation of performance obligations, transaction prices, and timing of recognition. Key controls include segregation of duties, approval processes, and regular reconciliations. ISA 315 emphasizes understanding the entity\'s revenue processes and identifying risks of material misstatement.',
      'accounts payable': 'Audit procedures for accounts payable include confirmation of balances, testing of cut-off procedures, review of subsequent payments, and verification of proper authorization and approval processes. ISA 330 requires substantive procedures including analytical procedures and tests of details.',
      'internal controls': 'Internal controls are processes designed to provide reasonable assurance regarding the achievement of objectives in operational effectiveness, reliable financial reporting, and compliance with laws and regulations. ISA 315 requires understanding and evaluating the design and implementation of relevant controls.',
      'materiality': 'Materiality is the magnitude of misstatements that could reasonably influence economic decisions of users. Auditors set materiality levels to plan audit procedures and evaluate findings. ISA 320 provides guidance on applying materiality in planning and performing an audit.',
      'audit risk': 'Audit risk is the risk that auditors express an inappropriate opinion when financial statements are materially misstated. It consists of inherent risk, control risk, and detection risk. ISA 200 requires auditors to reduce audit risk to an acceptably low level.',
      'audit evidence': 'Audit evidence is information used by auditors to arrive at conclusions on which the audit opinion is based. ISA 500 requires that audit evidence be sufficient and appropriate. Evidence can be obtained through inspection, observation, inquiry, confirmation, recalculation, reperformance, and analytical procedures.'
    };

    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const queryLower = query.toLowerCase();
    let response = 'This is a demo response. In a full implementation, this would query the audit knowledge base and return relevant information based on your uploaded audit documents and standards.';

    // Find matching response
    for (const [key, value] of Object.entries(demoResponses)) {
      if (queryLower.includes(key)) {
        response = value;
        break;
      }
    }

    res.status(200).json({ response });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
