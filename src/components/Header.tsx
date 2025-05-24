import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../hooks/useApp';

export function Header() {
  const { state } = useApp();
  const location = useLocation();

  const isHomePage = location.pathname === '/' || location.pathname === '/grocery-list';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to="/grocery-list" 
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
            >
              <span className="text-2xl">🛒</span>
              <span className="text-xl font-bold">Grocery List</span>
            </Link>
            
            {!isHomePage && (
              <nav className="flex items-center space-x-2 text-sm text-gray-500">
                <Link to="/grocery-list" className="hover:text-gray-700">
                  Lists
                </Link>
                <span>•</span>
                <span className="text-gray-900">Current List</span>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!state.isOnline && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                Offline
              </span>
            )}
            
            {state.syncStatus === 'syncing' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-1 animate-pulse"></div>
                Syncing
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
