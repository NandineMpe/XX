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
      console.log('🚀 Sending document request to n8n webhook:', requestData);
      console.log('📄 Document request details being sent:', {
        documentType: requestData.documentType,
        description: requestData.description,
        parameters: requestData.parameters
      });
      
      // Send request to n8n webhook endpoint
      const webhookResponse = await fetch('https://primary-production-1d298.up.railway.app/webhook/426951f9-1936-44c3-83ae-8f52f0508acf', {
        method: 'POST',
        headers: {
          'X-API-Key': 'admin123',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error('❌ n8n webhook request failed:', webhookResponse.status, errorText);
        throw new Error(`n8n webhook request failed: ${webhookResponse.status} - ${errorText}`);
      }

      const result = await webhookResponse.json();
      console.log('✅ Document request sent to n8n webhook successfully:', result);
      console.log('📝 Document request will now be processed by n8n workflow');
      
      // Trigger immediate refresh to show the new document request
      setTimeout(() => {
        console.log('🔄 Triggering immediate refresh after n8n webhook request...');
        get().fetchRequests();
      }, 2000); // Wait 2 seconds for n8n to process the request
      
      return true;
    } catch (error) {
      console.error('❌ Error in n8n webhook request flow:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to send document request to n8n webhook' });
      return false;
    }
  },

  fetchRequests: async () => {
    try {
      console.log('🔄 Fetching document requests from n8n API...');
      set({ loading: true, error: null });
      
      const url = 'https://primary-production-1d298.up.railway.app/webhook/api/document-requests';
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
      console.log('📊 n8n API Response data:', data);
      
      // Transform n8n document requests into document request format
      const transformedRequests: DocumentRequest[] = [];
      
      if (Array.isArray(data)) {
        data.forEach((request) => {
          try {
            console.log('🔍 Processing n8n document request:', {
              id: request.id,
              documentType: request.documentType,
              status: request.status
            });
            
            transformedRequests.push({
              id: request.id || request.requestId,
              auditor: request.parameters?.auditor || 'Unknown',
              document: request.documentType || 'Unknown Document',
              date: request.timestamp ? new Date(request.timestamp).toLocaleDateString() : new Date().toLocaleDateString(),
              source: request.parameters?.source_trigger || 'Walkthrough',
              method: 'Automatic',
              status: request.status || 'Requested',
              lastUpdate: request.timestamp ? new Date(request.timestamp).toLocaleString() : new Date().toLocaleString(),
              auditTrail: request.auditTrail || [],
              attachments: request.attachments || [],
              downloadUrl: request.downloadUrl,
              fileName: request.documentType,
              fileSize: request.fileSize,
              error: request.error,
              requestId: request.requestId,
              documentType: request.documentType,
              parameters: request.parameters,
              errorMessage: request.error,
            });
          } catch (transformError) {
            console.error('❌ Error transforming n8n document request:', request, transformError);
          }
        });
      }
      
      console.log('🔄 Transformed n8n document requests:', transformedRequests);
      
      set({ 
        requests: transformedRequests,
        loading: false,
        error: null 
      });
      
      console.log('✅ Successfully updated store with', transformedRequests.length, 'document requests from n8n');
      
    } catch (error) {
      console.error('❌ Error fetching document requests from n8n:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch document requests from n8n' 
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