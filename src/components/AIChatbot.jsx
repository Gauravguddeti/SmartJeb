import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User } from 'lucide-react';

/**
 * AI Chatbot Component - Gen Z Financial Assistant
 */
const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversationContext, setConversationContext] = useState({
    lastTopic: null,
    waitingForGoal: false,
    savingsAmount: null,
    timeframe: null
  });
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hey there! 👋 I'm SmartJeb, your AI financial assistant. I'm here to help you with literally anything - money questions, life advice, calculations, budgeting tips, or just having a friendly conversation! What's on your mind today?",
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

  // Enhanced AI responses with context awareness and better NLP
  const generateResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Context-aware responses for follow-ups
    if (conversationContext.waitingForGoal) {
      // User is responding to "What's this for?" question
      if (lowerMessage.includes('monitor') || lowerMessage.includes('computer') || lowerMessage.includes('screen') || lowerMessage.includes('display')) {
        setConversationContext({...conversationContext, waitingForGoal: false, lastTopic: 'monitor'});
        return "Perfect! A monitor is a great investment! 🖥️ Here's your tailored savings plan for ₹10,000 monitor:\n\n💡 **Monitor-Specific Strategy:**\n• **Research first**: Check for sales, discounts, or upcoming festivals\n• **Compare models**: Make a wishlist of 2-3 monitors to track prices\n• **Timing advantage**: Electronics often go on sale during festivals\n\n🎯 **Accelerated Savings Tips:**\n\n**Week 1-4: Tech-focused savings**\n• Skip gaming purchases/subscriptions: ₹500-800/week\n• Reduce streaming services: ₹200-400/week\n• Eat home more (invest food money in monitor): ₹600-900/week\n\n**Week 5-8: Side income boost**\n• Sell old electronics/gadgets: ₹1,000-3,000\n• Freelance your skills online: ₹2,000-5,000\n• Part-time gigs on weekends: ₹1,500-3,000\n\n**Week 9-12: Final push**\n• Monitor price tracking (buy during sales): Save 10-20%\n• Use cashback apps for purchase: ₹200-500 back\n• Consider EMI if 0% interest available\n\n🔥 **Pro tip**: Follow the monitor on price tracking websites. You might get it for ₹8,000-9,000 during sales!\n\nWhat size/type of monitor are you looking at? Gaming, work, or general use?";
      }
      
      if (lowerMessage.includes('bike') || lowerMessage.includes('motorcycle') || lowerMessage.includes('scooter')) {
        setConversationContext({...conversationContext, waitingForGoal: false, lastTopic: 'vehicle'});
        return "A bike/scooter! Smart choice for transportation! 🏍️ Here's your vehicle savings strategy:\n\n**Transportation-focused savings plan:**\n• Use current transport savings toward goal\n• Calculate monthly transport costs vs EMI benefits\n• Consider used vehicles for better value\n• Factor in insurance, registration costs\n\nWould you like me to help calculate the total cost including insurance and registration?";
      }
      
      if (lowerMessage.includes('phone') || lowerMessage.includes('mobile') || lowerMessage.includes('smartphone')) {
        setConversationContext({...conversationContext, waitingForGoal: false, lastTopic: 'phone'});
        return "A new phone! 📱 Here's your smartphone savings strategy:\n\n**Phone-specific tips:**\n• Wait for festival sales (save 15-25%)\n• Consider exchange offers for old phone\n• Compare online vs offline prices\n• Check for bank offers and cashback\n\nWhat type of phone are you considering? Budget, mid-range, or flagship?";
      }
      
      if (lowerMessage.includes('laptop') || lowerMessage.includes('computer')) {
        setConversationContext({...conversationContext, waitingForGoal: false, lastTopic: 'laptop'});
        return "A laptop! Great for productivity! 💻 Here's your laptop savings plan:\n\n**Laptop-focused strategy:**\n• Student discounts if applicable\n• Refurbished options for better value\n• Specification research to avoid overpaying\n• Extended warranty considerations\n\nWhat will you primarily use it for? Work, gaming, or general use?";
      }
      
      if (lowerMessage.includes('trip') || lowerMessage.includes('travel') || lowerMessage.includes('vacation') || lowerMessage.includes('holiday')) {
        setConversationContext({...conversationContext, waitingForGoal: false, lastTopic: 'travel'});
        return "A trip! Travel is the best investment! ✈️ Here's your travel savings strategy:\n\n**Travel-focused savings:**\n• Book in advance for better deals\n• Flexible dates for cheaper flights\n• Budget accommodation research\n• Local food vs expensive restaurants\n\nWhere are you planning to go? Domestic or international?";
      }
      
      if (lowerMessage.includes('emergency') || lowerMessage.includes('fund') || lowerMessage.includes('backup')) {
        setConversationContext({...conversationContext, waitingForGoal: false, lastTopic: 'emergency'});
        return "Emergency fund! You're being incredibly smart! 🛡️ This is the BEST financial decision:\n\n**Emergency fund strategy:**\n• Keep in high-yield savings account\n• Don't invest in risky assets\n• Aim for 3-6 months of expenses eventually\n• This ₹10,000 is a great start!\n\n**Motivation**: This money will give you peace of mind and financial security. Every rupee saved here is protecting your future!";
      }
      
      // Enhanced detection for simple follow-ups like "for a monitor"
      if (lowerMessage.startsWith('for ') || lowerMessage.startsWith('for a ') || lowerMessage.startsWith('for an ')) {
        // Extract the item after "for"
        const goalItem = lowerMessage.replace(/^for (a |an )?/, '').trim();
        
        if (goalItem.includes('monitor') || goalItem.includes('screen') || goalItem.includes('display')) {
          setConversationContext({...conversationContext, waitingForGoal: false, lastTopic: 'monitor'});
          return "Awesome! A monitor - excellent choice! 🖥️ Here's your monitor-specific savings plan:\n\n💡 **Smart Monitor Shopping:**\n• Research during sales seasons (get 15-25% off)\n• Compare 24\", 27\", or 32\" based on your needs\n• Gaming vs work monitors have different priorities\n• Check for dead pixels before buying\n\n🎯 **Monitor Savings Strategy:**\n\n**Immediate actions:**\n• Create price alerts on Amazon/Flipkart\n• Follow tech deal channels on Telegram\n• Check offline stores for demo pieces (often discounted)\n\n**Weekly savings plan:**\n• Week 1-4: Cut gaming/entertainment expenses (₹3,000)\n• Week 5-8: Side hustles/selling old stuff (₹3,500)\n• Week 9-12: Final push + timing the purchase (₹3,500)\n\n**Purchase timing:** Wait for upcoming sales or festivals to maximize savings!\n\nWhat type of monitor work are you planning - gaming, coding, design, or general use?";
        }
        
        if (goalItem.includes('phone') || goalItem.includes('mobile')) {
          setConversationContext({...conversationContext, waitingForGoal: false, lastTopic: 'phone'});
          return "A phone! 📱 Smart timing - let me help you save effectively:\n\n**Phone-specific savings hacks:**\n• Wait for festival sales or new model launches\n• Your old phone exchange value matters\n• Bank offers can save ₹1,000-3,000\n• Compare online vs offline prices\n\nWhat's your target phone? Budget (₹10k-15k), mid-range (₹15k-30k), or premium?";
        }
        
        if (goalItem.includes('laptop') || goalItem.includes('computer')) {
          setConversationContext({...conversationContext, waitingForGoal: false, lastTopic: 'laptop'});
          return "A laptop! 💻 Great investment in yourself. Here's how to save smart:\n\n**Laptop savings strategy:**\n• Student discounts (if applicable) save 5-10%\n• Refurbished/certified pre-owned options\n• Timing: Buy during back-to-school sales\n• Specs research prevents overspending\n\nWhat's the primary use? Programming, gaming, general work, or content creation?";
        }
        
        // Generic response for unrecognized "for X" items
        setConversationContext({...conversationContext, waitingForGoal: false, lastTopic: 'general'});
        return `Perfect! Saving for ${goalItem} - I love specific goals! 🎯\n\n**Your personalized ₹10,000 strategy:**\n• Research the best time to buy (sales, discounts)\n• Set up price alerts if it's available online\n• Consider if there are seasonal patterns for pricing\n• Factor in any additional costs (accessories, etc.)\n\n**3-month savings breakdown:**\n• Month 1: ₹3,333 (focus on cutting unnecessary expenses)\n• Month 2: ₹3,333 (find ways to earn extra)\n• Month 3: ₹3,334 (final push + smart purchase timing)\n\nNeed specific tips for finding the best deals on ${goalItem}?`;
      }
      
      // Generic goal response for unrecognized items
      setConversationContext({...conversationContext, waitingForGoal: false, lastTopic: 'general'});
      return `Awesome goal! 🎯 Here's your customized savings plan for ${message}:\n\n**Smart saving approach:**\n• Research the best deals and timing\n• Set up a dedicated savings account for this goal\n• Track progress weekly to stay motivated\n• Consider if there are seasonal discounts\n\n**Additional tips:**\n• Look for online reviews before purchasing\n• Compare prices across multiple platforms\n• See if you can get better value by waiting\n• Factor in any additional costs (accessories, maintenance)\n\nHaving a specific goal makes saving so much easier! You've got this! 💪\n\nNeed help with anything else about reaching this goal?`;
    }
    
    // Enhanced follow-up question handling based on conversation context
    if (conversationContext.lastTopic && !conversationContext.waitingForGoal) {
      // Monitor-related follow-ups
      if (conversationContext.lastTopic === 'monitor') {
        if (lowerMessage.includes('gaming') || lowerMessage.includes('game')) {
          return "Gaming monitor! 🎮 Perfect choice! Here's what to focus on:\n\n**Gaming monitor priorities:**\n• **High refresh rate** (144Hz minimum, 240Hz ideal)\n• **Low input lag** (1ms response time)\n• **Resolution vs performance** (1080p for high FPS, 1440p for quality)\n• **Adaptive sync** (FreeSync/G-Sync)\n\n**Budget allocation for ₹10,000:**\n• ₹8,000-9,000 for monitor (during sales)\n• ₹1,000-2,000 for accessories (arm mount, cables)\n\n**Best time to buy:** During gaming sales events or new GPU launches when older monitors get discounted!\n\nWhat games do you mainly play? Competitive FPS or single-player adventures?";
        }
        
        if (lowerMessage.includes('work') || lowerMessage.includes('office') || lowerMessage.includes('productivity')) {
          return "Work monitor! 💼 Excellent productivity investment:\n\n**Work monitor priorities:**\n• **Size matters** (27\" minimum for productivity)\n• **Resolution** (1440p sweet spot for text clarity)\n• **Ergonomics** (adjustable height/tilt)\n• **Eye comfort** (blue light reduction, flicker-free)\n\n**Productivity features to look for:**\n• USB-C connectivity (single cable setup)\n• Multiple inputs (switch between devices)\n• Built-in USB hub\n• Pivot capability (portrait mode)\n\n**ROI calculation:** A good monitor improves productivity by 20-30%. If you earn ₹20,000/month, this pays for itself in increased efficiency!\n\nWhat type of work do you do? Programming, design, data analysis, or general office tasks?";
        }
        
        if (lowerMessage.includes('size') || lowerMessage.includes('24') || lowerMessage.includes('27') || lowerMessage.includes('32')) {
          return "Monitor size - crucial decision! 📏\n\n**Size guide for ₹10,000 budget:**\n\n**24\" (₹6,000-8,000):**\n• Perfect for small desks\n• Good for competitive gaming\n• Less strain for close viewing\n• More budget left for higher refresh rate\n\n**27\" (₹8,000-12,000):**\n• Sweet spot for most users\n• Great for productivity + gaming\n• 1440p looks amazing at this size\n• Most popular choice\n\n**32\" (₹12,000+):**\n• Might exceed budget unless on heavy discount\n• Awesome for immersive gaming\n• Great for content creation\n• Consider curved at this size\n\n**My recommendation:** 27\" 1440p during sales for ₹9,000-10,000. Best bang for buck!\n\nHow far do you sit from your desk? That affects the ideal size too!";
        }
      }
      
      // Phone-related follow-ups
      if (conversationContext.lastTopic === 'phone') {
        if (lowerMessage.includes('budget') || lowerMessage.includes('cheap') || lowerMessage.includes('affordable')) {
          return "Budget phone strategy! 📱 Smart approach:\n\n**Best budget phones for ₹10,000:**\n• Redmi/Realme series (great value)\n• Samsung Galaxy M series\n• Consider 6-month old flagships\n\n**Budget phone savings tips:**\n• Buy during festival sales (save ₹1,500-2,500)\n• Consider exchange offers\n• Check for bank discounts\n• Older generation flagships > new budget phones\n\n**What to prioritize in budget:**\n• Good processor (daily performance)\n• Decent camera (if you take photos)\n• Battery life (heavy usage)\n• Software updates (longevity)\n\nAny specific features you can't compromise on? Camera, gaming, battery life?";
        }
        
        if (lowerMessage.includes('camera') || lowerMessage.includes('photo')) {
          return "Camera-focused phone! 📸 Here's how to maximize your budget:\n\n**Camera priorities for ₹10,000:**\n• Look for phones with larger sensors\n• Night mode capability\n• Optical image stabilization (OIS)\n• Multiple lenses (ultra-wide, macro)\n\n**Photography phone tips:**\n• Pixel phones often have best computational photography\n• iPhone SE (older model) might be available in budget\n• Samsung A-series for versatile camera setup\n\n**Timing strategy:**\n• Buy when new camera phones launch (older ones get discounted)\n• Check for camera-focused sales events\n\nDo you mainly take portraits, landscapes, or need good video recording?";
        }
      }
      
      // Laptop-related follow-ups
      if (conversationContext.lastTopic === 'laptop') {
        if (lowerMessage.includes('programming') || lowerMessage.includes('coding') || lowerMessage.includes('development')) {
          return "Programming laptop! 💻 Here's your developer-focused strategy:\n\n**Programming priorities for ₹10,000:**\n• **RAM**: 8GB minimum (16GB ideal for multitasking)\n• **SSD**: Faster than HDD for code compilation\n• **Processor**: Intel i5/AMD Ryzen 5 minimum\n• **Keyboard**: Good typing experience matters!\n\n**Developer laptop tips:**\n• Refurbished ThinkPads are excellent value\n• Consider business laptops (built for durability)\n• Check for student discounts\n• Linux compatibility if you prefer open source\n\n**Budget extension idea:** ₹10,000 might be tight for new. Consider:\n• ₹15,000 budget with ₹5,000 from side projects\n• Refurbished business laptops\n• EMI options with 0% interest\n\nWhat programming languages/frameworks do you work with?";
        }
        
        if (lowerMessage.includes('gaming') || lowerMessage.includes('game')) {
          return "Gaming laptop for ₹10,000? 🎮 Let's be realistic:\n\n**Hard truth:** ₹10,000 won't get you a good gaming laptop. Here are better approaches:\n\n**Option 1: Extend budget**\n• Gaming laptops start around ₹40,000-50,000\n• Save for 6 months instead of 3\n• Consider EMI options\n\n**Option 2: Desktop gaming**\n• ₹10,000 can upgrade an existing desktop\n• Better price-to-performance ratio\n• Upgradeable components\n\n**Option 3: Cloud gaming**\n• Use current laptop + cloud gaming services\n• Much cheaper monthly cost\n• Try before investing in hardware\n\nWhat games do you want to play? I can suggest the minimum specs needed!";
        }
      }
    }
    
    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      const greetings = [
        "Hey there! 👋 I'm your personal financial assistant. I'm here to help you with literally anything - money questions, life advice, calculations, or just a friendly chat! What's on your mind today?",
        "Hello! 😊 Great to see you! I'm here to help with whatever you need - whether it's budgeting, saving tips, investment advice, or even just random questions. Fire away!",
        "Hi! ✨ I'm your AI companion ready to tackle any question you throw at me. Financial planning, life advice, fun facts, calculations - I've got you covered!",
        "Hey! 🌟 Welcome to SmartJeb! I'm here as your personal assistant for everything - money management, general questions, advice, or just having a conversation. What can I help you with?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // How much/calculation questions
    if (lowerMessage.includes('how much') || lowerMessage.includes('calculate') || lowerMessage.includes('if i save')) {
      if (lowerMessage.includes('10000') && (lowerMessage.includes('3 months') || lowerMessage.includes('3 month'))) {
        return "Perfect! Let me break down exactly how to save ₹10,000 in 3 months:\n\n💰 **Your Savings Plan:**\n• **Daily target**: ₹111 per day (₹10,000 ÷ 90 days)\n• **Weekly target**: ₹770 per week\n• **Monthly target**: ₹3,333 per month\n\n🎯 **Practical Ways to Save ₹111 Daily:**\n• Skip outside food once = ₹100-150 saved\n• Use public transport instead of auto = ₹80-120 saved\n• Make coffee at home = ₹50-80 saved\n• Avoid impulse purchases = ₹50-100 saved\n\n📊 **Monthly Strategy:**\n• Week 1: Focus on food expenses (₹800 saved)\n• Week 2: Transportation savings (₹600 saved)\n• Week 3: Entertainment cuts (₹700 saved)\n• Week 4: Shopping discipline (₹900 saved)\n\n✨ **Pro Tips:**\n• Set up auto-transfer of ₹111 daily\n• Track progress weekly\n• Reward yourself at month-end (within budget!)\n• Find free entertainment alternatives\n\nYou've absolutely got this! Small daily actions = big results! 🚀";
      }
      
      const calculationResponses = [
        "I love crunching numbers! 🧮 Give me the specifics and I'll break it down for you. Whether it's savings goals, EMI calculations, investment returns, or daily budgets - just tell me the amount and timeframe!",
        "Math mode activated! 📊 Share your numbers with me - savings target, investment amount, monthly expenses, whatever you need calculated. I'll give you a detailed breakdown with practical tips!",
        "Let's do some financial math! 💡 Tell me exactly what you want to calculate - monthly savings for a goal, compound interest, EMI amounts, or anything else. I'll make it simple and actionable!",
        "Calculator ready! ⚡ Just give me the details - how much you want to save, invest, or spend, and over what period. I'll show you the daily, weekly, and monthly breakdown plus some smart strategies!"
      ];
      return calculationResponses[Math.floor(Math.random() * calculationResponses.length)];
    }

    // More specific patterns for the 10000 question - SET CONTEXT FOR FOLLOW-UP
    if ((lowerMessage.includes('10000') || lowerMessage.includes('ten thousand')) && (lowerMessage.includes('3 months') || lowerMessage.includes('3 month'))) {
      // Set context to wait for user's goal response
      setConversationContext({
        lastTopic: 'savings_plan',
        waitingForGoal: true,
        savingsAmount: 10000,
        timeframe: '3 months'
      });
      
      return "Awesome! ₹10,000 in 3 months is totally doable! 🎯\n\n💰 **Quick Math:**\n• **Daily target**: ₹111 (₹10,000 ÷ 90 days)\n• **Weekly target**: ₹770\n• **Monthly target**: ₹3,333\n\n🚀 **I can give you a super personalized savings strategy!**\n\nWhat's this ₹10,000 for? Tell me your goal and I'll tailor the perfect plan:\n• Monitor/laptop/phone?\n• Trip/vacation?\n• Emergency fund?\n• Something else awesome?\n\nThe more specific you are, the better tips I can give you! 😊";
    }

    // Specific question about wanting 10000 - ALSO SET CONTEXT
    if (lowerMessage.includes('want') && lowerMessage.includes('10000') && lowerMessage.includes('3 month')) {
      // Set context to wait for user's goal response
      setConversationContext({
        lastTopic: 'savings_plan',
        waitingForGoal: true,
        savingsAmount: 10000,
        timeframe: '3 months'
      });
      
      return "Perfect! You want ₹10,000 in 3 months - I love specific goals! 🎯\n\n💰 **The Math:**\n• **₹111 per day** for 90 days = ₹10,000\n• **₹770 per week** (easier to track weekly)\n• **₹3,333 per month**\n\n✨ **Here's the thing** - I can give you WAY better advice if I know what this is for!\n\n**Tell me your goal:**\n• Gaming setup/monitor?\n• New phone/laptop?\n• Trip somewhere amazing?\n• Emergency fund (smart choice!)?\n• Investment/course?\n• Something else?\n\nOnce you tell me, I'll create a laser-focused savings strategy just for you! What's the goal? 😊";
    }

    // Budget and money management
    if (lowerMessage.includes('budget') || lowerMessage.includes('money') || lowerMessage.includes('spend') || lowerMessage.includes('expense')) {
      const budgetResponses = [
        "Budgeting doesn't have to be boring! 💪 Here's my human approach:\n\n**The 50/30/20 rule (but flexible):**\n• 50% - Needs (rent, groceries, bills)\n• 30% - Wants (entertainment, dining out)\n• 20% - Savings & investments\n\n**Real talk:** Life happens! Some months you'll spend more on wants, others you'll save extra. The key is being aware and adjusting. Track for a week first to see where your money actually goes - you might be surprised! Want me to help you create a personalized budget?",
        "Let's talk money management like real humans! 💰 Forget those strict budgets that make you feel guilty about buying coffee.\n\n**My practical approach:**\n1. **Pay yourself first** - Save before you spend\n2. **Automate everything** - Savings, bills, investments\n3. **The 24-hour rule** - Wait a day before big purchases\n4. **Track expenses for awareness** - Not judgment!\n5. **Build in guilt-free spending** - You deserve treats!\n\nWhat specific area of budgeting are you struggling with? I can give you personalized strategies that actually work in real life!",
        "Money management that doesn't suck! 🎯 Here's what actually works:\n\n**Start small:** Track expenses for just one week. Don't change anything, just observe. You'll learn more about your habits than any budgeting app.\n\n**The envelope method (digital style):** Separate accounts for different purposes - one for bills, one for fun money, one for savings. It's like having different wallets.\n\n**Emergency fund first:** Even ₹50/day adds up to ₹18,250 in a year. Start there.\n\nWhat's your biggest money challenge right now? Let's solve it together with practical steps, not overwhelming spreadsheets!"
      ];
      return budgetResponses[Math.floor(Math.random() * budgetResponses.length)];
    }

    // Investment and savings
    if (lowerMessage.includes('invest') || lowerMessage.includes('sip') || lowerMessage.includes('mutual fund') || lowerMessage.includes('stock')) {
      const investmentResponses = [
        "Investing doesn't have to be scary! 📈 Let me break it down human-style:\n\n**For beginners:**\n• Start with SIPs in large-cap mutual funds (less risky)\n• Even ₹500/month builds wealth over time\n• Index funds are your best friend (low fees, market returns)\n• Don't try to time the market - consistency wins\n\n**Golden rules:**\n1. Emergency fund first (3-6 months expenses)\n2. Start small and increase gradually\n3. Diversify (don't put all eggs in one basket)\n4. Think long-term (5+ years minimum)\n\nWant specific fund recommendations or help calculating returns? I can guide you through the whole process step by step!",
        "Investment talk! 🚀 I'll keep it real and practical:\n\n**The truth about investing:**\n• You don't need lakhs to start - ₹500 SIP works\n• Mutual funds > individual stocks for beginners\n• Compound interest is literally magic over time\n• Market volatility is normal - don't panic sell\n\n**My starter pack recommendation:**\n1. Emergency fund in savings account\n2. ELSS funds for tax saving\n3. Large-cap index fund for stability\n4. Mid-cap fund for growth (small portion)\n\n**Example:** ₹2000 SIP with 12% average returns = ₹4.6 lakhs in 10 years (you invested only ₹2.4 lakhs!)\n\nWhat's your investment timeline and risk appetite? Let me suggest something specific for you!"
      ];
      return investmentResponses[Math.floor(Math.random() * investmentResponses.length)];
    }

    // Savings specific
    if (lowerMessage.includes('save') || lowerMessage.includes('saving') || lowerMessage.includes('emergency fund')) {
      const savingsResponses = [
        "Savings goals are everything! 🎯 Let's make it happen:\n\n**The psychology of saving:**\n• Make it automatic (you won't miss what you don't see)\n• Start ridiculously small to build the habit\n• Celebrate small wins (every ₹1000 saved matters!)\n• Visual progress tracking keeps you motivated\n\n**Practical saving hacks:**\n• Round up purchases and save the difference\n• Save any unexpected money (bonuses, gifts)\n• Use the 52-week challenge (₹10 week 1, ₹20 week 2...)\n• Create specific goals with deadlines\n\n**Emergency fund priority:** 3-6 months of expenses in a savings account. Not for investments - for peace of mind!\n\nWhat's your savings goal? Let me create a personalized plan that actually fits your lifestyle!",
        "Saving money is an art! 🎨 Here's my human approach:\n\n**Why people fail at saving:**\n• Setting unrealistic targets\n• No clear purpose\n• Treating savings as leftover money\n• No emergency buffer\n\n**What actually works:**\n1. **Pay yourself first** - Save before expenses\n2. **Automate transfers** - Remove willpower from equation\n3. **Specific goals** - 'Vacation fund' vs 'savings'\n4. **Track progress visually** - Charts, apps, whatever motivates you\n5. **Allow flexibility** - Life happens, adjust and continue\n\n**Quick win:** Start with ₹100/day for 30 days. That's ₹3000! Small amounts build confidence and habits.\n\nTell me your income and expenses - I'll help you find ₹5000-10000 to save monthly without feeling deprived!"
      ];
      return savingsResponses[Math.floor(Math.random() * savingsResponses.length)];
    }

    // Credit cards and debt
    if (lowerMessage.includes('credit') || lowerMessage.includes('debt') || lowerMessage.includes('loan') || lowerMessage.includes('emi')) {
      const debtResponses = [
        "Credit cards and debt - let's tackle this smartly! 💳\n\n**Credit card wisdom:**\n• Use it like cash - only spend what you have\n• Pay FULL amount every month (interest rates are brutal)\n• Keep utilization under 30% for good credit score\n• Cashback/rewards are bonuses, not reasons to spend more\n\n**If you're in debt:**\n1. List all debts with interest rates\n2. Pay minimums on all, extra on highest interest\n3. Consider balance transfer to lower rates\n4. Stop using credit for new purchases\n5. Side hustle for extra debt payments\n\n**Credit score matters:** Good score = better loan rates, credit card approvals, even job opportunities.\n\nNeed help with debt payoff strategy? Share your debt details and I'll create a personalized plan!",
        "Debt management reality check! 💪\n\n**The truth about debt:**\n• Not all debt is bad (education, home loans can be good)\n• Credit card debt is wealth killer - tackle first\n• EMIs should be max 40% of income\n• Emergency fund prevents new debt\n\n**Debt freedom strategy:**\n1. **Emergency ₹10,000 first** (prevents new debt)\n2. **List all debts** - amount, interest rate, minimum payment\n3. **Avalanche method** - pay highest interest first\n4. **Snowball method** - pay smallest amount first (psychological wins)\n5. **Negotiate with banks** - they often reduce rates/amounts\n\n**Credit card hack:** Set up auto-pay for full amount. Never pay just minimum - it's a trap!\n\nWhat's your debt situation? I can help create a realistic payoff timeline with actionable steps!"
      ];
      return debtResponses[Math.floor(Math.random() * debtResponses.length)];
    }

    // Life advice and general questions
    if (lowerMessage.includes('advice') || lowerMessage.includes('help') || lowerMessage.includes('what should i') || lowerMessage.includes('life')) {
      const lifeAdvice = [
        "Life advice coming right up! 🌟\n\n**Money mindset shifts that change everything:**\n• Wealth is built through habits, not big wins\n• Your worth isn't your net worth\n• Financial security > showing off\n• Invest in yourself first (skills, health, relationships)\n• Money is a tool, not the goal\n\n**General life wisdom:**\n• Start before you feel ready\n• Consistency beats perfection\n• Surround yourself with people who inspire you\n• Learn something new every month\n• Health is your real wealth\n\nWhat specific area of life are you thinking about? Career, relationships, personal growth, finances? I'm here to chat and help however I can!",
        "Here for all your life questions! 💫\n\n**Universal truths I've learned:**\n• Your 20s are for learning, 30s for earning, 40s for living\n• Invest in experiences and relationships over things\n• Financial independence = freedom to choose\n• Skills compound like investments\n• Your network determines your net worth\n\n**Practical life advice:**\n1. **Build multiple income streams** - job security is myth\n2. **Learn high-value skills** - digital marketing, coding, communication\n3. **Take calculated risks** - biggest risk is not taking any\n4. **Document your journey** - you'll inspire others\n5. **Give back** - success feels empty without purpose\n\nWhat's on your mind? Career decisions, relationship advice, life goals? Let's figure it out together!"
      ];
      return lifeAdvice[Math.floor(Math.random() * lifeAdvice.length)];
    }

    // Technology and general knowledge
    if (lowerMessage.includes('technology') || lowerMessage.includes('app') || lowerMessage.includes('phone') || lowerMessage.includes('computer')) {
      const techResponses = [
        "Tech talk! 💻 I love discussing technology and how it impacts our lives:\n\n**Financial tech that actually helps:**\n• Expense tracking apps (like SmartJeb! 😉)\n• Investment platforms with low fees\n• Banking apps with good UX\n• Budgeting tools that sync across devices\n\n**General tech wisdom:**\n• Don't upgrade devices yearly - waste of money\n• Learn basic troubleshooting to save on repairs\n• Use free alternatives to expensive software\n• Automate repetitive tasks\n• Backup everything important\n\nWhat specific tech question do you have? I can help with app recommendations, troubleshooting, or just chat about the latest trends!",
        "Technology questions? I'm here for it! 🚀\n\n**Smart money moves with tech:**\n• Use price comparison apps before buying\n• Automate savings and investments\n• Track expenses with apps (builds awareness)\n• Use cashback and reward apps wisely\n• Learn digital skills for side income\n\n**Tech life hacks:**\n• Free courses online for any skill\n• Open source alternatives save money\n• Cloud storage for important documents\n• Password managers for security\n• Screen time limits for productivity\n\nTell me what you're curious about - specific apps, devices, online learning, digital finance tools? I'm genuinely interested in helping!"
      ];
      return techResponses[Math.floor(Math.random() * techResponses.length)];
    }

    // Career and work
    if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('work') || lowerMessage.includes('salary')) {
      const careerResponses = [
        "Career conversations are my favorite! 🚀\n\n**Financial career wisdom:**\n• Salary is important, but growth potential matters more\n• Build skills that increase your market value\n• Network genuinely - help others first\n• Document your achievements for reviews\n• Always be learning something new\n\n**Money and career strategy:**\n1. **Negotiate salary** - research market rates first\n2. **Build emergency fund** - gives you negotiation power\n3. **Invest in skills** - highest ROI investment\n4. **Side hustles** - test business ideas, extra income\n5. **Plan career moves** - strategic job changes increase salary faster\n\n**Real talk:** Job security is dead. Build skill security instead. What career challenges are you facing? Let's strategize together!",
        "Let's talk career and money! 💼\n\n**Career financial planning:**\n• Track your earning potential, not just current salary\n• Invest 10% of income in skill development\n• Build reputation in your field (LinkedIn, networking)\n• Have 6-month emergency fund for career risks\n• Consider freelancing/consulting for extra income\n\n**Salary negotiation tips:**\n1. Research market rates thoroughly\n2. Document your value/achievements\n3. Ask for more than salary (benefits, growth, flexibility)\n4. Practice the conversation\n5. Be prepared to walk away\n\n**Career investment mindset:** Every skill learned, relationship built, and risk taken compounds over time.\n\nWhat's your career situation? New graduate, career change, salary negotiation, or planning next steps? I can help you think through it!"
      ];
      return careerResponses[Math.floor(Math.random() * careerResponses.length)];
    }

    // Relationships and personal
    if (lowerMessage.includes('relationship') || lowerMessage.includes('family') || lowerMessage.includes('friend') || lowerMessage.includes('personal')) {
      const relationshipResponses = [
        "Relationships and money - such an important topic! 💕\n\n**Financial harmony in relationships:**\n• Be transparent about money goals and habits\n• Discuss big purchases before making them\n• Both partners should understand finances\n• Separate fun money accounts reduce conflicts\n• Plan financial goals together\n\n**Personal finance psychology:**\n• Money stress affects all relationships\n• Financial security gives confidence\n• Teaching kids about money is parenting\n• Don't lend money you can't afford to lose\n• Success is better shared\n\n**Life balance:** Making money is important, but relationships, health, and personal growth matter just as much. What's going on in your personal life? I'm here to listen and help however I can!",
        "Personal stuff matters! 🫂\n\n**Money and relationships reality:**\n• Financial stress is a major relationship killer\n• Different money values cause conflicts\n• Financial independence gives relationship freedom\n• Joint financial goals strengthen partnerships\n• Money conversations should happen regularly\n\n**Personal growth and money:**\n1. **Self-worth affects financial decisions**\n2. **Emotional spending is real** - address the feelings\n3. **Financial therapy exists** - money triggers are normal\n4. **Success mindset takes practice**\n5. **Celebrate progress, not perfection**\n\nRemember: You're more than your bank balance. Your relationships, health, and happiness are the real wealth. What's on your heart today?"
      ];
      return relationshipResponses[Math.floor(Math.random() * relationshipResponses.length)];
    }

    // Fun and random questions
    if (lowerMessage.includes('fun') || lowerMessage.includes('joke') || lowerMessage.includes('tell me') || lowerMessage.includes('random')) {
      const funResponses = [
        "Fun time! 🎉 Here's some financial humor for you:\n\n**Money jokes:**\n• I told my wallet a joke about money... it didn't laugh because it was broke! 💸\n• Why don't money and secrets get along? Because money talks!\n• My bank account and I have trust issues - it keeps saying 'insufficient funds' and I keep saying 'that's impossible!'\n\n**Fun financial facts:**\n• The average person spends 5 years of their life thinking about money\n• ATMs were originally called 'robot cashiers'\n• The first credit card was made of cardboard\n\nWhat kind of fun stuff interests you? Random facts, jokes, weird money trivia, or something else entirely?",
        "Let's have some fun! 😄\n\n**Weird money facts:**\n• Bill Gates' net worth increases by about $1,300 every second\n• The most expensive pizza ever cost $12,000 (it had gold flakes!)\n• If you saved ₹100 every day since the pyramids were built, you still wouldn't be a billionaire\n• Monopoly money is printed more than real money in many countries\n\n**Financial wisdom disguised as fun:**\n• Compound interest is the 8th wonder of the world\n• Time is literally money when investing\n• The best investment is often in yourself\n\nWhat's your idea of fun? I can chat about literally anything - movies, sports, travel, weird facts, life stories, whatever makes you smile!"
      ];
      return funResponses[Math.floor(Math.random() * funResponses.length)];
    }

    // Default comprehensive responses
    const comprehensiveResponses = [
      "I love getting all kinds of questions! 🤗 While I'm great with financial stuff, I'm honestly here to chat about anything that's on your mind:\n\n**I can help with:**\n• Financial planning and budgeting\n• Investment advice and calculations\n• Career and life decisions\n• Technology and productivity tips\n• General life advice and motivation\n• Random conversations and fun facts\n• Problem-solving and brainstorming\n\nWhat's really on your mind today? Don't worry about staying on topic - I enjoy genuine conversations about whatever matters to you right now!",
      
      "Hey, I'm here for whatever you need! 💫 Your question might not be directly about money, but that's totally okay:\n\n**Things I love discussing:**\n• Life goals and how to achieve them\n• Practical advice for everyday challenges\n• Learning and skill development\n• Relationships and personal growth\n• Technology and its impact on life\n• Career strategies and planning\n• Creative problem-solving\n• Just having a genuine conversation!\n\nI'm built to be helpful, friendly, and actually useful. So whether it's a serious question, random thought, or you just want to chat - I'm genuinely interested. What's going on with you?",
      
      "You know what? I really enjoy when people ask me anything! 🌟 Sure, I'm great with financial advice, but I'm honestly just here to be helpful:\n\n**Real talk:** Life isn't just about money. It's about relationships, growth, purpose, health, creativity, and finding happiness. I can chat about:\n\n• Personal challenges you're facing\n• Goals you're working towards\n• Decisions you're trying to make\n• Skills you want to develop\n• Ideas you're exploring\n• Problems you need to solve\n• Or literally just random thoughts!\n\nI'm designed to be genuinely helpful and have real conversations. So what's actually on your mind today? I'm here to listen and help however I can!",
      
      "I appreciate you reaching out! 😊 Honestly, I'm here for any kind of conversation:\n\n**My philosophy:** Everyone's dealing with something, working towards something, or curious about something. Whether it's:\n\n• Financial stress or goals\n• Career decisions or challenges\n• Relationship questions\n• Personal development\n• Learning new things\n• Technology and productivity\n• Health and lifestyle\n• Creative projects\n• Random curiosity\n\nI genuinely want to be helpful. I'll give you honest, practical advice based on real-world experience and common sense. No judgment, no complicated jargon - just a friendly conversation.\n\nSo, what's really going on? What can I help you think through today?"
    ];
    
    return comprehensiveResponses[Math.floor(Math.random() * comprehensiveResponses.length)];
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
    <div className={`fixed transition-all duration-300 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 animate-slide-up ${
      isExpanded 
        ? 'bottom-6 right-6 left-6 top-6 md:left-1/4' 
        : 'bottom-6 right-6 w-96 h-[500px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">SmartJeb AI Assistant</h3>
            <p className="text-xs text-white/80">Your intelligent financial companion</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-lg p-1"
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5v4m0-4h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5v4m0-4h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-lg p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 ${
              isExpanded ? 'max-w-[70%]' : 'max-w-[80%]'
            } ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
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
            className={`flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
              isExpanded ? 'min-h-[60px]' : ''
            }`}
            rows={isExpanded ? "3" : "2"}
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
