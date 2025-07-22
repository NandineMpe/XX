/**
 * Augentik Landing Page with Spline Hero, 'Augentik In Action', 'Our Vision', and 'Integrations' sections
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
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
    subheading: 'Eliminate the back-and-forth of audit season by letting your system handle routine documentation requests with built-in agentic automation.',
    description: `When your external auditors send a request our system automatically reads and classifies the request, locates the appropriate documents from your internal repositories, and routes the results to you for one-click approval before sending them out. This system saves hours of manual searching, reduces delays in "Provided By Client" (PBC) items, and ensures consistency across audit cycles. It's especially helpful during peak periods when multiple auditors are reaching out across multiple entities.\n\nBy reducing your team's audit burden, this feature allows you to stay focused on the business—not your inbox.`,
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
    heading: 'Process Walkthrough',
    subheading: 'Minimize repeat explanations and improve auditor understanding with structured, visual walkthroughs of your company\'s key processes and account flows.',
    description: `Auditors often arrive with limited context—especially junior staff rotating in and out of engagements. This module helps eliminate the client-side burden of re-explaining business processes year after year. It centralizes your most frequently asked process overviews into visual, easy-to-understand formats auditors can access independently, at any stage of the audit.\n\nFrom "how does your group recognize revenue?" to "can we get a walkthrough of your inventory controls?"—these questions no longer need to go through your CFO or operational leads.\n\nGranular Audit-Friendly Content\nKey controls\nTiming of recognition\nSystem dependencies\nAssociated documentation (e.g., sample invoices, internal policies, reconciliations)`,
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
    label: 'Consolidation Queries',
    heading: 'Consolidation Query Assistant',
    subheading: 'Streamline the most time-consuming part of the audit with intelligent responses to accounting treatment queries—powered by your actual consolidation data.',
    description: `In large, listed entities, consolidation-related questions account for the majority of auditor interaction—often 60–70% of audit time. This module allows audit teams to independently ask questions about accounting treatments, eliminations, and group-level balances, and receive structured, client-approved explanations—without having to pull your team into repetitive back-and-forths.\n\nConsolidation questions are often complex, but most aren't unique. This tool standardizes responses to the most common queries—saving your Group Finance and Controllership teams hours each audit cycle. You maintain full oversight, while routine accounting explanations are handled at scale and with consistency.\n\nAuditors get what they need—accurate, transparent explanations—without needing to ping you for every number they can't immediately reconcile.\n\nThe system formulates a tailored explanation using:\nPrior-year audit responses\nGroup reporting policies\nMapped consolidation entries (e.g. trial balances, elimination journals, disclosures)\n\nAdditional Features\nIncludes linked support, such as relevant consolidation schedules, working papers, and accounting memos—pulled from connected systems like your group reporting tool or shared drives.\nIf the query requires input from Group Finance or isn't fully covered by documented policy, it gets routed to the correct subject-matter owner—with pre-filled context and suggested responses—to reduce your time spent manually interpreting vague audit questions.`,
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

  const navItems = [
    { name: 'Augentik In Action', url: '#action', icon: <Home /> },
    { name: 'Our Vision', url: '#vision', icon: <User /> },
    { name: 'Integrations', url: '#integrations', icon: <Layers /> },
    { name: 'Sign In', url: 'https://lightrag-production-71c6.up.railway.app/webui/login', icon: <LogIn /> },
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
          <SectionWithMockup
            title={tab.heading}
            description={tab.description}
            primaryImageSrc={""}
            secondaryImageSrc={""}
            reverseLayout={activeTab === 'walkthroughs'}
          />
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