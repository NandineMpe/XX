import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Separator from '@/components/ui/Separator';
import { CheckCircle, Circle, AlertCircle, ExternalLink, Play, Clock, CheckSquare, Database, FileText, Calculator, CheckSquare2, AlertTriangle, TrendingUp } from 'lucide-react';
import { ifrsMicroserviceUrl } from '@/lib/constants';

interface AuditProcedure {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  category: 'fsli' | 'compliance';
  microserviceUrl?: string;
  estimatedTime?: string;
  lastPerformed?: string;
}

interface AuditStep {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  details?: string;
  icon: React.ReactNode;
  timestamp?: string;
}

interface AuditProcess {
  procedureId: string;
  steps: AuditStep[];
  currentStep: number;
  isRunning: boolean;
  conclusion?: string;
}

const AuditCoPilot: React.FC = () => {
  const [procedures, setProcedures] = useState<AuditProcedure[]>([
    // FSLIs (Financial Statement Line Items)
    {
      id: 'operating-expenses',
      name: 'Operating Expenses Testing',
      description: 'Comprehensive testing of operating expenses including classification, completeness, and accuracy.',
      status: 'pending',
      category: 'fsli',
      estimatedTime: '2-3 hours'
    },
    {
      id: 'revenue-testing',
      name: 'Revenue Testing',
      description: 'Testing of revenue recognition, completeness, and accuracy in accordance with applicable standards.',
      status: 'pending',
      category: 'fsli',
      estimatedTime: '3-4 hours'
    },
    {
      id: 'payroll-testing',
      name: 'Payroll Testing',
      description: 'Verification of payroll expenses, employee benefits, and related accruals.',
      status: 'pending',
      category: 'fsli',
      estimatedTime: '2-3 hours'
    },
    {
      id: 'impairment-testing',
      name: 'Impairment Testing',
      description: 'Assessment of asset impairment indicators and calculation of impairment losses.',
      status: 'pending',
      category: 'fsli',
      estimatedTime: '4-5 hours'
    },
    // Compliance Checklists
    {
      id: 'ifrs-compliance',
      name: 'IFRS Compliance Checklist',
      description: 'Comprehensive IFRS compliance assessment covering all relevant standards and disclosure requirements.',
      status: 'pending',
      category: 'compliance',
      microserviceUrl: ifrsMicroserviceUrl,
      estimatedTime: '6-8 hours'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [auditProcess, setAuditProcess] = useState<AuditProcess | null>(null);

  // Operating Expenses Audit Steps
  const operatingExpensesSteps: AuditStep[] = [
    {
      id: 'pull-ledger',
      description: 'Pulling General Ledger',
      status: 'pending',
      icon: <Database className="h-4 w-4" />,
      details: 'Accessing financial system to extract general ledger data'
    },
    {
      id: 'access-account',
      description: 'Accessing Account No. 94110',
      status: 'pending',
      icon: <FileText className="h-4 w-4" />,
      details: 'Locating specific operating expenses account in the chart of accounts'
    },
    {
      id: 'sort-transactions',
      description: 'Sorting from Highest to Lowest',
      status: 'pending',
      icon: <TrendingUp className="h-4 w-4" />,
      details: 'Arranging transactions by amount in descending order for risk assessment'
    },
    {
      id: 'apply-methodology',
      description: 'Applying Audit Methodology',
      status: 'pending',
      icon: <CheckSquare2 className="h-4 w-4" />,
      details: 'Implementing statistical sampling and risk-based audit approach'
    },
    {
      id: 'extract-sample',
      description: 'Extracting Haphazard Sample of 10',
      status: 'pending',
      icon: <Calculator className="h-4 w-4" />,
      details: 'Selecting 10 transactions using systematic random sampling technique'
    },
    {
      id: 'sample-selected',
      description: 'Sample of 10 Transactions Selected',
      status: 'pending',
      icon: <CheckSquare className="h-4 w-4" />,
      details: 'Sample population identified and documented for testing'
    },
    {
      id: 'access-invoices',
      description: 'Accessing Invoices',
      status: 'pending',
      icon: <FileText className="h-4 w-4" />,
      details: 'Retrieving supporting documentation for selected transactions'
    },
    {
      id: 'pull-invoices',
      description: 'Pulling Invoices',
      status: 'pending',
      icon: <Database className="h-4 w-4" />,
      details: 'Extracting invoice details from document management system'
    },
    {
      id: 'compare-description',
      description: 'Comparing Sample Description to Invoice Detail',
      status: 'pending',
      icon: <CheckSquare2 className="h-4 w-4" />,
      details: 'Verifying transaction descriptions match supporting documentation'
    },
    {
      id: 'compare-amounts',
      description: 'Comparing Amounts',
      status: 'pending',
      icon: <Calculator className="h-4 w-4" />,
      details: 'Reconciling ledger amounts with invoice amounts for accuracy'
    },
    {
      id: 'compute-tax',
      description: 'Computing Tax',
      status: 'pending',
      icon: <Calculator className="h-4 w-4" />,
      details: 'Calculating applicable taxes and verifying tax calculations'
    },
    {
      id: 'calculate-differences',
      description: 'Calculating Differences',
      status: 'pending',
      icon: <AlertTriangle className="h-4 w-4" />,
      details: 'Identifying and quantifying variances between expected and actual amounts'
    },
    {
      id: 'assess-thresholds',
      description: 'Assessing Against Thresholds',
      status: 'pending',
      icon: <TrendingUp className="h-4 w-4" />,
      details: 'Evaluating differences against materiality thresholds and audit criteria'
    },
    {
      id: 'conclude-materiality',
      description: 'Concluding on Materiality',
      status: 'pending',
      icon: <CheckSquare2 className="h-4 w-4" />,
      details: 'Determining whether identified differences are material to financial statements'
    },
    {
      id: 'auditor-conclusion',
      description: 'Auditor Conclusion',
      status: 'pending',
      icon: <CheckSquare className="h-4 w-4" />,
      details: 'Formulating professional judgment on operating expenses accuracy'
    },
    {
      id: 'prepare-trail',
      description: 'Preparing Audit Trail',
      status: 'pending',
      icon: <FileText className="h-4 w-4" />,
      details: 'Documenting audit procedures, findings, and conclusions for review'
    },
    {
      id: 'audit-completed',
      description: 'Operating Expenses Audit Completed',
      status: 'pending',
      icon: <CheckCircle className="h-4 w-4" />,
      details: 'Final audit report prepared and ready for management review'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-blue-500">In Progress</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const handleStartProcedure = async (procedure: AuditProcedure) => {
    setIsLoading(true);

    // Update procedure status to in-progress
    setProcedures(prev => prev.map(p => 
      p.id === procedure.id ? { ...p, status: 'in-progress' as const } : p
    ));

    try {
      if (procedure.microserviceUrl) {
        // For IFRS Compliance, open the microservice
        window.open(procedure.microserviceUrl, '_blank');
      }
      
      // Special handling for Operating Expenses Testing
      if (procedure.id === 'operating-expenses') {
        await simulateOperatingExpensesAudit();
      } else {
        // Simulate other procedure execution
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Update status to completed
      setProcedures(prev => prev.map(p => 
        p.id === procedure.id ? { 
          ...p, 
          status: 'completed' as const,
          lastPerformed: new Date().toISOString()
        } : p
      ));
    } catch (error) {
      console.error('Error executing procedure:', error);
      setProcedures(prev => prev.map(p => 
        p.id === procedure.id ? { ...p, status: 'failed' as const } : p
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const simulateOperatingExpensesAudit = async () => {
    // Initialize audit process
    const initialSteps = operatingExpensesSteps.map(step => ({
      ...step,
      status: 'pending' as const,
      timestamp: undefined
    }));

    setAuditProcess({
      procedureId: 'operating-expenses',
      steps: initialSteps,
      currentStep: 0,
      isRunning: true
    });

    // Simulate each step with realistic timing
    for (let i = 0; i < operatingExpensesSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 seconds per step
      
      setAuditProcess(prev => {
        if (!prev) return prev;
        
        const updatedSteps = [...prev.steps];
        updatedSteps[i] = {
          ...updatedSteps[i],
          status: 'in-progress' as const,
          timestamp: new Date().toLocaleTimeString()
        };
        
        return {
          ...prev,
          steps: updatedSteps,
          currentStep: i
        };
      });

      // Simulate step completion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAuditProcess(prev => {
        if (!prev) return prev;
        
        const updatedSteps = [...prev.steps];
        updatedSteps[i] = {
          ...updatedSteps[i],
          status: 'completed' as const
        };
        
        return {
          ...prev,
          steps: updatedSteps,
          currentStep: i + 1
        };
      });
    }

    // Add conclusion
    setAuditProcess(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        isRunning: false,
        conclusion: 'Operating expenses audit completed successfully. No material misstatements identified. Sample testing supports the assertion that operating expenses are fairly stated in all material respects.'
      };
    });
  };

  const fsliProcedures = procedures.filter(p => p.category === 'fsli');
  const complianceProcedures = procedures.filter(p => p.category === 'compliance');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-black/80 backdrop-blur-lg border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-6 w-6 text-purple-400" />
              <h1 className="text-xl font-bold">Audit Co-Pilot</h1>
            </div>
            <Badge variant="outline" className="border-purple-400 text-purple-400">
              Autonomous Mode
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              Financial Year: 2024
            </span>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              Settings
            </Button>
          </div>
        </div>
      </nav>

      {/* Introduction Section */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Audit Procedures
            </h2>
            <p className="text-xl text-gray-300 mb-2">
              Performed autonomously, throughout the financial year
            </p>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our AI-powered audit agent continuously monitors and executes audit procedures, 
              ensuring comprehensive coverage and timely completion of all critical audit areas.
            </p>
          </div>
        </div>
      </section>

      {/* Audit Procedures */}
      <section className="px-6 pb-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Audit Process Display */}
          {auditProcess && (
            <div className="mb-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Audit Process in Progress</CardTitle>
                    {auditProcess.isRunning && (
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-blue-400 text-sm">Live</span>
                      </div>
                    )}
                  </div>
                  <CardDescription className="text-gray-300">
                    Step {auditProcess.currentStep + 1} of {auditProcess.steps.length}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {auditProcess.steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                          step.status === 'completed' ? 'bg-green-900/20 border border-green-500/30' :
                          step.status === 'in-progress' ? 'bg-blue-900/20 border border-blue-500/30 animate-pulse' :
                          'bg-gray-700/20 border border-gray-600/30'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {step.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : step.status === 'in-progress' ? (
                            <Clock className="h-5 w-5 text-blue-500 animate-spin" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {step.icon}
                            <span className="font-medium text-white">{step.description}</span>
                            {step.timestamp && (
                              <span className="text-xs text-gray-400">({step.timestamp})</span>
                            )}
                          </div>
                          {step.details && (
                            <p className="text-sm text-gray-400 mt-1">{step.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {auditProcess.conclusion && (
                    <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <h4 className="font-semibold text-green-400 mb-2">Audit Conclusion</h4>
                      <p className="text-gray-300">{auditProcess.conclusion}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* FSLIs Section */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-white">
              FSLIs (Financial Statement Line Items)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {fsliProcedures.map((procedure) => (
                <Card key={procedure.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(procedure.status)}
                        <CardTitle className="text-white">{procedure.name}</CardTitle>
                      </div>
                      {getStatusBadge(procedure.status)}
                    </div>
                    <CardDescription className="text-gray-300">
                      {procedure.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{procedure.estimatedTime}</span>
                      </div>
                      <Button
                        onClick={() => handleStartProcedure(procedure)}
                        disabled={isLoading || procedure.status === 'in-progress'}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {procedure.status === 'in-progress' ? (
                          <>
                            <Clock className="h-4 w-4 mr-2" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Start
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* Compliance Checklists Section */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-white">
              Compliance Checklists
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {complianceProcedures.map((procedure) => (
                <Card key={procedure.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(procedure.status)}
                        <CardTitle className="text-white">{procedure.name}</CardTitle>
                      </div>
                      {getStatusBadge(procedure.status)}
                    </div>
                    <CardDescription className="text-gray-300">
                      {procedure.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{procedure.estimatedTime}</span>
                      </div>
                      <div className="flex space-x-2">
                        {procedure.microserviceUrl && (
                          <Button
                            variant="outline"
                            onClick={() => window.open(procedure.microserviceUrl, '_blank')}
                            className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Service
                          </Button>
                        )}
                        <Button
                          onClick={() => handleStartProcedure(procedure)}
                          disabled={isLoading || procedure.status === 'in-progress'}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {procedure.status === 'in-progress' ? (
                            <>
                              <Clock className="h-4 w-4 mr-2" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Start
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuditCoPilot; 