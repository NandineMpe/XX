import { create } from 'zustand';

export type DocumentRequest = {
  id: string;
  auditor: string;
  document: string;
  date: string;
  source: string;
  method: string;
  status: string;
  lastUpdate: string;
  email?: string;
  auditTrail: Array<{ status: string; at: string; email?: string; error?: string }>;
  attachments: Array<{ name: string; url: string }>;
  downloadUrl?: string;
  fileName?: string;
  fileSize?: string;
  error?: string;
  // Additional fields for better n8n integration
  requestId?: string;
  documentType?: string;
  parameters?: any;
  errorMessage?: string;
};

type DocumentRequestStore = {
  requests: DocumentRequest[];
  loading: boolean;
  error: string | null;
  addRequest: (req: DocumentRequest) => void;
  updateRequest: (id: string, update: Partial<DocumentRequest>) => void;
  fetchRequests: () => Promise<void>;
  refreshRequests: () => Promise<void>;
  // New methods for better n8n integration
  sendWebhookRequest: (requestData: any) => Promise<boolean>;
  pollForUpdates: () => void;
  clearError: () => void;
};

// Status mapping for better n8n integration
// const STATUS_MAPPING = {
//   'Requested': 'Requested',
//   'In Progress': 'Auto-Retrieval in Progress',
//   'Waiting for Client Email Approval': 'Waiting for Client Email Approval',
//   'Client Approved via Email': 'Client Approved via Email',
//   'Sent to Auditor': 'Sent to Auditor',
//   'Ready': 'Ready',
//   'Failed': 'Failed / Needs Manual Intervention',
//   'Processing': 'Auto-Retrieval in Progress',
//   'Completed': 'Ready',
//   'Error': 'Failed / Needs Manual Intervention',
// };

export const useDocumentRequestStore = create<DocumentRequestStore>((set, get) => ({
  requests: [],
  loading: false,
  error: null,
  
  addRequest: (req) => set((state) => ({ requests: [req, ...state.requests] })),
  
  updateRequest: (id, update) =>
    set((state) => ({
      requests: state.requests.map((r) => (r.id === id ? { ...r, ...update } : r)),
    })),
  
  clearError: () => set({ error: null }),

  sendWebhookRequest: async (requestData) => {
    try {
      console.log('🚀 Sending document to LightRAG:', requestData);
      console.log('📄 Document details being sent:', {
        documentType: requestData.documentType,
        description: requestData.description,
        parameters: requestData.parameters
      });
      
      // Upload directly to LightRAG documents endpoint
      const formData = new FormData();
      
      // Create a simple text file with the document request details
      const documentContent = `Document Request: ${requestData.documentType}
Description: ${requestData.description}
Auditor: ${requestData.parameters.auditor}
Entity: ${requestData.parameters.entity}
Process: ${requestData.parameters.process}
Step: ${requestData.parameters.step}
Request ID: ${requestData.requestId}
Timestamp: ${requestData.timestamp}`;
      
      const blob = new Blob([documentContent], { type: 'text/plain' });
      const file = new File([blob], `${requestData.documentType.replace(/[^a-zA-Z0-9]/g, '_')}.txt`, { type: 'text/plain' });
      
      formData.append('file', file);
      
      const lightragResponse = await fetch('https://lightrag-production-6328.up.railway.app/documents/upload', {
        method: 'POST',
        headers: {
          'X-API-Key': 'admin123',
        },
        body: formData,
      });

      if (!lightragResponse.ok) {
        const errorText = await lightragResponse.text();
        console.error('❌ LightRAG upload failed:', lightragResponse.status, errorText);
        throw new Error(`LightRAG upload failed: ${lightragResponse.status} - ${errorText}`);
      }

      const result = await lightragResponse.json();
      console.log('✅ Document uploaded to LightRAG successfully:', result);
      console.log('📝 Document will now be processed by LightRAG pipeline');
      
      // Trigger immediate refresh to show the new document
      setTimeout(() => {
        console.log('🔄 Triggering immediate refresh after LightRAG upload...');
        get().fetchRequests();
      }, 2000); // Wait 2 seconds for LightRAG to process the upload
      
      return true;
    } catch (error) {
      console.error('❌ Error in LightRAG upload flow:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to upload document to LightRAG' });
      return false;
    }
  },

  fetchRequests: async () => {
    try {
      console.log('🔄 Fetching documents from LightRAG API...');
      set({ loading: true, error: null });
      
      const url = 'https://lightrag-production-6328.up.railway.app/documents';
      console.log('🌐 Making request to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': 'admin123',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📊 LightRAG API Response data:', data);
      
      if (!data.statuses || typeof data.statuses !== 'object') {
        console.error('❌ Invalid data structure:', data);
        throw new Error('Invalid data structure received from LightRAG API');
      }
      
      // Transform LightRAG documents into document request format
      const transformedRequests: DocumentRequest[] = [];
      
      // Process documents from all statuses
      Object.entries(data.statuses).forEach(([status, documents]) => {
        const docsArray = documents as any[];
        docsArray.forEach((doc) => {
          try {
            console.log('🔍 Processing LightRAG document:', {
              id: doc.id,
              status: status,
              file_path: doc.file_path,
              content_summary: doc.content_summary
            });
            
            // Extract filename from file_path
            const fileName = doc.file_path ? doc.file_path.split('/').pop() || 'Unknown Document' : 'Unknown Document';
            
            // Create audit trail
            const auditTrail = [];
            if (doc.created_at) {
              auditTrail.push({ 
                status: 'Requested', 
                at: new Date(doc.created_at).toISOString() 
              });
            }
            if (doc.updated_at && doc.updated_at !== doc.created_at) {
              auditTrail.push({ 
                status: status === 'processed' ? 'Ready' : status === 'processing' ? 'Auto-Retrieval in Progress' : status,
                at: new Date(doc.updated_at).toISOString() 
              });
            }
            
            // Map LightRAG status to document request status
            let mappedStatus = 'Requested';
            if (status === 'processed') mappedStatus = 'Ready';
            else if (status === 'processing') mappedStatus = 'Auto-Retrieval in Progress';
            else if (status === 'failed') mappedStatus = 'Failed / Needs Manual Intervention';
            
            // Handle attachments for processed documents
            const attachments = [];
            if (status === 'processed' && doc.file_path) {
              attachments.push({
                name: fileName,
                url: `https://lightrag-production-6328.up.railway.app/documents/download/${doc.id}`
              });
            }
            
            transformedRequests.push({
              id: doc.id,
              auditor: 'Sam Salt', // Default since LightRAG doesn't store this
              document: fileName,
              date: doc.created_at ? new Date(doc.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
              source: 'LightRAG Upload',
              method: 'Automatic',
              status: mappedStatus,
              lastUpdate: doc.updated_at ? new Date(doc.updated_at).toLocaleString() : new Date().toLocaleString(),
              auditTrail,
              attachments,
              downloadUrl: status === 'processed' ? `https://lightrag-production-6328.up.railway.app/documents/download/${doc.id}` : undefined,
              fileName: fileName,
              fileSize: doc.content_length ? `${doc.content_length} bytes` : undefined,
              error: doc.error,
              // Store original LightRAG data for debugging
              requestId: doc.id,
              documentType: fileName,
              parameters: { source: 'LightRAG Upload' },
              errorMessage: doc.error,
            });
          } catch (transformError) {
            console.error('❌ Error transforming LightRAG document:', doc, transformError);
          }
        });
      });
      
      console.log('🔄 Transformed LightRAG documents:', transformedRequests);
      
      set({ 
        requests: transformedRequests,
        loading: false,
        error: null 
      });
      
      console.log('✅ Successfully updated store with', transformedRequests.length, 'documents from LightRAG');
      
    } catch (error) {
      console.error('❌ Error fetching documents from LightRAG:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch documents from LightRAG' 
      });
    }
  },
  
  refreshRequests: async () => {
    console.log('🔄 Manual refresh triggered');
    await get().fetchRequests();
  },

  pollForUpdates: () => {
    // Set up polling for real-time updates
    const pollInterval = setInterval(async () => {
      const { requests } = get();
      const hasActiveRequests = requests.some(req => 
        req.status === 'Requested' || 
        req.status === 'Auto-Retrieval in Progress' ||
        req.status === 'Waiting for Client Email Approval'
      );
      
      // Only poll if there are active requests that need updates
      if (hasActiveRequests) {
        console.log('🔄 Polling for updates...');
        await get().fetchRequests();
      }
    }, 15000); // Poll every 15 seconds for more responsive updates
    
    // Return cleanup function
    return () => clearInterval(pollInterval);
  },
})); 