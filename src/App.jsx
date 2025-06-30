import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider } from './context/ExpenseContext';
import { GoalsProvider } from './context/GoalsContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Dashboard from './components/DashboardNew';
import Analytics from './components/Analytics';
import Goals from './components/Goals';
import Export from './components/Export';
import Settings from './components/Settings';
import Welcome from './components/Welcome';
import AIChatbot from './components/AIChatbot';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';

/**
 * Main App Component
 */
const AppContent = () => {
  const { user, loading, isGuest, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('expenses');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  // Initialize dark mode and handle auth state changes
  useEffect(() => {
    const savedSettings = localStorage.getItem('smartjeb-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
      }
    }
    
    // Always show landing page first, regardless of auth state
    // The landing page will handle navigation to the app
  }, []);

  // Handle auth state changes
  useEffect(() => {
    if (!loading) {
      const hasVisited = localStorage.getItem('smartjeb-visited');
      const hasSeenWelcome = localStorage.getItem('smartjeb-welcome-seen');
      
      // If user is authenticated and has visited before, skip landing page
      if ((isAuthenticated || isGuest) && hasVisited) {
        setShowLanding(false);
        
        // If they've also seen welcome, skip welcome too
        if (hasSeenWelcome) {
          setShowWelcome(false);
        }
      }
      
      // Mark as visited when authenticated or in guest mode
      if (isAuthenticated || isGuest) {
        localStorage.setItem('smartjeb-visited', 'true');
      }
    }
  }, [loading, isAuthenticated, isGuest]);

  // Show loading spinner while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const handleEnterApp = () => {
    // This is for "Enter App" button - direct access for authenticated users
    setShowLanding(false);
    setShowWelcome(true);
  };

  const handleTryApp = () => {
    // This is for "Try App" button - guest access with warning
    localStorage.setItem('smartjeb-visited', 'true');
    setShowLanding(false);
    setShowWelcome(true); // Show welcome screen with guest warning
  };

  const handleGetStarted = () => {
    // This is for "Get Started" button - show auth modal
    setShowAuth(true);
  };

  const handleShowAuth = () => {
    setShowAuth(true);
  };

  const handleCloseAuth = () => {
    setShowAuth(false);
  };

  const handleAuthSuccess = () => {
    // Auth successful, user state will be updated by AuthContext
    setShowAuth(false);
  };

  const handleGuestLogin = () => {
    // Guest mode is handled by AuthContext.enterGuestMode()
    // Hide landing page and show the app
    setShowLanding(false);
    setShowAuth(false);
    setShowWelcome(true);
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <ExpenseList onAddExpense={() => setShowExpenseForm(true)} />;
      case 'analytics':
        return <Analytics />;
      case 'goals':
        return <Goals />;
      case 'export':
        return <Export />;
      case 'settings':
        return <Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
      default:
        return <ExpenseList onAddExpense={() => setShowExpenseForm(true)} />;
    }
  };

  // Show landing page if user hasn't visited before
  if (showLanding) {
    return (
      <>
        <LandingPage 
          onEnterApp={handleEnterApp}
          onGetStarted={handleGetStarted}
          onShowAuth={handleShowAuth}
          user={user}
          isAuthenticated={isAuthenticated}
        />
        <AuthModal 
          isOpen={showAuth}
          onClose={handleCloseAuth}
          onGuestLogin={handleGuestLogin}
          onSuccess={handleAuthSuccess}
        />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            },
            success: {
              style: {
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              },
            },
            error: {
              style: {
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              },
            },
          }}
        />
      </>
    );
  }  return (
    <ExpenseProvider>
      <GoalsProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate-fade-in transition-colors duration-300 flex flex-col">
          {/* Welcome Screen */}
          {showWelcome && (
            <Welcome 
              onComplete={() => setShowWelcome(false)} 
              isGuest={!isAuthenticated}
            />
          )}

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              },
              success: {
                style: {
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                },
              },
              error: {
                style: {
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                },
              },
            }}
          />

          {/* Header */}
          <Header 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onAddExpense={() => setShowExpenseForm(true)}
            isGuest={!isAuthenticated}
          />

          {/* Main content */}
          <main className="container mx-auto px-4 py-6 pb-20 md:pb-6 flex-grow">
            <div className="animate-slide-up">
              {renderActiveComponent()}
            </div>
          </main>

          {/* Expense Form Modal */}
          {showExpenseForm && (
            <div className="animate-fade-in">
              <ExpenseForm
                onClose={() => setShowExpenseForm(false)}
                onSuccess={() => setShowExpenseForm(false)}
              />
            </div>
          )}

          {/* Bottom Navigation */}
          <Navigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            onAddExpense={() => setShowExpenseForm(true)}
          />

          {/* Footer */}
          <footer className="hidden md:block bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50 py-6 transition-colors duration-300 mt-auto">
            <div className="container mx-auto px-4 text-center space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Made with <span className="text-red-500 animate-pulse-gentle text-lg">♥</span> by{' '}
                <span className="font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  Gaurav Guddeti
                </span>
              </p>
              <div className="flex items-center justify-center space-x-6">
                <a
                  href="mailto:guddetigaurav1@gmail.com"
                  className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 group"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  <span>guddetigaurav1@gmail.com</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/gaurav-guddeti-a2359827b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 group"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"/>
                  </svg>
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://github.com/Gauravguddeti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 group"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"/>
                  </svg>
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </footer>

          {/* AI Chatbot */}
          <AIChatbot />
        </div>
      </GoalsProvider>
    </ExpenseProvider>
  );
};

// Main App wrapper with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
