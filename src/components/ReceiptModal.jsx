import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, Download, FileType } from 'lucide-react';

/**
 * Receipt Modal Component for full-screen image viewing
 */
const ReceiptModal = ({ isOpen, onClose, receiptUrl, expenseDescription }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [processedUrl, setProcessedUrl] = useState('');
  const imgRef = useRef(null);
  
  useEffect(() => {
    console.log("ReceiptModal: receiptUrl received:", receiptUrl);
    if (receiptUrl) {
      // Reset states when a new URL comes in
      setImageLoaded(false);
      setImageError(false);
      
      // Handle different receipt URL formats
      if (typeof receiptUrl === 'string') {
        // Create a new image to check if the URL is valid
        const img = new Image();
        img.onload = () => {
          setProcessedUrl(receiptUrl);
          setImageLoaded(true);
        };
        img.onerror = () => {
          console.error("Failed to load image from URL:", receiptUrl);
          // Try to use as Data URL if it's a base64 string
          if (receiptUrl.startsWith('data:')) {
            setProcessedUrl(receiptUrl);
          } else {
            setImageError(true);
          }
        };
        img.src = receiptUrl;
      } else if (receiptUrl instanceof File) {
        // If it's a File object, create an object URL
        const objectUrl = URL.createObjectURL(receiptUrl);
        setProcessedUrl(objectUrl);
      } else {
        console.error("Invalid receipt URL format:", receiptUrl);
        setImageError(true);
      }
    }
  }, [receiptUrl]);

  if (!isOpen || !receiptUrl) {
    return null;
  }

  const handleDownload = () => {
    if (!processedUrl && receiptUrl) {
      // If processedUrl is not available but receiptUrl is, try to use receiptUrl
      setProcessedUrl(receiptUrl);
    }
    
    const urlToUse = processedUrl || receiptUrl;
    
    if (urlToUse && urlToUse.startsWith('data:')) {
      // For data URLs, create a download link
      const link = document.createElement('a');
      link.href = urlToUse;
      link.download = `receipt-${expenseDescription || 'expense'}.jpg`;
      link.click();
    } else if (urlToUse) {
      // For regular URLs, open in new tab
      window.open(urlToUse, '_blank');
    } else {
      console.error("No valid URL available for download");
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };
  
  const handleClose = () => {
    // Clean up any object URLs to prevent memory leaks
    if (processedUrl && processedUrl.startsWith('blob:')) {
      URL.revokeObjectURL(processedUrl);
    }
    setImageLoaded(false);
    setImageError(false);
    setProcessedUrl('');
    onClose();
  };

  const modalContent = (
    <div 
      className="fixed inset-0"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 60000,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Receipt viewer"
    >
      <div 
        className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 60001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}
      >
        <div className="relative max-w-7xl max-h-full w-full h-full flex flex-col pointer-events-auto">
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
                onClick={handleClose}
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
                  ref={imgRef}
                  src={processedUrl}
                  alt={`Receipt for ${expenseDescription || 'expense'}`}
                  className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => {
                    console.log("Image loaded successfully in modal");
                    setImageLoaded(true);
                  }}
                  onError={(e) => {
                    console.error("Image failed to load in modal:", processedUrl);
                    setImageError(true);
                    setImageLoaded(true);
                  }}
                  style={{ maxHeight: 'calc(100vh - 200px)', width: 'auto' }}
                  crossOrigin="anonymous"
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
    </div>
  );

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clean up any object URLs when component unmounts
      if (processedUrl && processedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(processedUrl);
      }
    };
  }, [processedUrl]);

  return createPortal(modalContent, document.body);
};

export default ReceiptModal;
