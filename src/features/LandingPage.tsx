/**
 * Augentik Landing Page with Spline Hero, 'Augentik In Action', 'Our Vision', and 'Integrations' sections
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import styles from './LandingNavButtons.module.css';
import { TubelightNavBar } from "@/components/ui/tubelight-navbar"
import { Home, User, Layers, LogIn } from "lucide-react"
import SectionWithMockup from "@/components/ui/section-with-mockup"

const splineUrl = 'https://ae7an1f5d2ydi587.public.blob.vercel-storage.com/Augentik/Augentik%20Spline.spline';
const logoUrl = 'https://ae7an1f5d2ydi587.public.blob.vercel-storage.com/Augentik/agentic%20logo.png';

const INTEGRATION_LOGOS = [
  { src: 'https://ae7an1f5d2ydi587.public.blob.vercel-storage.com/Augentik/svg%20logos/azure.svg', alt: 'Azure' },
  { src: 'https://ae7an1f5d2ydi587.public.blob.vercel-storage.com/Augentik/svg%20logos/drive%20%281%29.svg', alt: 'Google Drive' },
  { src: 'https://ae7an1f5d2ydi587.public.blob.vercel-storage.com/Augentik/svg%20logos/dropbox.svg', alt: 'Dropbox' },
  { src: 'https://ae7an1f5d2ydi587.public.blob.vercel-storage.com/Augentik/svg%20logos/gmail.svg', alt: 'Gmail' },
  { src: 'https://ae7an1f5d2ydi587.public.blob.vercel-storage.com/Augentik/svg%20logos/microsoft.svg', alt: 'Microsoft' },
  { src: 'https://ae7an1f5d2ydi587.public.blob.vercel-storage.com/Augentik/svg%20logos/outlook.svg', alt: 'Outlook' },
  { src: 'https://ae7an1f5d2ydi587.public.blob.vercel-storage.com/Augentik/svg%20logos/slack-wordmark.svg', alt: 'Slack' },
];

const TABS = [
  {
    key: 'supporting',
    label: 'Supporting Documents',
    heading: 'Intelligent Supporting Document Retrieval',
    subheading: 'Automates the response to auditor document requests.',
    description: `When external auditors send requests, the system automatically reads and classifies these requests, locates appropriate documents from internal repositories, and routes results for one-click approval before transmission. This eliminates hours of manual searching and reduces delays in "Provided By Client" (PBC) items while ensuring consistency across audit cycles.`,
    steps: [
      {
        title: 'Automated Document Requests',
        desc: 'Our AI reads auditor emails and automatically categorizes document requests for efficient processing.'
      },
      {
        title: 'Intelligent Document Retrieval',
        desc: 'The system searches your files and emails to locate the exact documents needed for each request.'
      },
      {
        title: 'One-Click Approval & Delivery',
        desc: 'Review suggested documents and approve with a single click, eliminating manual file handling.'
      }
    ]
  },
  {
    key: 'walkthroughs',
    label: 'Walkthroughs',
    heading: 'Process Walkthrough Library',
    subheading: 'Centralizes frequently requested process overviews into visual, easy-to-understand formats.',
    description: `This module centralizes frequently requested process overviews into visual, easy-to-understand formats that auditors can access independently. This module eliminates the client-side burden of re-explaining business processes year after year. From revenue recognition methodologies to inventory control procedures, these standardized explanations include granular audit-friendly content such as key controls, timing of recognition, system dependencies, and associated documentation.`,
    steps: [
      {
        title: 'Walkthrough Templates',
        desc: 'Access industry-specific templates or create custom walkthroughs tailored to your audit needs.'
      },
      {
        title: 'Real-time Collaboration',
        desc: 'Work simultaneously with your team and auditors on walkthrough documentation with live updates.'
      },
      {
        title: 'AI-Powered Suggestions',
        desc: 'Receive intelligent recommendations for improving walkthrough documentation and addressing gaps.'
      }
    ]
  },
  {
    key: 'consolidation',
    label: 'Audit Queries',
    heading: 'Audit Query Assistant',
    subheading: 'Addresses the reality that in large, listed entities, consolidation-related questions account for 60-70% of audit time.',
    description: `This module addresses the reality that in large, listed entities, consolidation-related questions account for 60-70% of audit time. This module allows audit teams to independently query accounting treatments, eliminations, and group-level balances, receiving structured, client-approved explanations without requiring repetitive back-and-forth communications. The system formulates tailored explanations using prior-year audit responses, group reporting policies, and mapped consolidation entries.`,
    steps: [
      {
        title: 'Query Analysis',
        desc: 'AI analyzes incoming consolidation queries to understand the specific information needed.'
      },
      {
        title: 'Intelligent Response Generation',
        desc: 'System generates responses based on your consolidation data, policies, and previous audit interactions.'
      },
      {
        title: 'Smart Routing & Documentation',
        desc: 'Complex queries are routed to the right team members with context, while all interactions are documented for future reference.'
      }
    ]
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('supporting');
  const tab = TABS.find(t => t.key === activeTab) || TABS[0];

  // Rive animation for walkthroughs
  const { RiveComponent: WalkthroughRive } = useRive({
    src: 'https://ae7an1f5d2ydi587.public.blob.vercel-storage.com/Augentik/walkthrough.riv',
    autoplay: true,
  });

  const navItems = [
    { name: 'Augentik In Action', url: '#action', icon: <Home /> },
    { name: 'Our Vision', url: '#vision', icon: <User /> },
    { name: 'Integrations', url: '#integrations', icon: <Layers /> },
    { name: 'Sign In', url: 'https://lightrag-production-6328.up.railway.app/webui/#/login', icon: <LogIn /> },
  ]

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-start overflow-x-hidden">
      {/* Tubelight Navbar */}
      <TubelightNavBar items={navItems} logoUrl={logoUrl} />

      {/* Hero Section with Spline filling the area, below navbar */}
      <section className="w-full flex flex-col items-center justify-center pt-32 pb-0 px-0 bg-black relative" style={{ minHeight: '100vh', height: '100vh', overflow: 'hidden' }}>
        <div className="absolute inset-0 w-full h-full">
          <Spline scene={splineUrl} style={{ width: '100%', height: '100%' }} />
        </div>
      </section>

      {/* Augentik In Action Section with Tabs */}
      <section id="action" className="w-full flex flex-col items-center justify-center py-20 px-4 bg-black text-white relative z-10">
        <div className="max-w-4xl w-full mx-auto flex flex-col items-center">
          <div className="flex space-x-4 mb-8">
            {TABS.map((tabOption) => (
              <button
                key={tabOption.key}
                onClick={() => setActiveTab(tabOption.key)}
                className={`px-6 py-2 rounded-full font-semibold text-lg transition-colors focus:outline-none ${activeTab === tabOption.key ? 'bg-purple-900/40 text-white' : 'bg-black/40 text-gray-300 hover:bg-purple-900/20'}`}
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {tabOption.label}
              </button>
            ))}
          </div>
          {activeTab === 'walkthroughs' ? (
            // Custom walkthroughs section with Rive animation
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8 w-full items-center">
              {/* Text Content */}
              <div className="flex flex-col items-start gap-4 mt-10 md:mt-0 max-w-[546px] mx-auto md:mx-0">
                <div className="space-y-2 md:space-y-1">
                  <h2 className="text-white text-3xl md:text-[40px] font-semibold leading-tight md:leading-[53px]">
                    {tab.heading}
                  </h2>
                </div>
                <p className="text-[#868f97] text-sm md:text-[15px] leading-6">
                  {tab.description}
                </p>
              </div>

              {/* Rive Animation */}
              <div className="relative mt-10 md:mt-0 mx-auto w-full max-w-[471px]">
                <div className="relative w-full h-[637px] bg-[#ffffff0a] rounded-[32px] backdrop-blur-[15px] backdrop-brightness-[100%] border-0 z-10 overflow-hidden">
                  <div className="p-0 h-full flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <div className="text-6xl mb-4">📋</div>
                      <div className="text-xl mb-2 font-semibold">Process Walkthrough Library</div>
                      <div className="text-sm text-gray-500 max-w-xs">
                        Interactive process documentation and audit-friendly walkthroughs
                      </div>
                      <div className="mt-4 text-xs text-gray-600">
                        Rive animation loading...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <SectionWithMockup
              title={tab.heading}
              description={tab.description}
              primaryImageSrc={""}
              secondaryImageSrc={""}
              reverseLayout={false}
            />
          )}
        </div>
      </section>

      {/* Our Vision Section */}
      <section id="vision" className="w-full flex flex-col items-center justify-center py-20 px-4 bg-black text-white relative z-10">
        <div className="max-w-3xl w-full mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Our Vision</h2>
          <p className="text-lg mb-8">Augentik performs the audit before your auditor comes in to ask questions. We believe in proactive, intelligent audit automation—so you can focus on your business, not your inbox.</p>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="w-full flex flex-col items-center justify-center py-20 px-4 bg-black text-white relative z-10">
        <div className="max-w-4xl w-full mx-auto rounded-2xl shadow-lg bg-black/80 p-10 flex flex-col items-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            {/* Sparkles removed */}
          </div>
          <div className="uppercase text-xs tracking-widest text-gray-400 mb-2 relative z-10">Integrations</div>
          <h2 className="text-3xl font-bold mb-2 text-center relative z-10">Built to plug right into your stack</h2>
          <p className="text-base text-gray-300 mb-8 text-center relative z-10">Integrate with the tools you already use and deploy to your own infrastructure, communication, or documentation.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 w-full items-center justify-items-center relative z-10">
            {INTEGRATION_LOGOS.map((logo, idx) => (
              <img
                key={idx}
                src={logo.src}
                alt={logo.alt}
                className="h-10 w-auto object-contain grayscale hover:grayscale-0 transition duration-200"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full bg-black text-gray-400 py-6 text-center mt-12 border-t border-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
        A Dreamweaver Venture Studio company
      </footer>
    </div>
  );
};

export default LandingPage; 