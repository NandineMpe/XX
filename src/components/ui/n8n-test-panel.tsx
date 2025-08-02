import React, { useState } from 'react';
import { useDocumentRequestStore } from '@/stores/documentRequests';
import Button from '@/components/ui/Button';
import { v4 as uuidv4 } from 'uuid';

export default function N8nTestPanel() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const { sendWebhookRequest, fetchRequests, requests, error, clearError } = useDocumentRequestStore();

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runWebhookTest = async () => {
    setIsTesting(true);
    setTestResults([]);
    clearError();

    try {
      addTestResult('🚀 Starting n8n webhook test...');
      
      const testData = {
        documentType: 'Test Document from Frontend',
        description: 'This is a test document request to verify n8n workflow integration',
        parameters: {
          auditor: 'Sam Salt',
          entity: 'Test Entity',
          process: 'Test Process',
          step: 'Test Step',
          source_trigger: 'Test Panel'
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      };

      addTestResult(`📤 Sending webhook request with ID: ${testData.requestId}`);
      
      const success = await sendWebhookRequest(testData);
      
      if (success) {
        addTestResult('✅ Webhook request sent successfully');
        
        // Wait a moment then fetch requests to see if it appears
        setTimeout(async () => {
          addTestResult('🔄 Fetching updated requests...');
          await fetchRequests();
          
          const newRequest = requests.find(r => r.requestId === testData.requestId);
          if (newRequest) {
            addTestResult(`✅ Request found in dashboard: ${newRequest.document} (Status: ${newRequest.status})`);
          } else {
            addTestResult('⚠️ Request not found in dashboard yet - may need more time');
          }
        }, 2000);
        
      } else {
        addTestResult('❌ Webhook request failed');
      }
    } catch (error) {
      addTestResult(`❌ Test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const runApiTest = async () => {
    setIsTesting(true);
    setTestResults([]);
    clearError();

    try {
      addTestResult('🔄 Testing API endpoint...');
      await fetchRequests();
      
      addTestResult(`📊 Found ${requests.length} requests in system`);
      
      if (requests.length > 0) {
        const latestRequest = requests[0];
        addTestResult(`📋 Latest request: ${latestRequest.document} (Status: ${latestRequest.status})`);
        
        if (latestRequest.downloadUrl) {
          addTestResult(`📎 Download URL available: ${latestRequest.downloadUrl}`);
        }
      }
    } catch (error) {
      addTestResult(`❌ API test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    clearError();
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-4 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">n8n Workflow Test Panel</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={clearResults}
          className="text-xs"
        >
          Clear
        </Button>
      </div>

      <div className="space-y-2 mb-4">
        <Button
          onClick={runWebhookTest}
          disabled={isTesting}
          className="w-full"
          size="sm"
        >
          {isTesting ? 'Testing...' : 'Test Webhook'}
        </Button>
        
        <Button
          onClick={runApiTest}
          disabled={isTesting}
          variant="outline"
          className="w-full"
          size="sm"
        >
          {isTesting ? 'Testing...' : 'Test API'}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-xs">
          Error: {error}
        </div>
      )}

      <div className="max-h-64 overflow-y-auto">
        <div className="text-xs text-gray-300 space-y-1">
          {testResults.length === 0 ? (
            <div className="text-gray-500 italic">No test results yet</div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="font-mono">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        Requests: {requests.length} | Status: {loading ? 'Loading' : 'Ready'}
      </div>
    </div>
  );
} 