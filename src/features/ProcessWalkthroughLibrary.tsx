import React, { useState } from 'react';
import { useRive } from '@rive-app/react-canvas';
import Button from '@/components/ui/Button';
import { useDocumentRequestStore } from '@/stores/documentRequests';
import { v4 as uuidv4 } from 'uuid';
// Mock config/data
const entities = [
  {
    id: 'ornua',
    name: 'Ornua',
    processes: [
      {
        id: 'business-model',
        name: 'Business Model',
        description: 'Interactive business model of Ornua.',
        steps: [
          {
            title: 'Dairy Procurement',
            explanation: 'This stage focuses on how Ornua buys dairy from its member co-operatives. The key audit risk is ensuring the cost of goods sold is accurately recorded and that the process is managed correctly.',
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
          {
            title: 'Value-Addition Process',
            explanation: 'This stage covers the internal processes of transforming raw materials into finished goods. The audit focus is on inventory valuation, cost allocation, and production controls.',
            controls: [],
            docs: [
              { name: 'Inventory Valuation Policy', type: 'view', description: 'The accounting policy explaining how inventory (raw materials, work-in-progress, finished goods) is valued (e.g., FIFO, weighted average) and how overheads are capitalized.' },
              { name: 'Standard Costing Sheets', type: 'view', description: 'Documents showing the standard cost build-up for key products (e.g., a case of Kerrygold butter), including materials, labor, and overhead.' },
              { name: 'Production Process Flowcharts', type: 'view', description: 'Visual diagrams of the production process at facilities like Kerrygold Park, showing key stages and control points.' },
              { name: 'Bill of Materials (BOM) for Key Products', type: 'view', description: 'A standard list of all raw materials and components required to produce a finished good.' },
              { name: 'Inventory Count Instructions & Procedures', type: 'view', description: 'The company’s standard procedures for conducting physical inventory counts (e.g., year-end stock-take).' },
              { name: 'Detailed Inventory Listing (by location)', type: 'request', description: 'A complete listing of all inventory on hand at a specific date. This is the population for selecting samples for physical verification and valuation testing.' },
              { name: 'Sample of Production Work Orders', type: 'request', description: 'For a selected sample, these documents show the authorization to produce a certain quantity of goods and track the materials used.' },
              { name: 'Overhead Allocation Calculation', type: 'request', description: 'The detailed calculation showing how factory overhead costs (rent, utilities, indirect labor) were allocated to the cost of inventory during the period.' },
            ],
          },
          {
            title: 'Global Sales and Revenue Generation',
            explanation: 'This is a critical stage focusing on revenue recognition. The audit needs to confirm that revenue is recorded completely, accurately, and in the correct period, in line with accounting standards (e.g., IFRS 15).',
            controls: [],
            docs: [
              { name: 'Revenue Recognition Policy', type: 'view', description: 'The formal accounting policy detailing when and how the company recognizes revenue for its two main streams (Foods and Ingredients). This is a foundational document.' },
              { name: 'Standard Customer Contracts / Master Sales Agreements', type: 'view', description: 'Template agreements for major retailers (Ornua Foods) and B2B clients (Ornua Ingredients) outlining shipping terms (Incoterms), payment terms, and rebate structures.' },
              { name: 'Published Price Lists / Catalogs', type: 'view', description: 'Standard price lists for consumer products or ingredient categories.' },
              { name: 'Credit Control & Customer Onboarding Policy', type: 'view', description: 'The policy for assessing new customers’ creditworthiness and setting them up in the system.' },
              { name: 'Sales General Ledger / Sales Journal', type: 'request', description: 'The complete listing of all sales transactions. This is the population from which an auditor selects a sample to test revenue.' },
              { name: 'Sample of Customer POs, Sales Invoices, & Shipping Docs (Bills of Lading)', type: 'request', description: 'For a selected sample, this evidence trail proves a valid sale occurred, goods were shipped (transfer of control), and the customer was billed correctly.' },
              { name: 'Credit Memos & Supporting Correspondence', type: 'request', description: 'For a selected sample of credit memos, the auditor needs to see the authorization and reason for issuing credit to a customer (e.g., for a product return).' },
              { name: 'Rebate and Discount Calculation', type: 'request', description: 'The detailed calculation for significant customer rebates or discounts to ensure they are accounted for correctly as a reduction of revenue.' },
            ],
          },
          {
            title: 'Profit Allocation',
            explanation: 'This stage focuses on the unique co-operative aspects of the business. The audit risk is ensuring the “Value Payment” is calculated correctly and that profit retention and distribution are properly authorized and recorded.',
            controls: [],
            docs: [
              { name: 'Ornua Co-operative Rules / Bylaws', type: 'view', description: 'The governing document of the co-operative, which outlines the principles for profit distribution and member payments.' },
              { name: 'Policy on Calculating the “Ornua Value Payment”', type: 'view', description: 'A formal policy document explaining the methodology and formula used to calculate the annual bonus payment to members.' },
              { name: 'Board Meeting Minutes (Approving the Value Payment)', type: 'request', description: 'The official minutes where the Board of Directors formally approves the total amount of the Value Payment to be distributed for the year. This is a key authorization control.' },
              { name: 'Value Payment Calculation Schedule', type: 'request', description: 'The detailed spreadsheet or report showing the calculation of the Value Payment, allocating the total pool to individual member co-operatives based on their supply volumes and other criteria.' },
              { name: 'Sample of Payment Advices to Members', type: 'request', description: 'For a selected sample of members, the formal communication and payment remittance advice detailing their share of the Value Payment.' },
              { name: 'General Ledger entry for the Value Payment Liability', type: 'request', description: 'The journal entry to record the liability for the Value Payment at year-end, ensuring it is accrued correctly in the financial statements.' },
            ],
          },
        ],
      },
      {
        id: 'impairment-process',
        name: 'Impairment Process',
        description: 'Impairment process (not clickable)',
        steps: [],
      },
      {
        id: 'inventory-process',
        name: 'Inventory Process',
        description: 'Inventory process (not clickable)',
        steps: [],
      },
    ],
  },
];

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className='fixed top-8 right-8 z-[100] bg-green-700 text-white px-4 py-2 rounded shadow-lg animate-fade-in'>
      {message}
    </div>
  );
}

function OrnuaBusinessModel() {
  const { RiveComponent, rive } = useRive({
    src: 'https://ifonjarzvpechegr.public.blob.vercel-storage.com/Augentik%20Assets/Ornua%20BM.riv',
    autoplay: false,
  });

  React.useEffect(() => {
    if (rive && rive.ready) {
      rive.play();
    }
  }, [rive]);

  const handlePause = () => {
    if (rive) rive.pause();
  };
  const handlePlay = () => {
    if (rive) rive.play();
  };

  return (
    <div style={{ width: 600, height: 400, position: 'relative' }}>
      <RiveComponent style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: 8 }}>
        <button onClick={handlePlay} style={{ padding: '4px 12px', borderRadius: 4, background: '#22c55e', color: 'white', border: 'none', cursor: 'pointer' }}>Play</button>
        <button onClick={handlePause} style={{ padding: '4px 12px', borderRadius: 4, background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}>Pause</button>
      </div>
    </div>
  );
}

export default function ProcessWalkthroughLibrary() {
  const [selectedEntity, setSelectedEntity] = useState(entities[0]);
  const [selectedProcess, setSelectedProcess] = useState(selectedEntity.processes[0]);
  const [currentStep, setCurrentStep] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const addRequest = useDocumentRequestStore((s) => s.addRequest);

  // Helper to handle document request
  const handleRequestDoc = (doc: any, process: any, step: any) => {
    const now = new Date();
    addRequest({
      id: uuidv4(),
      auditor: 'Nandini Mpe',
      document: doc.name,
      date: now.toISOString().slice(0, 10),
      source: selectedEntity.name,
      method: 'Manual',
      status: 'Requested',
      lastUpdate: now.toISOString(),
      auditTrail: [{ status: 'Requested', at: now.toISOString() }],
      attachments: [],
    });
    setToast(`Requested: ${doc.name}`);
  };

  const step = selectedProcess.steps[currentStep];

  return (
    <div className="flex h-full w-full bg-black text-white pt-24">
      {/* Toast Notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {/* Sidebar */}
      <aside className="w-80 bg-[var(--sidebar-background)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] flex flex-col p-4 shadow-lg pt-24">
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
        <div className="flex-1 overflow-y-auto">
          <div className="text-xs text-[var(--sidebar-foreground)] mb-2">Processes</div>
          <ul>
            <li>
              <Button
                variant={selectedProcess.id === 'business-model' ? 'default' : 'outline'}
                className={`w-full text-left px-2 py-2 rounded mb-1 font-medium focus:outline-none focus:ring-2 focus:ring-[var(--sidebar-ring)]`}
                onClick={() => {
                  setSelectedProcess(selectedEntity.processes[0]);
                  setCurrentStep(0);
                }}
                aria-current={selectedProcess.id === 'business-model' ? 'step' : undefined}
              >
                Business Model
              </Button>
              </li>
          </ul>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Glassmorphic Progress Bar for Stages */}
        <div className="w-full max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between gap-2 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg border border-white/20" style={{ position: 'relative' }}>
              {selectedProcess.steps.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <button
                  className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-200 font-bold text-lg ${i === currentStep ? 'bg-white/80 text-black border-primary shadow-lg scale-110' : 'bg-white/20 text-white border-white/30 hover:bg-white/30 hover:text-primary'}`}
                  style={{ backdropFilter: 'blur(8px)' }}
                  onClick={() => setCurrentStep(i)}
                  aria-current={i === currentStep ? 'step' : undefined}
                  title={s.title}
                >
                  {i + 1}
                </button>
                <span className={`mt-2 text-xs font-medium ${i === currentStep ? 'text-primary' : 'text-white/70'}`}>{s.title}</span>
              </div>
            ))}
            {/* Glass bar effect */}
            <div className="absolute left-0 top-1/2 w-full h-2 bg-white/20 rounded-full -z-10" style={{ transform: 'translateY(-50%)', backdropFilter: 'blur(8px)' }} />
            <div
              className="absolute left-0 top-1/2 h-2 bg-gradient-to-r from-primary to-blue-400 rounded-full -z-10 transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / selectedProcess.steps.length) * 100}%`,
                transform: 'translateY(-50%)',
                opacity: 0.7,
              }}
            />
          </div>
            </div>

        <h1 className="text-2xl font-bold mb-4">{selectedEntity.name}</h1>
        <h2 className="text-xl font-semibold mb-4">{selectedProcess.name}</h2>
        <p className="text-lg mb-4">{selectedProcess.description}</p>

        {/* Rive player for Business Model process */}
        {selectedProcess.id === 'business-model' && (
          <div className="w-full flex justify-center mb-6">
            <div className="max-w-xl w-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg p-4 flex items-center justify-center" style={{ margin: '0 auto' }}>
              <OrnuaBusinessModel />
            </div>
          </div>
        )}

        {/* Key Documents for the current step only */}
        {step && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">Key Documents</h3>
            <ul className="list-disc pl-5">
              {step.docs.map((doc, index) => (
                <li key={index} className="text-sm mb-1 flex items-center gap-2">
                  {doc.type === 'view' ? (
                    <span
                      className="font-medium underline text-blue-400 cursor-pointer hover:text-blue-300 transition"
                      title="Click to view document"
                      tabIndex={0}
                      onClick={() => {/* TODO: Implement view logic if available */}}
                    >
                      {doc.name}
                    </span>
                  ) : (
                    <span className="font-medium">{doc.name}</span>
                  )}
                  <span className="italic">[{doc.type === 'view' ? 'View' : 'Request'}]</span> - {doc.description}
                  {doc.type === 'request' && (
                    <Button
                      variant="outline"
                      className="ml-2 text-xs"
                      onClick={() => handleRequestDoc(doc, selectedProcess, step)}
                    >
                      Request
                    </Button>
                  )}
                  </li>
                ))}
              </ul>
            </div>
        )}
      </main>
    </div>
  );
} 