import React, { useState } from 'react';
import { FileText, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

import AssessmentForm, { AssessmentFormData } from './AssessmentForm';
import AssessmentProgress from './AssessmentProgress';
import AssessmentResults, { ComplianceResult } from './AssessmentResults';
import ComplianceSummary from './ComplianceSummary';

interface IFRSComplianceDashboardProps {
  onBack?: () => void;
}

type AssessmentStep = 'setup' | 'progress' | 'results';

const IFRSComplianceDashboard: React.FC<IFRSComplianceDashboardProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('setup');
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentData, setAssessmentData] = useState<AssessmentFormData | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentRequirement, setCurrentRequirement] = useState('');
  const [totalRequirements, setTotalRequirements] = useState(0);
  const [completedRequirements, setCompletedRequirements] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState('');
  const [assessmentStatus, setAssessmentStatus] = useState<'running' | 'completed' | 'error' | 'paused'>('running');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ComplianceResult[]>([]);

  // Mock assessment simulation
  const simulateAssessment = async (data: AssessmentFormData) => {
    setIsAssessing(true);
    setCurrentStep('progress');
    setAssessmentData(data);
    setTotalRequirements(25); // Mock total requirements
    setCompletedRequirements(0);
    setProgress(0);
    setError(null);

    // Simulate progress updates
    const requirements = [
      'IFRS 15 - Revenue Recognition',
      'IFRS 16 - Leases',
      'IFRS 9 - Financial Instruments',
      'IFRS 13 - Fair Value Measurement',
      'IAS 1 - Presentation of Financial Statements',
      'IAS 2 - Inventories',
      'IAS 7 - Statement of Cash Flows',
      'IAS 8 - Accounting Policies',
      'IAS 10 - Events After Reporting Period',
      'IAS 12 - Income Taxes',
      'IAS 16 - Property, Plant and Equipment',
      'IAS 17 - Leases',
      'IAS 18 - Revenue',
      'IAS 19 - Employee Benefits',
      'IAS 20 - Government Grants',
      'IAS 21 - Effects of Changes in Foreign Exchange Rates',
      'IAS 23 - Borrowing Costs',
      'IAS 24 - Related Party Disclosures',
      'IAS 26 - Accounting and Reporting by Retirement Benefit Plans',
      'IAS 27 - Separate Financial Statements',
      'IAS 28 - Investments in Associates and Joint Ventures',
      'IAS 29 - Financial Reporting in Hyperinflationary Economies',
      'IAS 32 - Financial Instruments: Presentation',
      'IAS 33 - Earnings Per Share',
      'IAS 34 - Interim Financial Reporting',
    ];

    for (let i = 0; i < requirements.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay per requirement
      
      setCurrentRequirement(requirements[i]);
      setCompletedRequirements(i + 1);
      setProgress(((i + 1) / requirements.length) * 100);
      
      // Update estimated time remaining
      const remainingTime = Math.round((requirements.length - i - 1) * 2 / 60);
      setEstimatedTimeRemaining(`${remainingTime} minutes`);
    }

    // Generate mock results
    const mockResults: ComplianceResult[] = requirements.map((req, index) => {
      const statuses: ComplianceResult['status'][] = ['COMPLIANT', 'NON_COMPLIANT', 'INSUFFICIENT_INFO', 'NOT_APPLICABLE'];
      const riskLevels: ComplianceResult['risk_level'][] = ['low', 'medium', 'high'];
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
      const confidence = Math.floor(Math.random() * 40) + 60; // 60-100%

      return {
        requirement_id: `REQ-${String(index + 1).padStart(3, '0')}`,
        description: req,
        status,
        confidence,
        risk_level: riskLevel,
        reasoning: `Assessment of ${req} based on the provided financial statements and business context.`,
        actions: status === 'COMPLIANT' 
          ? 'No action required - requirement is fully compliant.'
          : status === 'NON_COMPLIANT'
          ? 'Immediate action required to address compliance gaps.'
          : 'Additional information needed for complete assessment.',
        evidence_citations: [
          'Financial statements page 15, Note 3',
          'Management discussion and analysis section 2.1',
        ],
        standard_name: req.split(' - ')[0],
        requirement_text: `Entities shall apply the requirements of ${req.split(' - ')[0]} when preparing and presenting financial statements.`,
      };
    });

    setResults(mockResults);
    setAssessmentStatus('completed');
    setIsAssessing(false);
    setCurrentStep('results');
  };

  const handleExport = (format: 'pdf' | 'excel' | 'json') => {
    // Mock export functionality
    console.log(`Exporting results in ${format} format`);
    // In a real implementation, this would call the backend API
  };

  const handleNewAssessment = () => {
    setCurrentStep('setup');
    setResults([]);
    setAssessmentData(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-gray-400 hover:text-white"
              >
                ← Back
              </Button>
            )}
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold">IFRS Compliance Assessment</h1>
                <p className="text-gray-400">Comprehensive IFRS compliance evaluation and reporting</p>
              </div>
            </div>
          </div>
          
          {currentStep === 'results' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleNewAssessment}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                New Assessment
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('pdf')}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep === 'setup' ? 'text-blue-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'setup' ? 'bg-blue-500' : 'bg-gray-600'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Setup</span>
            </div>
            <div className={`w-12 h-1 ${currentStep === 'progress' || currentStep === 'results' ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
            <div className={`flex items-center space-x-2 ${currentStep === 'progress' ? 'text-blue-400' : currentStep === 'results' ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'progress' ? 'bg-blue-500' : currentStep === 'results' ? 'bg-green-500' : 'bg-gray-600'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Assessment</span>
            </div>
            <div className={`w-12 h-1 ${currentStep === 'results' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
            <div className={`flex items-center space-x-2 ${currentStep === 'results' ? 'text-green-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'results' ? 'bg-green-500' : 'bg-gray-600'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Results</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {currentStep === 'setup' && (
          <AssessmentForm
            onSubmit={simulateAssessment}
            isSubmitting={isAssessing}
          />
        )}

        {currentStep === 'progress' && (
          <AssessmentProgress
            progress={progress}
            currentRequirement={currentRequirement}
            totalRequirements={totalRequirements}
            completedRequirements={completedRequirements}
            estimatedTimeRemaining={estimatedTimeRemaining}
            status={assessmentStatus}
            error={error}
          />
        )}

        {currentStep === 'results' && results.length > 0 && (
          <div className="space-y-6">
            <ComplianceSummary
              results={results}
              entityName={assessmentData?.entityName || 'Unknown Entity'}
              assessmentDate={new Date().toLocaleDateString()}
              totalRequirements={totalRequirements}
            />
            
            <AssessmentResults
              results={results}
              entityName={assessmentData?.entityName || 'Unknown Entity'}
              onExport={handleExport}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default IFRSComplianceDashboard; 