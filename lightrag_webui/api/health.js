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
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
