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
};

type DocumentRequestStore = {
  requests: DocumentRequest[];
  loading: boolean;
  error: string | null;
  addRequest: (req: DocumentRequest) => void;
  updateRequest: (id: string, update: Partial<DocumentRequest>) => void;
  fetchRequests: () => Promise<void>;
  refreshRequests: () => Promise<void>;
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
  fetchRequests: async () => {
    try {
      console.log('🔄 Fetching document requests from API...');
      set({ loading: true, error: null });
      
      const url = 'https://lightrag-production-6328.up.railway.app/webhook/api/document-requests';
      console.log('🌐 Making request to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': 'admin123',
          'Content-Type': 'application/json',
        },
        mode: 'cors', // Explicitly set CORS mode
      });
      
      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()));
      
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
      
      // Transform backend data to match frontend format
      const transformedRequests = data.requests.map((request: any) => ({
        id: request.requestId,
        auditor: request.parameters?.auditor || 'Unknown',
        document: request.documentType || 'Unknown',
        date: new Date(request.createdAt).toLocaleDateString(),
        source: request.parameters?.source_trigger || 'Walkthrough',
        method: 'Manual',
        status: request.status,
        lastUpdate: new Date(request.updatedAt).toLocaleString(),
        auditTrail: [{ status: request.status, at: request.updatedAt }],
        attachments: request.downloadUrl ? [{ name: request.fileName || 'Document', url: request.downloadUrl }] : [],
        downloadUrl: request.downloadUrl,
        fileName: request.fileName,
        fileSize: request.fileSize,
      }));
      
      console.log('🔄 Transformed requests:', transformedRequests);
      
      set({ 
        requests: transformedRequests,
        loading: false,
        error: null 
      });
      
      console.log('✅ Successfully updated store with', transformedRequests.length, 'requests');
      
    } catch (error) {
      console.error('❌ Error fetching requests:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
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
})); 