import React, { useState, useMemo } from 'react';
import Rive from '@rive-app/react-canvas';
// Rive animation for Ornua Business Model
const OrnuaRiveAnimation = () => (
  <div className="w-full h-96 bg-gray-900 flex items-center justify-center rounded-lg border border-gray-700 mb-6">
    <Rive src="https://ifonjarzvpechegr.public.blob.vercel-storage.com/drag_and_drop_elearning%20%2812%29.riv" style={{ width: '100%', height: '22rem', background: 'transparent' }} />
  </div>
);
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
        id: 'business-model',
        name: 'Business Model',
        description: 'Interactive business model of Ornua (company being audited).',
        steps: [
          {
            title: 'Business Model',
            explanation: 'Explore the interactive business model of Ornua.',
            controls: ['Drag and drop, click to explore nodes'],
            docs: [
              { name: 'Business Model Overview', type: 'view' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'kerry-gold',
    name: 'Kerry Gold',
    processes: [
      {
        id: 'revenue',
        name: 'Revenue Recognition',
        description: 'How revenue is recognized for Kerry Gold group.',
        steps: [
          {
            title: 'Design',
            explanation: 'Define revenue streams and recognition policies.',
            controls: ['Segregation of duties', 'Approval matrix'],
            docs: [
              { name: 'Revenue Policy', type: 'view' },
              { name: 'Sample Invoice', type: 'preview' },
            ],
          },
          {
            title: 'Contract Identification',
            explanation: 'Identify contracts with customers.',
            controls: ['Contract review checklist'],
            docs: [
              { name: 'Contract Template', type: 'view' },
            ],
          },
          {
            title: 'Testing',
            explanation: 'Test revenue transactions for compliance.',
            controls: ['Sample selection', 'Exception reporting'],
            docs: [
              { name: 'Test Results', type: 'preview' },
            ],
          },
        ],
      },
      {
        id: 'inventory',
        name: 'Inventory',
        description: 'Inventory management and controls.',
        steps: [
          {
            title: 'Design',
            explanation: 'Document inventory flow and controls.',
            controls: ['Physical count procedures'],
            docs: [
              { name: 'Inventory Policy', type: 'view' },
            ],
          },
        ],
      },
    ],
  },
];

export default function ProcessWalkthroughLibrary() {
  const [selectedEntity, setSelectedEntity] = useState(entities[0]);
  const [search, setSearch] = useState('');
  const [selectedProcess, setSelectedProcess] = useState(selectedEntity.processes[0]);
  const [currentStep, setCurrentStep] = useState(0);

  // Filtered process list
  const filteredProcesses = useMemo(() => {
    return selectedEntity.processes.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [selectedEntity, search]);

  const step = selectedProcess.steps[currentStep];

  return (
    <div className="flex h-full w-full bg-black text-white pt-24">
      {/* Sidebar */}
      <aside className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col p-4">
        <div className="mb-4">
          <label className="block text-xs mb-1">Entity</label>
          <select
            className="w-full rounded bg-zinc-800 border border-zinc-700 px-2 py-1 text-sm"
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
            className="w-full rounded bg-zinc-800 border border-zinc-700 px-2 py-1 text-sm"
            placeholder="Search processes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="text-xs text-gray-400 mb-2">Processes</div>
          <ul>
            {filteredProcesses.map(proc => (
              <li key={proc.id}>
                <button
                  className={`w-full text-left px-2 py-2 rounded mb-1 ${proc.id === selectedProcess.id ? 'bg-purple-900/40 text-white' : 'hover:bg-zinc-800 text-gray-300'}`}
                  onClick={() => { setSelectedProcess(proc); setCurrentStep(0); }}
                >
                  {proc.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-8 overflow-y-auto">
        <div className="w-full max-w-3xl">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-1">{selectedEntity.name} – {selectedProcess.name}</h2>
            <div className="text-gray-400 text-sm mb-2">{selectedProcess.description}</div>
          </div>
          {/* Show Ornua Rive animation only for Ornua's Business Model process */}
          {selectedEntity.id === 'ornua' && selectedProcess.id === 'business-model' ? (
            <OrnuaRiveAnimation />
          ) : (
            <RiveAnimation step={currentStep} />
          )}
          {/* Step Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {selectedProcess.steps.map((s, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${i === currentStep ? 'bg-primary text-white' : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'}`}
                  onClick={() => setCurrentStep(i)}
                >
                  {s.title}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(currentStep - 1)}
              >Back</button>
              <button
                className="px-3 py-1 rounded bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                disabled={currentStep === selectedProcess.steps.length - 1}
                onClick={() => setCurrentStep(currentStep + 1)}
              >Next</button>
            </div>
          </div>
          {/* Step Narrative Panel */}
          <div className="bg-zinc-800 rounded-lg p-6 mb-4 shadow">
            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
            <div className="mb-2 text-gray-300">{step.explanation}</div>
            <div className="mb-2">
              <div className="font-semibold text-sm mb-1">Key Controls / Points of Interest</div>
              <ul className="list-disc ml-6 text-sm text-gray-200">
                {step.controls.map((ctrl, i) => <li key={i}>{ctrl}</li>)}
              </ul>
            </div>
            <div className="mb-2">
              <div className="font-semibold text-sm mb-1">Supporting Documents</div>
              <ul className="list-none ml-0 text-sm">
                {step.docs.map((doc, i) => (
                  <li key={i} className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 underline cursor-pointer">{doc.name}</span>
                    {doc.type === 'preview' && <span className="text-xs text-gray-400">Preview</span>}
                    {doc.type === 'view' && <span className="text-xs text-gray-400">View</span>}
                    <button className="ml-2 text-xs px-2 py-1 rounded bg-purple-900/40 text-white hover:bg-purple-900/60">Request</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button
                className="px-3 py-1 rounded bg-green-700 text-white hover:bg-green-800 text-xs"
                onClick={() => alert('Evidence request triggered!')}
              >Request Evidence</button>
              <span className="text-xs text-gray-400">Status: <span className="text-green-400">In Progress</span></span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((currentStep + 1) / selectedProcess.steps.length) * 100}%` }}
            />
          </div>
        </div>
      </main>
    </div>
  );
} 