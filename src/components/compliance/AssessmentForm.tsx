import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface AssessmentFormProps {
  onSubmit: (data: AssessmentFormData) => void;
  isSubmitting?: boolean;
}

export interface AssessmentFormData {
  entityName: string;
  businessDescription: string;
  ifrsRequirements: File | null;
  financialStatements: File | null;
  maxConcurrent?: number;
  additionalContext?: string;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [formData, setFormData] = useState<AssessmentFormData>({
    entityName: '',
    businessDescription: '',
    ifrsRequirements: null,
    financialStatements: null,
    maxConcurrent: 5,
    additionalContext: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const onDropIFRS = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFormData(prev => ({ ...prev, ifrsRequirements: file }));
      setErrors(prev => ({ ...prev, ifrsRequirements: '' }));
    }
  }, []);

  const onDropFinancial = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFormData(prev => ({ ...prev, financialStatements: file }));
      setErrors(prev => ({ ...prev, financialStatements: '' }));
    }
  }, []);

  const { getRootProps: getIFRSRootProps, getInputProps: getIFRSInputProps, isDragActive: isIFRSDragActive } = useDropzone({
    onDrop: onDropIFRS,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const { getRootProps: getFinancialRootProps, getInputProps: getFinancialInputProps, isDragActive: isFinancialDragActive } = useDropzone({
    onDrop: onDropFinancial,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.entityName.trim()) {
      newErrors.entityName = 'Entity name is required';
    }

    if (!formData.businessDescription.trim()) {
      newErrors.businessDescription = 'Business description is required';
    }

    if (!formData.ifrsRequirements) {
      newErrors.ifrsRequirements = 'IFRS requirements file is required';
    }

    if (!formData.financialStatements) {
      newErrors.financialStatements = 'Financial statements file is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const removeFile = (type: 'ifrs' | 'financial') => {
    if (type === 'ifrs') {
      setFormData(prev => ({ ...prev, ifrsRequirements: null }));
    } else {
      setFormData(prev => ({ ...prev, financialStatements: null }));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-400" />
          IFRS Compliance Assessment Setup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Entity Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Entity Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Entity Name *
              </label>
              <Input
                type="text"
                value={formData.entityName}
                onChange={(e) => setFormData(prev => ({ ...prev, entityName: e.target.value }))}
                placeholder="Enter entity name"
                className={`bg-gray-700 border-gray-600 text-white ${errors.entityName ? 'border-red-500' : ''}`}
              />
              {errors.entityName && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.entityName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Description *
              </label>
              <textarea
                value={formData.businessDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
                placeholder="Describe the entity's business activities, industry, and key operations"
                rows={3}
                className={`w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.businessDescription ? 'border-red-500' : ''}`}
              />
              {errors.businessDescription && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.businessDescription}
                </p>
              )}
            </div>
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Document Upload</h3>
            
            {/* IFRS Requirements Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                IFRS Requirements Document *
              </label>
              <div
                {...getIFRSRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isIFRSDragActive ? 'border-blue-400 bg-blue-400/10' : 'border-gray-600 hover:border-gray-500'
                } ${errors.ifrsRequirements ? 'border-red-500' : ''}`}
              >
                <input {...getIFRSInputProps()} />
                {formData.ifrsRequirements ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <div className="text-left">
                        <p className="text-white font-medium">{formData.ifrsRequirements.name}</p>
                        <p className="text-gray-400 text-sm">{formatFileSize(formData.ifrsRequirements.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile('ifrs');
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-300">
                      {isIFRSDragActive ? 'Drop the IFRS requirements file here' : 'Drag & drop IFRS requirements (PDF/TXT) or click to browse'}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">Max size: 10MB</p>
                  </div>
                )}
              </div>
              {errors.ifrsRequirements && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.ifrsRequirements}
                </p>
              )}
            </div>

            {/* Financial Statements Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Financial Statements *
              </label>
              <div
                {...getFinancialRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isFinancialDragActive ? 'border-blue-400 bg-blue-400/10' : 'border-gray-600 hover:border-gray-500'
                } ${errors.financialStatements ? 'border-red-500' : ''}`}
              >
                <input {...getFinancialInputProps()} />
                {formData.financialStatements ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <div className="text-left">
                        <p className="text-white font-medium">{formData.financialStatements.name}</p>
                        <p className="text-gray-400 text-sm">{formatFileSize(formData.financialStatements.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile('financial');
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-300">
                      {isFinancialDragActive ? 'Drop the financial statements file here' : 'Drag & drop financial statements (PDF/TXT) or click to browse'}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">Max size: 50MB</p>
                  </div>
                )}
              </div>
              {errors.financialStatements && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.financialStatements}
                </p>
              )}
            </div>
          </div>

          {/* Assessment Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Assessment Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Concurrent Assessments
              </label>
              <Input
                type="number"
                min="1"
                max="20"
                value={formData.maxConcurrent}
                onChange={(e) => setFormData(prev => ({ ...prev, maxConcurrent: parseInt(e.target.value) || 5 }))}
                className="bg-gray-700 border-gray-600 text-white w-32"
              />
              <p className="text-gray-500 text-sm mt-1">Higher values may improve speed but increase resource usage</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Context (Optional)
              </label>
              <textarea
                value={formData.additionalContext}
                onChange={(e) => setFormData(prev => ({ ...prev, additionalContext: e.target.value }))}
                placeholder="Any additional context or specific areas of focus for the assessment"
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              {isSubmitting ? 'Starting Assessment...' : 'Start Assessment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AssessmentForm; 