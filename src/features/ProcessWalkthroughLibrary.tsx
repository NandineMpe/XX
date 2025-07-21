import React, { useState, useMemo } from 'react';
import { useRive } from '@rive-app/react-canvas';
import Button from '@/components/ui/Button';
// Rive animation for Ornua Business Model
const OrnuaRiveAnimation = ({ step }: { step: number }) => {
  // Assume animation names are 'step1', 'step2', ...
  const animationName = `step${step + 1}`;
  const { RiveComponent } = useRive({
    src: 'https://ifonjarzvpechegr.public.blob.vercel-storage.com/drag_and_drop_elearning%20%2812%29.riv',
    animations: [animationName],
    autoplay: true,
  });
  return (
    <div className='w-full h-96 bg-gray-900 flex items-center justify-center rounded-lg border border-gray-700 mb-6'>
      <RiveComponent style={{ width: '100%', height: '22rem', background: 'transparent' }} />
    </div>
  );
};
// Placeholder for other processes
const RiveAnimation = ({ step }: { step: number }) => (
  <div className="w-full h-64 bg-gray-900 flex items-center justify-center rounded-lg border border-gray-700 mb-6">
    <span className="text-gray-400">[Rive Animation for Step {step + 1}]</span>
  </div>
);

// Mock config/data
const entities = [
  {
    id: 'ornua',
    name: 'Ornua',
    processes: [
      {
        id: 'dairy-procurement',
        name: 'Stage 1: Dairy Procurement',
        description: 'This stage focuses on how Ornua buys dairy from its member co-operatives. The key audit risk is ensuring the cost of goods sold is accurately recorded and that the process is managed correctly.',
        steps: [
          {
            title: 'Dairy Procurement',
            explanation: 'How Ornua buys dairy from its member co-operatives.',
            controls: [],
            docs: [
              { name: 'Member Co-operative Framework Agreement', type: 'view', description: 'A master agreement outlining the commercial relationship, quality standards, and general terms between Ornua and its member co-ops. This is essential for understanding the basis of the procurement process.' },
              { name: 'Procurement & Quality Policy', type: 'view', description: 'A policy document detailing the standards for dairy quality, testing procedures, and the process for accepting goods from members.' },
              { name: 'List of Approved Member Co-operatives', type: 'view', description: 'A standard list of the co-operatives that Ornua is authorized to purchase from.' },
              { name: 'Purchase Price Bulletins / Memos', type: 'view', description: 'Regular communications sent to members detailing the current purchase prices for various dairy commodities (butter, cheese, powders).' },
              { name: 'Procurement General Ledger / Purchase Journal', type: 'request', description: 'A detailed listing of all procurement transactions for a specific period. This is the population from which an auditor would select a sample for testing.' },
              { name: 'Sample of Purchase Orders & Goods Received Notes (GRNs)', type: 'request', description: 'For a selected sample of transactions, the auditor needs the PO to verify authorization and the GRN to confirm receipt of goods, linking them to the invoice and payment.' },
              { name: 'Sample of Member Invoices & Payment Remittances', type: 'request', description: 'Evidence to trace the transaction from the general ledger back to the source invoice from the member co-op and the subsequent bank payment.' },
            ],
          },
        ],
      },
      {
        id: 'value-addition',
        name: 'Stage 2: Value-Addition Process',
        description: 'This stage covers the internal processes of transforming raw materials into finished goods. The audit focus is on inventory valuation, cost allocation, and production controls.',
        steps: [
          {
            title: 'Value-Addition Process',
            explanation: 'Transforming raw materials into finished goods.',
            controls: [],
            docs: [
              { name: 'Inventory Valuation Policy', type: 'view', description: 'The accounting policy explaining how inventory (raw materials, work-in-progress, finished goods) is valued (e.g., FIFO, weighted average) and how overheads are capitalized.' },
              { name: 'Standard Costing Sheets', type: 'view', description: 'Documents showing the standard cost build-up for key products (e.g., a case of Kerrygold butter), including materials, labor, and overhead.' },
              { name: 'Production Process Flowcharts', type: 'view', description: 'Visual diagrams of the production process at facilities like Kerrygold Park, showing key stages and control points.' },
              { name: 'Bill of Materials (BOM) for Key Products', type: 'view', description: 'A standard list of all raw materials and components required to produce a finished good.' },
              { name: 'Inventory Count Instructions & Procedures', type: 'view', description: 'The company\'s standard procedures for conducting physical inventory counts (e.g., year-end stock-take).' },
              { name: 'Detailed Inventory Listing (by location)', type: 'request', description: 'A complete listing of all inventory on hand at a specific date. This is the population for selecting samples for physical verification and valuation testing.' },
              { name: 'Sample of Production Work Orders', type: 'request', description: 'For a selected sample, these documents show the authorization to produce a certain quantity of goods and track the materials used.' },
              { name: 'Overhead Allocation Calculation', type: 'request', description: 'The detailed calculation showing how factory overhead costs (rent, utilities, indirect labor) were allocated to the cost of inventory during the period.' },
            ],
          },
        ],
      },
      {
        id: 'sales-revenue',
        name: 'Stage 3: Global Sales and Revenue Generation',
        description: 'This is a critical stage focusing on revenue recognition. The audit needs to confirm that revenue is recorded completely, accurately, and in the correct period, in line with accounting standards (e.g., IFRS 15).',
        steps: [
          {
            title: 'Global Sales and Revenue Generation',
            explanation: 'Revenue recognition and sales process.',
            controls: [],
            docs: [
              { name: 'Revenue Recognition Policy', type: 'view', description: 'The formal accounting policy detailing when and how the company recognizes revenue for its two main streams (Foods and Ingredients). This is a foundational document.' },
              { name: 'Standard Customer Contracts / Master Sales Agreements', type: 'view', description: 'Template agreements for major retailers (Ornua Foods) and B2B clients (Ornua Ingredients) outlining shipping terms (Incoterms), payment terms, and rebate structures.' },
              { name: 'Published Price Lists / Catalogs', type: 'view', description: 'Standard price lists for consumer products or ingredient categories.' },
              { name: 'Credit Control & Customer Onboarding Policy', type: 'view', description: 'The policy for assessing new customers\' creditworthiness and setting them up in the system.' },
              { name: 'Sales General Ledger / Sales Journal', type: 'request', description: 'The complete listing of all sales transactions. This is the population from which an auditor selects a sample to test revenue.' },
              { name: 'Sample of Customer POs, Sales Invoices, & Shipping Docs (Bills of Lading)', type: 'request', description: 'For a selected sample, this evidence trail proves a valid sale occurred, goods were shipped (transfer of control), and the customer was billed correctly.' },
              { name: 'Credit Memos & Supporting Correspondence', type: 'request', description: 'For a selected sample of credit memos, the auditor needs to see the authorization and reason for issuing credit to a customer (e.g., for a product return).' },
              { name: 'Rebate and Discount Calculation', type: 'request', description: 'The detailed calculation for significant customer rebates or discounts to ensure they are accounted for correctly as a reduction of revenue.' },
            ],
          },
        ],
      },
      {
        id: 'profit-allocation',
        name: 'Stage 4: Profit Allocation',
        description: 'This stage focuses on the unique co-operative aspects of the business. The audit risk is ensuring the Value Payment is calculated correctly and that profit retention and distribution are properly authorized and recorded.',
        steps: [
          {
            title: 'Profit Allocation',
            explanation: 'Profit allocation and value payment process.',
            controls: [],
            docs: [
              { name: 'Ornua Co-operative Rules / Bylaws', type: 'view', description: 'The governing document of the co-operative, which outlines the principles for profit distribution and member payments.' },
              { name: 'Policy on Calculating the Ornua Value Payment', type: 'view', description: 'A formal policy document explaining the methodology and formula used to calculate the annual bonus payment to members.' },
              { name: 'Board Meeting Minutes (Approving the Value Payment)', type: 'request', description: 'The official minutes where the Board of Directors formally approves the total amount of the Value Payment to be distributed for the year. This is a key authorization control.' },
              { name: 'Value Payment Calculation Schedule', type: 'request', description: 'The detailed spreadsheet or report showing the calculation of the Value Payment, allocating the total pool to individual member co-operatives based on their supply volumes and other criteria.' },
              { name: 'Sample of Payment Advices to Members', type: 'request', description: 'For a selected sample of members, the formal communication and payment remittance advice detailing their share of the Value Payment.' },
              { name: 'General Ledger entry for the Value Payment Liability', type: 'request', description: 'The journal entry to record the liability for the Value Payment at year-end, ensuring it is accrued correctly in the financial statements.' },
            ],
          },
        ],
      },
    ],
  },
];

interface RequestedDoc {
  name: string;
  process: string;
  step: string;
  requestedAt: string;
  auditor: string;
  source: string;
  trigger: string;
  status: 'Requested' | 'Received';
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className="fixed top-8 right-8 z-[100] bg-green-700 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
      {message}
    </div>
  );
}

export default function ProcessWalkthroughLibrary() {
  const [selectedEntity, setSelectedEntity] = useState(entities[0]);
  const [search, setSearch] = useState('');
  const [selectedProcess, setSelectedProcess] = useState(selectedEntity.processes[0]);
  const [currentStep, setCurrentStep] = useState(0);
  const [requestedDocs, setRequestedDocs] = useState<RequestedDoc[]>([]);
  const [showTable, setShowTable] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [docTableFilter, setDocTableFilter] = useState('');

  // Helper to handle document request
  const handleRequestDoc = (doc: any, process: any, step: any) => {
    const now = new Date();
    setRequestedDocs(prev => [
      ...prev,
      {
        name: doc.name,
        process: process.name,
        step: step.title,
        requestedAt: now.toLocaleString(),
        auditor: 'Nandini Mpe',
        source: selectedEntity.name,
        trigger: 'User',
        status: 'Requested',
      },
    ]);
    setToast(`Requested: ${doc.name}`);
  };

  const handleMarkReceived = (idx: number) => {
    setRequestedDocs(prev => prev.map((doc, i) => i === idx ? { ...doc, status: 'Received' } : doc));
    setToast('Document marked as received');
  };

  // Filtered process list
  const filteredProcesses = useMemo(() => {
    return selectedEntity.processes.filter((p: any) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [selectedEntity, search]);

  // Filtered requested docs
  const filteredRequestedDocs = requestedDocs.filter(doc =>
    doc.name.toLowerCase().includes(docTableFilter.toLowerCase()) ||
    doc.process.toLowerCase().includes(docTableFilter.toLowerCase()) ||
    doc.step.toLowerCase().includes(docTableFilter.toLowerCase())
  );

  const step = selectedProcess.steps[currentStep];

  return (
    <div className="flex h-full w-full bg-black text-white pt-24">
      {/* Toast Notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {/* Supporting Document Retrieval Table */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-4xl">
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg mb-6 p-4 relative">
          <button
            className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-gray-300"
            onClick={() => setShowTable(v => !v)}
            aria-label={showTable ? 'Hide Table' : 'Show Table'}
          >{showTable ? 'Hide' : 'Show'}</button>
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            Requested Supporting Documents
            <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">{requestedDocs.length}</span>
          </h2>
          {showTable && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <input
                  className="rounded bg-zinc-800 border border-zinc-700 px-2 py-1 text-sm w-64"
                  placeholder="Filter by document, process, or step..."
                  value={docTableFilter}
                  onChange={e => setDocTableFilter(e.target.value)}
                />
                <button
                  className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-gray-300"
                  onClick={() => setDocTableFilter('')}
                >Clear</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-zinc-800">
                      <th className="p-2 text-left">Document</th>
                      <th className="p-2 text-left">Process</th>
                      <th className="p-2 text-left">Step</th>
                      <th className="p-2 text-left">Requested At</th>
                      <th className="p-2 text-left">Auditor</th>
                      <th className="p-2 text-left">Source</th>
                      <th className="p-2 text-left">Trigger</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequestedDocs.length === 0 ? (
                      <tr><td colSpan={9} className="text-center text-gray-400 p-4">No documents requested yet.</td></tr>
                    ) : (
                      filteredRequestedDocs.map((doc, i) => (
                        <tr key={i} className="border-b border-zinc-800 group hover:bg-zinc-800 transition">
                          <td className="p-2">
                            <span title={doc.name}>{doc.name}</span>
                          </td>
                          <td className="p-2">{doc.process}</td>
                          <td className="p-2">{doc.step}</td>
                          <td className="p-2">{doc.requestedAt}</td>
                          <td className="p-2">{doc.auditor}</td>
                          <td className="p-2">{doc.source}</td>
                          <td className="p-2">{doc.trigger}</td>
                          <td className="p-2">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${doc.status === 'Requested' ? 'bg-yellow-600 text-white' : 'bg-green-600 text-white'}`}
                              title={doc.status === 'Requested' ? 'Awaiting document' : 'Document received'}
                            >{doc.status}</span>
                          </td>
                          <td className="p-2">
                            {doc.status === 'Requested' && (
                              <button
                                className="text-xs px-2 py-1 rounded bg-green-700 hover:bg-green-800 text-white"
                                onClick={() => handleMarkReceived(requestedDocs.findIndex(d => d === doc))}
                                title="Mark as Received"
                              >Mark as Received</button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Sidebar */}
      <aside className="w-80 bg-[var(--sidebar-background)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] flex flex-col p-4 shadow-lg">
        <div className="mb-4">
          <label className="block text-xs mb-1">Entity</label>
          <select
            className="w-full rounded bg-[var(--input)] border border-[var(--border)] px-2 py-1 text-sm focus:ring-2 focus:ring-[var(--sidebar-ring)] focus:outline-none text-[var(--sidebar-foreground)]"
            value={selectedEntity.id}
            onChange={e => {
              const entity = entities.find(ent => ent.id === e.target.value)!;
              setSelectedEntity(entity);
              setSelectedProcess(entity.processes[0]);
              setCurrentStep(0);
            }}
          >
            {entities.map(ent => (
              <option key={ent.id} value={ent.id}>{ent.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <input
            className="w-full rounded bg-[var(--input)] border border-[var(--border)] px-2 py-1 text-sm focus:ring-2 focus:ring-[var(--sidebar-ring)] focus:outline-none text-[var(--sidebar-foreground)]"
            placeholder="Search processes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="text-xs text-[var(--sidebar-foreground)] mb-2">Processes</div>
          <ul>
            {filteredProcesses.map((proc: any) => (
              <li key={proc.id}>
                <Button
                  variant={proc.id === selectedProcess.id ? 'default' : 'outline'}
                  className={`w-full text-left px-2 py-2 rounded mb-1 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--sidebar-ring)] ${proc.id === selectedProcess.id ? '' : 'hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]'}`}
                  onClick={() => { setSelectedProcess(proc); setCurrentStep(0); }}
                  aria-current={proc.id === selectedProcess.id ? 'step' : undefined}
                >
                  {proc.name}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-8 overflow-y-auto bg-[var(--background)]">
        <div className="w-full max-w-3xl">
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-1 tracking-tight text-[var(--primary)] drop-shadow">{selectedEntity.name} – {selectedProcess.name}</h2>
            <div className="text-[var(--muted-foreground)] text-base mb-2 italic">{selectedProcess.description}</div>
          </div>
          {/* Show Ornua Rive animation only for Ornua's Business Model process */}
          {selectedEntity.id === 'ornua' && selectedProcess.id === 'business-model' ? (
            <OrnuaRiveAnimation step={currentStep} />
          ) : (
            <RiveAnimation step={currentStep} />
          )}
          {/* Step Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {selectedProcess.steps.map((s: any, i: number) => (
                <Button
                  key={i}
                  variant={i === currentStep ? 'default' : 'outline'}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${i === currentStep ? '' : 'hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'}`}
                  onClick={() => setCurrentStep(i)}
                  aria-current={i === currentStep ? 'step' : undefined}
                >
                  {s.title}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="px-3 py-1 rounded text-xs"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(currentStep - 1)}
              >Back</Button>
              <Button
                variant="outline"
                className="px-3 py-1 rounded text-xs"
                disabled={currentStep === selectedProcess.steps.length - 1}
                onClick={() => setCurrentStep(currentStep + 1)}
              >Next</Button>
            </div>
          </div>
          {/* Step Narrative Panel */}
          <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-lg p-6 mb-4 shadow-lg border border-[var(--border)]">
            <h3 className="text-lg font-semibold mb-2 text-[var(--primary)] drop-shadow">{step.title}</h3>
            <div className="mb-2 text-[var(--muted-foreground)]">{step.explanation}</div>
            <div className="mb-2">
              <div className="font-semibold text-sm mb-1">Key Controls / Points of Interest</div>
              <ul className="list-disc ml-6 text-sm text-[var(--foreground)]">
                {step.controls.map((ctrl: string, i: number) => <li key={i}>{ctrl}</li>)}
              </ul>
            </div>
            <div className="mb-2">
              <div className="font-semibold text-sm mb-1">Supporting Documents</div>
              <ul className="list-none ml-0 text-sm">
                {step.docs.map((doc: any, i: number) => (
                  <li key={i} className="flex items-center gap-2 mb-1 group">
                    <span
                      className="text-[var(--primary)] underline cursor-pointer group-hover:text-[var(--primary-foreground)]"
                      title={doc.description}
                      tabIndex={0}
                    >{doc.name}</span>
                    {doc.type === 'preview' && <span className="text-xs text-[var(--muted-foreground)]">Preview</span>}
                    {doc.type === 'view' && <span className="text-xs text-[var(--muted-foreground)]">View</span>}
                    {doc.type === 'request' && (
                      <Button
                        variant="default"
                        className="ml-2 text-xs px-2 py-1 rounded"
                        onClick={() => handleRequestDoc(doc, selectedProcess, step)}
                        title="Request this document"
                      >Request</Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant="default"
                className="px-3 py-1 rounded text-xs"
                onClick={() => setToast('Evidence request triggered!')}
              >Request Evidence</Button>
              <span className="text-xs text-[var(--muted-foreground)]">Status: <span className="text-green-400">In Progress</span></span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-[var(--muted)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] transition-all"
              style={{ width: `${((currentStep + 1) / selectedProcess.steps.length) * 100}%` }}
            />
          </div>
        </div>
      </main>
    </div>
  );
} 