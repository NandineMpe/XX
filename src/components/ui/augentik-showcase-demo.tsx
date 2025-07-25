import { ProjectShowcase } from './project-showcase';

function openInNewTab(link: string) {
  window.open(link, '_blank', 'noopener,noreferrer');
}

export const AugentikShowcaseDemo = () => (
  <div className="p-16 rounded-lg min-h-[300px] flex flex-wrap gap-6 items-center justify-center relative bg-black">
    <div className="items-center justify-center relative flex" style={{ maxWidth: '1536px' }}>
      <ProjectShowcase
        testimonials={[
          {
            name: 'Audit Query Assistant',
            quote: 'Our AI-powered system addresses the reality that in large, listed entities, consolidation-related questions account for 60-70% of audit time. The system allows audit teams to independently query accounting treatments, eliminations, and group-level balances, receiving structured, client-approved explanations without requiring repetitive back-and-forth communications.',
            designation: 'AI-Powered Audit Intelligence',
            src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            link: 'https://lightrag-production-6328.up.railway.app/webui/#/login',
          },
          {
            name: 'Process Walkthrough Library',
            quote: 'This module centralizes frequently requested process overviews into visual, easy-to-understand formats that auditors can access independently. It eliminates the client-side burden of re-explaining business processes year after year, from revenue recognition methodologies to inventory control procedures.',
            designation: 'Visual Process Documentation',
            src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2015&q=80',
            link: 'https://lightrag-production-6328.up.railway.app/webui/#/login',
          },
          {
            name: 'Evidence Retrieval',
            quote: 'When external auditors send requests, our system automatically reads and classifies these requests, locates appropriate documents from internal repositories, and routes results for one-click approval before transmission. This eliminates hours of manual searching and reduces delays in "Provided By Client" (PBC) items.',
            designation: 'Automated Document Management',
            src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2011&q=80',
            link: 'https://lightrag-production-6328.up.railway.app/webui/#/login',
          },
          {
            name: 'IFRS Compliance Assessment',
            quote: 'Our system performs comprehensive IFRS compliance checks in under 10 minutes, providing instant insights and actionable recommendations. This accelerates the compliance process from weeks to minutes, ensuring your financial statements meet international standards.',
            designation: 'Real-time Compliance Monitoring',
            src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            link: 'https://lightrag-production-6328.up.railway.app/webui/#/login',
          },
          {
            name: 'Continuous Transaction Monitoring',
            quote: 'We are building the infrastructure for real-time transaction monitoring, where financial data is continuously analyzed for anomalies and compliance deviations as they happen. This provides proactive risk management and ensures audit readiness at all times.',
            designation: 'Real-time Risk Detection',
            src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            link: 'https://lightrag-production-6328.up.railway.app/webui/#/login',
          },
        ]}
        colors={{
          name: '#ffffff',
          position: 'rgba(156, 163, 175, 0.8)',
          testimony: 'rgba(229, 231, 235, 0.9)',
        }}
        fontSizes={{
          name: '28px',
          position: '20px',
          testimony: '20px',
        }}
        spacing={{
          nameTop: '0',
          nameBottom: '10px',
          positionTop: '0',
          positionBottom: '0.5em',
          testimonyTop: '1.24em',
          testimonyBottom: '1em',
          lineHeight: '1.56',
        }}
        halomotButtonGradient="linear-gradient(135deg, #8b5cf6, #a855f7, #7c3aed)"
        halomotButtonBackground="rgba(0, 0, 0, 0.8)"
        halomotButtonTextColor="#ffffff"
        halomotButtonOuterBorderRadius="12px"
        halomotButtonInnerBorderRadius="11px"
        halomotButtonHoverTextColor="#ffffff"
        buttonInscriptions={{
          previousButton: 'Previous',
          nextButton: 'Next',
          openWebAppButton: 'Try Demo',
        }}
        onItemClick={openInNewTab}
        autoplay={true}
        outlineColor="rgba(255, 255, 255, 0.1)"
        hoverOutlineColor="rgba(139, 92, 246, 0.3)"
      />
    </div>
  </div>
); 