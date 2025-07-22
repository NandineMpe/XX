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

function OrnuaBusinessModel() {
  const { RiveComponent, rive } = useRive({
    src: 'https://ifonjarzvpechegr.public.blob.vercel-storage.com/Augentik%20Assets/Ornua%20BM.riv',
    autoplay: true,
  });

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
          </ul>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">{selectedEntity.name}</h1>
        <h2 className="text-xl font-semibold mb-4">{selectedProcess.name}</h2>
        <p className="text-lg mb-4">{selectedProcess.description}</p>

        {step && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">{step.title}</h3>
            <p className="text-base mb-4">{step.explanation}</p>
            <ul className="list-disc pl-5 mb-4">
              {step.controls.map((control, index) => (
                <li key={index} className="text-sm mb-1">{control}</li>
              ))}
            </ul>
            <h4 className="text-base font-semibold mb-2">Documents</h4>
            <ul className="list-disc pl-5">
              {step.docs.map((doc, index) => (
                <li key={index} className="text-sm mb-1">
                  <span className="font-medium">{doc.name}</span> - {doc.description}
                  <Button
                    variant="outline"
                    className="ml-2 text-xs"
                    onClick={() => handleRequestDoc(doc, selectedProcess, step)}
                  >
                    Request
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          {currentStep > 0 && (
            <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>Previous</Button>
          )}
          {currentStep < selectedProcess.steps.length - 1 && (
            <Button variant="outline" onClick={() => setCurrentStep(prev => prev + 1)}>Next</Button>
          )}
        </div>
      </main>
    </div>
  );
}