import React, { useEffect, useRef, useState } from 'react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'achieved' | 'in-progress' | 'future';
  icon: string;
}

const MILESTONES: Milestone[] = [
  {
    id: 'foundation',
    title: 'Automated Knowledge & Evidence',
    description: 'AI-powered document retrieval and process knowledge centralization, eliminating repetitive audit tasks.',
    status: 'achieved',
    icon: '📋'
  },
  {
    id: 'accelerator',
    title: 'Real-time Compliance Assessment',
    description: 'Comprehensive IFRS compliance checks in under 10 minutes with instant insights and recommendations.',
    status: 'achieved',
    icon: '⚡'
  },
  {
    id: 'integration',
    title: 'Continuous Transaction Monitoring',
    description: 'Real-time financial data analysis for anomalies and compliance deviations as they occur.',
    status: 'in-progress',
    icon: '🔍'
  },
  {
    id: 'singularity',
    title: 'The Continuous Audit',
    description: 'Revolutionary audit ecosystem with round-the-clock intelligence, ready for immediate auditor review and sign-off.',
    status: 'future',
    icon: '✅'
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
    <div ref={timelineRef} className="w-full py-20 relative overflow-hidden">
      {/* Background gradient for visual storytelling */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10 pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Timeline Header with increased spacing */}
        <div className="text-center mb-20">
          <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            The Road to Audit Singularity
          </h3>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            From fragmented processes to unified intelligence—witness the evolution of audit
          </p>
        </div>

        {/* Timeline Container with enhanced spacing */}
        <div className="relative mb-16">
          {/* Background Line with gradient */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-gray-800 via-gray-600 to-gray-800 transform -translate-y-1/2 z-0 rounded-full" />
          
          {/* Singularity Line (animated) with enhanced glow */}
          <div 
            className={`absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 transform -translate-y-1/2 z-10 transition-all duration-3000 ease-out rounded-full ${
              isVisible ? 'w-full' : 'w-0'
            }`}
            style={{
              boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)',
              filter: 'blur(1px)'
            }}
          />

          {/* Milestones with increased spacing */}
          <div className="relative z-20 flex justify-between items-start timeline-mobile gap-8">
            {MILESTONES.map((milestone, index) => (
              <div
                key={milestone.id}
                className="flex flex-col items-center group cursor-pointer milestone flex-1"
                onClick={() => setActiveMilestone(activeMilestone === milestone.id ? null : milestone.id)}
              >
                {/* Enhanced Milestone Node */}
                <div className="relative mb-8">
                  {/* Outer Ring with gradient border */}
                  <div 
                    className={`w-20 h-20 rounded-full border-3 border-gradient-to-r from-gray-600 to-gray-500 flex items-center justify-center transition-all duration-700 ${
                      isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}
                    style={{
                      animationDelay: `${index * 300}ms`,
                      background: 'linear-gradient(145deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.8))',
                      border: '2px solid transparent',
                      backgroundClip: 'padding-box'
                    }}
                  >
                    {/* Inner Circle with enhanced styling */}
                    <div 
                      className={`w-16 h-16 rounded-full ${getStatusColor(milestone.status)} flex items-center justify-center text-white text-2xl font-bold transition-all duration-500 shadow-lg ${
                        activeMilestone === milestone.id ? 'scale-110 shadow-2xl' : 'scale-100'
                      } ${
                        milestone.status === 'in-progress' ? 'animate-pulse shadow-purple-500/50' : ''
                      }`}
                      style={{
                        background: milestone.status === 'achieved' 
                          ? 'linear-gradient(145deg, #10b981, #059669)' 
                          : milestone.status === 'in-progress'
                          ? 'linear-gradient(145deg, #f59e0b, #d97706)'
                          : 'linear-gradient(145deg, #8b5cf6, #7c3aed)'
                      }}
                    >
                      {milestone.icon}
                    </div>
                  </div>

                  {/* Enhanced Glow Effect */}
                  <div 
                    className={`absolute inset-0 rounded-full transition-all duration-500 ${
                      activeMilestone === milestone.id ? 'scale-200 opacity-40' : 'scale-100 opacity-0'
                    }`}
                    style={{
                      background: `radial-gradient(circle, ${getStatusColor(milestone.status).replace('bg-', '')} 0%, transparent 70%)`,
                      filter: 'blur(12px)'
                    }}
                  />
                </div>

                {/* Enhanced Milestone Content */}
                <div className={`text-center max-w-sm transition-all duration-500 ${
                  activeMilestone === milestone.id ? 'scale-105' : 'scale-100'
                }`}>
                  <div className="flex flex-col items-center mb-4">
                    <h4 className="text-xl font-bold text-white mb-3 leading-tight">{milestone.title}</h4>
                    <span className={`px-4 py-2 text-sm rounded-full font-semibold ${getStatusBgColor(milestone.status)} ${getStatusTextColor(milestone.status)} border border-current/20`}>
                      {getStatusText(milestone.status)}
                    </span>
                  </div>

                  {/* Enhanced Description */}
                  <div className={`transition-all duration-500 overflow-hidden ${
                    activeMilestone === milestone.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <p className="text-base text-gray-300 leading-relaxed bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center space-y-4 bg-gray-900/70 rounded-2xl px-8 py-6 border border-gray-800 backdrop-blur-sm">
            {/* Visual Progress Bar */}
            <div className="w-full max-w-md">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress</span>
                <span>{MILESTONES.filter(m => m.status === 'achieved').length} of {MILESTONES.length}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${(MILESTONES.filter(m => m.status === 'achieved').length / MILESTONES.length) * 100}%`
                  }}
                />
              </div>
            </div>
            
            {/* Milestone Dots */}
            <div className="flex space-x-3">
              {MILESTONES.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    milestone.status === 'achieved'
                      ? 'bg-green-500 shadow-lg shadow-green-500/50'
                      : milestone.status === 'in-progress'
                      ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50 animate-pulse'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTimeline; 