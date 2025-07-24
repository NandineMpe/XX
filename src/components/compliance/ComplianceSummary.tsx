import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, XCircle, HelpCircle, FileText, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export interface ComplianceResult {
  requirement_id: string;
  description: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'INSUFFICIENT_INFO' | 'NOT_APPLICABLE';
  confidence: number;
  risk_level: 'low' | 'medium' | 'high';
  reasoning: string;
  actions: string;
  evidence_citations?: string[];
  standard_name?: string;
  requirement_text?: string;
}

interface ComplianceSummaryProps {
  results: ComplianceResult[];
  entityName: string;
  assessmentDate: string;
  totalRequirements: number;
}

const ComplianceSummary: React.FC<ComplianceSummaryProps> = ({
  results,
  entityName,
  assessmentDate,
  totalRequirements,
}) => {
  // Calculate statistics
  const stats = {
    compliant: results.filter(r => r.status === 'COMPLIANT').length,
    nonCompliant: results.filter(r => r.status === 'NON_COMPLIANT').length,
    insufficientInfo: results.filter(r => r.status === 'INSUFFICIENT_INFO').length,
    notApplicable: results.filter(r => r.status === 'NOT_APPLICABLE').length,
    total: results.length,
  };

  const riskStats = {
    low: results.filter(r => r.risk_level === 'low').length,
    medium: results.filter(r => r.risk_level === 'medium').length,
    high: results.filter(r => r.risk_level === 'high').length,
  };

  const overallCompliance = Math.round((stats.compliant / stats.total) * 100);
  const averageConfidence = Math.round(
    results.reduce((sum, r) => sum + r.confidence, 0) / results.length
  );

  const getComplianceStatus = () => {
    if (overallCompliance >= 90) return { status: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (overallCompliance >= 75) return { status: 'Good', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (overallCompliance >= 60) return { status: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { status: 'Poor', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const complianceStatus = getComplianceStatus();

  const getPriorityActions = () => {
    return results
      .filter(r => r.status === 'NON_COMPLIANT' && r.risk_level === 'high')
      .slice(0, 3)
      .map(r => ({
        id: r.requirement_id,
        description: r.description,
        actions: r.actions,
      }));
  };

  const priorityActions = getPriorityActions();

  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Metrics */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Entity:</span>
                <span className="text-white font-medium">{entityName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Assessment Date:</span>
                <span className="text-white">{assessmentDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Total Requirements:</span>
                <span className="text-white">{totalRequirements}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Average Confidence:</span>
                <span className="text-white">{averageConfidence}%</span>
              </div>
            </div>

            {/* Overall Compliance Score */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${complianceStatus.bg} mb-4`}>
                <span className={`text-3xl font-bold ${complianceStatus.color}`}>
                  {overallCompliance}%
                </span>
              </div>
              <div className={`text-lg font-semibold ${complianceStatus.color}`}>
                {complianceStatus.status} Compliance
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {stats.compliant} of {stats.total} requirements compliant
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{stats.compliant}</span>
                  <span className="text-gray-400 text-sm">
                    ({Math.round((stats.compliant / stats.total) * 100)}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-400" />
                  <span className="text-gray-300">Non-Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{stats.nonCompliant}</span>
                  <span className="text-gray-400 text-sm">
                    ({Math.round((stats.nonCompliant / stats.total) * 100)}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-yellow-400" />
                  <span className="text-gray-300">Insufficient Info</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{stats.insufficientInfo}</span>
                  <span className="text-gray-400 text-sm">
                    ({Math.round((stats.insufficientInfo / stats.total) * 100)}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300">Not Applicable</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{stats.notApplicable}</span>
                  <span className="text-gray-400 text-sm">
                    ({Math.round((stats.notApplicable / stats.total) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Level Breakdown */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Low Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{riskStats.low}</span>
                  <span className="text-gray-400 text-sm">
                    ({Math.round((riskStats.low / stats.total) * 100)}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-300">Medium Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{riskStats.medium}</span>
                  <span className="text-gray-400 text-sm">
                    ({Math.round((riskStats.medium / stats.total) * 100)}%)
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-gray-300">High Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{riskStats.high}</span>
                  <span className="text-gray-400 text-sm">
                    ({Math.round((riskStats.high / stats.total) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Highlights */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Key Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Compliance Score */}
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <h4 className="text-white font-medium">Overall Compliance Score</h4>
                <p className="text-gray-400 text-sm">Percentage of requirements that are fully compliant</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${complianceStatus.color}`}>
                  {overallCompliance}%
                </div>
                <div className={`text-sm ${complianceStatus.color}`}>
                  {complianceStatus.status}
                </div>
              </div>
            </div>

            {/* Critical Issues */}
            {stats.nonCompliant > 0 && (
              <div className="flex items-center justify-between p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div>
                  <h4 className="text-red-300 font-medium">Critical Issues Identified</h4>
                  <p className="text-red-400 text-sm">
                    {stats.nonCompliant} non-compliant requirements require immediate attention
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-400">{stats.nonCompliant}</div>
                  <div className="text-sm text-red-400">Issues</div>
                </div>
              </div>
            )}

            {/* Information Gaps */}
            {stats.insufficientInfo > 0 && (
              <div className="flex items-center justify-between p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                <div>
                  <h4 className="text-yellow-300 font-medium">Information Gaps</h4>
                  <p className="text-yellow-400 text-sm">
                    {stats.insufficientInfo} requirements need additional information for assessment
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-400">{stats.insufficientInfo}</div>
                  <div className="text-sm text-yellow-400">Gaps</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Priority Actions */}
      {priorityActions.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Priority Actions Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorityActions.map((action, index) => (
                <div key={action.id} className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-red-300 font-medium">{action.id}</h4>
                      <p className="text-gray-300 text-sm mt-1">{action.description}</p>
                      <p className="text-red-300 text-sm mt-2">{action.actions}</p>
                    </div>
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30 ml-3">
                      High Priority
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComplianceSummary; 