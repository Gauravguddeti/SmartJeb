import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User } from 'lucide-react';

/**
 * AI Chatbot Component - Gen Z Financial Assistant
 */
const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hey bestie! 👋 I'm your AI financial assistant. Ask me anything about money, savings, or budgeting - I promise to keep it real (and maybe slightly sassy) 💅",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gen Z AI responses with financial advice
  const generateResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Budget-related responses
    if (lowerMessage.includes('budget') || lowerMessage.includes('money') || lowerMessage.includes('spend')) {
      const budgetResponses = [
        "Bestie, budgeting is literally just telling your money where to go instead of wondering where it went! 💰 Start with the 50/30/20 rule - 50% needs, 30% wants, 20% savings. It's giving main character energy! ✨",
        "Listen babe, a budget isn't a diet for your wallet - it's more like a personal trainer! 💪 Track everything for a week first, then we can spill the tea on where your coins are really going! ☕",
        "Budget talk? I'm here for it! 📊 Rule #1: Pay yourself first (savings), Rule #2: Needs before wants, Rule #3: That third bubble tea can wait bestie! 🧋",
        "Okay budget queen/king! 👑 Try the envelope method but make it digital - separate accounts for different spending categories. It's giving organized icon vibes! 💅"
      ];
      return budgetResponses[Math.floor(Math.random() * budgetResponses.length)];
    }

    // Savings-related responses
    if (lowerMessage.includes('save') || lowerMessage.includes('saving') || lowerMessage.includes('emergency')) {
      const savingsResponses = [
        "Savings era activated! 🚀 Start small - even ₹50 a day adds up to ₹18,250 in a year! That's literally a mini vacation fund right there! ✈️",
        "Emergency fund is NOT optional, bestie! 🚨 Aim for 3-6 months of expenses. I know it sounds like a lot, but future you will thank present you! 🙏",
        "Saving hack incoming! 💡 Every time you resist buying something unnecessary, transfer that amount to savings. It's giving self-control queen vibes! 👸",
        "The 52-week challenge hits different! Week 1: save ₹10, Week 2: save ₹20, and so on. By week 52, you'll have saved ₹13,780! Math is mathing! 🧮"
      ];
      return savingsResponses[Math.floor(Math.random() * savingsResponses.length)];
    }

    // Investment-related responses
    if (lowerMessage.includes('invest') || lowerMessage.includes('stock') || lowerMessage.includes('mutual fund')) {
      const investmentResponses = [
        "Investment queen! 👑 Start with SIPs in index funds - they're low maintenance like your weekend vibes! Even ₹500/month can grow into something beautiful over time! 📈",
        "Bestie, time in the market > timing the market! 📊 Start small with mutual funds, SIPs are your bestie here. Compound interest is literally free money! 💸",
        "Investment tip: Don't put all your eggs in one basket unless that basket is diversified mutual funds! 🧺 Start with large-cap funds if you're risk-averse! 📊",
        "SIP it like it's hot! 🔥 Systematic Investment Plans in equity mutual funds for long-term wealth creation. Start with ₹1000/month and watch the magic happen! ✨"
      ];
      return investmentResponses[Math.floor(Math.random() * investmentResponses.length)];
    }

    // Calculation requests
    if (lowerMessage.includes('calculate') || lowerMessage.includes('how much') || lowerMessage.includes('if i save')) {
      const calculations = [
        "Math time! 🧮 If you save ₹100 daily for 6 months, that's ₹18,000! For a year? ₹36,500! Compound that at 8% annually and bestie, you're looking at some serious growth! 📈",
        "Quick calculation check! ✅ Saving ₹200/day = ₹6,000/month = ₹72,000/year. That's giving financial goals vibes! Add some investment returns and you're unstoppable! 🚀",
        "Let's crunch some numbers! 🔢 ₹500/month in a SIP with 12% returns = approximately ₹7 lakhs in 10 years! Time and consistency are your superpowers! ⚡",
        "Calculator mode activated! 💻 Emergency fund target: 6 months expenses. If your monthly expenses are ₹20,000, aim for ₹1.2 lakhs as your safety net! 🛡️"
      ];
      return calculations[Math.floor(Math.random() * calculations.length)];
    }

    // Spending habits and tips
    if (lowerMessage.includes('spend') || lowerMessage.includes('expensive') || lowerMessage.includes('tip')) {
      const spendingTips = [
        "Spending wisdom incoming! 💎 Before buying anything over ₹1000, sleep on it for 24 hours. If you still want it, go for it! Impulse purchases are so last season! 💅",
        "Hot tip: Use the 1% rule! 📏 Don't spend more than 1% of your annual income on any single non-essential item. It's giving responsible spender energy! ✨",
        "Bestie, track EVERYTHING for a week! 📱 You'll be shook by where your money actually goes. Small expenses add up faster than TikTok views! 📈",
        "Pro tip: Automate your savings first, then spend what's left! 🤖 Pay yourself before paying for that aesthetic coffee. Your future self will thank you! ☕"
      ];
      return spendingTips[Math.floor(Math.random() * spendingTips.length)];
    }

    // Credit card and debt
    if (lowerMessage.includes('credit') || lowerMessage.includes('debt') || lowerMessage.includes('loan')) {
      const debtResponses = [
        "Credit card real talk! 💳 Pay the full amount every month, bestie! Interest rates are NOT your friend. Use credit cards like cash - only spend what you have! 💰",
        "Debt payoff strategy time! 🎯 List all debts, pay minimums on all, then attack the highest interest rate first (avalanche method). You got this! 💪",
        "Credit score matters, babe! 📊 Keep utilization under 30%, pay on time, and don't close old cards. A good credit score is your ticket to better interest rates! 🎟️",
        "Emergency: If you're in debt, stop borrowing MORE! 🛑 Create a debt payoff plan, consider balance transfers to lower rates, and maybe pick up a side hustle! 💼"
      ];
      return debtResponses[Math.floor(Math.random() * debtResponses.length)];
    }

    // Default responses for general queries
    const defaultResponses = [
      "That's an interesting question, bestie! 🤔 While I'm still learning, I'd suggest checking reliable financial websites or talking to a certified financial advisor for personalized advice! 💡",
      "Hmm, that's a good one! 💭 For specific financial advice, I'd recommend consulting with professionals. But I'm here for general money tips and calculations! 📊",
      "You're asking the important questions! 🙌 While I can help with basic financial concepts, always verify important financial decisions with qualified experts! ✅",
      "Love that you're thinking about money management! 💰 I'm best at helping with budgeting basics, savings tips, and general financial wellness. What specific area interests you? 🤗",
      "Financial curiosity is everything! ✨ I can help with budgeting, saving strategies, and basic investment concepts. What money topic is on your mind today? 💫"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: generateResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50 animate-pulse"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Financial Assistant</h3>
            <p className="text-xs text-white/80">Your sassy money bestie</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-lg p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%] ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-primary-500' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`rounded-2xl p-3 ${
                message.type === 'user'
                  ? 'bg-primary-500 text-white rounded-tr-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-md'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-md p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about budgeting, savings, or money tips..."
            className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            rows="2"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white p-2 rounded-xl transition-colors duration-200 self-end"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
