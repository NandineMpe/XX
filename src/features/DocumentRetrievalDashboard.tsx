import React, { useState, useMemo } from 'react';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { ColumnDef } from '@tanstack/react-table';
import { Mail, Clock, Loader2, Send, AlertTriangle, CheckCircle, Search, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useDocumentRequestStore, DocumentRequest } from '@/stores/documentRequests';

// Status definitions
const STATUS = {
  REQUESTED: 'Requested',
  IN_PROGRESS: 'Auto-Retrieval in Progress',
  WAITING_EMAIL: 'Waiting for Client Email Approval',
  CLIENT_APPROVED: 'Client Approved via Email',
  SENT: 'Sent to Auditor',
  FAILED: 'Failed / Needs Manual Intervention',
};

const statusMeta = {
  [STATUS.REQUESTED]:    { icon: <Clock className="text-gray-400" />, color: 'gray', label: 'Requested' },
  [STATUS.IN_PROGRESS]:  { icon: <Loader2 className="animate-spin text-blue-500" />, color: 'blue', label: 'Auto-Retrieval' },
  [STATUS.WAITING_EMAIL]:{ icon: <Mail className="text-yellow-500" />, color: 'yellow', label: 'Waiting Email', badge: true },
  [STATUS.CLIENT_APPROVED]: { icon: <CheckCircle className="text-green-500" />, color: 'green', label: 'Client Approved' },
  [STATUS.SENT]:         { icon: <Send className="text-blue-600" />, color: 'blue', label: 'Sent' },
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
  } else if (request.status === STATUS.SENT) {
    // For documents retrieved via n8n webhook that are marked as SENT
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
    accessorFn: () => 'Walkthrough',
    cell: () => 'Walkthrough',
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
      // Show download button if document is available (status is SENT or has attachments)
      const hasAttachments = request.attachments && request.attachments.length > 0;
      const isAvailable = request.status === STATUS.SENT || hasAttachments;
      
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
      const actions = statusActions[row.original.status] || [];
      return (
        <div className="flex gap-2">
          {actions.map((action) => (
            <button key={action} className="text-xs px-2 py-1 rounded bg-muted hover:bg-accent border text-muted-foreground">
              {action}
            </button>
          ))}
        </div>
      );
    },
    size: 80,
  },
];

export default function DocumentRetrievalDashboard() {
  const requests = useDocumentRequestStore((s) => s.requests);
  const [selected, setSelected] = useState<DocumentRequest | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAuditor, setFilterAuditor] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Unique status and auditor options for filters
  const statusOptions = Array.from(new Set(requests.map(r => r.status)));
  const auditorOptions = Array.from(new Set(requests.map(r => r.auditor)));

  // Enhanced filter logic
  const filtered = useMemo(() => {
    if (!Array.isArray(requests)) return [];
    return requests.filter((r) =>
      (r.document?.toLowerCase().includes(search.toLowerCase()) ||
        r.auditor?.toLowerCase().includes(search.toLowerCase()) ||
        r.status?.toLowerCase().includes(search.toLowerCase()) ||
        r.date?.includes(search)) &&
      (filterStatus ? r.status === filterStatus : true) &&
      (filterAuditor ? r.auditor === filterAuditor : true) &&
      (filterDate ? r.date === filterDate : true)
    );
  }, [requests, search, filterStatus, filterAuditor, filterDate]);

  return (
    <div className="flex h-full w-full bg-black text-white pt-24">
      <div className="w-full max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Supporting Document Retrieval</h1>
        {/* Search/Filter Bar with custom style */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          {/* Search input with icon and slash */}
          <label className={`search-label flex items-center relative rounded-[12px] overflow-hidden bg-[#3D3D3D] px-3 py-2 cursor-text border border-transparent focus-within:bg-[#464646] focus-within:border-gray-400 hover:border-gray-400 transition w-64`}
            style={{ minWidth: 220 }}
          >
            <input
              className='outline-none w-full border-none bg-transparent text-gray-300 pr-8 text-sm placeholder-gray-400'
              placeholder='Search by document, auditor, status, or date...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              type='text'
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
                        <li key={i}><a href={a.url} className='text-blue-600 underline'>{a.name}</a></li>
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
      </div>
    </div>
  );
} 