/**
 * Augentik Landing Page with Spline Hero, 'Augentik In Action', 'Our Vision', and 'Integrations' sections
 */
import React, { useState } from 'react';
import Spline from '@splinetool/react-spline';
import { useRive } from '@rive-app/react-canvas';
import { TubelightNavBar } from '@/components/ui/tubelight-navbar';
import { Home, User, Layers, LogIn } from 'lucide-react';
import SectionWithMockup from '@/components/ui/section-with-mockup';

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
    description: 'When external auditors send requests, the system automatically reads and classifies these requests, locates appropriate documents from internal repositories, and routes results for one-click approval before transmission. This eliminates hours of manual searching and reduces delays in "Provided By Client" (PBC) items while ensuring consistency across audit cycles.',
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
    description: 'This module centralizes frequently requested process overviews into visual, easy-to-understand formats that auditors can access independently. This module eliminates the client-side burden of re-explaining business processes year after year. From revenue recognition methodologies to inventory control procedures, these standardized explanations include granular audit-friendly content such as key controls, timing of recognition, system dependencies, and associated documentation.',
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
    description: 'This module addresses the reality that in large, listed entities, consolidation-related questions account for 60-70% of audit time. This module allows audit teams to independently query accounting treatments, eliminations, and group-level balances, receiving structured, client-approved explanations without requiring repetitive back-and-forth communications. The system formulates tailored explanations using prior-year audit responses, group reporting policies, and mapped consolidation entries.',
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
  const [activeTab, setActiveTab] = useState('supporting');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const tab = TABS.find(t => t.key === activeTab) || TABS[0];

  // Rive animation for walkthroughs
  const { RiveComponent: WalkthroughRive, rive } = useRive({
    src: 'https://ifonjarzvpechegr.public.blob.vercel-storage.com/Augentik%20Assets/ornua_bm%20%281%29.riv',
    autoplay: true,
    stateMachines: 'State Machine 1',
  });

  React.useEffect(() => {
    if (rive) {
      // Automatically play the state machine
      rive.play();
    }
  }, [rive]);

  // Force page to start at top
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle scroll events
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const navItems = [
    { name: 'Home', url: '#top', icon: <Home /> },
    { name: 'Augentik In Action', url: '#action', icon: <User /> },
    { name: 'Our Vision', url: '#vision', icon: <User /> },
    { name: 'Integrations', url: '#integrations', icon: <Layers /> },
    { name: 'Sign In', url: 'https://lightrag-production-6328.up.railway.app/webui/#/login', icon: <LogIn /> },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top anchor for scrolling */}
      <div id="top" className="absolute top-0 left-0 w-0 h-0"></div>
      
      {/* Tubelight Navbar */}
      <TubelightNavBar items={navItems} logoUrl={logoUrl} />

      {/* Hero Section with Spline filling the area, below navbar */}
      <section className="w-full flex flex-col items-center justify-center pt-32 pb-20 px-0 bg-black relative">
        <div className="absolute inset-0 w-full h-full">
          <Spline scene={splineUrl} style={{ width: '100%', height: '100%' }} />
        </div>
        
        {/* Scroll nudge indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center text-white/60">
            <div className="text-sm mb-2">Scroll to explore</div>
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
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
                style={{ fontFamily: 'Playfair Display, serif' }}
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
                  <div className="p-0 h-full">
                    {WalkthroughRive ? (
                      <WalkthroughRive className="w-full h-full" />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-gray-400 text-center">
                          <div className="text-6xl mb-4">📋</div>
                          <div className="text-xl mb-2 font-semibold">Process Walkthrough Library</div>
                          <div className="text-sm text-gray-500 max-w-xs">
                            Interactive process documentation and audit-friendly walkthroughs
                          </div>
                          <div className="mt-4 text-xs text-gray-600">
                            Loading Rive animation...
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <SectionWithMockup
              title={tab.heading}
              description={tab.description}
              primaryImageSrc={''}
              secondaryImageSrc={''}
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
          
          {/* Scrolling Logos Banner */}
          <div className="relative z-10 w-full overflow-hidden">
            <div className="flex animate-scroll-banner">
              {/* First set of logos */}
              {INTEGRATION_LOGOS.map((logo, idx) => (
                <div key={`first-${idx}`} className="flex-shrink-0 mx-8">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition duration-300"
                    loading="lazy"
                  />
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {INTEGRATION_LOGOS.map((logo, idx) => (
                <div key={`second-${idx}`} className="flex-shrink-0 mx-8">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition duration-300"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full bg-black text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <img
                  src="https://ae7an1f5d2ydi587.public.blob.vercel-storage.com/Augentik/Augentik%20Logo.png"
                  alt="Augentik Logo"
                  className="w-16 h-16 mr-4 object-contain"
                />
                <div>
                  <h3 className='text-white text-lg font-semibold' style={{ fontFamily: 'Playfair Display, serif' }}>
                    Augentik
                  </h3>
                  <p className='text-sm text-gray-500'>Intelligent Audit Automation</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Transforming audit processes through intelligent automation, real-time compliance monitoring, 
                and precision-driven analysis. Experience the future of audit assurance.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#action" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#vision" className="hover:text-white transition-colors">Our Vision</a></li>
                <li><a href="#integrations" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="https://lightrag-production-6328.up.railway.app/webui/#/login" className="hover:text-white transition-colors">Sign In</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500 mb-4 md:mb-0">
              <p>© 2025 Augentik. All rights reserved.</p>
              <p className="mt-1">
                A Dreamweaver Venture Studio Company (by{' '}
                <a href="https://ideatostartup.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                  ideatostartup.io
                </a>
                )
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Scroll to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default LandingPage;