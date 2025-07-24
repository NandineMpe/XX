import React from 'react';
import { Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Progress from '@/components/ui/Progress';

interface AssessmentProgressProps {
  progress: number;
  currentRequirement: string;
  totalRequirements: number;
  completedRequirements: number;
  estimatedTimeRemaining: string;
  status: 'running' | 'completed' | 'error' | 'paused';
  error?: string;
}

const AssessmentProgress: React.FC<AssessmentProgressProps> = ({
  progress,
  currentRequirement,
  totalRequirements,
  completedRequirements,
  estimatedTimeRemaining,
  status,
  error,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'paused':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      default:
        return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'running':
        return 'Assessment in Progress';
      case 'completed':
        return 'Assessment Completed';
      case 'error':
        return 'Assessment Error';
      case 'paused':
        return 'Assessment Paused';
      default:
        return 'Starting Assessment';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'text-blue-400';
      case 'completed':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'paused':
        return 'text-yellow-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          {getStatusIcon()}
          {getStatusText()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Current Requirement</span>
            </div>
            <p className="text-white text-sm truncate" title={currentRequirement}>
              {currentRequirement || 'Initializing...'}
            </p>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-gray-300">Completed</span>
            </div>
            <p className="text-white text-lg font-semibold">
              {completedRequirements} / {totalRequirements}
            </p>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">Estimated Time</span>
            </div>
            <p className="text-white text-sm">{estimatedTimeRemaining}</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">Error</span>
            </div>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Progress Details */}
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Assessment Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={getStatusColor()}>{getStatusText()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Progress:</span>
              <span className="text-white">{completedRequirements} of {totalRequirements} requirements</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Completion:</span>
              <span className="text-white">{Math.round(progress)}%</span>
            </div>
            {status === 'running' && (
              <div className="flex justify-between">
                <span className="text-gray-400">Current:</span>
                <span className="text-white truncate max-w-xs" title={currentRequirement}>
                  {currentRequirement}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Animation */}
        {status === 'running' && (
          <div className="flex items-center justify-center py-4">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssessmentProgress; 