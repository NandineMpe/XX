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
            explanation: 'Procurement of raw milk from farmers and suppliers, ensuring quality and traceability.',
            controls: [
              'Supplier vetting and onboarding',
              'Milk quality testing and traceability',
              'Contract management and pricing controls',
            ],
            docs: [
              { name: 'Milk Supply Contracts', type: 'view', description: 'Contracts with milk suppliers outlining terms and conditions.' },
              { name: 'Quality Test Reports', type: 'request', description: 'Lab reports for milk quality and safety.' },
              { name: 'Supplier Onboarding Checklist', type: 'view', description: 'Checklist for onboarding new suppliers.' },
            ],
          },
          {
            title: 'Value-Addition Process',
            explanation: 'Processing of raw milk into value-added products such as cheese, butter, and powders.',
            controls: [
              'Production batch controls',
              'Recipe and formulation management',
              'Equipment calibration and maintenance',
            ],
            docs: [
              { name: 'Production Batch Records', type: 'request', description: 'Records of each production batch.' },
              { name: 'Recipe Change Approvals', type: 'view', description: 'Approvals for any changes in product recipes.' },
              { name: 'Maintenance Logs', type: 'request', description: 'Logs of equipment maintenance and calibration.' },
            ],
          },
          {
            title: 'Global Sales and Revenue Generation',
            explanation: 'Sales of finished products to global markets, revenue recognition, and customer management.',
            controls: [
              'Sales order approval workflow',
              'Revenue recognition policy',
              'Customer credit checks',
            ],
            docs: [
              { name: 'Sales Invoices', type: 'request', description: 'Invoices issued to customers for product sales.' },
              { name: 'Revenue Recognition Policy', type: 'view', description: 'Company policy for recognizing revenue.' },
              { name: 'Customer Credit Reports', type: 'request', description: 'Reports on customer creditworthiness.' },
            ],
          },
          {
            title: 'Profit Allocation',
            explanation: 'Allocation of profits generated from global sales activities to members and reinvestment.',
            controls: [
              'Profit distribution approval',
              'Capital retention policy',
              'Member payout calculations',
            ],
            docs: [
              { name: 'Profit Distribution Statements', type: 'request', description: 'Statements showing profit allocation to members.' },
              { name: 'Board Approval Minutes', type: 'view', description: 'Minutes from board meetings approving profit allocation.' },
              { name: 'Capital Retention Schedules', type: 'view', description: 'Schedules showing retained capital for reinvestment.' },
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

export default function ProcessWalkthroughLibrary() {
  const [selectedEntity, setSelectedEntity] = useState(entities[0]);
  const [selectedProcess, setSelectedProcess] = useState(selectedEntity.processes[0]);
  const [currentStep, setCurrentStep] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const addRequest = useDocumentRequestStore((s) => s.addRequest);

  const { RiveComponent } = useRive({
    src: 'https://ifonjarzvpechegr.public.blob.vercel-storage.com/Augentik%20Assets/ornua_business_model.riv',
    autoplay: true,
  });

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
            <li>
              <div className="w-full text-left px-2 py-2 rounded mb-1 font-medium text-[var(--muted-foreground)] cursor-not-allowed opacity-60 select-none">
                Impairment Process
              </div>
            </li>
            <li>
              <div className="w-full text-left px-2 py-2 rounded mb-1 font-medium text-[var(--muted-foreground)] cursor-not-allowed opacity-60 select-none">
                Inventory Process
              </div>
            </li>
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
          {selectedProcess.id === 'business-model' ? (
            <div className='w-full h-96 bg-gray-900 flex items-center justify-center rounded-lg border border-gray-700 mb-6'>
              <RiveComponent style={{ width: '100%', height: '22rem', background: 'transparent' }} />
            </div>
          ) : null}
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