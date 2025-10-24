'use client';
import { useState } from 'react';
import { api } from '@/lib/api.js';

export default function TestPage() {
  const [result, setResult] = useState(null);

  const testConnection = async () => {
    try {
      const data = await api.testConnection();
      setResult({ success: true, data });
    } catch (error) {
      setResult({ success: false, error: error.message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Backend Connection Test</h1>
        
        <button 
          onClick={testConnection}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Connection
        </button>

        {result && (
          <div className="mt-4 p-4 rounded bg-gray-50">
            <pre className="text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}