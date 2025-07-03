import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Spline from '@splinetool/react-spline';
import { useRive } from '@rive-app/react-canvas';

// Rive Animation Component for Evidence Retrieval
function RiveAnimationSupporting() {
  const { RiveComponent } = useRive({
    src: 'https://cvjdrblhcif4qupj.public.blob.vercel-storage.com/Agentik/ecg_workflow-p1NUbrSSlmj7Bi7cSvqPfzkP2ixPIb.riv',
    autoplay: true,
  });

  return <RiveComponent className="w-full h-full" />;
}

// Rive Animation Component for Walkthroughs
function RiveAnimationWalkthrough() {
  const { RiveComponent } = useRive({
    src: 'https://cvjdrblhcif4qupj.public.blob.vercel-storage.com/Agentik/drag_and_drop_elearning-78LLk3MsmIUsq8fJIJVp1FaOkl9BD9.riv',
    autoplay: true,
  });

  return <RiveComponent className="w-full h-full" />;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('supporting-documents');
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const liquidButtonStyle = {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
    backdropFilter: 'blur(10px)',
    borderRadius: '50px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '15px 40px',
    transition: 'all 0.3s ease-in-out',
    border: '1px solid rgba(255,255,255,0.2)',
    fontWeight: '500',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)';
    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.5)';
    e.currentTarget.style.transform = 'translateY(-2px)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)';
    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)';
    e.currentTarget.style.transform = 'translateY(0)';
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.outline = 'none';
    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.5), 0 0 0 3px rgba(255,255,255,0.3)';
  };

  const handleLearnMoreClick = () => {
    const howItWorksSection = document.getElementById('how-augentik-works');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setExpandedAccordion(null); // Reset accordion when switching tabs
  };

  const toggleAccordion = (tabId: string) => {
    setExpandedAccordion(expandedAccordion === tabId ? null : tabId);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src="https://cvjdrblhcif4qupj.public.blob.vercel-storage.com/agentic%20logo-czxgzNbq2lmA1WMRnfeJzd16ZelMFs.png" 
                alt="Agentic Logo" 
                className="h-20 w-auto"
              />
            </div>
            <button 
              onClick={handleLoginClick}
              style={liquidButtonStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onFocus={handleFocus}
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Full-Screen Spline */}
      <section className="relative min-h-screen overflow-hidden flex items-center justify-center">
        {/* Full-screen Spline Animation as Background */}
        <Spline 
          scene="https://cvjdrblhcif4qupj.public.blob.vercel-storage.com/Agentik/clarity_stream-0VzBbd4AYCXvjq8CdNjqeLA3KZ1OfS.spline"
          className="w-full h-full absolute inset-0 z-0"
        />
        
        {/* Centered Content - Buttons */}
        <div className="relative z-10 flex flex-col justify-center items-center pt-20">
          <div className="flex gap-6">
            <button 
              onClick={handleLearnMoreClick}
              style={liquidButtonStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onFocus={handleFocus}
            >
              Learn More
            </button>
            <button 
              onClick={handleLoginClick}
              style={liquidButtonStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onFocus={handleFocus}
            >
              Get Started
            </button>
          </div>
        </div>
        
        {/* Scroll Prompt - Positioned at very bottom of hero section */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce z-10">
          <p className="text-white/70 text-sm mb-2 font-medium">Scroll to explore</p>
          <button 
            onClick={handleLearnMoreClick}
            className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center hover:border-white/50 transition-colors"
          >
            <svg 
              className="w-4 h-4 text-white/70" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      </section>

      {/* How Augentik Works Section */}
      <section id="how-augentik-works" className="py-20 bg-black text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How Augentik Works
            </h2>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-900 rounded-full p-1 flex">
              <button
                onClick={() => handleTabClick('supporting-documents')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'supporting-documents'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Supporting Documents
              </button>
              <button
                onClick={() => handleTabClick('walkthroughs')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'walkthroughs'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Walkthroughs
              </button>
              <button
                onClick={() => handleTabClick('consolidation-queries')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'consolidation-queries'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Consolidation Queries
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-7xl mx-auto">
            {/* Supporting Documents Tab */}
            {activeTab === 'supporting-documents' && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                <div className="lg:col-span-2">
                  <h3 className="text-3xl font-bold mb-6">Intelligent Supporting Document Retrieval</h3>
                  <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                    Eliminate the back-and-forth of audit season by letting your system handle routine documentation requests with built-in agentic automation.
                  </p>
                  
                  {/* Modern Accordion */}
                  <div className="mb-8">
                    <button 
                      onClick={() => toggleAccordion('supporting-documents')}
                      className="group w-full bg-gradient-to-r from-blue-600/10 to-blue-500/10 border border-blue-500/20 rounded-xl px-6 py-4 text-left hover:from-blue-600/20 hover:to-blue-500/20 hover:border-blue-500/30 transition-all duration-300 flex items-center justify-between"
                    >
                      <span className="text-blue-400 font-medium">View detailed description</span>
                      <svg 
                        className={`w-5 h-5 text-blue-400 transform transition-transform duration-300 ${expandedAccordion === 'supporting-documents' ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedAccordion === 'supporting-documents' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-6 rounded-b-xl border-x border-b border-blue-500/20 mt-0">
                        <p className="text-gray-300 mb-6 leading-relaxed">
                          When your external auditors send a request our system automatically reads and classifies the request, locates the appropriate documents from your internal repositories, and routes the results to you for one-click approval before sending them out. This system saves hours of manual searching, reduces delays in &quot;Provided By Client&quot; (PBC) items, and ensures consistency across audit cycles. It&apos;s especially helpful during peak periods when multiple auditors are reaching out across multiple entities.
                        </p>
                        <p className="text-gray-300 leading-relaxed">
                          By reducing your team&apos;s audit burden, this feature allows you to stay focused on the business—not your inbox.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start group">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold mr-4 mt-1 shadow-lg group-hover:shadow-blue-500/25 transition-shadow">01</div>
                      <div>
                        <h4 className="font-semibold mb-2 text-lg">Automated Document Requests</h4>
                        <p className="text-gray-400 leading-relaxed">Our AI reads auditor emails and automatically categorizes document requests for efficient processing.</p>
                      </div>
                    </div>
                    <div className="flex items-start group">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold mr-4 mt-1 shadow-lg group-hover:shadow-blue-500/25 transition-shadow">02</div>
                      <div>
                        <h4 className="font-semibold mb-2 text-lg">Intelligent Document Retrieval</h4>
                        <p className="text-gray-400 leading-relaxed">The system searches your files and emails to locate the exact documents needed for each request.</p>
                      </div>
                    </div>
                    <div className="flex items-start group">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold mr-4 mt-1 shadow-lg group-hover:shadow-blue-500/25 transition-shadow">03</div>
                      <div>
                        <h4 className="font-semibold mb-2 text-lg">One-Click Approval & Delivery</h4>
                        <p className="text-gray-400 leading-relaxed">Review suggested documents and approve with a single click, eliminating manual file handling.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 h-[600px] overflow-hidden shadow-2xl">
                    <RiveAnimationSupporting />
                  </div>
                </div>
              </div>
            )}

            {/* Walkthroughs Tab */}
            {activeTab === 'walkthroughs' && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                <div className="lg:col-span-2">
                  <h3 className="text-3xl font-bold mb-6">Process Walkthrough</h3>
                  <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                    Minimize repeat explanations and improve auditor understanding with structured, visual walkthroughs of your company&apos;s key processes and account flows.
                  </p>
                  
                  {/* Modern Accordion */}
                  <div className="mb-8">
                    <button 
                      onClick={() => toggleAccordion('walkthroughs')}
                      className="group w-full bg-gradient-to-r from-purple-600/10 to-purple-500/10 border border-purple-500/20 rounded-xl px-6 py-4 text-left hover:from-purple-600/20 hover:to-purple-500/20 hover:border-purple-500/30 transition-all duration-300 flex items-center justify-between"
                    >
                      <span className="text-purple-400 font-medium">View detailed description</span>
                      <svg 
                        className={`w-5 h-5 text-purple-400 transform transition-transform duration-300 ${expandedAccordion === 'walkthroughs' ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedAccordion === 'walkthroughs' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-6 rounded-b-xl border-x border-b border-purple-500/20 mt-0">
                        <p className="text-gray-300 mb-6 leading-relaxed">
                          Auditors often arrive with limited context—especially junior staff rotating in and out of engagements. This module helps eliminate the client-side burden of re-explaining business processes year after year. It centralizes your most frequently asked process overviews into visual, easy-to-understand formats auditors can access independently, at any stage of the audit.
                        </p>
                        <p className="text-gray-300 leading-relaxed">
                          From &quot;how does your group recognize revenue?&quot; to &quot;can we get a walkthrough of your inventory controls?&quot;—these questions no longer need to go through your CFO or operational leads.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start group">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold mr-4 mt-1 shadow-lg group-hover:shadow-purple-500/25 transition-shadow">01</div>
                      <div>
                        <h4 className="font-semibold mb-2 text-lg">Walkthrough Templates</h4>
                        <p className="text-gray-400 leading-relaxed">Access industry-specific templates or create custom walkthroughs tailored to your audit needs.</p>
                      </div>
                    </div>
                    <div className="flex items-start group">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold mr-4 mt-1 shadow-lg group-hover:shadow-purple-500/25 transition-shadow">02</div>
                      <div>
                        <h4 className="font-semibold mb-2 text-lg">Real-time Collaboration</h4>
                        <p className="text-gray-400 leading-relaxed">Work simultaneously with your team and auditors on walkthrough documentation with live updates.</p>
                      </div>
                    </div>
                    <div className="flex items-start group">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold mr-4 mt-1 shadow-lg group-hover:shadow-purple-500/25 transition-shadow">03</div>
                      <div>
                        <h4 className="font-semibold mb-2 text-lg">AI-Powered Suggestions</h4>
                        <p className="text-gray-400 leading-relaxed">Receive intelligent recommendations for improving walkthrough documentation and addressing gaps.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 h-[600px] overflow-hidden shadow-2xl">
                    <RiveAnimationWalkthrough />
                  </div>
                </div>
              </div>
            )}

            {/* Consolidation Queries Tab */}
            {activeTab === 'consolidation-queries' && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                <div className="lg:col-span-2">
                  <h3 className="text-3xl font-bold mb-6">Consolidation Query Assistant</h3>
                  <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                    Streamline the most time-consuming part of the audit with intelligent responses to accounting treatment queries—powered by your actual consolidation data.
                  </p>
                  
                  {/* Modern Accordion */}
                  <div className="mb-8">
                    <button 
                      onClick={() => toggleAccordion('consolidation-queries')}
                      className="group w-full bg-gradient-to-r from-emerald-600/10 to-emerald-500/10 border border-emerald-500/20 rounded-xl px-6 py-4 text-left hover:from-emerald-600/20 hover:to-emerald-500/20 hover:border-emerald-500/30 transition-all duration-300 flex items-center justify-between"
                    >
                      <span className="text-emerald-400 font-medium">View detailed description</span>
                      <svg 
                        className={`w-5 h-5 text-emerald-400 transform transition-transform duration-300 ${expandedAccordion === 'consolidation-queries' ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedAccordion === 'consolidation-queries' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm p-6 rounded-b-xl border-x border-b border-emerald-500/20 mt-0">
                        <p className="text-gray-300 mb-6 leading-relaxed">
                          In large, listed entities, consolidation-related questions account for the majority of auditor interaction—often 60–70% of audit time. This module allows audit teams to independently ask questions about accounting treatments, eliminations, and group-level balances, and receive structured, client-approved explanations—without having to pull your team into repetitive back-and-forths.
                        </p>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                          Consolidation questions are often complex, but most aren&apos;t unique. This tool standardizes responses to the most common queries—saving your Group Finance and Controllership teams hours each audit cycle. You maintain full oversight, while routine accounting explanations are handled at scale and with consistency.
                        </p>
                        <p className="text-gray-300 leading-relaxed">
                          Auditors get what they need—accurate, transparent explanations—without needing to ping you for every number they can&apos;t immediately reconcile.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start group">
                      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold mr-4 mt-1 shadow-lg group-hover:shadow-emerald-500/25 transition-shadow">01</div>
                      <div>
                        <h4 className="font-semibold mb-2 text-lg">Query Analysis</h4>
                        <p className="text-gray-400 leading-relaxed">AI analyzes incoming consolidation queries to understand the specific information needed.</p>
                      </div>
                    </div>
                    <div className="flex items-start group">
                      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold mr-4 mt-1 shadow-lg group-hover:shadow-emerald-500/25 transition-shadow">02</div>
                      <div>
                        <h4 className="font-semibold mb-2 text-lg">Intelligent Response Generation</h4>
                        <p className="text-gray-400 leading-relaxed">Generate structured responses based on your consolidation data, policies, and previous audit interactions.</p>
                      </div>
                    </div>
                    <div className="flex items-start group">
                      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold mr-4 mt-1 shadow-lg group-hover:shadow-emerald-500/25 transition-shadow">03</div>
                      <div>
                        <h4 className="font-semibold mb-2 text-lg">Smart Routing & Documentation</h4>
                        <p className="text-gray-400 leading-relaxed">Route complex queries to the right team members with context, while all interactions are documented for future reference.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 h-[600px] overflow-hidden shadow-2xl">
                    <Spline 
                      scene="https://cvjdrblhcif4qupj.public.blob.vercel-storage.com/Agentik/Consolidation%20Spline-FTrge2gy4A5LvLEx5lf81SS2wbXQwP.spline"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-16 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center mb-6">
              <img 
                src="https://cvjdrblhcif4qupj.public.blob.vercel-storage.com/agentic%20logo-czxgzNbq2lmA1WMRnfeJzd16ZelMFs.png" 
                alt="Agentic Logo" 
                className="h-12 w-auto"
              />
            </div>
            <div className="mb-6">
              <p className="text-gray-300 text-lg font-medium mb-2">
                A Dreamweaver Venture Studio Company
              </p>
              <p className="text-gray-400 text-sm">
                Transforming industries through innovative AI solutions
              </p>
            </div>
            <div className="border-t border-gray-700 pt-6 w-full">
              <p className="text-gray-500 text-sm">
                © 2025 Dreamweaver Venture Studio. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
