import React, { useState } from 'react';
import Button from '@/components/ui/Button';

export default function WebhookTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<string>('');

  const testWebhook = async () => {
    setIsTesting(true);
    setResult('Testing...');
    
    try {
      const testData = {
        documentType: 'Test Document',
        description: 'Testing webhook connection',
        parameters: {
          auditor: 'Sam Salt',
          entity: 'Test Entity',
          process: 'Test Process',
          step: 'Test Step',
          source_trigger: 'Test'
        },
        timestamp: new Date().toISOString(),
        requestId: `test-${Date.now()}`
      };

      console.log('🧪 Testing webhook with data:', testData);
      
      const response = await fetch('https://primary-production-1d298.up.railway.app/webhook/426951f9-1936-44c3-83ae-8f52f0508acf', {
        method: 'POST',
        headers: {
          'X-API-Key': 'admin123',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(`✅ Success! Response: ${JSON.stringify(data)}`);
        console.log('✅ Webhook test successful:', data);
      } else {
        const errorText = await response.text();
        setResult(`❌ Failed! Status: ${response.status}, Error: ${errorText}`);
        console.error('❌ Webhook test failed:', response.status, errorText);
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('❌ Webhook test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 w-80 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-4 z-50">
      <h3 className="text-white font-semibold mb-4">Webhook Test</h3>
      
      <Button
        onClick={testWebhook}
        disabled={isTesting}
        className="w-full mb-4"
        size="sm"
      >
        {isTesting ? 'Testing...' : 'Test Webhook'}
      </Button>
      
      {result && (
        <div className={`p-2 rounded text-xs ${
          result.includes('✅') 
            ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
            : 'bg-red-500/20 border border-red-500/30 text-red-300'
        }`}>
          {result}
        </div>
      )}
    </div>
  );
} 