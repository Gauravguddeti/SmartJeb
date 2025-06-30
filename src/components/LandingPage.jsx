import React, { useState } from 'react';
import { ArrowRight, Mail, Linkedin, Github, Instagram, Menu, X, Star, CheckCircle, TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react';

const LandingPage = ({ onEnterApp, onTryApp, onGetStarted, onShowAuth, user, isAuthenticated }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [reviewForm, setReviewForm] = useState({ email: '', review: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleSliderStart = (e) => {
    setIsDragging(true);
    // Prevent default to avoid text selection
    e.preventDefault();
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    // Handle initial touch position
    const slider = e.currentTarget.closest('.slider-container');
    if (slider) {
      const rect = slider.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    }
  };

  const handleSliderMove = (e) => {
    if (!isDragging) return;
    
    const slider = e.currentTarget.closest('.slider-container');
    if (!slider) return;
    
    const rect = slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleSliderEnd = () => {
    setIsDragging(false);
  };

  // Add event listeners for mouse and touch events
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const slider = document.querySelector('.slider-container');
        if (slider) {
          const rect = slider.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
          setSliderPosition(percentage);
        }
      }
    };

    const handleTouchMove = (e) => {
      if (isDragging) {
        const slider = document.querySelector('.slider-container');
        if (slider) {
          const rect = slider.getBoundingClientRect();
          const x = e.touches[0].clientX - rect.left;
          const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
          setSliderPosition(percentage);
        }
        e.preventDefault(); // Prevent scrolling while dragging
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create mailto link with review content
      const subject = encodeURIComponent('SmartJeb Review');
      const body = encodeURIComponent(`Review from: ${reviewForm.email}\n\nReview:\n${reviewForm.review}`);
      const mailtoLink = `mailto:guddetigaurav1@gmail.com?subject=${subject}&body=${body}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      // Reset form
      setReviewForm({ email: '', review: '' });
      alert('Thank you! Your email client should open with the review. Please send it to complete the submission.');
    } catch (error) {
      alert('Error opening email client. Please email your review directly to guddetigaurav1@gmail.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 font-sans">
      {/* Header/Navbar */}
      <header className="fixed w-full bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 z-50">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/logo.svg" alt="SmartJeb" className="w-10 h-10" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">SmartJeb</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('why-smartjeb')} className="hover:text-blue-400 transition">Why SmartJeb</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-blue-400 transition">Features</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-blue-400 transition">About</button>
            <button onClick={onShowAuth} className="hover:text-blue-400 transition">Login</button>
            <button 
              onClick={onGetStarted}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
            >
              Sign Up
            </button>
          </div>
          
          <button 
            className="md:hidden text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-800/95 backdrop-blur-lg border-t border-slate-700/50">
            <div className="container mx-auto px-6 py-4 space-y-4">
              <button onClick={() => scrollToSection('why-smartjeb')} className="block hover:text-blue-400 transition">Why SmartJeb</button>
              <button onClick={() => scrollToSection('features')} className="block hover:text-blue-400 transition">Features</button>
              <button onClick={() => scrollToSection('about')} className="block hover:text-blue-400 transition">About</button>
              <button onClick={onShowAuth} className="block hover:text-blue-400 transition">Login</button>
              <button 
                onClick={onGetStarted}
                className="block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-all duration-300"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-20 pb-10 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Track Your Expenses. <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Rule Your Wallet.</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              SmartJeb helps you understand your money, get smart insights, and have fun while tracking.
            </p>
            {isAuthenticated && (
              <div className="text-sm text-gray-400 mb-4 text-center">
                Welcome back, {user?.email}! 👋
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                // Authenticated user buttons
                <>
                  <button 
                    onClick={onEnterApp}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center"
                  >
                    Enter App <ArrowRight className="ml-2" size={20} />
                  </button>
                  <button 
                    onClick={onShowAuth}
                    className="border border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300"
                  >
                    Switch Account
                  </button>
                </>
              ) : (
                // Non-authenticated user buttons
                <>
                  <button 
                    onClick={onGetStarted}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center"
                  >
                    Get Started — It's Free! <ArrowRight className="ml-2" size={20} />
                  </button>
                  <button 
                    onClick={onTryApp}
                    className="border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300"
                  >
                    Try App (Guest Mode)
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="md:w-1/2 bg-slate-800/50 p-4 rounded-2xl backdrop-blur-sm border border-slate-700/50">
            <img 
              src="/lightmode.png" 
              alt="SmartJeb Dashboard" 
              className="w-full h-auto rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Why SmartJeb Section */}
      <section id="why-smartjeb" className="py-20 px-6 bg-slate-800/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">
            Why <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">SmartJeb</span>?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">100% Free Forever</h3>
                  <p className="text-slate-300">No hidden fees, no premium plans, no BS. Just pure expense tracking goodness.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Shield className="text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
                  <p className="text-slate-300">Your data stays on your device. No cloud storage, no data mining, no worries.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Zap className="text-purple-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                  <p className="text-slate-300">Built with modern tech for instant responses. No loading screens, no delays.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-orange-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Smart Insights</h3>
                  <p className="text-slate-300">AI-powered categorization and spending analysis that actually makes sense.</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-8 border border-slate-700/50">
                <div className="text-4xl font-bold mb-2">10,000+</div>
                <div className="text-slate-300 mb-4">Expenses Tracked</div>
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-slate-300 mb-4">Happy Users</div>
                <div className="text-4xl font-bold mb-2">0</div>
                <div className="text-slate-300">Dollars Charged</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Features</span> That Make You Go 😎
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-slate-800/50 rounded-xl p-8 transition duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl border border-slate-700/50">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-xl font-bold mb-3">Smart Expense Tracking</h3>
              <p className="text-slate-300">AI-powered automatic tagging and categorization so you don't have to lift a finger (well, maybe just one).</p>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-8 transition duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl border border-slate-700/50">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3">Analytics Dashboard</h3>
              <p className="text-slate-300">Beautiful charts and breakdowns that actually make sense (unlike your ex's mixed signals).</p>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-8 transition duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl border border-slate-700/50">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3">Goal Setting</h3>
              <p className="text-slate-300">Set savings goals and track your progress with motivational insights and achievements.</p>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-8 transition duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl border border-slate-700/50">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-3">Mobile Responsive</h3>
              <p className="text-slate-300">Track expenses on the go with our fully responsive design that works on any device.</p>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-8 transition duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl border border-slate-700/50">
              <div className="text-4xl mb-4">📤</div>
              <h3 className="text-xl font-bold mb-3">Export Data</h3>
              <p className="text-slate-300">Export your data anytime in CSV or PDF format. Your data, your control.</p>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-8 transition duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl border border-slate-700/50">
              <div className="text-4xl mb-4">🌙</div>
              <h3 className="text-xl font-bold mb-3">Dark Mode</h3>
              <p className="text-slate-300">Easy on the eyes with beautiful dark mode that makes late-night budgeting a pleasure.</p>
            </div>
          </div>
          
          {/* Dark Mode Slider */}
          <div className="mt-20">
            <h3 className="text-2xl font-bold mb-2 flex items-center justify-center">
              <span className="mr-2">🌓</span> Dark Mode Hits Different
            </h3>
            <p className="text-slate-300 mb-6 text-center">Slide to witness the glow-up — from light to night.</p>
            
            <div className="relative w-full max-w-2xl mx-auto h-96 rounded-2xl overflow-hidden border border-slate-700/50 slider-container">
              <img 
                src="/lightmode.png" 
                alt="Light Mode" 
                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
              />
              <img 
                src="/darkmode.png" 
                alt="Dark Mode" 
                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
              />
              <div 
                className="absolute top-0 w-1 h-full bg-white cursor-ew-resize z-10 shadow-lg"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                onMouseDown={handleSliderStart}
                onTouchStart={handleTouchStart}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg pointer-events-none">
                  <span className="text-slate-900 text-sm">↔</span>
                </div>
              </div>
              <div 
                className="absolute inset-0 cursor-ew-resize"
                onMouseDown={handleSliderStart}
                onTouchStart={handleTouchStart}
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-slate-800/30">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Wait... <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">This Isn't a Company</span>
          </h2>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            SmartJeb is just a fun side-project I built to make budgeting suck less. No corporate overlords, no VC funding, just one developer trying to help people get better with their money.
          </p>
          <p className="text-xl text-slate-300 mb-12 leading-relaxed font-semibold">
            No fees. No ads. No BS. Just fun, smart money tracking — totally free.
          </p>
          
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-slate-700 mb-4 overflow-hidden border-4 border-blue-500/30">
              <img 
                src="/pfp.png" 
                alt="Gaurav Guddeti" 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-2xl font-bold">Gaurav Guddeti</h3>
            <p className="text-slate-400 mb-4">The guy behind the code</p>
            
            <div className="flex space-x-4">
              <a 
                href="mailto:guddetigaurav1@gmail.com" 
                className="text-slate-400 hover:text-blue-400 transition"
                title="Email"
              >
                <Mail size={24} />
              </a>
              <a 
                href="https://linkedin.com/in/gaurav-guddeti-a2359827b" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-400 transition"
                title="LinkedIn"
              >
                <Linkedin size={24} />
              </a>
              <a 
                href="https://github.com/Gauravguddeti" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-400 transition"
                title="GitHub"
              >
                <Github size={24} />
              </a>
              <a 
                href="https://instagram.com/is.that.gaurav" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-400 transition"
                title="Instagram"
              >
                <Instagram size={24} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Drop a Review</span> 💬
          </h2>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Your Email (so I can say thanks!) *
                </label>
                <input 
                  type="email" 
                  id="email" 
                  value={reviewForm.email}
                  onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="you@example.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="review" className="block text-sm font-medium text-slate-300 mb-2">
                  Your Honest Thoughts *
                </label>
                <textarea 
                  id="review" 
                  rows="4" 
                  value={reviewForm.review}
                  onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="How has SmartJeb helped you? What could be better?"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center"
              >
                <Mail className="mr-2" size={20} />
                {isSubmitting ? 'Opening Email...' : 'Send Review'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800/50 py-12 px-6 border-t border-slate-700/50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2">
                <img src="/logo.svg" alt="SmartJeb" className="w-8 h-8" />
                <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">SmartJeb</span>
              </div>
            </div>
            
            <div className="flex space-x-6 mb-6 md:mb-0">
              <a 
                href="mailto:guddetigaurav1@gmail.com" 
                className="hover:text-blue-400 transition" 
                title="Email"
              >
                <Mail size={20} />
              </a>
              <a 
                href="https://linkedin.com/in/gaurav-guddeti-a2359827b" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition" 
                title="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="https://github.com/Gauravguddeti" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition" 
                title="GitHub"
              >
                <Github size={20} />
              </a>
              <a 
                href="https://instagram.com/is.that.gaurav" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition" 
                title="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            © 2025 SmartJeb. Built with <span className="text-red-400">♥</span> by Gaurav Guddeti
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
