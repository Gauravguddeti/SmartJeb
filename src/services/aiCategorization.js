/**
 * AI Categorization Service for PennyLog
 * Provides smart expense categorization using local algorithms
 */

/**
 * Keywords for automatic categorization
 */
const CATEGORY_KEYWORDS = {
  'Food': [
    'restaurant', 'food', 'dining', 'cafe', 'pizza', 'burger', 'swiggy', 
    'zomato', 'uber eats', 'delivery', 'kitchen', 'meal', 'lunch', 'dinner',
    'breakfast', 'snack', 'coffee', 'tea', 'mcdonalds', 'kfc', 'dominos',
    'starbucks', 'dunkin', 'subway', 'taco', 'chinese', 'indian', 'italian'
  ],
  'Transport': [
    'uber', 'lyft', 'taxi', 'bus', 'metro', 'train', 'fuel', 'petrol',
    'gas', 'parking', 'toll', 'auto', 'rickshaw', 'ola', 'rapido',
    'flight', 'airline', 'booking', 'travel', 'cab', 'bike', 'scooter'
  ],
  'Shopping': [
    'amazon', 'flipkart', 'myntra', 'shop', 'store', 'mall', 'clothes',
    'fashion', 'electronics', 'mobile', 'laptop', 'gadget', 'online',
    'purchase', 'buy', 'order', 'delivery', 'clothing', 'shoes', 'bag'
  ],
  'Entertainment': [
    'movie', 'cinema', 'theater', 'concert', 'show', 'game', 'netflix',
    'spotify', 'youtube', 'subscription', 'gaming', 'steam', 'playstation',
    'xbox', 'entertainment', 'fun', 'party', 'club', 'bar', 'pub'
  ],
  'Health': [
    'hospital', 'doctor', 'medical', 'pharmacy', 'medicine', 'health',
    'clinic', 'checkup', 'dental', 'eye', 'surgery', 'treatment',
    'prescription', 'vitamin', 'supplement', 'fitness', 'gym', 'yoga'
  ],
  'Bills': [
    'electricity', 'water', 'gas', 'internet', 'phone', 'mobile',
    'recharge', 'bill', 'utility', 'rent', 'emi', 'loan', 'insurance',
    'credit card', 'bank', 'payment', 'subscription', 'netflix', 'prime'
  ],
  'Education': [
    'school', 'college', 'university', 'course', 'book', 'education',
    'tuition', 'fee', 'exam', 'certification', 'online course', 'udemy',
    'coursera', 'skill', 'training', 'workshop', 'seminar', 'conference'
  ]
};

/**
 * Vendor patterns for automatic categorization
 */
const VENDOR_PATTERNS = {
  'Food': [
    /swiggy/i, /zomato/i, /uber\s*eats/i, /mcdonalds/i, /kfc/i, /dominos/i,
    /pizza/i, /restaurant/i, /cafe/i, /starbucks/i, /dunkin/i, /subway/i
  ],
  'Transport': [
    /uber/i, /ola/i, /rapido/i, /taxi/i, /fuel/i, /petrol/i, /gas/i,
    /parking/i, /toll/i, /flight/i, /airline/i, /railway/i, /metro/i
  ],
  'Shopping': [
    /amazon/i, /flipkart/i, /myntra/i, /ajio/i, /nykaa/i, /bigbasket/i,
    /grofers/i, /blinkit/i, /zepto/i, /dunzo/i, /electronics/i
  ],
  'Entertainment': [
    /netflix/i, /prime\s*video/i, /hotstar/i, /spotify/i, /youtube/i,
    /cinema/i, /movie/i, /theater/i, /gaming/i, /steam/i, /playstation/i
  ],
  'Health': [
    /apollo/i, /hospital/i, /clinic/i, /pharmacy/i, /medical/i, /doctor/i,
    /gym/i, /fitness/i, /yoga/i, /medicine/i, /health/i
  ],
  'Bills': [
    /electricity/i, /bses/i, /reliance/i, /airtel/i, /jio/i, /vodafone/i,
    /bank/i, /sbi/i, /hdfc/i, /icici/i, /axis/i, /emi/i, /loan/i
  ]
};

/**
 * Smart categorization based on expense details
 * @param {Object} expenseData - Expense data containing amount, note, vendor
 * @returns {string} Suggested category
 */
export function categorizeExpense(expenseData) {
  const { note = '', vendor = '', amount } = expenseData;
  const text = `${note} ${vendor}`.toLowerCase();
  
  // Score each category based on keyword matches
  const categoryScores = {};
  
  // Check vendor patterns first (higher weight)
  for (const [category, patterns] of Object.entries(VENDOR_PATTERNS)) {
    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        score += 3; // Higher weight for vendor patterns
      }
    }
    categoryScores[category] = score;
  }
  
  // Check keyword matches
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (!categoryScores[category]) categoryScores[category] = 0;
    
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        categoryScores[category] += 1;
      }
    }
  }
  
  // Amount-based hints
  if (amount < 50) {
    categoryScores['Food'] = (categoryScores['Food'] || 0) + 0.5;
  } else if (amount > 1000) {
    categoryScores['Shopping'] = (categoryScores['Shopping'] || 0) + 0.5;
    categoryScores['Bills'] = (categoryScores['Bills'] || 0) + 0.5;
  }
  
  // Find category with highest score
  let bestCategory = 'Other';
  let bestScore = 0;
  
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  
  // Return 'Other' if no strong match found
  return bestScore > 0 ? bestCategory : 'Other';
}

/**
 * Generate weekly spending insights
 * @param {Array} expenses - Array of expenses for the week
 * @returns {Object} Insights object with summary and tips
 */
export function generateWeeklyInsights(expenses) {
  if (expenses.length === 0) {
    return {
      summary: "No expenses recorded this week.",
      tips: ["Start tracking your daily expenses to get personalized insights!"]
    };
  }
  
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgPerDay = total / 7;
  
  // Category breakdown
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});
  
  const topCategory = Object.entries(categoryTotals).reduce((a, b) => 
    categoryTotals[a[0]] > categoryTotals[b[0]] ? a : b
  )[0];
  
  const topCategoryAmount = categoryTotals[topCategory];
  const topCategoryPercentage = ((topCategoryAmount / total) * 100).toFixed(0);
  
  // Day-wise analysis
  const dailyTotals = expenses.reduce((acc, expense) => {
    const day = new Date(expense.date).toLocaleDateString('en-US', { weekday: 'long' });
    acc[day] = (acc[day] || 0) + expense.amount;
    return acc;
  }, {});
  
  const highestSpendingDay = Object.entries(dailyTotals).reduce((a, b) => 
    dailyTotals[a[0]] > dailyTotals[b[0]] ? a : b
  )[0];
  
  // Generate summary
  const summary = `This week you spent ₹${total.toFixed(0)} across ${expenses.length} transactions. Your highest spending was on ${topCategory} (${topCategoryPercentage}% of total). ${highestSpendingDay} was your biggest spending day with ₹${dailyTotals[highestSpendingDay].toFixed(0)}.`;
  
  // Generate tips
  const tips = generateSavingTips(categoryTotals, total, avgPerDay);
  
  return { summary, tips, categoryTotals, dailyTotals };
}

/**
 * Generate personalized saving tips
 * @param {Object} categoryTotals - Category-wise spending totals
 * @param {number} total - Total spending
 * @param {number} avgPerDay - Average daily spending
 * @returns {Array} Array of saving tips
 */
function generateSavingTips(categoryTotals, total, avgPerDay) {
  const tips = [];
  
  // Food-specific tips
  if (categoryTotals['Food'] > total * 0.4) {
    tips.push("Try cooking at home more often to reduce food delivery expenses.");
    tips.push("Consider meal prepping on weekends to save time and money.");
  }
  
  // Transport tips
  if (categoryTotals['Transport'] > total * 0.3) {
    tips.push("Consider using public transport or carpooling to reduce travel costs.");
    tips.push("Plan your trips efficiently to minimize unnecessary rides.");
  }
  
  // Shopping tips
  if (categoryTotals['Shopping'] > total * 0.5) {
    tips.push("Create a shopping list before buying to avoid impulse purchases.");
    tips.push("Look for discounts and compare prices before making big purchases.");
  }
  
  // Entertainment tips
  if (categoryTotals['Entertainment'] > total * 0.2) {
    tips.push("Look for free or low-cost entertainment alternatives like local events.");
    tips.push("Consider sharing subscription services with family or friends.");
  }
  
  // High spending tips
  if (avgPerDay > 500) {
    tips.push("Set a daily spending limit to help control your expenses.");
    tips.push("Review your expenses weekly to identify areas for improvement.");
  }
  
  // General tips if no specific category dominates
  if (tips.length === 0) {
    tips.push("You're doing well with balanced spending across categories!");
    tips.push("Keep tracking your expenses to maintain good financial habits.");
    tips.push("Consider setting monthly budgets for each spending category.");
  }
  
  return tips.slice(0, 3); // Return top 3 tips
}

/**
 * Analyze spending patterns and predict future expenses
 * @param {Array} historicalExpenses - Historical expense data
 * @returns {Object} Analysis and predictions
 */
export function analyzeSpendingPatterns(historicalExpenses) {
  if (historicalExpenses.length < 7) {
    return {
      trend: 'insufficient_data',
      prediction: 'Need more data for analysis',
      patterns: []
    };
  }
  
  // Sort by date
  const sortedExpenses = historicalExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Calculate weekly totals
  const weeklyTotals = [];
  let currentWeekStart = new Date(sortedExpenses[0].date);
  let currentWeekTotal = 0;
  
  sortedExpenses.forEach(expense => {
    const expenseDate = new Date(expense.date);
    const daysDiff = Math.floor((expenseDate - currentWeekStart) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 7) {
      weeklyTotals.push(currentWeekTotal);
      currentWeekStart = new Date(expenseDate);
      currentWeekTotal = expense.amount;
    } else {
      currentWeekTotal += expense.amount;
    }
  });
  
  if (currentWeekTotal > 0) {
    weeklyTotals.push(currentWeekTotal);
  }
  
  // Determine trend
  let trend = 'stable';
  if (weeklyTotals.length >= 2) {
    const recent = weeklyTotals.slice(-2);
    const change = ((recent[1] - recent[0]) / recent[0]) * 100;
    
    if (change > 10) trend = 'increasing';
    else if (change < -10) trend = 'decreasing';
  }
  
  // Calculate average and predict next week
  const avgWeekly = weeklyTotals.reduce((sum, total) => sum + total, 0) / weeklyTotals.length;
  const prediction = `Based on your spending pattern, you might spend around ₹${avgWeekly.toFixed(0)} next week.`;
  
  // Identify patterns
  const patterns = [];
  const categoryFrequency = historicalExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + 1;
    return acc;
  }, {});
  
  const mostFrequentCategory = Object.entries(categoryFrequency).reduce((a, b) => 
    categoryFrequency[a[0]] > categoryFrequency[b[0]] ? a : b
  )[0];
  
  patterns.push(`You spend most frequently on ${mostFrequentCategory}`);
  
  return { trend, prediction, patterns, weeklyTotals };
}
