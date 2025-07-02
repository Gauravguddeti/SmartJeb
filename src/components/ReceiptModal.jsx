import React, { useState } from 'react';
import { X, ZoomIn, Download } from 'lucide-react';

/**
 * Receipt Modal Component for full-screen image viewing
 */
const ReceiptModal = ({ isOpen, onClose, receiptUrl, expenseDescription }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !receiptUrl) return null;

  const handleDownload = () => {
    if (receiptUrl.startsWith('data:')) {
      // For data URLs, create a download link
      const link = document.createElement('a');
      link.href = receiptUrl;
      link.download = `receipt-${expenseDescription || 'expense'}.jpg`;
      link.click();
    } else {
      // For regular URLs, open in new tab
      window.open(receiptUrl, '_blank');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ zIndex: 60000 }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Receipt viewer"
    >
      <div className="relative max-w-7xl max-h-full w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-t-lg">
          <h3 className="text-white font-semibold text-lg">
            Receipt - {expenseDescription || 'Expense'}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors duration-200"
              title="Download receipt"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors duration-200"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex-1 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-b-lg overflow-hidden">
          {!imageError ? (
            <div className="relative max-w-full max-h-full">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              )}
              <img
                src={receiptUrl}
                alt={`Receipt for ${expenseDescription || 'expense'}`}
                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
                style={{ maxHeight: 'calc(100vh - 200px)' }}
              />
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <ZoomIn className="w-12 h-12 text-white/60" />
              </div>
              <h4 className="text-white font-semibold mb-2">Cannot Display Receipt</h4>
              <p className="text-white/70 mb-4">
                The receipt image could not be loaded. This might be due to:
              </p>
              <ul className="text-white/60 text-sm space-y-1 mb-6">
                <li>• Corrupted image data</li>
                <li>• Network connectivity issues</li>
                <li>• Unsupported image format</li>
              </ul>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
              >
                Try Download
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-2 text-center">
          <p className="text-white/60 text-sm">
            Click outside the image or press the X button to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
