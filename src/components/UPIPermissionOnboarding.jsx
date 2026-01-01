import React, { useState, useEffect } from 'react';
import { Bell, Smartphone, Shield, Check, X, ChevronRight } from 'lucide-react';

interface UPIPermissionOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted: () => void;
}

/**
 * UPI Auto-Capture Permission Onboarding
 * Explains why notification access is needed
 */
const UPIPermissionOnboarding: React.FC<UPIPermissionOnboardingProps> = ({
  isOpen,
  onClose,
  onPermissionGranted
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Smartphone className="w-12 h-12 text-blue-500" />,
      title: 'Auto-Capture UPI Transactions',
      description: 'SmartJeb can automatically detect when you make payments via GPay, PhonePe, Paytm, and other UPI apps.',
      details: ['Saves you time', 'Never miss an expense', 'Instant categorization']
    },
    {
      icon: <Bell className="w-12 h-12 text-purple-500" />,
      title: 'Notification Access Required',
      description: 'We need permission to read UPI payment notifications from your payment apps.',
      details: [
        'Only reads payment notifications',
        'No access to messages or calls',
        'Works in the background'
      ]
    },
    {
      icon: <Shield className="w-12 h-12 text-green-500" />,
      title: 'Your Privacy Matters',
      description: 'All data stays on your device. We never send notification data to any server.',
      details: [
        '100% on-device processing',
        'No data sent to servers',
        'You can disable anytime'
      ]
    }
  ];

  const handleRequestPermission = async () => {
    // This will be implemented with Capacitor plugin
    try {
      // TODO: Call native Android method to request notification listener permission
      // For now, open settings manually
      const { Device } = await import('@capacitor/device');
      const info = await Device.getInfo();
      
      if (info.platform === 'android') {
        // Open notification listener settings
        // This will be handled by our custom plugin
        console.log('Requesting notification listener permission...');
        onPermissionGranted();
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">UPI Auto-Capture</h2>
          <p className="text-sm opacity-90 mt-1">Track expenses automatically</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-blue-500'
                    : 'w-2 bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Current step */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {steps[currentStep].icon}
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {steps[currentStep].title}
            </h3>

            <p className="text-gray-600 dark:text-gray-300">
              {steps[currentStep].description}
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-2">
              {steps[currentStep].details.map((detail, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-blue-900 dark:text-blue-200">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Example notification */}
          {currentStep === 1 && (
            <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Example notification:</div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🟢</div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">Google Pay</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      You paid ₹350 to Zomato
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Just now
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 mt-8">
            {currentStep < steps.length - 1 ? (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleRequestPermission}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
                >
                  Grant Permission
                </button>
              </>
            )}
          </div>

          {/* Privacy note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You can disable auto-capture anytime in Settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UPIPermissionOnboarding;
