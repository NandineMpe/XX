import { useState } from 'react'
import { useTabVisibility } from '@/contexts/useTabVisibility'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { toast } from 'sonner'

export default function ApiSite() {
  const { isTabVisible } = useTabVisibility()
  const isApiTabVisible = isTabVisible('api')
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:9621')
  const [apiKey, setApiKey] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  const handleTestConnection = async () => {
    setIsConnecting(true)
    try {
      // Simulate API connection test
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('API connection test successful!')
    } catch {
      toast.error('Failed to connect to API endpoint')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSaveConfiguration = () => {
    // Save API configuration to localStorage
    localStorage.setItem('AUGENTIK_API_ENDPOINT', apiEndpoint)
    localStorage.setItem('AUGENTIK_API_KEY', apiKey)
    toast.success('API configuration saved successfully!')
  }

  const apiEndpoints = [
    {
      name: 'Local Development',
      url: 'http://localhost:9621',
      description: 'Connect to local Augentik API server'
    },
    {
      name: 'Production Server',
      url: 'https://api.augentik.com',
      description: 'Connect to production Augentik API'
    },
    {
      name: 'Staging Environment',
      url: 'https://staging-api.augentik.com',
      description: 'Connect to staging Augentik API'
    }
  ]

  return (
    <div className={`size-full p-6 ${isApiTabVisible ? '' : 'hidden'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">API Configuration</h1>
          <p className="text-gray-400">Configure your connection to the Augentik API backend</p>
        </div>

        {/* API Connection Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>API Endpoint Configuration</CardTitle>
            <CardDescription>
              Configure the API endpoint and authentication for your Augentik backend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Setup Options */}
            <div>
              <label className="text-sm font-medium mb-3 block">Quick Setup</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {apiEndpoints.map((endpoint) => (
                  <Card 
                    key={endpoint.name}
                    className={`cursor-pointer transition-colors hover:border-emerald-500 ${
                      apiEndpoint === endpoint.url ? 'border-emerald-500 bg-emerald-500/5' : ''
                    }`}
                    onClick={() => setApiEndpoint(endpoint.url)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-1">{endpoint.name}</h3>
                      <p className="text-xs text-gray-400 mb-2">{endpoint.description}</p>
                      <code className="text-xs bg-gray-800 px-2 py-1 rounded">{endpoint.url}</code>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Custom API Endpoint */}
            <div>
              <label htmlFor="api-endpoint" className="text-sm font-medium mb-2 block">
                API Endpoint URL
              </label>
              <input
                id="api-endpoint"
                type="url"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                placeholder="https://your-api-endpoint.com"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* API Key */}
            <div>
              <label htmlFor="api-key" className="text-sm font-medium mb-2 block">
                API Key (Optional)
              </label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Leave empty if your API doesn&apos;t require authentication
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleTestConnection}
                disabled={isConnecting || !apiEndpoint}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isConnecting ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button
                onClick={handleSaveConfiguration}
                disabled={!apiEndpoint}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Save Configuration
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>
              Learn how to integrate with the Augentik API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="font-medium mb-2">🔍 Query API</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Perform intelligent audit queries using natural language
                </p>
                <code className="text-xs bg-gray-900 px-2 py-1 rounded block">
                  POST /query
                </code>
              </div>
              
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="font-medium mb-2">📄 Document Upload</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Upload audit documents for processing and analysis
                </p>
                <code className="text-xs bg-gray-900 px-2 py-1 rounded block">
                  POST /documents/upload
                </code>
              </div>
              
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="font-medium mb-2">🕸️ Knowledge Graph</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Access the audit knowledge graph and relationships
                </p>
                <code className="text-xs bg-gray-900 px-2 py-1 rounded block">
                  GET /graphs
                </code>
              </div>
              
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="font-medium mb-2">⚡ Health Check</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Monitor API status and system health
                </p>
                <code className="text-xs bg-gray-900 px-2 py-1 rounded block">
                  GET /health
                </code>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="font-medium mb-2 text-blue-400">🚀 Getting Started</h3>
              <p className="text-sm text-gray-300 mb-3">
                To get started with the Augentik API:
              </p>
              <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                <li>Configure your API endpoint above</li>
                <li>Test the connection to ensure it's working</li>
                <li>Start uploading audit documents</li>
                <li>Query your audit knowledge base</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
