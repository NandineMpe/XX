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
  deleteRequest: (id: string) => void;
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
  
  deleteRequest: (id) =>
    set((state) => ({
      requests: state.requests.filter((r) => r.id !== id),
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
      console.log('🌐 Webhook URL:', 'https://lightrag-production-6328.up.railway.app/documents/n8n_webhook');
      console.log('📦 Request body:', JSON.stringify(requestData, null, 2));
      
      // Send request to n8n webhook endpoint
      const webhookResponse = await fetch('https://lightrag-production-6328.up.railway.app/documents/n8n_webhook', {
        method: 'POST',
        headers: {
          'X-API-Key': 'admin123',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('📡 Webhook response status:', webhookResponse.status);
      console.log('📡 Webhook response headers:', Object.fromEntries(webhookResponse.headers.entries()));

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text();
        console.error('❌ n8n webhook request failed:', webhookResponse.status, errorText);
        throw new Error(`n8n webhook request failed: ${webhookResponse.status} - ${errorText}`);
      }

      const result = await webhookResponse.json();
      console.log('✅ Document request sent to n8n webhook successfully:', result);
      console.log('📝 Document request will now be processed by n8n workflow');
      
      // Don't trigger immediate refresh - let the local request persist
      // The polling mechanism will handle updates when LightRAG data becomes available
      console.log('📝 Local request will persist until LightRAG data is available');
      
      return true;
    } catch (error) {
      console.error('❌ Error in n8n webhook request flow:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
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
      console.log('📊 LightRAG API Response data structure:', {
        hasStatuses: !!data.statuses,
        statusesType: typeof data.statuses,
        statusesKeys: data.statuses ? Object.keys(data.statuses) : 'none',
        totalDocuments: data.statuses ? Object.values(data.statuses).flat().length : 0
      });
      
      if (!data.statuses || typeof data.statuses !== 'object') {
        console.error('❌ Invalid data structure:', data);
        throw new Error('Invalid data structure received from LightRAG API');
      }
      
      // Get current local requests to merge with LightRAG data
      const currentRequests = get().requests;
      console.log('📊 Current local requests:', currentRequests);
      
      // Transform LightRAG documents into document request format
      // Only include documents that are actual document requests (n8n webhook documents)
      const transformedRequests: DocumentRequest[] = [];
      
      // Process documents from all statuses
      Object.entries(data.statuses).forEach(([status, documents]) => {
        const docsArray = documents as any[];
        console.log(`📄 Processing ${docsArray.length} documents with status: ${status}`);
        
        docsArray.forEach((doc) => {
          try {
            console.log('🔍 Processing LightRAG document:', {
              id: doc.id,
              status: status,
              file_path: doc.file_path,
              content_summary: doc.content_summary,
              source: doc.source,
              documentType: doc.documentType,
              requestId: doc.requestId,
              parameters: doc.parameters
            });
            
            // Extract filename from file_path and remove .txt extension
            let fileName = doc.file_path ? doc.file_path.split('/').pop() || 'Unknown Document' : 'Unknown Document';
            // Remove .txt extension for display
            if (fileName.endsWith('.txt')) {
              fileName = fileName.slice(0, -4);
            }
            
            // Filter: ONLY include documents that are actual document requests from n8n webhook
            // This should be very strict - only n8n webhook documents, not uploaded documents
            const isDocumentRequest = (
              // MUST have one of these n8n-specific indicators:
              // 1. n8n in source field
              (doc.source && doc.source.toLowerCase().includes('n8n')) ||
              // 2. n8n in file_path
              (doc.file_path && doc.file_path.toLowerCase().includes('n8n')) ||
              // 3. n8n_upload documentType
              (doc.documentType && doc.documentType === 'n8n_upload') ||
              // 4. requestId field (indicates it's a document request)
              doc.requestId ||
              // 5. Specific n8n filename patterns
              (fileName && (
                fileName.toLowerCase().includes('qb retrieval n8n') ||
                fileName.toLowerCase().includes('procurement general ledger n8n') ||
                fileName.toLowerCase().includes('n8n')
              )) ||
              // 6. Content summary with document request patterns (legacy)
              (doc.content_summary && (
                doc.content_summary.includes('Document Request:') ||
                doc.content_summary.includes('Request ID:') ||
                doc.content_summary.includes('source_trigger:') ||
                doc.content_summary.includes('n8n')
              )) ||
              // 7. Parameters field with n8n indicators
              (doc.parameters && (
                (typeof doc.parameters === 'string' && doc.parameters.includes('n8n')) ||
                (typeof doc.parameters === 'object' && (
                  doc.parameters.source_trigger === 'Walkthrough' ||
                  doc.parameters.documentType ||
                  doc.parameters.requestId
                ))
              ))
            );
            
            // Skip if this is not a document request (i.e., it's an uploaded file)
            if (!isDocumentRequest) {
              console.log('⏭️ Skipping uploaded document (not a document request):', fileName);
              console.log('📄 Document source:', doc.source);
              console.log('📄 Document file_path:', doc.file_path);
              console.log('📄 Document documentType:', doc.documentType);
              console.log('📄 Document requestId:', doc.requestId);
              console.log('📄 Document content_summary includes document request patterns:', doc.content_summary?.includes('Document Request:') || false);
              console.log('📄 Document parameters:', doc.parameters);
              console.log('📄 Document content_summary includes n8n:', doc.content_summary?.includes('n8n') || false);
              console.log('📄 Document file_path includes n8n:', doc.file_path?.includes('n8n') || false);
              return; // Skip uploaded documents
            }
            
            console.log('✅ Including document in requests:', fileName);
            console.log('📄 Document details:', {
              id: doc.id,
              status: status,
              source: doc.source,
              file_path: doc.file_path,
              content_summary_length: doc.content_summary?.length || 0
            });
            
            // Parse document request content to extract information
            const contentLines = doc.content_summary ? doc.content_summary.split('\n') : [];
            const requestInfo: any = {};
            
            // Determine if this is a document request or uploaded document
            // This logic is now handled by the isDocumentRequest check above
            
            // First try to parse from content_summary (legacy documents)
            contentLines.forEach((line: string) => {
              if (line.includes(':')) {
                const [key, value] = line.split(':').map((s: string) => s.trim());
                requestInfo[key] = value;
              }
            });
            
            // If we don't have structured content, try to extract from parameters (n8n documents)
            if (!requestInfo['Document Request'] && !requestInfo['Auditor']) {
              console.log('🔍 No structured content found, checking parameters for n8n document');
              
              // Check if this is an n8n document with parameters
              if (doc.parameters) {
                try {
                  const params = typeof doc.parameters === 'string' 
                    ? JSON.parse(doc.parameters) 
                    : doc.parameters;
                  
                  requestInfo['Document Request'] = params.documentType || params.document_type;
                  requestInfo['Auditor'] = params.auditor;
                  requestInfo['Entity'] = params.entity;
                  requestInfo['Process'] = params.process;
                  requestInfo['Step'] = params.step;
                  requestInfo['Request ID'] = params.requestId;
                  requestInfo['Source Trigger'] = params.source_trigger;
                  
                  console.log('✅ Successfully extracted parameters from n8n document:', requestInfo);
                } catch (error) {
                  console.log('❌ Error parsing parameters:', error);
                }
              }
              
              // Fallback to filename if still no info
              if (!requestInfo['Document Request']) {
                console.log('🔍 Using filename as fallback');
                // For n8n documents, use the filename to extract document type
                if (fileName.toLowerCase().includes('procurement general ledger')) {
                  requestInfo['Document Request'] = 'Procurement General Ledger / Purchase Journal';
                } else if (fileName.toLowerCase().includes('qb retrieval')) {
                  requestInfo['Document Request'] = fileName.replace('QB Retrieval n8n_', '').replace('_', ' ');
                } else if (fileName.toLowerCase().includes('n8n')) {
                  // For n8n documents, try to extract meaningful name from filename
                  const cleanFileName = fileName
                    .replace(/\.txt$/, '') // Remove .txt extension
                    .replace(/n8n_/g, '') // Remove n8n_ prefix
                    .replace(/_/g, ' ') // Replace underscores with spaces
                    .replace(/\b\w/g, (l: string) => l.toUpperCase()); // Capitalize words
                  
                  // If the filename is just 'webhook' or similar, use the documentType from parameters
                  if (cleanFileName.toLowerCase() === 'webhook' && doc.parameters) {
                    try {
                      const params = typeof doc.parameters === 'string' 
                        ? JSON.parse(doc.parameters) 
                        : doc.parameters;
                      requestInfo['Document Request'] = params.documentType || params.document_type || 'Document Request';
                    } catch {
                      requestInfo['Document Request'] = 'Document Request';
                    }
                  } else {
                    requestInfo['Document Request'] = cleanFileName || 'Document Request';
                  }
                } else {
                  // For uploaded documents, use the filename as the document name
                  requestInfo['Document Request'] = fileName;
                }
                requestInfo['Auditor'] = 'Sam Salt'; // Default auditor
              }
              
              // Ensure we have a proper document name
              if (!requestInfo['Document Request'] || requestInfo['Document Request'] === 'unknown') {
                console.log('⚠️ No document name found, using fallback');
                // Try to extract from content_summary if available
                if (doc.content_summary && doc.content_summary.length > 0) {
                  // Look for document type in content summary
                  const contentLines = doc.content_summary.split('\n');
                  for (const line of contentLines) {
                    if (line.toLowerCase().includes('document') || line.toLowerCase().includes('type')) {
                      const match = line.match(/[^:]*$/); // Get everything after the last colon
                      if (match && match[0].trim()) {
                        requestInfo['Document Request'] = match[0].trim();
                        break;
                      }
                    }
                  }
                }
                
                // Final fallback
                if (!requestInfo['Document Request'] || requestInfo['Document Request'] === 'unknown') {
                  requestInfo['Document Request'] = 'Document Request';
                }
              }
            }
            
            // For uploaded documents that have been processed, set appropriate source
            const documentSource = isDocumentRequest 
              ? (requestInfo['Source Trigger'] || requestInfo['Process'] ? 'Walkthrough' : 'LightRAG Upload')
              : (doc.source && doc.source.toLowerCase().includes('n8n')) 
                ? 'Walkthrough' 
                : 'Document Upload';
                
            // Override source for specific cases
            let finalSource = documentSource;
            if (isDocumentRequest && requestInfo['Source Trigger'] === 'Walkthrough') {
              finalSource = 'Walkthrough';
            } else if (isDocumentRequest && requestInfo['Process']) {
              finalSource = 'Walkthrough';
            } else if (doc.source && doc.source.toLowerCase().includes('n8n')) {
              finalSource = 'Walkthrough';
            } else if (doc.source && doc.source !== 'Ornua') {
              finalSource = doc.source;
            }
            
            // For n8n documents, ALWAYS use 'Walkthrough' as the source
            if (isDocumentRequest) {
              finalSource = 'Walkthrough';
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
              source: finalSource,
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
                source_trigger: requestInfo['Source Trigger'] || 'Walkthrough'
              },
              errorMessage: doc.error,
            });
          } catch (transformError) {
            console.error('❌ Error transforming LightRAG document:', doc, transformError);
          }
        });
      });
      
      console.log('🔄 Transformed document requests from LightRAG:', transformedRequests);
      console.log('📊 Total documents processed:', Object.values(data.statuses).flat().length);
      console.log('📊 Documents that passed filtering:', transformedRequests.length);
      
      // Merge LightRAG data with local requests
      // Keep local requests that don't have matching LightRAG data
      const mergedRequests = [...currentRequests];
      
      // Update existing local requests with LightRAG data if they match
      transformedRequests.forEach((lightragRequest) => {
        const existingIndex = mergedRequests.findIndex(req => 
          req.requestId === lightragRequest.requestId ||
          req.document === lightragRequest.document
        );
        
        if (existingIndex >= 0) {
          console.log('🔄 Updating existing local request with LightRAG data:', lightragRequest.document);
          mergedRequests[existingIndex] = { ...mergedRequests[existingIndex], ...lightragRequest };
        } else {
          console.log('➕ Adding new LightRAG request:', lightragRequest.document);
          mergedRequests.push(lightragRequest);
        }
      });
      
      console.log('📊 Final merged requests:', mergedRequests);
      
      set({ 
        requests: mergedRequests,
        loading: false,
        error: null 
      });
      
      console.log('✅ Successfully updated store with', mergedRequests.length, 'document requests (local + LightRAG)');
      
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
      
      // Always poll if there are any requests (including new ones that might not have status yet)
      if (requests.length > 0) {
        console.log('🔄 Polling for updates...');
        await get().fetchRequests();
      }
    }, 10000); // Poll every 10 seconds for more responsive updates
    
    // Return cleanup function
    return () => clearInterval(pollInterval);
  },
})); 