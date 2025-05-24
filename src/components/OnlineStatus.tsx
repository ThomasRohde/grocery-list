import { useEffect, useState } from 'react';
import { useApp } from '../hooks/useApp';

export function OnlineStatus() {
  const { state } = useApp();
  const [showToast, setShowToast] = useState(false);
  const [lastStatus, setLastStatus] = useState(state.isOnline);

  useEffect(() => {
    if (lastStatus !== state.isOnline) {
      setShowToast(true);
      setLastStatus(state.isOnline);
      
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [state.isOnline, lastStatus]);

  if (!showToast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        px-4 py-2 rounded-lg shadow-lg transition-all duration-300
        ${state.isOnline 
          ? 'bg-primary-600 text-white' 
          : 'bg-yellow-500 text-white'
        }
      `}>
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${
            state.isOnline ? 'bg-white' : 'bg-white animate-pulse'
          }`}></span>
          <span className="text-sm font-medium">
            {state.isOnline ? 'Back online' : 'Working offline'}
          </span>
        </div>
      </div>
    </div>
  );
}
