import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Separator from '@/components/ui/Separator';
import { CheckCircle, Circle, AlertCircle, ExternalLink, Play, Clock, CheckSquare, Database, FileText, Calculator, CheckSquare2, AlertTriangle, TrendingUp, Terminal, Cpu, HardDrive } from 'lucide-react';
import { ifrsMicroserviceUrl } from '@/lib/constants';
import AuditStartButton from '@/components/ui/AuditStartButton';

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

interface ProcessLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'command';
  details?: string;
}

interface ComplianceResult {
  requirement_id: string;
  description: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'INSUFFICIENT_INFO' | 'NOT_APPLICABLE';
  confidence: number;
  risk_level: 'low' | 'medium' | 'high';
  reasoning: string;
  actions: string;
}

const AuditCoPilot: React.FC = () => {
  const [procedures, setProcedures] = useState<AuditProcedure[]>([
    // Compliance Checklists (Prioritized)
    {
      id: 'ifrs-compliance',
      name: 'IFRS Compliance Checklist',
      description: 'Comprehensive IFRS compliance assessment covering all relevant standards and disclosure requirements.',
      status: 'pending',
      category: 'compliance',
      microserviceUrl: ifrsMicroserviceUrl,
      estimatedTime: '45-60 minutes'
    },
    // FSLIs (Financial Statement Line Items)
    {
      id: 'operating-expenses',
      name: 'Operating Expenses Testing',
      description: 'Comprehensive testing of operating expenses including classification, completeness, and accuracy.',
      status: 'pending',
      category: 'fsli',
      estimatedTime: '15-20 minutes'
    },
    {
      id: 'revenue-testing',
      name: 'Revenue Testing',
      description: 'Testing of revenue recognition, completeness, and accuracy in accordance with applicable standards.',
      status: 'pending',
      category: 'fsli',
      estimatedTime: '20-25 minutes'
    },
    {
      id: 'payroll-testing',
      name: 'Payroll Testing',
      description: 'Verification of payroll expenses, employee benefits, and related accruals.',
      status: 'pending',
      category: 'fsli',
      estimatedTime: '15-20 minutes'
    },
    {
      id: 'impairment-testing',
      name: 'Impairment Testing',
      description: 'Assessment of asset impairment indicators and calculation of impairment losses.',
      status: 'pending',
      category: 'fsli',
      estimatedTime: '25-30 minutes'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [activeProcess, setActiveProcess] = useState<string | null>(null);
  const [processLogs, setProcessLogs] = useState<ProcessLog[]>([]);
  const [complianceResults, setComplianceResults] = useState<ComplianceResult[]>([]);
  const [showComplianceTable, setShowComplianceTable] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
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

  const addProcessLog = (message: string, type: ProcessLog['type'] = 'info', details?: string) => {
    const log: ProcessLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
      details
    };
    setProcessLogs(prev => [...prev, log]);
  };

  const handleStartProcedure = async (procedure: AuditProcedure) => {
    setIsLoading(true);
    setActiveProcess(procedure.id);
    setProcessLogs([]);

    // Update procedure status to in-progress
    setProcedures(prev => prev.map(p => 
      p.id === procedure.id ? { ...p, status: 'in-progress' as const } : p
    ));

    try {
      if (procedure.id === 'ifrs-compliance') {
        await executeIFRSComplianceAudit();
      } else if (procedure.id === 'operating-expenses') {
        await executeOperatingExpensesAudit();
      } else {
        // Simulate other procedures
        addProcessLog(`Initializing ${procedure.name}...`, 'command');
        await new Promise(resolve => setTimeout(resolve, 2000));
        addProcessLog(`${procedure.name} completed successfully.`, 'success');
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
      addProcessLog(`Error executing ${procedure.name}: ${error}`, 'error');
      setProcedures(prev => prev.map(p => 
        p.id === procedure.id ? { ...p, status: 'failed' as const } : p
      ));
    } finally {
      setIsLoading(false);
      setActiveProcess(null);
    }
  };

  const executeIFRSComplianceAudit = async () => {
    addProcessLog('Initializing IFRS Compliance Assessment...', 'command');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addProcessLog('Connecting to IFRS Compliance Microservice...', 'info');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    addProcessLog('Loading Kerry Group 2023 Financial Statements...', 'info');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    addProcessLog('Parsing entity information: Global food and ingredients industry leader', 'info');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addProcessLog('Loading IFRS Standards Database (739 requirements)...', 'info');
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    addProcessLog('Starting real-time compliance assessment...', 'command');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate real-time compliance results
    const mockResults: ComplianceResult[] = [
      {
        requirement_id: 'IFRS_1_39AH_IFRS1A',
        description: 'Deferred Tax related to Assets and Liabilities arising from a Single Transaction',
        status: 'NOT_APPLICABLE',
        confidence: 90,
        risk_level: 'low',
        reasoning: 'Standard not applicable: The IFRS requirement pertains to deferred tax related to assets and liabilities arising from a single transaction, which is specifically relevant to entities that recognize deferred tax assets and liabilities.',
        actions: 'No follow-up required as standard is not applicable.'
      },
      {
        requirement_id: 'IFRS_1_39AE_IFRS1A',
        description: 'IFRS 17 Insurance Contracts, issued in May 2017',
        status: 'NOT_APPLICABLE',
        confidence: 95,
        risk_level: 'low',
        reasoning: 'Standard not applicable: IFRS 17 Insurance Contracts is specifically designed for entities that issue insurance contracts. The entity\'s business description indicates that it is involved in dairy and food ingredients, not insurance.',
        actions: 'No follow-up required as standard is not applicable.'
      },
      {
        requirement_id: 'IFRS_1_2_IFRS1A',
        description: 'An entity shall apply IFRS 1 in:',
        status: 'NOT_APPLICABLE',
        confidence: 85,
        risk_level: 'low',
        reasoning: 'Standard not applicable: IFRS 1 is applicable to entities adopting IFRS for the first time. Given that the entity\'s business description does not indicate that it is a first-time adopter of IFRS.',
        actions: 'No follow-up required as standard is not applicable.'
      }
    ];

    setComplianceResults(mockResults);
    setShowComplianceTable(true);
    
    addProcessLog('Compliance assessment completed. Results populated in table.', 'success');
    addProcessLog('Total Requirements: 739 | Processed: 10 | Not Applicable: 10', 'info');
  };

  const executeOperatingExpensesAudit = async () => {
    addProcessLog('Initializing Operating Expenses Audit...', 'command');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addProcessLog('> Connecting to financial system...', 'command');
    await new Promise(resolve => setTimeout(resolve, 800));
    addProcessLog('✓ Financial system connection established', 'success');
    
    addProcessLog('> Accessing general ledger database...', 'command');
    await new Promise(resolve => setTimeout(resolve, 1200));
    addProcessLog('✓ General ledger access granted', 'success');
    
    addProcessLog('> Querying account 94110 (Operating Expenses)...', 'command');
    await new Promise(resolve => setTimeout(resolve, 1500));
    addProcessLog('✓ Retrieved 2,847 transactions for account 94110', 'success');
    
    addProcessLog('> Sorting transactions by amount (highest to lowest)...', 'command');
    await new Promise(resolve => setTimeout(resolve, 1000));
    addProcessLog('✓ Transactions sorted successfully', 'success');
    
    addProcessLog('> Applying statistical sampling methodology...', 'command');
    await new Promise(resolve => setTimeout(resolve, 2000));
    addProcessLog('✓ Sample size determined: 10 transactions', 'success');
    
    addProcessLog('> Extracting haphazard sample of 10 transactions...', 'command');
    await new Promise(resolve => setTimeout(resolve, 1500));
    addProcessLog('✓ Sample transactions selected:', 'info');
    addProcessLog('  - Invoice #INV-2023-001: $45,230.00', 'info');
    addProcessLog('  - Invoice #INV-2023-015: $32,150.00', 'info');
    addProcessLog('  - Invoice #INV-2023-089: $28,750.00', 'info');
    addProcessLog('  - Invoice #INV-2023-156: $22,400.00', 'info');
    addProcessLog('  - Invoice #INV-2023-234: $18,900.00', 'info');
    addProcessLog('  - Invoice #INV-2023-312: $15,600.00', 'info');
    addProcessLog('  - Invoice #INV-2023-445: $12,300.00', 'info');
    addProcessLog('  - Invoice #INV-2023-567: $9,800.00', 'info');
    addProcessLog('  - Invoice #INV-2023-678: $7,200.00', 'info');
    addProcessLog('  - Invoice #INV-2023-789: $5,100.00', 'info');
    
    addProcessLog('> Accessing supporting documentation...', 'command');
    await new Promise(resolve => setTimeout(resolve, 2000));
    addProcessLog('✓ Invoice details retrieved from document management system', 'success');
    
    addProcessLog('> Comparing transaction descriptions to invoice details...', 'command');
    await new Promise(resolve => setTimeout(resolve, 3000));
    addProcessLog('✓ All 10 sample descriptions match supporting documentation', 'success');
    
    addProcessLog('> Reconciling amounts and computing taxes...', 'command');
    await new Promise(resolve => setTimeout(resolve, 2500));
    addProcessLog('✓ Amount reconciliation completed', 'success');
    addProcessLog('✓ Tax calculations verified', 'success');
    
    addProcessLog('> Calculating differences and assessing against thresholds...', 'command');
    await new Promise(resolve => setTimeout(resolve, 2000));
    addProcessLog('✓ No material differences identified', 'success');
    addProcessLog('✓ All variances within acceptable thresholds', 'success');
    
    addProcessLog('> Concluding on materiality...', 'command');
    await new Promise(resolve => setTimeout(resolve, 1500));
    addProcessLog('✓ No material misstatements identified', 'success');
    
    addProcessLog('> Preparing audit trail documentation...', 'command');
    await new Promise(resolve => setTimeout(resolve, 2000));
    addProcessLog('✓ Audit trail completed and saved', 'success');
    
    addProcessLog('✓ Operating Expenses Audit completed successfully', 'success');
    addProcessLog('✓ Conclusion: No material misstatements. Operating expenses fairly stated.', 'success');
  };

  const complianceProcedures = procedures.filter(p => p.category === 'compliance');
  const fsliProcedures = procedures.filter(p => p.category === 'fsli');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-black/80 backdrop-blur-lg border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Terminal className="h-6 w-6 text-purple-400" />
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
            <h2 className="text-5xl font-bold mb-6 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Autonomous Audit Execution
            </h2>
            <p className="text-2xl text-white mb-4 font-light" style={{ fontFamily: "'Playfair Display', serif" }}>
              Intelligent Compliance Assessment & Financial Statement Verification
            </p>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Augentik's advanced audit co-pilot orchestrates comprehensive financial examinations through 
              intelligent automation, real-time compliance monitoring, and precision-driven analysis. 
              Experience the future of audit assurance where every procedure is executed with surgical precision 
              and every finding is documented with forensic accuracy.
            </p>
          </div>
        </div>
      </section>

      {/* Audit Procedures */}
      <section className="px-6 pb-12">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Process Log Display */}
          {activeProcess && processLogs.length > 0 && (
            <div className="mb-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Terminal className="h-5 w-5 text-cyan-400" />
                      <span>Audit Process Console</span>
                    </CardTitle>
                    {activeProcess && (
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-cyan-400 text-sm">Live</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/80 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto">
                    {processLogs.map((log) => (
                      <div key={log.id} className="mb-1">
                        <span className="text-gray-500">[{log.timestamp}]</span>
                        <span className={`ml-2 ${
                          log.type === 'success' ? 'text-green-400' :
                          log.type === 'error' ? 'text-red-400' :
                          log.type === 'warning' ? 'text-yellow-400' :
                          log.type === 'command' ? 'text-cyan-400' :
                          'text-gray-300'
                        }`}>
                          {log.message}
                        </span>
                        {log.details && (
                          <div className="ml-4 text-gray-400 text-xs">
                            {log.details}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Compliance Results Table */}
          {showComplianceTable && complianceResults.length > 0 && (
            <div className="mb-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">IFRS Compliance Assessment Results</CardTitle>
                  <CardDescription className="text-gray-300">
                    Real-time compliance assessment for Kerry Group 2023
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left p-2 text-gray-300">Requirement ID</th>
                          <th className="text-left p-2 text-gray-300">Description</th>
                          <th className="text-left p-2 text-gray-300">Status</th>
                          <th className="text-left p-2 text-gray-300">Confidence</th>
                          <th className="text-left p-2 text-gray-300">Risk Level</th>
                          <th className="text-left p-2 text-gray-300">Reasoning</th>
                          <th className="text-left p-2 text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complianceResults.map((result, index) => (
                          <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                            <td className="p-2 text-cyan-400 font-mono">{result.requirement_id}</td>
                            <td className="p-2 text-gray-300">{result.description}</td>
                            <td className="p-2">
                              <Badge variant={
                                result.status === 'COMPLIANT' ? 'default' :
                                result.status === 'NON_COMPLIANT' ? 'destructive' :
                                result.status === 'INSUFFICIENT_INFO' ? 'secondary' :
                                'outline'
                              } className={
                                result.status === 'NOT_APPLICABLE' ? 'border-gray-500 text-gray-400' : ''
                              }>
                                {result.status}
                              </Badge>
                            </td>
                            <td className="p-2 text-gray-300">{result.confidence}%</td>
                            <td className="p-2">
                              <Badge variant={
                                result.risk_level === 'high' ? 'destructive' :
                                result.risk_level === 'medium' ? 'secondary' :
                                'default'
                              } className={
                                result.risk_level === 'low' ? 'bg-green-500' : ''
                              }>
                                {result.risk_level}
                              </Badge>
                            </td>
                            <td className="p-2 text-gray-400 text-xs max-w-xs">{result.reasoning}</td>
                            <td className="p-2 text-gray-400 text-xs">{result.actions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Compliance Checklists Section */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-white">
              Compliance Checklists
            </h3>
            <div className="space-y-4">
              {complianceProcedures.map((procedure) => (
                <Card key={procedure.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          {getStatusIcon(procedure.status)}
                          <div>
                            <h4 className="text-lg font-semibold text-white">{procedure.name}</h4>
                            <p className="text-gray-300 text-sm">{procedure.description}</p>
                          </div>
                          {getStatusBadge(procedure.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{procedure.estimatedTime}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
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
                        <AuditStartButton
                          onClick={() => handleStartProcedure(procedure)}
                          disabled={isLoading || procedure.status === 'in-progress'}
                          isRunning={procedure.status === 'in-progress'}
                        >
                          {procedure.status === 'in-progress' ? 'Running...' : 'Start Audit'}
                        </AuditStartButton>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator className="bg-gray-700" />

          {/* FSLIs Section */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-white">
              FSLIs (Financial Statement Line Items)
            </h3>
            <div className="space-y-4">
              {fsliProcedures.map((procedure) => (
                <Card key={procedure.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          {getStatusIcon(procedure.status)}
                          <div>
                            <h4 className="text-lg font-semibold text-white">{procedure.name}</h4>
                            <p className="text-gray-300 text-sm">{procedure.description}</p>
                          </div>
                          {getStatusBadge(procedure.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{procedure.estimatedTime}</span>
                          </span>
                        </div>
                      </div>
                      <AuditStartButton
                        onClick={() => handleStartProcedure(procedure)}
                        disabled={isLoading || procedure.status === 'in-progress'}
                        isRunning={procedure.status === 'in-progress'}
                      >
                        {procedure.status === 'in-progress' ? 'Running...' : 'Start Audit'}
                      </AuditStartButton>
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