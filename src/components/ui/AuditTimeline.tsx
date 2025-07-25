import React, { useEffect, useRef, useState } from 'react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'achieved' | 'in-progress' | 'future';
  icon: string;
  year?: string;
}

const MILESTONES: Milestone[] = [
  {
    id: 'foundation',
    title: 'Automated Knowledge & Evidence',
    description: 'We started by solving the most repetitive audit tasks. Our AI-powered platform automates document retrieval and centralizes process knowledge, eliminating the endless back-and-forth that bogs down finance teams.',
    status: 'achieved',
    icon: '📄',
    year: '2023'
  },
  {
    id: 'accelerator',
    title: 'Real-time Compliance Assessment',
    description: 'We then accelerated the compliance process from weeks to minutes. Our system performs comprehensive IFRS compliance checks in under 10 minutes, providing instant insights and actionable recommendations.',
    status: 'achieved',
    icon: '⚡',
    year: '2024'
  },
  {
    id: 'integration',
    title: 'Continuous Transaction Monitoring',
    description: 'This is where we are now. We are building the infrastructure for real-time transaction monitoring, where financial data is continuously analyzed for anomalies and compliance deviations as they happen.',
    status: 'in-progress',
    icon: '🔄',
    year: '2025'
  },
  {
    id: 'singularity',
    title: 'The Continuous Audit',
    description: 'On day 1000 of our journey, we see a revolutionary audit ecosystem: continuous, round-the-clock audit intelligence that provides a comprehensive audit trail ready for auditor review and sign-off. One auditor, one machine, one audit, completed continuously, audited in a fraction of the time, with no more waiting an entire year to spot irregularities.',
    status: 'future',
    icon: '∞',
    year: '2026+'
  }
];

const AuditTimeline: React.FC = () => {
  const [activeMilestone, setActiveMilestone] = useState<string | null>(null);
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

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'achieved':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'future':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Milestone['status']) => {
    switch (status) {
      case 'achieved':
        return 'Achieved';
      case 'in-progress':
        return 'In Progress';
      case 'future':
        return 'Future Vision';
      default:
        return 'Unknown';
    }
  };

  const getStatusTextColor = (status: Milestone['status']) => {
    switch (status) {
      case 'achieved':
        return 'text-green-400';
      case 'in-progress':
        return 'text-yellow-400';
      case 'future':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBgColor = (status: Milestone['status']) => {
    switch (status) {
      case 'achieved':
        return 'bg-green-500/20';
      case 'in-progress':
        return 'bg-yellow-500/20';
      case 'future':
        return 'bg-purple-500/20';
      default:
        return 'bg-gray-500/20';
    }
  };

  return (
    <div ref={timelineRef} className="w-full py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Timeline Header */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-4">The Road to Audit Singularity</h3>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            From fragmented processes to unified intelligence—witness the evolution of audit
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Background Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 transform -translate-y-1/2 z-0" />
          
          {/* Singularity Line (animated) */}
          <div 
            className={`absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transform -translate-y-1/2 z-10 transition-all duration-2000 ease-out ${
              isVisible ? 'w-full' : 'w-0'
            }`}
            style={{
              boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)',
              filter: 'blur(0.5px)'
            }}
          />

          {/* Milestones */}
          <div className="relative z-20 flex justify-between items-center timeline-mobile">
            {MILESTONES.map((milestone, index) => (
              <div
                key={milestone.id}
                className="flex flex-col items-center group cursor-pointer milestone"
                onClick={() => setActiveMilestone(activeMilestone === milestone.id ? null : milestone.id)}
              >
                {/* Milestone Node */}
                <div className="relative mb-6">
                  {/* Outer Ring */}
                  <div 
                    className={`w-16 h-16 rounded-full border-2 border-gray-600 flex items-center justify-center transition-all duration-500 ${
                      isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}
                    style={{
                      animationDelay: `${index * 200}ms`
                    }}
                  >
                    {/* Inner Circle */}
                    <div 
                      className={`w-12 h-12 rounded-full ${getStatusColor(milestone.status)} flex items-center justify-center text-white text-xl font-bold transition-all duration-300 ${
                        activeMilestone === milestone.id ? 'scale-110' : 'scale-100'
                      } ${
                        milestone.status === 'in-progress' ? 'animate-pulse' : ''
                      }`}
                    >
                      {milestone.icon}
                    </div>
                  </div>

                  {/* Glow Effect */}
                  <div 
                    className={`absolute inset-0 rounded-full transition-all duration-300 ${
                      activeMilestone === milestone.id ? 'scale-150 opacity-30' : 'scale-100 opacity-0'
                    }`}
                    style={{
                      background: `radial-gradient(circle, ${getStatusColor(milestone.status).replace('bg-', '')} 0%, transparent 70%)`,
                      filter: 'blur(8px)'
                    }}
                  />
                </div>

                {/* Milestone Content */}
                <div className={`text-center max-w-xs transition-all duration-300 ${
                  activeMilestone === milestone.id ? 'scale-105' : 'scale-100'
                }`}>
                  <div className="flex items-center justify-center mb-2">
                    <h4 className="text-lg font-semibold text-white mr-2">{milestone.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBgColor(milestone.status)} ${getStatusTextColor(milestone.status)}`}>
                      {getStatusText(milestone.status)}
                    </span>
                  </div>
                  
                  {milestone.year && (
                    <p className="text-sm text-gray-400 mb-3">{milestone.year}</p>
                  )}

                  {/* Description (shown on hover/click) */}
                  <div className={`transition-all duration-300 overflow-hidden ${
                    activeMilestone === milestone.id ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-gray-900/50 rounded-full px-6 py-3 border border-gray-800">
            <div className="flex space-x-1">
              {MILESTONES.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index < MILESTONES.filter(m => m.status === 'achieved').length 
                      ? 'bg-green-500' 
                      : index === MILESTONES.filter(m => m.status === 'achieved').length 
                        ? 'bg-yellow-500 animate-pulse' 
                        : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-400 ml-2">
              {MILESTONES.filter(m => m.status === 'achieved').length} of {MILESTONES.length} phases completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTimeline; 