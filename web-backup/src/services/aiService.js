import { EXPENSE_CATEGORIES, getCategorizationData, addCategorizationData } from './database.js';

/**
 * Keywords for automatic categorization
 */
const CATEGORY_KEYWORDS = {
  'Food & Dining': [
    'restaurant', 'swiggy', 'zomato', 'uber eats', 'food', 'lunch', 'dinner', 
    'breakfast', 'cafe', 'pizza', 'burger', 'coffee', 'tea', 'starbucks',
    'mcdonald', 'kfc', 'dominos', 'subway', 'dunkin'
  ],
  'Transportation': [
    'uber', 'ola', 'taxi', 'bus', 'metro', 'petrol', 'fuel', 'gas',
    'parking', 'auto', 'rickshaw', 'rapido', 'bike', 'car'
  ],
  'Shopping': [
    'amazon', 'flipkart', 'myntra', 'ajio', 'shopping', 'clothes',
    'electronics', 'phone', 'laptop', 'shoes', 'bag', 'nykaa'
  ],
  'Entertainment': [
    'movie', 'cinema', 'netflix', 'spotify', 'game', 'concert',
    'theater', 'bookmyshow', 'music', 'youtube premium'
  ],
  'Bills & Utilities': [
    'electricity', 'water', 'gas', 'internet', 'mobile', 'phone bill',
    'broadband', 'wifi', 'jio', 'airtel', 'vi', 'bsnl'
  ],
  'Healthcare': [
    'doctor', 'hospital', 'medicine', 'pharmacy', 'health', 'medical',
    'clinic', 'apollo', 'max', 'fortis', 'medplus'
  ],
  'Education': [
    'course', 'book', 'education', 'school', 'college', 'university',
    'training', 'certification', 'udemy', 'coursera'
  ],
  'Travel': [
    'flight', 'hotel', 'booking', 'makemytrip', 'goibibo', 'cleartrip',
    'train', 'irctc', 'vacation', 'trip'
  ],
  'Groceries': [
    'grocery', 'supermarket', 'big bazaar', 'dmart', 'reliance fresh',
    'more', 'vegetables', 'fruits', 'milk', 'bread'
  ],
  'Personal Care': [
    'salon', 'spa', 'cosmetics', 'skincare', 'haircut', 'beauty',
    'personal', 'hygiene'
  ]
};

/**
 * Simple sentiment analysis for expense mood detection
 * @param {string} note - Expense note
 * @returns {string} Mood (positive, negative, neutral)
 */
export const analyzeMood = (note) => {
  if (!note || typeof note !== 'string') return 'neutral';
  
  const positiveWords = ['happy', 'great', 'good', 'excellent', 'amazing', 'wonderful', 'love', 'enjoy'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'expensive', 'overpriced', 'disappointed'];
  
  const lowerNote = note.toLowerCase();
  const hasPositive = positiveWords.some(word => lowerNote.includes(word));
  const hasNegative = negativeWords.some(word => lowerNote.includes(word));
  
  if (hasPositive && !hasNegative) return 'positive';
  if (hasNegative && !hasPositive) return 'negative';
  return 'neutral';
};

/**
 * Categorize expense based on description and note using keyword matching
 * @param {string} description - Expense description
 * @param {string} note - Optional expense note
 * @returns {Promise<string>} Predicted category
 */
export const categorizeExpense = async (description, note = '') => {
  const text = `${description} ${note}`.toLowerCase();
  
  // First try keyword matching
  let bestMatch = { category: 'Other', score: 0 };
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.filter(keyword => text.includes(keyword.toLowerCase()));
    const score = matches.length;
    
    if (score > bestMatch.score) {
      bestMatch = { category, score };
    }
  }
  
  // If no keyword match, try learning from previous categorizations
  if (bestMatch.score === 0) {
    try {
      const trainingData = await getCategorizationData();
      const prediction = await predictCategoryFromTraining(text, trainingData);
      if (prediction) {
        bestMatch.category = prediction;
      }
    } catch (error) {
      console.warn('Failed to use training data for categorization:', error);
    }
  }
  
  return bestMatch.category;
};

/**
 * Simple Naive Bayes-like categorization using training data
 * @param {string} text - Text to categorize
 * @param {Array} trainingData - Previous categorization data
 * @returns {string|null} Predicted category or null
 */
const predictCategoryFromTraining = async (text, trainingData) => {
  if (!trainingData || trainingData.length === 0) return null;
  
  const words = text.split(/\s+/);
  const categoryScores = {};
  
  // Initialize scores for all categories
  EXPENSE_CATEGORIES.forEach(category => {
    categoryScores[category] = 0;
  });
  
  // Calculate scores based on word frequency in each category
  for (const data of trainingData) {
    const category = data.category;
    const description = data.description;
    
    for (const word of words) {
      if (word.length > 2 && description.includes(word)) {
        categoryScores[category] = (categoryScores[category] || 0) + 1;
      }
    }
  }
  
  // Find category with highest score
  let bestCategory = null;
  let maxScore = 0;
  
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }
  
  return maxScore > 0 ? bestCategory : null;
};

/**
 * Train the categorization model with user corrections
 * @param {string} description - Expense description
 * @param {string} userCategory - User-corrected category
 * @returns {Promise<void>}
 */
export const trainCategorization = async (description, userCategory) => {
  try {
    await addCategorizationData(description, userCategory);
  } catch (error) {
    console.error('Failed to save categorization training data:', error);
  }
};

/**
 * Generate spending insights based on expense data
 * @param {Array} expenses - Array of expenses
 * @returns {Object} Insights object
 */
export const generateSpendingInsights = (expenses) => {
  if (!expenses || expenses.length === 0) {
    return {
      totalSpent: 0,
      topCategory: 'None',
      averagePerDay: 0,
      insights: ['No expenses recorded yet.'],
      tips: ['Start logging your expenses to get personalized insights!']
    };
  }
  
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Category breakdown
  const categoryTotals = {};
  expenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });
  
  const topCategory = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
  
  // Daily average
  const dates = [...new Set(expenses.map(e => e.date))];
  const averagePerDay = totalSpent / Math.max(dates.length, 1);
  
  // Generate insights
  const insights = [];
  const tips = [];
  
  // Top spending category insight
  if (topCategory !== 'None') {
    const categoryPercent = Math.round((categoryTotals[topCategory] / totalSpent) * 100);
    insights.push(`Your highest spending category is ${topCategory} (${categoryPercent}% of total).`);
  }
  
  // Daily spending pattern
  if (averagePerDay > 1000) {
    insights.push(`You spend an average of ₹${Math.round(averagePerDay)} per day.`);
    tips.push('Consider setting a daily spending limit to better control your expenses.');
  }
  
  // Category-specific tips
  if (categoryTotals['Food & Dining'] > totalSpent * 0.3) {
    tips.push('Food & Dining takes up a large portion of your budget. Try cooking at home more often.');
  }
  
  if (categoryTotals['Entertainment'] > totalSpent * 0.2) {
    tips.push('Consider reducing entertainment expenses by finding free or low-cost activities.');
  }
  
  if (categoryTotals['Transportation'] > totalSpent * 0.25) {
    tips.push('Look into public transportation or carpooling to reduce transportation costs.');
  }
  
  return {
    totalSpent,
    topCategory,
    averagePerDay,
    insights,
    tips,
    categoryTotals
  };
};

/**
 * Generate weekly summary with AI insights
 * @param {Array} weekExpenses - Expenses for the week
 * @param {Array} previousWeekExpenses - Expenses for previous week (for comparison)
 * @returns {Object} Weekly summary
 */
export const generateWeeklySummary = (weekExpenses, previousWeekExpenses = []) => {
  const currentTotal = weekExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const previousTotal = previousWeekExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const percentageChange = previousTotal > 0 
    ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100)
    : 0;
  
  const insights = generateSpendingInsights(weekExpenses);
  
  return {
    currentWeekTotal: currentTotal,
    previousWeekTotal: previousTotal,
    percentageChange,
    trend: percentageChange > 0 ? 'increased' : percentageChange < 0 ? 'decreased' : 'stable',
    ...insights
  };
};
