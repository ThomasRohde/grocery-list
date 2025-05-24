import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

export function SharedListPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shareCode = searchParams.get('code');

  useEffect(() => {
    // In a real implementation, this would fetch the shared list from a server
    // For now, we'll just show a placeholder
    
    setTimeout(() => {
      setLoading(false);
      setError('Shared lists are not yet implemented in this demo.');
    }, 1000);
  }, [id, shareCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared list...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔗</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Shared List</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <p className="text-sm text-gray-500 mb-4">
          In a full implementation, this would allow family members to:
        </p>
        <ul className="text-sm text-gray-500 space-y-1 mb-6">
          <li>• View and edit the shared grocery list</li>
          <li>• Sync changes in real-time</li>
          <li>• Install the PWA on their devices</li>
          <li>• Work offline with background sync</li>
        </ul>
        <a 
          href="/grocery-list" 
          className="btn-primary"
        >
          Go to My Lists
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Shared List</h1>
      {/* Shared list content would go here */}
    </div>
  );
}
