import * as QRCode from 'qrcode'

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export const generateQRCodeURL = async (
  text: string, 
  options: QRCodeOptions = {}
): Promise<string> => {
  const defaultOptions = {
    width: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    ...options
  };

  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, defaultOptions);
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const generateShareableLink = (listId: string): string => {
  const baseUrl = window.location.origin;
  const basePath = import.meta.env.BASE_URL || '/';
  return `${baseUrl}${basePath}shared/${listId}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  }
};
