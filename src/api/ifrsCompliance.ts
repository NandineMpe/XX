import { ifrsMicroserviceUrl } from '@/lib/constants';

export interface IFRSAssessmentRequest {
  entityName: string;
  businessDescription: string;
  ifrsRequirements: File;
  financialStatements: File;
  maxConcurrent?: number;
  additionalContext?: string;
}

export interface IFRSAssessmentResponse {
  assessmentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  estimatedTimeRemaining?: number;
  results?: ComplianceResult[];
  error?: string;
}

export interface ComplianceResult {
  requirementId: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'partial' | 'not-applicable' | 'error';
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string;
  evidence: string[];
  recommendations: string[];
  applicableStandards: string[];
  lastUpdated: string;
}

export interface AssessmentProgress {
  assessmentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentRequirement?: string;
  completedCount: number;
  totalCount: number;
  estimatedTimeRemaining?: number;
  error?: string;
}

export interface ComplianceSummary {
  totalRequirements: number;
  compliantCount: number;
  nonCompliantCount: number;
  partialCount: number;
  notApplicableCount: number;
  errorCount: number;
  overallComplianceRate: number;
  highRiskCount: number;
  criticalRiskCount: number;
  assessmentDuration: number;
  lastUpdated: string;
}

class IFRSComplianceAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ifrsMicroserviceUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  private async makeFormDataRequest<T>(
    endpoint: string,
    formData: FormData
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Start a new IFRS compliance assessment
  async startAssessment(data: IFRSAssessmentRequest): Promise<IFRSAssessmentResponse> {
    const formData = new FormData();
    formData.append('entityName', data.entityName);
    formData.append('businessDescription', data.businessDescription);
    formData.append('ifrsRequirements', data.ifrsRequirements);
    formData.append('financialStatements', data.financialStatements);
    
    if (data.maxConcurrent) {
      formData.append('maxConcurrent', data.maxConcurrent.toString());
    }
    
    if (data.additionalContext) {
      formData.append('additionalContext', data.additionalContext);
    }

    return this.makeFormDataRequest<IFRSAssessmentResponse>('/compliance/assess', formData);
  }

  // Get assessment progress
  async getAssessmentProgress(assessmentId: string): Promise<AssessmentProgress> {
    return this.makeRequest<AssessmentProgress>(`/compliance/progress/${assessmentId}`);
  }

  // Get assessment results
  async getAssessmentResults(assessmentId: string): Promise<ComplianceResult[]> {
    return this.makeRequest<ComplianceResult[]>(`/compliance/results/${assessmentId}`);
  }

  // Get compliance summary
  async getComplianceSummary(assessmentId: string): Promise<ComplianceSummary> {
    return this.makeRequest<ComplianceSummary>(`/compliance/summary/${assessmentId}`);
  }

  // Parse IFRS requirements from file
  async parseRequirements(file: File): Promise<{ requirements: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.makeFormDataRequest<{ requirements: string[] }>('/compliance/requirements/parse', formData);
  }

  // Extract entity information from financial statements
  async extractEntityInfo(file: File): Promise<{ entityName: string; businessDescription: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.makeFormDataRequest<{ entityName: string; businessDescription: string }>('/compliance/entity/extract', formData);
  }

  // Quick assessment (single requirement)
  async quickAssessment(
    requirement: string,
    financialStatements: File,
    entityName?: string
  ): Promise<ComplianceResult> {
    const formData = new FormData();
    formData.append('requirement', requirement);
    formData.append('financialStatements', financialStatements);
    
    if (entityName) {
      formData.append('entityName', entityName);
    }

    return this.makeFormDataRequest<ComplianceResult>('/compliance/assess/single', formData);
  }

  // Detailed assessment with custom parameters
  async detailedAssessment(
    data: IFRSAssessmentRequest & {
      customParameters?: Record<string, any>;
      assessmentType?: 'comprehensive' | 'targeted' | 'risk-based';
    }
  ): Promise<IFRSAssessmentResponse> {
    const formData = new FormData();
    formData.append('entityName', data.entityName);
    formData.append('businessDescription', data.businessDescription);
    formData.append('ifrsRequirements', data.ifrsRequirements);
    formData.append('financialStatements', data.financialStatements);
    
    if (data.maxConcurrent) {
      formData.append('maxConcurrent', data.maxConcurrent.toString());
    }
    
    if (data.additionalContext) {
      formData.append('additionalContext', data.additionalContext);
    }

    return this.makeFormDataRequest<IFRSAssessmentResponse>('/compliance/assess/detailed', formData);
  }

  // Export assessment results
  async exportResults(
    assessmentId: string,
    format: 'pdf' | 'excel' | 'json' | 'csv'
  ): Promise<Blob> {
    const url = `${this.baseUrl}/compliance/export/${assessmentId}?format=${format}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error(`Export request failed for ${assessmentId}:`, error);
      throw error;
    }
  }
}

export const ifrsComplianceAPI = new IFRSComplianceAPI(); 