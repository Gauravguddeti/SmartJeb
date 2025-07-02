import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Video Modal Component
 * Displays a video in a small overlay window for mobile devices
 */
const VideoModal = ({ isOpen, onClose, videoSrc }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Semi-transparent backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Video container */}
      <div className="relative w-full max-w-xs mx-auto rounded-xl overflow-hidden shadow-2xl transform transition-all z-[61] animate-slide-up">
        {/* Close button */}
        <button
          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full z-[62] transition-all duration-300"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>
        
        {/* Video player */}
        <video
          src={videoSrc}
          className="w-full h-auto rounded-xl"
          controls
          autoPlay
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );

  // Use createPortal to render the modal at the document body level
  return createPortal(modalContent, document.body);
};

export default VideoModal;
