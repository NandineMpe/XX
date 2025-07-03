// Mock API for demo purposes when backend is not available
export const mockApiResponses = {
  health: {
    status: 'healthy',
    working_directory: './rag_storage',
    input_directory: './inputs',
    configuration: {
      llm_binding: 'openai',
      llm_model: 'gpt-4o-mini',
      embedding_binding: 'openai',
      embedding_model: 'text-embedding-3-large',
      max_tokens: 16384,
      kv_storage: 'JsonKVStorage',
      doc_status_storage: 'JsonDocStatusStorage',
      graph_storage: 'NetworkXStorage',
      vector_storage: 'NanoVectorDBStorage'
    },
    pipeline_busy: false,
    webui_title: 'Augentik Dashboard',
    webui_description: 'Audit Intelligence Platform'
  },

  authStatus: {
    auth_configured: false,
    access_token: 'demo-token-' + Date.now(),
    auth_mode: 'disabled',
    message: 'Demo mode - no authentication required',
    webui_title: 'Augentik Dashboard',
    webui_description: 'Audit Intelligence Platform'
  },

  documents: {
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
  },

  graphs: {
    nodes: [
      {
        id: 'audit_risk',
        labels: ['concept'],
        properties: {
          entity_type: 'audit_concept',
          description: 'The risk that auditors express an inappropriate opinion when financial statements are materially misstated'
        }
      },
      {
        id: 'internal_controls',
        labels: ['concept'],
        properties: {
          entity_type: 'audit_concept',
          description: 'Processes designed to provide reasonable assurance regarding achievement of objectives'
        }
      },
      {
        id: 'materiality',
        labels: ['concept'],
        properties: {
          entity_type: 'audit_concept',
          description: 'The magnitude of misstatements that could influence economic decisions'
        }
      }
    ],
    edges: [
      {
        id: 'edge_1',
        source: 'audit_risk',
        target: 'internal_controls',
        type: 'relates_to',
        properties: {
          description: 'Audit risk assessment considers the effectiveness of internal controls'
        }
      },
      {
        id: 'edge_2',
        source: 'materiality',
        target: 'audit_risk',
        type: 'influences',
        properties: {
          description: 'Materiality levels affect audit risk assessment and procedures'
        }
      }
    ]
  },

  graphLabels: ['audit_concept', 'audit_procedure', 'audit_standard', 'control', 'risk']
};

export const mockQueryResponses = {
  'revenue recognition': 'Based on audit standards, revenue recognition requires proper documentation of performance obligations, transaction prices, and timing of recognition. Key controls include segregation of duties, approval processes, and regular reconciliations. ISA 315 emphasizes understanding the entity\'s revenue processes and identifying risks of material misstatement.',
  'accounts payable': 'Audit procedures for accounts payable include confirmation of balances, testing of cut-off procedures, review of subsequent payments, and verification of proper authorization and approval processes. ISA 330 requires substantive procedures including analytical procedures and tests of details.',
  'internal controls': 'Internal controls are processes designed to provide reasonable assurance regarding the achievement of objectives in operational effectiveness, reliable financial reporting, and compliance with laws and regulations. ISA 315 requires understanding and evaluating the design and implementation of relevant controls.',
  'materiality': 'Materiality is the magnitude of misstatements that could reasonably influence economic decisions of users. Auditors set materiality levels to plan audit procedures and evaluate findings. ISA 320 provides guidance on applying materiality in planning and performing an audit.',
  'audit risk': 'Audit risk is the risk that auditors express an inappropriate opinion when financial statements are materially misstated. It consists of inherent risk, control risk, and detection risk. ISA 200 requires auditors to reduce audit risk to an acceptably low level.',
  'audit evidence': 'Audit evidence is information used by auditors to arrive at conclusions on which the audit opinion is based. ISA 500 requires that audit evidence be sufficient and appropriate. Evidence can be obtained through inspection, observation, inquiry, confirmation, recalculation, reperformance, and analytical procedures.'
};

export function getMockQueryResponse(query: string): string {
  const queryLower = query.toLowerCase();
  
  for (const [key, response] of Object.entries(mockQueryResponses)) {
    if (queryLower.includes(key)) {
      return response;
    }
  }
  
  return 'This is a demo response. In a full implementation, this would query the audit knowledge base and return relevant information based on your uploaded audit documents and standards.';
}
