import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Separator from '@/components/ui/Separator';
import { CheckCircle, Circle, AlertCircle, ExternalLink, Play, Clock, CheckSquare } from 'lucide-react';
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
      
      // Simulate procedure execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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