import { useState } from 'react';
import axios from 'axios';

export default function GHLAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startOAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/ghl/auth', {
        userId: 'test-user-id', // Replace with actual user ID in production
      });

      window.location.href = response.data.url;
    } catch (err) {
      setError('Failed to start OAuth flow');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-8 text-3xl font-bold">GoHighLevel Integration</h1>
      {error && (
        <div className="mb-4 rounded bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}
      <button
        onClick={startOAuth}
        disabled={loading}
        className={`rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 ${
          loading ? 'cursor-not-allowed opacity-50' : ''
        }`}
      >
        {loading ? 'Connecting...' : 'Connect to GoHighLevel'}
      </button>
    </div>
  );
} 