import React, { useState, useEffect } from 'react';
import { PiggyBank, Sparkles, Target, BarChart3, Shield, ArrowRight, CheckCircle, Star, Gift } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import UserProfileModal from './UserProfileModal';

/**
 * Welcome Component - Onboarding experience for new users
 */
const Welcome = ({ onComplete, isGuest = false }) => {
  const { expenses } = useExpenses();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Check if user should see welcome screen
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('smartjeb-welcome-seen');
    const hasExpenses = expenses.length > 0;
    
    if (hasSeenWelcome || hasExpenses) {
      setIsVisible(false);
      onComplete?.();
    }
  }, [expenses.length, onComplete]);

  const steps = [
    {
      title: isGuest ? "Welcome to SmartJeb! 🎉 (Guest Mode)" : "Welcome to SmartJeb! 🎉",
      subtitle: isGuest ? "Trying out SmartJeb - Data won't be saved" : "Your smart expense tracking companion",
      description: isGuest 
        ? "You're using SmartJeb in guest mode. Your data won't be saved permanently. Sign up to keep your expenses safe!"
        : "Track your daily expenses with AI-powered insights and beautiful analytics. Let's get you started!",
      icon: PiggyBank,
      color: "primary",
      features: isGuest ? [
        "⚠️ Guest mode - data is temporary",
        "🤖 AI-powered expense categorization", 
        "📊 Beautiful charts and analytics",
        "💾 Sign up to save your data permanently"
      ] : [
        "🤖 AI-powered expense categorization",
        "📊 Beautiful charts and analytics", 
        "🎯 Goal tracking and budgeting",
        "🔒 100% privacy - data stays on your device"
      ]
    },
    {
      title: "Smart Categorization ✨",
      subtitle: "AI learns from your spending patterns",
      description: "Our AI automatically categorizes your expenses and provides insights to help you make better financial decisions.",
      icon: Sparkles,
      color: "purple",
      features: [
        "Automatic expense categorization",
        "Smart spending insights",
        "Weekly summary reports",
        "Personalized saving tips"
      ]
    },
    {
      title: "Track Your Goals 🎯",
      subtitle: "Set budgets and achieve financial targets",
      description: "Set monthly budgets, track spending goals, and get notifications when you're close to your limits.",
      icon: Target,
      color: "green",
      features: [
        "Monthly budget tracking",
        "Category-wise spending limits",
        "Progress notifications",
        "Achievement celebrations"
      ]
    },
    {
      title: "Beautiful Analytics 📈",
      subtitle: "Visualize your spending patterns",
      description: "Get detailed insights with interactive charts, spending trends, and export capabilities.",
      icon: BarChart3,
      color: "blue",
      features: [
        "Interactive spending charts",
        "Monthly and weekly trends",
        "Category breakdowns",
        "Export to CSV/PDF"
      ]
    },
    {
      title: "Privacy First 🔐",
      subtitle: "Your data stays with you",
      description: "All your financial data is stored locally on your device. No accounts, no cloud storage, complete privacy.",
      icon: Shield,
      color: "red",
      features: [
        "Local data storage only",
        "No account registration",
        "No data tracking",
        "Open source & transparent"
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('smartjeb-welcome-seen', 'true');
    setIsVisible(false);
    
    // For authenticated users, show profile setup
    if (user && !isGuest) {
      setShowProfileModal(true);
    } else {
      onComplete?.();
    }
  };

  const handleProfileComplete = () => {
    setShowProfileModal(false);
    onComplete?.();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  const getColorClasses = (color) => {
    switch (color) {
      case 'primary':
        return 'from-primary-500 to-primary-600 text-white';
      case 'purple':
        return 'from-purple-500 to-purple-600 text-white';
      case 'green':
        return 'from-green-500 to-green-600 text-white';
      case 'blue':
        return 'from-blue-500 to-blue-600 text-white';
      case 'red':
        return 'from-red-500 to-red-600 text-white';
      default:
        return 'from-gray-500 to-gray-600 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getColorClasses(currentStepData.color)} p-6 text-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
              <Icon className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{currentStepData.title}</h1>
            <p className="text-lg opacity-90">{currentStepData.subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-gray-600 text-center text-lg leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentStepData.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`bg-gradient-to-r ${getColorClasses(currentStepData.color)} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? `bg-gradient-to-r ${getColorClasses(currentStepData.color)}`
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 font-medium transition-colors duration-300"
          >
            Skip Tour
          </button>
          
          <div className="flex items-center space-x-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-300"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r ${getColorClasses(currentStepData.color)} rounded-xl font-semibold transition-all duration-300 hover:shadow-lg transform hover:scale-105 active:scale-95`}
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
              {currentStep === steps.length - 1 ? (
                <Star className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Celebration confetti for last step */}
        {currentStep === steps.length - 1 && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              >
                <Gift className="w-4 h-4 text-yellow-500" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isVisible && welcomeContent}
      {showProfileModal && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={handleProfileComplete}
          isFirstTime={true}
        />
      )}
    </>
  );
};

export default Welcome;
