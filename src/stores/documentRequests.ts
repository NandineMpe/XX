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
      console.log('🔄 Fetching document requests from LightRAG API...');
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
      // Only include documents that are actual document requests (not uploaded files)
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
            
            // Extract filename from file_path and remove .txt extension
            let fileName = doc.file_path ? doc.file_path.split('/').pop() || 'Unknown Document' : 'Unknown Document';
            // Remove .txt extension for display
            if (fileName.endsWith('.txt')) {
              fileName = fileName.slice(0, -4);
            }
            
            // Filter: Only include documents that are actual document requests
            // Document requests typically have specific naming patterns or content
            const isDocumentRequest = doc.content_summary && (
              doc.content_summary.includes('Document Request:') ||
              doc.content_summary.includes('Auditor:') ||
              doc.content_summary.includes('Entity:') ||
              doc.content_summary.includes('Process:') ||
              doc.content_summary.includes('Step:') ||
              doc.content_summary.includes('Request ID:') ||
              // Add more flexible patterns to catch different document request formats
              doc.content_summary.includes('documentType:') ||
              doc.content_summary.includes('parameters:') ||
              doc.content_summary.includes('source_trigger:') ||
              // If it has a requestId field, it's likely a document request
              doc.requestId
            );
            
            // Additional check: Exclude files that are clearly uploaded documents
            // These patterns indicate uploaded files, not document requests
            const isUploadedFile = fileName.toLowerCase().includes('.pdf') ||
              fileName.toLowerCase().includes('.doc') ||
              fileName.toLowerCase().includes('.docx') ||
              fileName.toLowerCase().includes('.xls') ||
              fileName.toLowerCase().includes('.xlsx') ||
              fileName.toLowerCase().includes('.txt') ||
              // Check if the content looks like a document request metadata
              (doc.content_summary && (
                doc.content_summary.includes('file_path:') ||
                doc.content_summary.includes('content_length:') ||
                doc.content_summary.includes('created_at:') ||
                doc.content_summary.includes('updated_at:')
              )) ||
              // Check if the filename looks like a standard document (not a request)
              fileName.toLowerCase().includes('ias-') ||
              fileName.toLowerCase().includes('ifrs-') ||
              fileName.toLowerCase().includes('policy') ||
              fileName.toLowerCase().includes('agreement') ||
              fileName.toLowerCase().includes('procedure');
            
            // Skip if this is not a document request (i.e., it's an uploaded file)
            if (!isDocumentRequest || isUploadedFile) {
              console.log('⏭️ Skipping uploaded file (not a document request):', fileName);
              console.log('📄 Document content summary:', doc.content_summary);
              console.log('🔍 Is document request:', isDocumentRequest);
              console.log('🔍 Is uploaded file:', isUploadedFile);
              return; // Actually skip this document
            }
            
            // Parse document request content to extract information
            const contentLines = doc.content_summary ? doc.content_summary.split('\n') : [];
            const requestInfo: any = {};
            
            contentLines.forEach((line: string) => {
              if (line.includes(':')) {
                const [key, value] = line.split(':').map((s: string) => s.trim());
                requestInfo[key] = value;
              }
            });
            
            // If we don't have structured content, try to extract from the document itself
            if (!requestInfo['Document Request'] && !requestInfo['Auditor']) {
              console.log('🔍 No structured content found, using document metadata');
              // Use the filename as the document name
              requestInfo['Document Request'] = fileName;
              requestInfo['Auditor'] = 'Sam Salt'; // Default auditor
            }
            
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
                url: 'https://ifonjarzvpechegr.public.blob.vercel-storage.com/Purchase%20Order%20GL%20Listing.xlsx'
              });
            }
            
            transformedRequests.push({
              id: doc.id,
              auditor: requestInfo['Auditor'] || 'Sam Salt',
              document: requestInfo['Document Request'] || fileName,
              date: doc.created_at ? new Date(doc.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
              source: requestInfo['Process'] ? 'Walkthrough' : 'LightRAG Upload',
              method: 'Automatic',
              status: mappedStatus,
              lastUpdate: doc.updated_at ? new Date(doc.updated_at).toLocaleString() : new Date().toLocaleString(),
              auditTrail,
              attachments,
              downloadUrl: status === 'processed' ? 'https://ifonjarzvpechegr.public.blob.vercel-storage.com/Purchase%20Order%20GL%20Listing.xlsx' : undefined,
              fileName: fileName,
              fileSize: doc.content_length ? `${doc.content_length} bytes` : undefined,
              error: doc.error,
              requestId: requestInfo['Request ID'] || doc.id,
              documentType: requestInfo['Document Request'] || fileName,
              parameters: { 
                auditor: requestInfo['Auditor'],
                entity: requestInfo['Entity'],
                process: requestInfo['Process'],
                step: requestInfo['Step'],
                source: 'Walkthrough'
              },
              errorMessage: doc.error,
            });
          } catch (transformError) {
            console.error('❌ Error transforming LightRAG document:', doc, transformError);
          }
        });
      });
      
      console.log('🔄 Transformed document requests:', transformedRequests);
      console.log('📊 Total documents processed:', Object.values(data.statuses).flat().length);
      console.log('📊 Documents that passed filtering:', transformedRequests.length);
      
      set({ 
        requests: transformedRequests,
        loading: false,
        error: null 
      });
      
      console.log('✅ Successfully updated store with', transformedRequests.length, 'document requests from LightRAG');
      
    } catch (error) {
      console.error('❌ Error fetching document requests from LightRAG:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch document requests from LightRAG' 
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