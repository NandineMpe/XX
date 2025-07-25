import React, { useState, useEffect, useRef } from 'react';
import { FileText, CheckCircle, AlertTriangle, Download, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

import AssessmentForm, { AssessmentFormData } from './AssessmentForm';
import AssessmentProgress from './AssessmentProgress';
import AssessmentResults, { ComplianceResult } from './AssessmentResults';
import ComplianceSummary from './ComplianceSummary';
import { ifrsComplianceAPI, IFRSAssessmentResponse, AssessmentProgress as APIProgress, ComplianceSummary as APISummary } from '@/api/ifrsCompliance';

interface IFRSComplianceDashboardProps {
  onBack?: () => void;
}

type AssessmentStep = 'setup' | 'progress' | 'results';

const IFRSComplianceDashboard: React.FC<IFRSComplianceDashboardProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('setup');
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentData, setAssessmentData] = useState<AssessmentFormData | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentRequirement, setCurrentRequirement] = useState('');
  const [totalRequirements, setTotalRequirements] = useState(0);
  const [completedRequirements, setCompletedRequirements] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState('');
  const [assessmentStatus, setAssessmentStatus] = useState<'running' | 'completed' | 'error' | 'paused'>('running');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ComplianceResult[]>([]);
  const [summary, setSummary] = useState<APISummary | null>(null);
  
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start assessment with real API call
  const startAssessment = async (data: AssessmentFormData) => {
    try {
      setIsAssessing(true);
      setCurrentStep('progress');
      setAssessmentData(data);
      setError(null);
      setProgress(0);
      setCompletedRequirements(0);

      // Call the actual API to start assessment
      const response: IFRSAssessmentResponse = await ifrsComplianceAPI.startAssessment(data);
      
      if (response.status === 'failed') {
        throw new Error(response.error || 'Assessment failed to start');
      }

      setAssessmentId(response.assessmentId);
      
      // Start polling for progress
      startProgressPolling(response.assessmentId);
      
    } catch (err) {
      console.error('Failed to start assessment:', err);
      setError(err instanceof Error ? err.message : 'Failed to start assessment');
      setIsAssessing(false);
      setCurrentStep('setup');
    }
  };

  // Poll for assessment progress
  const startProgressPolling = (id: string) => {
    progressIntervalRef.current = setInterval(async () => {
      try {
        const progressData: APIProgress = await ifrsComplianceAPI.getAssessmentProgress(id);
        
        setProgress(progressData.progress);
        setCurrentRequirement(progressData.currentRequirement || '');
        setCompletedRequirements(progressData.completedCount);
        setTotalRequirements(progressData.totalCount);
        
        if (progressData.estimatedTimeRemaining) {
          const minutes = Math.round(progressData.estimatedTimeRemaining / 60);
          setEstimatedTimeRemaining(`${minutes} minutes`);
        }

        if (progressData.status === 'completed') {
          clearInterval(progressIntervalRef.current!);
          setIsAssessing(false);
          setAssessmentStatus('completed');
          await loadResults(id);
          setCurrentStep('results');
        } else if (progressData.status === 'failed') {
          clearInterval(progressIntervalRef.current!);
          setIsAssessing(false);
          setAssessmentStatus('error');
          setError(progressData.error || 'Assessment failed');
        }
        
      } catch (err) {
        console.error('Failed to get progress:', err);
        setError('Failed to get assessment progress');
      }
    }, 2000); // Poll every 2 seconds
  };

  // Load assessment results
  const loadResults = async (id: string) => {
    try {
      const [resultsData, summaryData] = await Promise.all([
        ifrsComplianceAPI.getAssessmentResults(id),
        ifrsComplianceAPI.getComplianceSummary(id)
      ]);
      
      setResults(resultsData);
      setSummary(summaryData);
      
    } catch (err) {
      console.error('Failed to load results:', err);
      setError('Failed to load assessment results');
    }
  };

  // Export results
  const handleExport = async (format: 'pdf' | 'excel' | 'json' | 'csv') => {
    if (!assessmentId) return;
    
    try {
      const blob = await ifrsComplianceAPI.exportResults(assessmentId, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ifrs-compliance-assessment.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('Failed to export results:', err);
      setError('Failed to export results');
    }
  };

  // Start new assessment
  const handleNewAssessment = () => {
    setCurrentStep('setup');
    setIsAssessing(false);
    setAssessmentData(null);
    setAssessmentId(null);
    setProgress(0);
    setCurrentRequirement('');
    setTotalRequirements(0);
    setCompletedRequirements(0);
    setEstimatedTimeRemaining('');
    setAssessmentStatus('running');
    setError(null);
    setResults([]);
    setSummary(null);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 'setup':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">IFRS Compliance Assessment</h2>
                <p className="text-gray-300">Upload your IFRS requirements and financial statements for comprehensive compliance analysis</p>
              </div>
            </div>
            
            <AssessmentForm onSubmit={startAssessment} isSubmitting={isAssessing} />
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">Assessment in Progress</h2>
                <p className="text-gray-300">Analyzing your financial statements against IFRS requirements</p>
              </div>
            </div>
            
            <AssessmentProgress
              progress={progress}
              currentRequirement={currentRequirement}
              completedCount={completedRequirements}
              totalCount={totalRequirements}
              estimatedTimeRemaining={estimatedTimeRemaining}
              status={assessmentStatus}
              error={error}
            />
          </div>
        );

      case 'results':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {onBack && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">Assessment Results</h2>
                  <p className="text-gray-300">Comprehensive IFRS compliance analysis complete</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('excel')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewAssessment}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  New Assessment
                </Button>
              </div>
            </div>
            
            {summary && <ComplianceSummary results={results} summary={summary} />}
            <AssessmentResults results={results} onExport={handleExport} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {renderStep()}
    </div>
  );
};

export default IFRSComplianceDashboard; 