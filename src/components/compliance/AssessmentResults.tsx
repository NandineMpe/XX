import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle, XCircle, HelpCircle, FileText, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

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

interface AssessmentResultsProps {
  results: ComplianceResult[];
  entityName: string;
  onExport?: (format: 'pdf' | 'excel' | 'json') => void;
}

const AssessmentResults: React.FC<AssessmentResultsProps> = ({ results, entityName, onExport }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (requirementId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(requirementId)) {
      newExpanded.delete(requirementId);
    } else {
      newExpanded.add(requirementId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusIcon = (status: ComplianceResult['status']) => {
    switch (status) {
      case 'COMPLIANT':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'NON_COMPLIANT':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'INSUFFICIENT_INFO':
        return <HelpCircle className="h-4 w-4 text-yellow-400" />;
      case 'NOT_APPLICABLE':
        return <FileText className="h-4 w-4 text-gray-400" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ComplianceResult['status']) => {
    const variants = {
      COMPLIANT: 'bg-green-500/20 text-green-300 border-green-500/30',
      NON_COMPLIANT: 'bg-red-500/20 text-red-300 border-red-500/30',
      INSUFFICIENT_INFO: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      NOT_APPLICABLE: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    };

    return (
      <Badge className={`${variants[status]} border`}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getRiskBadge = (riskLevel: ComplianceResult['risk_level']) => {
    const variants = {
      low: 'bg-green-500/20 text-green-300 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      high: 'bg-red-500/20 text-red-300 border-red-500/30',
    };

    return (
      <Badge className={`${variants[riskLevel]} border capitalize`}>
        {riskLevel}
      </Badge>
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const complianceStats = {
    compliant: results.filter(r => r.status === 'COMPLIANT').length,
    nonCompliant: results.filter(r => r.status === 'NON_COMPLIANT').length,
    insufficientInfo: results.filter(r => r.status === 'INSUFFICIENT_INFO').length,
    notApplicable: results.filter(r => r.status === 'NOT_APPLICABLE').length,
    total: results.length,
  };

  const overallCompliance = Math.round((complianceStats.compliant / complianceStats.total) * 100);

  return (
    <div className="space-y-6">
      {/* Header with Export Options */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Assessment Results</h2>
          <p className="text-gray-400">IFRS Compliance Assessment for {entityName}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport?.('pdf')}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport?.('excel')}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-900/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Compliant</p>
                <p className="text-white text-2xl font-bold">{complianceStats.compliant}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm">Non-Compliant</p>
                <p className="text-white text-2xl font-bold">{complianceStats.nonCompliant}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-900/20 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm">Insufficient Info</p>
                <p className="text-white text-2xl font-bold">{complianceStats.insufficientInfo}</p>
              </div>
              <HelpCircle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/20 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Overall Score</p>
                <p className="text-white text-2xl font-bold">{overallCompliance}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Detailed Compliance Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-3 text-gray-300 font-medium">Requirement</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Risk Level</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Confidence</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <React.Fragment key={result.requirement_id}>
                    <tr 
                      className="border-b border-gray-700/50 hover:bg-gray-700/20 cursor-pointer"
                      onClick={() => toggleRow(result.requirement_id)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button className="text-gray-400 hover:text-white">
                            {expandedRows.has(result.requirement_id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          <div>
                            <div className="text-white font-medium">{result.requirement_id}</div>
                            <div className="text-gray-400 text-xs truncate max-w-xs">
                              {result.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          {getStatusBadge(result.status)}
                        </div>
                      </td>
                      <td className="p-3">
                        {getRiskBadge(result.risk_level)}
                      </td>
                      <td className="p-3">
                        <span className={getConfidenceColor(result.confidence)}>
                          {result.confidence}%
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-gray-400 text-xs truncate max-w-xs">
                          {result.actions}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Details */}
                    {expandedRows.has(result.requirement_id) && (
                      <tr className="bg-gray-700/10">
                        <td colSpan={5} className="p-4">
                          <div className="space-y-4">
                            {/* Requirement Details */}
                            {result.standard_name && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-2">Standard</h4>
                                <p className="text-white text-sm">{result.standard_name}</p>
                              </div>
                            )}
                            
                            {result.requirement_text && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-2">Requirement Text</h4>
                                <p className="text-gray-300 text-sm bg-gray-800/50 p-3 rounded">
                                  {result.requirement_text}
                                </p>
                              </div>
                            )}

                            {/* Reasoning */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-300 mb-2">Assessment Reasoning</h4>
                              <p className="text-gray-300 text-sm bg-gray-800/50 p-3 rounded">
                                {result.reasoning}
                              </p>
                            </div>

                            {/* Evidence Citations */}
                            {result.evidence_citations && result.evidence_citations.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-2">Evidence Citations</h4>
                                <div className="space-y-2">
                                  {result.evidence_citations.map((citation, idx) => (
                                    <div key={idx} className="text-gray-300 text-sm bg-gray-800/50 p-2 rounded">
                                      {citation}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-300 mb-2">Recommended Actions</h4>
                              <p className="text-gray-300 text-sm bg-gray-800/50 p-3 rounded">
                                {result.actions}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentResults; 