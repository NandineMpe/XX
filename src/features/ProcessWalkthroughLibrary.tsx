import React, { useState } from 'react';
import { useRive } from '@rive-app/react-canvas';
import Button from '@/components/ui/Button';
import { useDocumentRequestStore } from '@/stores/documentRequests';
import { v4 as uuidv4 } from 'uuid';
import { Sidebar } from '@/components/ui/modern-side-bar';
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
              { name: 'Inventory Count Instructions & Procedures', type: 'view', description: 'The company\'s standard procedures for conducting physical inventory counts (e.g., year-end stock-take).' },
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
              { name: 'Credit Control & Customer Onboarding Policy', type: 'view', description: 'The policy for assessing new customers\' creditworthiness and setting them up in the system.' },
              { name: 'Sales General Ledger / Sales Journal', type: 'request', description: 'The complete listing of all sales transactions. This is the population from which an auditor selects a sample to test revenue.' },
              { name: 'Sample of Customer POs, Sales Invoices, & Shipping Docs (Bills of Lading)', type: 'request', description: 'For a selected sample, this evidence trail proves a valid sale occurred, goods were shipped (transfer of control), and the customer was billed correctly.' },
              { name: 'Credit Memos & Supporting Correspondence', type: 'request', description: 'For a selected sample of credit memos, the auditor needs to see the authorization and reason for issuing credit to a customer (e.g., for a product return).' },
              { name: 'Rebate and Discount Calculation', type: 'request', description: 'The detailed calculation for significant customer rebates or discounts to ensure they are accounted for correctly as a reduction of revenue.' },
            ],
          },
          {
            title: 'Profit Allocation',
            explanation: 'This stage focuses on the unique co-operative aspects of the business. The audit risk is ensuring the "Value Payment" is calculated correctly and that profit retention and distribution are properly authorized and recorded.',
            controls: [],
            docs: [
              { name: 'Ornua Co-operative Rules / Bylaws', type: 'view', description: 'The governing document of the co-operative, which outlines the principles for profit distribution and member payments.' },
              { name: 'Policy on Calculating the "Ornua Value Payment"', type: 'view', description: 'A formal policy document explaining the methodology and formula used to calculate the annual bonus payment to members.' },
              { name: 'Board Meeting Minutes (Approving the Value Payment)', type: 'request', description: 'The official minutes where the Board of Directors formally approves the total amount of the Value Payment to be distributed for the year. This is a key authorization control.' },
              { name: 'Value Payment Calculation Schedule', type: 'request', description: 'The detailed spreadsheet or report showing the calculation of the Value Payment, allocating the total pool to individual member co-operatives based on their supply volumes and other criteria.' },
              { name: 'Sample of Payment Advices to Members', type: 'request', description: 'For a selected sample of members, the formal communication and payment remittance advice detailing their share of the Value Payment.' },
              { name: 'General Ledger entry for the Value Payment Liability', type: 'request', description: 'The journal entry to record the liability for the Value Payment at year-end, ensuring it is accrued correctly in the financial statements.' },
            ],
          },
        ],
      },
      {
        id: 'intercompany-transactions',
        name: 'Intercompany Transactions & Transfer Pricing',
        description: 'Process for managing intercompany transactions and transfer pricing compliance.',
        steps: [
          {
            title: 'Transfer Pricing Policy',
            explanation: 'This stage covers the establishment and maintenance of transfer pricing policies across Ornua entities.',
            controls: [],
            docs: [
              { name: 'Transfer Pricing Policy Document', type: 'view', description: 'Comprehensive policy outlining transfer pricing methodologies and compliance requirements.' },
              { name: 'Intercompany Agreement Templates', type: 'view', description: 'Standard templates for intercompany agreements between Ornua entities.' },
              { name: 'Transfer Pricing Documentation', type: 'request', description: 'Annual transfer pricing documentation including benchmarking studies and compliance reports.' },
            ],
          },
          {
            title: 'Transaction Processing',
            explanation: 'This stage focuses on the processing and recording of intercompany transactions.',
            controls: [],
            docs: [
              { name: 'Intercompany Transaction Procedures', type: 'view', description: 'Standard operating procedures for processing intercompany transactions.' },
              { name: 'Intercompany Reconciliation Reports', type: 'request', description: 'Monthly reconciliation reports showing intercompany balances and transactions.' },
              { name: 'Sample of Intercompany Invoices', type: 'request', description: 'Sample invoices for intercompany transactions to verify pricing and documentation.' },
            ],
          },
        ],
      },
      {
        id: 'trade-promotion',
        name: 'Trade Promotion & Rebate Management',
        description: 'Process for managing trade promotions and customer rebates.',
        steps: [
          {
            title: 'Promotion Planning',
            explanation: 'This stage covers the planning and approval of trade promotions and rebate programs.',
            controls: [],
            docs: [
              { name: 'Trade Promotion Policy', type: 'view', description: 'Policy document outlining trade promotion guidelines and approval processes.' },
              { name: 'Promotion Budget Planning', type: 'request', description: 'Annual budget planning documents for trade promotions and rebates.' },
              { name: 'Promotion Approval Workflow', type: 'view', description: 'Documentation of the approval workflow for trade promotions.' },
            ],
          },
          {
            title: 'Rebate Calculation & Processing',
            explanation: 'This stage focuses on the calculation and processing of customer rebates.',
            controls: [],
            docs: [
              { name: 'Rebate Calculation Procedures', type: 'view', description: 'Standard procedures for calculating customer rebates based on sales volumes.' },
              { name: 'Rebate Accrual Calculations', type: 'request', description: 'Monthly rebate accrual calculations and supporting documentation.' },
              { name: 'Sample of Rebate Payments', type: 'request', description: 'Sample rebate payment documentation and supporting calculations.' },
            ],
          },
        ],
      },
      {
        id: 'commodity-procurement',
        name: 'Commodity Procurement & Hedging',
        description: 'Process for managing commodity procurement and hedging activities.',
        steps: [
          {
            title: 'Procurement Strategy',
            explanation: 'This stage covers the development and execution of commodity procurement strategies.',
            controls: [],
            docs: [
              { name: 'Commodity Procurement Policy', type: 'view', description: 'Policy document outlining commodity procurement strategies and risk management.' },
              { name: 'Hedging Policy & Procedures', type: 'view', description: 'Comprehensive policy for hedging activities and derivative instruments.' },
              { name: 'Procurement Contracts', type: 'request', description: 'Sample of key commodity procurement contracts and agreements.' },
            ],
          },
          {
            title: 'Hedging Activities',
            explanation: 'This stage focuses on hedging activities and derivative instrument management.',
            controls: [],
            docs: [
              { name: 'Hedging Documentation', type: 'request', description: 'Documentation of hedging activities including hedge effectiveness testing.' },
              { name: 'Derivative Position Reports', type: 'request', description: 'Monthly reports showing derivative positions and fair value calculations.' },
              { name: 'Risk Management Reports', type: 'request', description: 'Regular risk management reports covering commodity price exposure.' },
            ],
          },
        ],
      },
      {
        id: 'cooperative-value',
        name: 'Co-operative Value Payment Calculation & Distribution',
        description: 'Process for calculating and distributing co-operative value payments to members.',
        steps: [
          {
            title: 'Value Payment Calculation',
            explanation: 'This stage covers the calculation of co-operative value payments based on member contributions.',
            controls: [],
            docs: [
              { name: 'Value Payment Calculation Policy', type: 'view', description: 'Detailed policy for calculating co-operative value payments.' },
              { name: 'Member Contribution Reports', type: 'request', description: 'Annual reports showing member contributions and participation levels.' },
              { name: 'Value Payment Calculation Models', type: 'request', description: 'Mathematical models and spreadsheets used for value payment calculations.' },
            ],
          },
          {
            title: 'Distribution Process',
            explanation: 'This stage focuses on the distribution of value payments to member co-operatives.',
            controls: [],
            docs: [
              { name: 'Distribution Procedures', type: 'view', description: 'Standard procedures for distributing value payments to members.' },
              { name: 'Payment Authorization Documents', type: 'request', description: 'Board authorization documents for value payment distributions.' },
              { name: 'Member Payment Records', type: 'request', description: 'Records of value payments made to individual member co-operatives.' },
            ],
          },
        ],
      },
      {
        id: 'supply-chain',
        name: 'Global Supply Chain & Logistics Management',
        description: 'Process for managing global supply chain and logistics operations.',
        steps: [
          {
            title: 'Supply Chain Planning',
            explanation: 'This stage covers supply chain planning and optimization across global operations.',
            controls: [],
            docs: [
              { name: 'Supply Chain Strategy', type: 'view', description: 'Comprehensive supply chain strategy document outlining global operations.' },
              { name: 'Logistics Network Design', type: 'view', description: 'Documentation of global logistics network design and optimization.' },
              { name: 'Supply Chain Performance Reports', type: 'request', description: 'Regular performance reports covering supply chain metrics and KPIs.' },
            ],
          },
          {
            title: 'Logistics Operations',
            explanation: 'This stage focuses on day-to-day logistics operations and transportation management.',
            controls: [],
            docs: [
              { name: 'Logistics Operating Procedures', type: 'view', description: 'Standard operating procedures for logistics and transportation operations.' },
              { name: 'Transportation Contracts', type: 'request', description: 'Sample of key transportation and logistics service contracts.' },
              { name: 'Logistics Cost Analysis', type: 'request', description: 'Detailed analysis of logistics costs and efficiency metrics.' },
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
  {
    id: 'ornua-foods-na',
    name: 'Ornua Foods North America, Inc.',
    processes: [
      {
        id: 'business-model',
        name: 'Business Model',
        description: 'Business model for Ornua Foods North America.',
        steps: [],
      },
    ],
  },
  {
    id: 'ornua-ingredients-uk',
    name: 'Ornua Ingredients UK Limited',
    processes: [
      {
        id: 'business-model',
        name: 'Business Model',
        description: 'Business model for Ornua Ingredients UK.',
        steps: [],
      },
    ],
  },
  {
    id: 'ornua-cooperative',
    name: 'Ornua Co-operative Limited (Parent/HQ)',
    processes: [
      {
        id: 'business-model',
        name: 'Business Model',
        description: 'Business model for Ornua Co-operative Limited.',
        steps: [],
      },
    ],
  },
  {
    id: 'kerrygold-company',
    name: 'The Kerrygold Company Limited (Holding Company)',
    processes: [
      {
        id: 'business-model',
        name: 'Business Model',
        description: 'Business model for The Kerrygold Company Limited.',
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
    src: 'https://ifonjarzvpechegr.public.blob.vercel-storage.com/Augentik%20Assets/ornua_bm.riv',
    autoplay: true,
    stateMachines: 'State Machine 1',
  });

  React.useEffect(() => {
    if (rive && rive.ready) {
      // Automatically play the state machine
      rive.play();
    }
  }, [rive]);

  return (
    <div className="w-full flex justify-center mb-6">
      <div className="max-w-4xl w-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg p-4 flex items-center justify-center" style={{ margin: '0 auto' }}>
        <div style={{ width: '100%', height: 500, position: 'relative' }}>
          <RiveComponent style={{ width: '100%', height: '100%' }} />
        </div>
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
      auditor: 'Sam Salt',
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
    <div className="flex h-full w-full bg-black text-white">
      {/* Toast Notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {/* Sidebar */}
      <Sidebar
        entities={entities}
        selectedEntity={selectedEntity}
        selectedProcess={selectedProcess}
        onEntityChange={(entity) => {
          setSelectedEntity(entity);
          setSelectedProcess(entity.processes[0]);
          setCurrentStep(0);
        }}
        onProcessChange={(process) => {
          setSelectedProcess(process);
          setCurrentStep(0);
        }}
      />
      {/* Main Content */}
      <main className="flex-1 p-8 pt-32">
        {/* Glassmorphic Progress Bar for Stages */}
        <div className="w-full max-w-4xl mx-auto mb-8">
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
              className="absolute left-0 top-1/2 h-2 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full -z-10 transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / selectedProcess.steps.length) * 100}%`,
                transform: 'translateY(-50%)',
                opacity: 0.7,
              }}
            />
          </div>
            </div>

        <h1 className="text-3xl font-bold mb-4">{selectedEntity.name}</h1>
        <h2 className="text-2xl font-semibold mb-4">{selectedProcess.name}</h2>
        <p className="text-lg mb-8 text-gray-300">{selectedProcess.description}</p>

        {/* Rive player for Business Model process */}
        {selectedProcess.id === 'business-model' && (
          <div className="w-full flex justify-center mb-12">
            <div className="w-full max-w-5xl rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg p-6 flex items-center justify-center">
              <OrnuaBusinessModel />
            </div>
          </div>
        )}

        {/* Key Documents for the current step only */}
        {step && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6 text-white">Key Documents</h3>
            <div className="grid gap-4">
              {step.docs.map((doc, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-white">{doc.name}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          doc.type === 'view' 
                            ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' 
                            : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        }`}>
                          {doc.type === 'view' ? 'View' : 'Request'}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{doc.description}</p>
                    </div>
                    <div className="ml-4">
                      {doc.type === 'view' ? (
                        <button
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                          onClick={() => {/* TODO: Implement view logic if available */}}
                        >
                          View Document
                        </button>
                      ) : (
                        <Button
                          variant="outline"
                          className="px-4 py-2 border-orange-500/30 text-orange-300 hover:bg-orange-500/10 transition-colors duration-200"
                          onClick={() => handleRequestDoc(doc, selectedProcess, step)}
                        >
                          Request Document
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 