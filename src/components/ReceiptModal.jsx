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
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const imgRef = useRef(null);
  const modalRef = useRef(null);
  
  useEffect(() => {
    // When modal opens, focus on it for keyboard interaction
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);
  
  useEffect(() => {
    console.log("ReceiptModal: receiptUrl received:", receiptUrl?.substring(0, 50));
    if (!receiptUrl) return;
    
    // Reset states when a new URL comes in
    setImageLoaded(false);
    setImageError(false);
    
    // Create a separate function to handle different URL types
    const processReceiptUrl = () => {
      // For blob URLs, use directly
      if (typeof receiptUrl === 'string' && receiptUrl.startsWith('blob:')) {
        console.log("Using existing blob URL");
        setProcessedUrl(receiptUrl);
        return;
      }
      
      // For data URLs, use directly
      if (typeof receiptUrl === 'string' && receiptUrl.startsWith('data:')) {
        console.log("Using data URL");
        setProcessedUrl(receiptUrl);
        return;
      }
      
      // For regular URLs (e.g. Supabase URLs)
      if (typeof receiptUrl === 'string' && (receiptUrl.startsWith('http') || receiptUrl.startsWith('https'))) {
        console.log("Using remote URL");
        // Create a blob URL from the remote URL to avoid CORS issues
        fetch(receiptUrl)
          .then(response => response.blob())
          .then(blob => {
            const objectUrl = URL.createObjectURL(blob);
            setProcessedUrl(objectUrl);
          })
          .catch(error => {
            console.error("Failed to fetch remote image:", error);
            // Fallback to direct URL
            setProcessedUrl(receiptUrl);
            setImageError(true);
          });
        return;
      }
      
      // For File objects
      if (receiptUrl instanceof File) {
        console.log("Creating object URL from File");
        const objectUrl = URL.createObjectURL(receiptUrl);
        setProcessedUrl(objectUrl);
        return;
      }
      
      // For any other format, try as string
      console.log("Trying as string URL");
      setProcessedUrl(String(receiptUrl));
    };
    
    processReceiptUrl();
    
    // Cleanup function to revoke object URLs
    return () => {
      if (processedUrl && processedUrl.startsWith('blob:')) {
        console.log("Revoking object URL on cleanup");
        URL.revokeObjectURL(processedUrl);
      }
    };
  }, [receiptUrl]);
  
  // Handle image load success
  const handleImageLoad = (e) => {
    setImageLoaded(true);
    setImageError(false);
    if (e.target) {
      setImageSize({
        width: e.target.naturalWidth,
        height: e.target.naturalHeight
      });
    }
  };
  
  // Handle image load error
  const handleImageError = () => {
    console.error("Image failed to load:", processedUrl);
    setImageError(true);
    setImageLoaded(false);
    
    // If we haven't tried the original URL directly, fall back to it
    if (processedUrl !== receiptUrl && receiptUrl) {
      console.log("Falling back to original URL");
      setProcessedUrl(receiptUrl);
    }
  };

  if (!isOpen) {
    return null;
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

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
      onKeyDown={handleKeyDown}
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
        <div className="relative max-w-7xl max-h-full w-full h-full flex flex-col pointer-events-auto" ref={modalRef} tabIndex="-1">
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
              <div className="relative max-w-full max-h-full overflow-auto">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  </div>
                )}
                <img
                  ref={imgRef}
                  src={processedUrl || receiptUrl}
                  alt={`Receipt for ${expenseDescription || 'expense'}`}
                  className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{ 
                    maxHeight: 'calc(100vh - 160px)', 
                    width: 'auto',
                    margin: '0 auto'
                  }}
                  crossOrigin="anonymous"
                />
                
                {imageLoaded && imageSize.width > 0 && (
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {imageSize.width} × {imageSize.height}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                  <FileType className="w-12 h-12 text-white/60" />
                </div>
                <h4 className="text-white font-semibold mb-2">Cannot Display Receipt</h4>
                <p className="text-white/70 mb-4">
                  The receipt image could not be loaded properly.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Download Receipt
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="p-2 text-center">
            <p className="text-white/60 text-sm">
              Click outside the image or press ESC to close
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ReceiptModal;
