import React, { useState, useMemo, useEffect, useCallback } from 'react';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { ColumnDef } from '@tanstack/react-table';
import { Mail, Clock, Loader2, Send, AlertTriangle, CheckCircle, Search, Download, RefreshCw, Trash2, Upload, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import Input from '@/components/ui/Input';
import FileUploader from '@/components/ui/FileUploader';
import { useDocumentRequestStore, DocumentRequest } from '@/stores/documentRequests';
import { useAuthStore } from '@/stores/state';

// Status definitions
const STATUS = {
  REQUESTED: 'Requested',
  IN_PROGRESS: 'Auto-Retrieval in Progress',
  WAITING_EMAIL: 'Waiting for Client Email Approval',
  CLIENT_APPROVED: 'Client Approved via Email',
  SENT: 'Sent to Auditor',
  READY: 'Ready',
  FAILED: 'Failed / Needs Manual Intervention',
};

const statusMeta = {
  [STATUS.REQUESTED]:    { icon: <Clock className="text-gray-400" />, color: 'gray', label: 'Requested' },
  [STATUS.IN_PROGRESS]:  { icon: <Loader2 className="animate-spin text-blue-500" />, color: 'blue', label: 'Auto-Retrieval' },
  [STATUS.WAITING_EMAIL]:{ icon: <Mail className="text-yellow-500" />, color: 'yellow', label: 'Waiting Email', badge: true },
  [STATUS.CLIENT_APPROVED]: { icon: <CheckCircle className="text-green-500" />, color: 'green', label: 'Client Approved' },
  [STATUS.SENT]:         { icon: <Send className="text-blue-600" />, color: 'blue', label: 'Sent' },
  [STATUS.READY]:        { icon: <Download className='text-green-500' />, color: 'green', label: 'Ready' },
  [STATUS.FAILED]:       { icon: <AlertTriangle className="text-red-500" />, color: 'red', label: 'Failed', error: true },
};

// Mock data
// Remove: const mockRequests = [...];

const statusActions = {
  [STATUS.WAITING_EMAIL]: ['Resend Email'],
  [STATUS.FAILED]: ['Retry', 'View Log'],
};

// Handle document download function
const handleDownload = (request: DocumentRequest) => {
  // Check if there are attachments available
  if (request.attachments && request.attachments.length > 0) {
    // If multiple attachments, download the first one or show a selection
    const attachment = request.attachments[0];
    
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name || `${request.document}_${request.auditor}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (request.status === STATUS.SENT || request.status === STATUS.READY) {
    // For documents retrieved via n8n webhook that are marked as SENT or READY
    // This would typically have a download URL in the request data
    const downloadUrl = (request as any).downloadUrl || (request as any).fileUrl;
    
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${request.document}_${request.auditor}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback: show a message that download is not available
      alert('Download URL not available for this document. Please contact support.');
    }
  }
};

export default function DocumentRetrievalDashboard() {
  const { 
    requests, 
    loading, 
    error, 
    fetchRequests, 
    refreshRequests,
    pollForUpdates,
    deleteRequest
  } = useDocumentRequestStore();
  const { username } = useAuthStore();
  
  const [selected, setSelected] = useState<DocumentRequest | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<DocumentRequest | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAuditor, setFilterAuditor] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // PBC import and manual add dialogs
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [manualDescription, setManualDescription] = useState('');
  const [manualDate, setManualDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  // Handle delete button click
  const handleDeleteClick = useCallback((request: DocumentRequest) => {
    setDeleteConfirm(request);
  }, []);

  // Define columns inside the component so setDeleteConfirm is in scope
  const columns: ColumnDef<DocumentRequest, any>[] = [
    {
      header: '',
      id: 'status',
      accessorFn: (row) => row.status ?? '',
      cell: ({ row }) => {
        const meta = statusMeta[row.original.status] || statusMeta[STATUS.REQUESTED];
        return (
          <span className="flex items-center gap-1">
            {meta.icon}
            {meta.badge && <Badge variant="secondary" className="ml-1">Email</Badge>}
          </span>
        );
      },
      size: 40,
    },
    {
      header: 'Auditor',
      id: 'auditor',
      accessorFn: (row) => row.auditor ?? '',
    },
    {
      header: 'Document Requested',
      id: 'document',
      accessorFn: (row) => row.document ?? '',
    },
    {
      header: 'Date',
      id: 'date',
      accessorFn: (row) => row.date ?? '',
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? format(new Date(value), 'yyyy-MM-dd') : '';
      },
    },
    {
      header: 'Source/Trigger',
      id: 'source',
      accessorFn: (row) => row.source ?? 'Manual addition',
      cell: ({ row }) => row.original.source || 'Manual addition',
    },
    {
      header: 'Current Status',
      id: 'currentStatus',
      accessorFn: (row) => row.status ?? '',
      cell: ({ getValue }) => {
        const meta = statusMeta[getValue()] || statusMeta[STATUS.REQUESTED];
        return (
          <span className={`flex items-center gap-2 font-medium text-${meta.color}-700`}>
            {meta.icon}
            {meta.label}
          </span>
        );
      },
    },
    {
      header: 'Last Update',
      id: 'lastUpdate',
      accessorFn: (row) => row.lastUpdate ?? '',
      cell: ({ getValue }) => {
        const value = getValue();
        return value ? format(new Date(value), 'yyyy-MM-dd HH:mm') : '';
      },
    },
    {
      header: 'Download',
      id: 'download',
      cell: ({ row }) => {
        const request = row.original;
        // Show download button if document is available (status is SENT, READY, or has attachments)
        const hasAttachments = request.attachments && request.attachments.length > 0;
        const isAvailable = request.status === STATUS.SENT || request.status === STATUS.READY || hasAttachments;
        
        if (!isAvailable) {
          return <span className="text-gray-400 text-xs">Not available</span>;
        }
        
        return (
          <button 
            className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            onClick={() => handleDownload(request)}
            title="Download document"
          >
            <Download size={12} />
            Download
          </button>
        );
      },
      size: 100,
    },
    {
      header: '',
      id: 'actions',
      cell: ({ row }) => {
        const request = row.original;
        const actions = statusActions[request.status] || [];
        return (
          <div className="flex gap-2">
            {actions.map((action) => (
              <button key={action} className="text-xs px-2 py-1 rounded bg-muted hover:bg-accent border text-muted-foreground">
                {action}
              </button>
            ))}
            <button 
              className="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white transition-colors"
              onClick={() => handleDeleteClick(request)}
              title="Delete request"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        );
      },
      size: 80,
    },
  ];

  // Initial data fetch - ensure it runs immediately on mount
  useEffect(() => {
    console.log('🚀 DocumentRetrievalDashboard mounted, fetching requests...');
    fetchRequests();
  }, []); // Empty dependency array ensures it only runs once on mount

  // Start polling for updates when component mounts
  useEffect(() => {
    console.log('🔄 Starting polling for document request updates...');
    const cleanup = pollForUpdates();
    
    // Cleanup polling when component unmounts
    return cleanup;
  }, [pollForUpdates]);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    console.log('🔄 Manual refresh button clicked');
    refreshRequests();
  }, [refreshRequests]);

  // Debug logging for requests data
  useEffect(() => {
    console.log('📊 Current requests in dashboard:', requests);
    console.log('📊 Loading state:', loading);
    console.log('📊 Error state:', error);
  }, [requests, loading, error]);

  // Unique status and auditor options for filters
  const statusOptions = Array.from(new Set(requests.map(r => r.status)));
  const auditorOptions = Array.from(new Set(requests.map(r => r.auditor)));

  // Enhanced filter logic - only show document requests, not all uploaded documents
  const filtered = useMemo(() => {
    if (!Array.isArray(requests)) return [];
    
    // First filter by search and other criteria
    const searchFiltered = requests.filter((r) =>
      (r.document?.toLowerCase().includes(search.toLowerCase()) ||
        r.auditor?.toLowerCase().includes(search.toLowerCase()) ||
        r.status?.toLowerCase().includes(search.toLowerCase()) ||
        r.date?.includes(search)) &&
      (filterStatus ? r.status === filterStatus : true) &&
      (filterAuditor ? r.auditor === filterAuditor : true) &&
      (filterDate ? r.date === filterDate : true)
    );
    
    // Then filter to only show document requests (exclude raw uploads)
    return searchFiltered.filter((r) => {
      const isFromN8n =
        r.source === 'Walkthrough' ||
        (r.documentType && r.documentType === 'n8n_upload') ||
        (r.parameters && (r.parameters.source_trigger === 'Walkthrough')) ||
        (r.document && (
          r.document.toLowerCase().includes('procurement general ledger') ||
          r.document.toLowerCase().includes('qb retrieval')
        ));

      const isManualAddition = r.source === 'Manual addition' ||
        (r.parameters && (r.parameters.source_trigger === 'Manual'));

      return isFromN8n || isManualAddition;
    });
  }, [requests, search, filterStatus, filterAuditor, filterDate]);

  // Loading state
  if (loading && requests.length === 0) {
    return (
      <div className="flex h-full w-full bg-black text-white pt-24">
        <div className="w-full max-w-7xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin text-blue-500" />
              <span>Loading document requests...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && requests.length === 0) {
    return (
      <div className="flex h-full w-full bg-black text-white pt-24">
        <div className="w-full max-w-7xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-4">Error: {error}</p>
              <button 
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-black text-white pt-24">
      <div className="w-full max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Supporting Document Retrieval</h1>
          
          <div className="flex items-center gap-2">
            {/* Import PBC List */}
            <button
              onClick={() => setShowImportDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              disabled={loading}
              title="Import PBC list to create requests"
            >
              <Upload className="w-4 h-4" />
              Import PBC List
            </button>
            {/* Manual Request */}
            <button
              onClick={() => setShowManualDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              disabled={loading}
              title="Create a manual document request"
            >
              <Plus className="w-4 h-4" />
              New Manual Request
            </button>
            {/* Refresh button */}
            <button 
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
              {loading && <span>Refreshing...</span>}
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" />
              <span>Error: {error}</span>
            </div>
          </div>
        )}

        {/* Search/Filter Bar with custom style */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          {/* Search input with icon and slash */}
          <label className={`search-label flex items-center relative rounded-[12px] overflow-hidden bg-[#3D3D3D] px-3 py-2 cursor-text border border-transparent focus-within:bg-[#464646] focus-within:border-gray-400 hover:border-gray-400 transition w-64`}
            style={{ minWidth: 220 }}
          >
            <input
              className="outline-none w-full border-none bg-transparent text-gray-300 pr-8 text-sm placeholder-gray-400"
              placeholder="Search by document, auditor, status, or date..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              type="text"
            />
            {/* Slash icon for shortcut hint */}
            {!search && !searchFocused && (
              <span className="slash-icon absolute right-2 top-1/2 -translate-y-1/2 border border-[#393838] bg-gradient-to-br from-[#343434] to-[#6d6d6d] rounded text-center shadow-inner text-xs w-[15px] h-[18px] flex items-center justify-center select-none pointer-events-none">
                /
              </span>
            )}
            {/* Magnifying glass icon */}
            {(search || searchFocused) && (
              <Search className="search-icon absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            )}
          </label>
          {/* Status filter dropdown */}
          <select
            className="rounded-[12px] bg-[#3D3D3D] border border-transparent px-3 py-2 text-sm text-white focus:outline-none focus:bg-[#464646] focus:border-gray-400 hover:border-gray-400 transition"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ minWidth: 140 }}
          >
            <option value="">All Statuses</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          {/* Auditor filter dropdown */}
          <select
            className="rounded-[12px] bg-[#3D3D3D] border border-transparent px-3 py-2 text-sm text-white focus:outline-none focus:bg-[#464646] focus:border-gray-400 hover:border-gray-400 transition"
            value={filterAuditor}
            onChange={e => setFilterAuditor(e.target.value)}
            style={{ minWidth: 140 }}
          >
            <option value="">All Auditors</option>
            {auditorOptions.map(auditor => (
              <option key={auditor} value={auditor}>{auditor}</option>
            ))}
          </select>
          {/* Date filter input */}
          <input
            type="date"
            className="rounded-[12px] bg-[#3D3D3D] border border-transparent px-3 py-2 text-sm text-white focus:outline-none focus:bg-[#464646] focus:border-gray-400 hover:border-gray-400 transition"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            style={{ minWidth: 140 }}
          />
        </div>
        {/* Table with tooltips */}
        <DataTable
          columns={columns}
          data={Array.isArray(filtered) ? filtered : []}
        />
        {/* PBC Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent>
            <div>
              <DialogHeader>
                <DialogTitle>Import PBC List</DialogTitle>
                <DialogDescription>
                  Drag and drop a CSV file exported from your PBC list. We will create requests using the description and request date. Auditor will be set to Sam Salt, source will be Manual addition, and status will be Requested.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <FileUploader
                  accept={{ 'text/csv': ['.csv'] }}
                  maxFileCount={1}
                  multiple={false}
                  onUpload={async (files) => {
                    if (!files || files.length === 0) return;
                    const file = files[0];
                    try {
                      const text = await file.text();
                      const rows = parseCsv(text);
                      const header = rows[0] || [];
                      const dataRows = rows.slice(1);
                      const colIndex = buildPbcColumnIndex(header);
                      const nowIso = new Date().toISOString();
                      const auditorName = 'Sam Salt';
                      const newRequests: DocumentRequest[] = [];
                      dataRows.forEach((cells) => {
                        const description = pickCell(cells, colIndex.description);
                        if (!description) return;
                        const dateCell = pickCell(cells, colIndex.requestDate);
                        const dateVal = normalizeDate(dateCell);
                        const req: DocumentRequest = {
                          id: uuidv4(),
                          auditor: auditorName,
                          document: description,
                          date: dateVal || nowIso.slice(0, 10),
                          source: 'Manual addition',
                          method: 'Manual',
                          status: 'Requested',
                          lastUpdate: nowIso,
                          auditTrail: [{ status: 'Requested', at: nowIso }],
                          attachments: [],
                          requestId: undefined,
                          documentType: undefined,
                          parameters: { source_trigger: 'Manual' },
                        } as DocumentRequest;
                        newRequests.push(req);
                      });
                      // Add to store in a batch
                      newRequests.forEach((req) => {
                        // optimistic local add
                        useDocumentRequestStore.getState().addRequest(req);
                      });
                      setShowImportDialog(false);
                    } catch (e) {
                      console.error('Error importing PBC CSV:', e);
                    }
                  }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Manual Request Dialog */}
        <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
          <DialogContent>
            <div>
              <DialogHeader>
                <DialogTitle>New Manual Request</DialogTitle>
                <DialogDescription>
                  Enter a description and optional request date to add a document request.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 flex flex-col gap-3">
                <label className="text-sm">Description</label>
                <Input
                  placeholder="e.g., Accounts payable aging report"
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                />
                <label className="text-sm">Request date</label>
                <Input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowManualDialog(false)}
                    className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const nowIso = new Date().toISOString();
                      if (!manualDescription.trim()) {
                        return;
                      }
                      const req: DocumentRequest = {
                        id: uuidv4(),
                        auditor: username || 'Sam Salt',
                        document: manualDescription.trim(),
                        date: manualDate || nowIso.slice(0, 10),
                        source: 'Manual addition',
                        method: 'Manual',
                        status: 'Requested',
                        lastUpdate: nowIso,
                        auditTrail: [{ status: 'Requested', at: nowIso }],
                        attachments: [],
                        parameters: { source_trigger: 'Manual' },
                      } as DocumentRequest;
                      useDocumentRequestStore.getState().addRequest(req);
                      setManualDescription('');
                      setManualDate(new Date().toISOString().slice(0, 10));
                      setShowManualDialog(false);
                    }}
                    className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    Add Request
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* Detail Dialog */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent>
            {selected && (
              <div>
                <DialogHeader>
                  <DialogTitle>{selected.document}</DialogTitle>
                  <DialogDescription>
                    Requested by <b>{selected.auditor}</b> on {format(new Date(selected.date), 'yyyy-MM-dd')}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-2">
                  <div className="font-semibold">Audit Trail</div>
                  <ul className="text-xs space-y-1">
                    {selected.auditTrail.map((item: any, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <span>{statusMeta[item.status].icon}</span>
                        <span>{statusMeta[item.status].label}</span>
                        <span className="text-gray-400 ml-2">{format(new Date(item.at), 'yyyy-MM-dd HH:mm')}</span>
                        {item.email && <Badge variant="secondary">Email: {item.email}</Badge>}
                        {item.error && <span className="text-red-500 ml-2">{item.error}</span>}
                      </li>
                    ))}
                  </ul>
                  <div className="font-semibold mt-4">Attachments / Logs</div>
                  {selected.attachments.length ? (
                    <ul className="text-xs space-y-1">
                      {selected.attachments.map((a: any, i: number) => (
                        <li key={i}><a href={a.url} className="text-blue-600 underline">{a.name}</a></li>
                      ))}
                    </ul>
                                     ) : (
                     <div className='text-gray-400 text-xs'>Pending</div>
                   )}
                  {/* Status-specific info */}
                  {selected.status === STATUS.WAITING_EMAIL && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">Waiting for Client Email Approval</span>
                      </div>
                      <div className="text-xs">Email sent to <b>{selected.email}</b> on {format(new Date(selected.lastUpdate), 'yyyy-MM-dd HH:mm')}</div>
                      <button className="mt-2 text-xs px-2 py-1 rounded bg-muted hover:bg-accent border text-muted-foreground">Resend Email</button>
                      <div className="text-xs text-gray-500 mt-2">Approval must be completed via secure email link. No in-app approval/upload.</div>
                    </div>
                  )}
                  {selected.status === STATUS.CLIENT_APPROVED && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-xs">
                      Client approved via email at {format(new Date(selected.lastUpdate), 'yyyy-MM-dd HH:mm')}, document queued for auditor.
                    </div>
                  )}
                  {selected.status === STATUS.FAILED && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-xs">
                      <div className="font-medium text-red-600 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Failed / Needs Manual Intervention</div>
                      <div className="mt-1">{selected.error}</div>
                      <button className="mt-2 text-xs px-2 py-1 rounded bg-muted hover:bg-accent border text-muted-foreground">Retry</button>
                      <button className="ml-2 text-xs px-2 py-1 rounded bg-muted hover:bg-accent border text-muted-foreground">View Log</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent>
            {deleteConfirm && (
              <div>
                <DialogHeader>
                  <DialogTitle>Delete Document Request</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete the document request for <b>{deleteConfirm.document}</b>?
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 flex gap-3 justify-end">
                  <button 
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      deleteRequest(deleteConfirm.id);
                      setDeleteConfirm(null);
                    }}
                    className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 

// ---------- Helpers for PBC CSV import ----------

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        current.push(cell.trim());
        cell = '';
      } else if (char === '\n') {
        current.push(cell.trim());
        rows.push(current);
        current = [];
        cell = '';
      } else if (char === '\r') {
        // skip
      } else {
        cell += char;
      }
    }
  }
  if (cell.length > 0 || current.length > 0) {
    current.push(cell.trim());
    rows.push(current);
  }
  return rows;
}

function buildPbcColumnIndex(header: string[]): { description: number[]; requestDate: number[] } {
  const indices = { description: [] as number[], requestDate: [] as number[] };
  header.forEach((h, idx) => {
    const key = h?.toLowerCase().trim();
    if (!key) return;
    if (
      key.includes('description') ||
      key.includes('document request') ||
      key === 'request' ||
      key === 'document' ||
      key.includes('supporting document')
    ) {
      indices.description.push(idx);
    }
    if (
      key === 'date' ||
      key.includes('request date') ||
      key.includes('requested date') ||
      key.includes('request_dt') ||
      key.includes('requested')
    ) {
      indices.requestDate.push(idx);
    }
  });
  return indices;
}

function pickCell(cells: string[], indices: number[] | undefined): string | undefined {
  if (!indices || indices.length === 0) return undefined;
  for (const idx of indices) {
    const v = cells[idx];
    if (v && v.trim().length > 0) return v.trim();
  }
  return undefined;
}

function normalizeDate(value?: string): string | undefined {
  if (!value) return undefined;
  const t = value.trim();
  // Accept ISO, yyyy-mm-dd, mm/dd/yyyy, dd/mm/yyyy
  const isoMatch = /^\d{4}-\d{2}-\d{2}$/;
  if (isoMatch.test(t)) return t;
  const mdY = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/;
  const m = t.match(mdY);
  if (m) {
    let mm = parseInt(m[1], 10);
    let dd = parseInt(m[2], 10);
    let yyyy = parseInt(m[3].length === 2 ? `20${m[3]}` : m[3], 10);
    if (dd > 31 && mm <= 12) {
      // maybe dd/mm/yyyy
      const tmp = dd; dd = mm; mm = tmp;
    }
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${yyyy}-${pad(mm)}-${pad(dd)}`;
  }
  // Last resort: Date.parse
  const d = new Date(t);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return undefined;
}