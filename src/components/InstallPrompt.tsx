import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { debugPWAStatus } from '../utils/pwa';
import type { PWADebugResult } from '../types';

// Debug component for development mode
function DebugInfo() {
  const [debugResult, setDebugResult] = useState<PWADebugResult | null>(null);

  useEffect(() => {
    debugPWAStatus().then(setDebugResult);
  }, []);

  if (!debugResult) return <div className="text-sm text-yellow-700 mt-2">Loading debug info...</div>;

  return (
    <div className="mt-3 p-3 bg-yellow-100 rounded text-xs">
      <h4 className="font-medium text-yellow-800 mb-2">PWA Debug Information:</h4>
      <div className="space-y-1 text-yellow-700">
        <div>HTTPS: {debugResult.isHTTPS ? '✅' : '❌'}</div>
        <div>Service Worker: {debugResult.hasSW ? '✅' : '❌'}</div>
        <div>Standalone Mode: {debugResult.isStandalone ? '✅' : '❌'}</div>
        <div>Installable: {debugResult.isInstallable ? '✅' : '❌'}</div>
        <div className="mt-2">
          <div className="font-medium">User Agent:</div>
          <div className="text-xs break-all">{debugResult.userAgent}</div>
        </div>
      </div>
    </div>
  );
}

export function InstallPrompt() {
  const { state } = useApp();
  const [dismissed, setDismissed] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  useEffect(() => {
    // Check if app is running in standalone mode
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
    );
  }, []);

  // Don't show if already dismissed or if running in standalone mode
  if (dismissed || isStandalone) return null;

  // Show debug info in development mode if no install prompt is available
  const isDev = import.meta.env.DEV;
  if (!state.installPrompt && isDev) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:max-w-md z-50">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🔧</span>
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800 mb-2">
                PWA Install Debug (Dev Mode)
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                Install prompt not available. Click to see debug information.
              </p>
              <button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="text-sm bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded"
              >
                {showDebugInfo ? 'Hide' : 'Show'} Debug Info
              </button>
              {showDebugInfo && <DebugInfo />}
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-yellow-400 hover:text-yellow-600"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If no install prompt and not in dev mode, show manual install instructions
  if (!state.installPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:max-w-sm z-50">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">📱</span>
            <div className="flex-1">
              <h3 className="font-medium text-blue-800 mb-1">
                Install Grocery List
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                To install this app, use your browser's menu and look for "Install" or "Add to Home Screen".
              </p>
              <button
                onClick={() => setDismissed(true)}
                className="text-sm bg-blue-200 hover:bg-blue-300 text-blue-800 px-3 py-1 rounded"
              >
                Got it
              </button>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-blue-400 hover:text-blue-600"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }
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
