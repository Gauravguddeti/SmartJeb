import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Video Modal Component
 * Displays a video in a small overlay window for mobile devices
 * with a pointing line to the hamburger menu
 */
const VideoModal = ({ isOpen, onClose, videoSrc, menuPosition }) => {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      // Delay the animation slightly to ensure proper rendering
      const timer = setTimeout(() => {
        setAnimate(true);
      }, 10);
      
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[60] flex items-start justify-center">
      {/* Semi-transparent backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
        style={{ opacity: animate ? 0.7 : 0 }}
        onClick={onClose}
      />
      
      {/* Pointer line to hamburger menu */}
      <div 
        className="absolute z-[62] transition-all duration-500 ease-in-out origin-top-right"
        style={{ 
          top: `${menuPosition?.top || 16}px`,
          right: `${menuPosition?.right || 16}px`,
          opacity: animate ? 1 : 0,
          transform: animate ? 'scale(1)' : 'scale(0.5)'
        }}
      >
        <svg width="60" height="30" viewBox="0 0 60 30" className="filter drop-shadow-lg">
          <path 
            d="M0,0 Q30,30 60,5" 
            stroke="#FF5757" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round"
            className="animate-pulse-gentle"
          />
        </svg>
      </div>
      
      {/* Video container */}
      <div 
        className="relative w-full max-w-xs mx-auto mt-24 rounded-xl overflow-hidden shadow-2xl z-[61] transition-all duration-500 ease-in-out"
        style={{ 
          opacity: animate ? 1 : 0, 
          transform: animate ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)'
        }}
      >
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
