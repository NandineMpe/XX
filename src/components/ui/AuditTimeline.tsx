import React, { useEffect, useRef, useState } from 'react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'future';
  icon: string;
}

const MILESTONES: Milestone[] = [
  {
    id: 'foundation',
    title: 'Automated Knowledge & Evidence',
    description: 'We solved the most repetitive audit tasks. Our AI-powered platform automates document retrieval and centralizes process knowledge, eliminating endless back-and-forth.',
    status: 'completed',
    icon: 'check'
  },
  {
    id: 'accelerator',
    title: 'Real-time Compliance Assessment',
    description: 'We accelerated compliance from weeks to minutes. Our system performs comprehensive IFRS compliance checks in under 10 minutes with instant insights.',
    status: 'completed',
    icon: 'check'
  },
  {
    id: 'integration',
    title: 'Continuous Transaction Monitoring',
    description: 'We\'re building infrastructure for real-time transaction monitoring, where financial data is continuously analyzed for anomalies and compliance deviations.',
    status: 'in-progress',
    icon: 'monitor'
  },
  {
    id: 'singularity',
    title: 'The Continuous Audit',
    description: 'Our ultimate goal: a single, continuous audit trail. One auditor, one machine, one audit—done continuously. No more waiting, no more surprises.',
    status: 'future',
    icon: 'star'
  }
];

const AuditTimeline: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (timelineRef.current) {
      observer.observe(timelineRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getStatusClass = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'in-progress':
        return 'in-progress';
      case 'future':
        return 'future';
      default:
        return '';
    }
  };

  const getStatusText = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'future':
        return 'Future Vision';
      default:
        return '';
    }
  };

  const getStatusStyle = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      case 'future':
        return 'status-future';
      default:
        return '';
    }
  };

  const getIconPath = (icon: string) => {
    switch (icon) {
      case 'check':
        return "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z";
      case 'monitor':
        return "M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z";
      case 'star':
        return "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";
      default:
        return "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z";
    }
  };

  return (
    <div ref={timelineRef} className="w-full py-12 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Timeline Header */}
        <div className="text-center mb-12 md:mb-20">
          <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8">
            Reimagining audit from burden to advantage—where continuous intelligence meets human expertise
          </p>
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              The traditional audit model is broken. Finance teams spend months preparing for annual audits, drowning in document requests, explaining the same processes year after year, and waiting an entire year to discover irregularities that could have been caught in real-time.
            </p>
            <p className="text-base md:text-lg text-gray-300 leading-relaxed">
              Our vision is to eliminate the burden of being audited while saving finance teams both time and money. On day 1000 of our journey, we see a revolutionary audit ecosystem: continuous, round-the-clock audit intelligence. One auditor, one machine, one audit—completed continuously, audited in a fraction of the time.
            </p>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="w-full max-w-6xl mx-auto relative">
          <div className="relative h-32 md:h-48 my-6 md:my-10">
            {/* Background Timeline Line */}
            <div className="absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500 transform -translate-y-1/2 rounded-full" />
            
            {/* Progress Line */}
            <div 
              className={`absolute top-1/2 left-[10%] h-1 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 transform -translate-y-1/2 rounded-full transition-all duration-3000 ease-in-out ${
                isVisible ? 'w-[60%]' : 'w-0'
              }`}
              style={{
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)'
              }}
            />

            {/* Milestones */}
            {MILESTONES.map((milestone, index) => (
              <div
                key={milestone.id}
                className={`absolute top-1/2 transform -translate-y-1/2 cursor-pointer transition-all duration-300 group ${
                  index === 0 ? 'left-[10%]' : 
                  index === 1 ? 'left-[30%]' : 
                  index === 2 ? 'left-[50%]' : 'left-[80%]'
                }`}
              >
                {/* Milestone Dot */}
                <div className={`w-5 h-5 rounded-full border-3 relative transition-all duration-300 transform -translate-x-1/2 ${
                  milestone.status === 'completed' 
                    ? 'bg-purple-600 border-purple-500 shadow-lg shadow-purple-500/60' 
                    : milestone.status === 'in-progress'
                    ? 'bg-yellow-500 border-yellow-400 shadow-lg shadow-yellow-500/60 animate-pulse'
                    : 'bg-gray-700 border-gray-600'
                }`}>
                  {/* Icon */}
                  <svg 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-80" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d={getIconPath(milestone.icon)} />
                  </svg>
                </div>

                {/* Milestone Content with Enhanced Glassmorphism */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-72 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 opacity-0 invisible transition-all duration-300 -mt-4 shadow-lg group-hover:opacity-100 group-hover:visible group-hover:-mt-6">
                  <h4 className="text-lg font-semibold mb-3 text-white">
                    {milestone.title}
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed mb-4">
                    {milestone.description}
                  </p>
                  <span className={`inline-block px-3 py-2 rounded-xl text-xs font-medium border backdrop-blur-sm ${
                    milestone.status === 'completed'
                      ? 'bg-purple-600/20 text-purple-300 border-purple-600/30 shadow-lg shadow-purple-500/20'
                      : milestone.status === 'in-progress'
                      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 shadow-lg shadow-yellow-500/20'
                      : 'bg-gray-600/20 text-gray-300 border-gray-600/30'
                  }`}>
                    {getStatusText(milestone.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline Legend with Glassmorphism */}
          <div className="flex justify-center mt-12 md:mt-16">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 md:px-8 py-4 md:py-6 shadow-lg">
              <div className="flex gap-6 md:gap-10 flex-wrap justify-center">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="w-4 h-4 rounded-full bg-purple-600 shadow-lg shadow-purple-500/50"></div>
                  <span className="font-medium">Completed</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50 animate-pulse"></div>
                  <span className="font-medium">In Progress</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="w-4 h-4 rounded-full bg-gray-600"></div>
                  <span className="font-medium">Future Vision</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTimeline; 