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
const STATUS_MAPPING = {
  'Requested': 'Requested',
  'In Progress': 'Auto-Retrieval in Progress',
  'Waiting for Client Email Approval': 'Waiting for Client Email Approval',
  'Client Approved via Email': 'Client Approved via Email',
  'Sent to Auditor': 'Sent to Auditor',
  'Ready': 'Ready',
  'Failed': 'Failed / Needs Manual Intervention',
  'Processing': 'Auto-Retrieval in Progress',
  'Completed': 'Ready',
  'Error': 'Failed / Needs Manual Intervention',
};

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
      console.log('🚀 Sending webhook request:', requestData);
      
      const response = await fetch('https://primary-production-1d298.up.railway.app/webhook/426951f9-1936-44c3-83ae-8f52f0508acf', {
        method: 'POST',
        headers: {
          'X-API-Key': 'admin123',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Webhook request failed:', response.status, errorText);
        throw new Error(`Webhook failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Webhook request successful:', result);
      return true;
    } catch (error) {
      console.error('❌ Error sending webhook request:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to send webhook request' });
      return false;
    }
  },

  fetchRequests: async () => {
    try {
      console.log('🔄 Fetching document requests from API...');
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
      console.log('📊 API Response data:', data);
      
      if (!data.requests || !Array.isArray(data.requests)) {
        console.error('❌ Invalid data structure:', data);
        throw new Error('Invalid data structure received from API');
      }
      
      // Enhanced data transformation with better error handling
      const transformedRequests = data.requests.map((request: any) => {
        try {
          // Extract parameters safely
          const parameters = request.parameters || {};
          
          // Generate a descriptive document name
          const documentName = request.documentType || 
                             parameters.documentType || 
                             `Document Request ${request.requestId?.slice(0, 8) || 'Unknown'}`;
          
          // Determine status with fallback
          const backendStatus = request.status || 'Requested';
          const mappedStatus = STATUS_MAPPING[backendStatus as keyof typeof STATUS_MAPPING] || backendStatus;
          
          // Determine if this request has been processed
          const isProcessed = request.downloadUrl || 
                             request.fileName || 
                             mappedStatus === 'Ready' || 
                             mappedStatus === 'Sent to Auditor';
          
          // Create audit trail
          const auditTrail = [];
          if (request.createdAt) {
            auditTrail.push({ 
              status: 'Requested', 
              at: new Date(request.createdAt).toISOString() 
            });
          }
          if (request.updatedAt && request.updatedAt !== request.createdAt) {
            auditTrail.push({ 
              status: mappedStatus, 
              at: new Date(request.updatedAt).toISOString() 
            });
          }
          
          // Handle attachments
          const attachments = [];
          if (request.downloadUrl) {
            attachments.push({
              name: request.fileName || 'Document',
              url: request.downloadUrl
            });
          }
          
          return {
            id: request.requestId || request.id || `req-${Date.now()}`,
            auditor: parameters.auditor || 'Sam Salt',
            document: documentName,
            date: request.createdAt ? new Date(request.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
            source: parameters.source_trigger || parameters.entity || 'Walkthrough',
            method: 'Manual',
            status: isProcessed ? 'Ready' : mappedStatus,
            lastUpdate: request.updatedAt ? new Date(request.updatedAt).toLocaleString() : new Date().toLocaleString(),
            auditTrail,
            attachments,
            downloadUrl: request.downloadUrl,
            fileName: request.fileName,
            fileSize: request.fileSize,
            error: request.errorMessage,
            // Store original data for debugging
            requestId: request.requestId,
            documentType: request.documentType,
            parameters: request.parameters,
            errorMessage: request.errorMessage,
          };
        } catch (transformError) {
          console.error('❌ Error transforming request:', request, transformError);
          // Return a fallback request object
          return {
            id: request.requestId || `req-${Date.now()}`,
            auditor: 'Unknown',
            document: 'Document Request',
            date: new Date().toLocaleDateString(),
            source: 'Walkthrough',
            method: 'Manual',
            status: 'Failed / Needs Manual Intervention',
            lastUpdate: new Date().toLocaleString(),
            auditTrail: [{ status: 'Error', at: new Date().toISOString() }],
            attachments: [],
            error: 'Failed to process request data',
            requestId: request.requestId,
          };
        }
      });
      
      console.log('🔄 Transformed requests:', transformedRequests);
      
      set({ 
        requests: transformedRequests,
        loading: false,
        error: null 
      });
      
      console.log('✅ Successfully updated store with', transformedRequests.length, 'requests');
      
    } catch (error) {
      console.error('❌ Error fetching requests:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch requests' 
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
      
      if (hasActiveRequests) {
        console.log('🔄 Polling for updates...');
        await get().fetchRequests();
      }
    }, 30000); // Poll every 30 seconds if there are active requests
    
    // Return cleanup function
    return () => clearInterval(pollInterval);
  },
})); 