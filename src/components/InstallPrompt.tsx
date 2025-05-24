import { useState } from 'react';
import { useApp } from '../hooks/useApp';

export function InstallPrompt() {
  const { state } = useApp();
  const [dismissed, setDismissed] = useState(false);

  if (!state.installPrompt || dismissed) return null;

  const handleInstall = async () => {
    try {
      state.installPrompt?.prompt();
      const choice = await state.installPrompt?.userChoice;
      
      if (choice?.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error during install:', error);
    }
    
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:max-w-sm z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">📱</span>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">
              Install Grocery List
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Add this app to your home screen for quick access and offline use.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="btn-primary text-sm py-1 px-3"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="btn-secondary text-sm py-1 px-3"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
