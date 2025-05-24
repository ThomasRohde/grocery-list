import { useState, useEffect } from 'react';
import type { GroceryList } from '../types';
import { generateQRCodeURL, generateShareableLink, copyToClipboard } from '../utils/qrcode';

interface ShareModalProps {
  list: GroceryList;
  onClose: () => void;
}

export function ShareModal({ list, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [qrCodeURL, setQrCodeURL] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(true);
  
  const shareURL = generateShareableLink(list.id);

  // Generate QR code when component mounts
  useEffect(() => {
    const generateQR = async () => {
      try {
        setIsGeneratingQR(true);
        const qrCode = await generateQRCodeURL(shareURL, {
          width: 200,
          margin: 2,
          color: {
            dark: '#1d4ed8', // blue-700
            light: '#ffffff'
          }
        });
        setQrCodeURL(qrCode);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      } finally {
        setIsGeneratingQR(false);
      }
    };

    generateQR();
  }, [shareURL]);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareURL);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Share List</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Share this list with family members so they can view and edit it too.
          </p>
            <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center mb-4">
              {isGeneratingQR ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-2"></div>
              ) : qrCodeURL ? (
                <img 
                  src={qrCodeURL} 
                  alt="QR Code for sharing list" 
                  className="mx-auto mb-2"
                />
              ) : (
                <div className="text-6xl mb-2">📱</div>
              )}
              <p className="text-sm text-gray-600">QR Code for easy sharing</p>
              <p className="text-xs text-gray-500 mt-1">
                Scan with your phone to open the shared list
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Share Link
            </label>
            <div className="flex">
              <input
                type="text"
                value={shareURL}
                readOnly
                className="input-field rounded-r-none flex-1"
              />
              <button
                onClick={handleCopyLink}
                className={`
                  px-4 py-2 rounded-r-md border border-l-0 border-gray-300 
                  ${copied 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }
                  transition-colors
                `}
              >
                {copied ? '✓' : 'Copy'}
              </button>
            </div>
          </div>
            <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-primary-800">
              <strong>💡 Tip:</strong> Family members can scan the QR code or click the link
              to install this PWA on their devices for offline access.
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full btn-primary"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
