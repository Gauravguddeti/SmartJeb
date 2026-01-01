/**
 * Category data structure and utilities
 */

// Category types for the app
export type CategoryType = 
  | 'food'
  | 'transport'
  | 'shopping'
  | 'housing'
  | 'utilities'
  | 'healthcare'
  | 'entertainment'
  | 'education'
  | 'personal'
  | 'others';

// Category interface
export interface Category {
  id: CategoryType;
  name: string;
  icon: string;
  color: string;
  keywords: string[]; // Keywords for automatic categorization
}

// Categories configuration with icons and keywords for NLP matching
export const CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    icon: 'fast-food-outline',
    color: '#FF5722',
    keywords: [
      'restaurant', 'food', 'meal', 'lunch', 'dinner', 'breakfast', 'cafe', 
      'pizza', 'burger', 'zomato', 'swiggy', 'doordash', 'uber eats', 'grubhub',
      'restaurant', 'dine', 'eat', 'grocery', 'takeout', 'delivery'
    ]
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: 'car-outline',
    color: '#4CAF50',
    keywords: [
      'uber', 'ola', 'lyft', 'taxi', 'cab', 'auto', 'transport', 'bus', 'train', 
      'metro', 'subway', 'fuel', 'petrol', 'gas', 'diesel', 'parking', 'toll',
      'ticket', 'fare', 'travel', 'ride', 'commute', 'transit', 'transport'
    ]
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'cart-outline',
    color: '#2196F3',
    keywords: [
      'amazon', 'flipkart', 'walmart', 'target', 'shop', 'mall', 'store', 'buy',
      'purchase', 'myntra', 'ajio', 'retail', 'clothing', 'apparel', 'fashion',
      'electronics', 'gadget', 'device', 'merchandise', 'product'
    ]
  },
  {
    id: 'housing',
    name: 'Housing',
    icon: 'home-outline',
    color: '#9C27B0',
    keywords: [
      'rent', 'mortgage', 'housing', 'apartment', 'flat', 'house', 'accommodation',
      'property', 'lease', 'tenant', 'landlord', 'real estate', 'broker', 'deposit'
    ]
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: 'flash-outline',
    color: '#FF9800',
    keywords: [
      'electricity', 'water', 'gas', 'internet', 'wifi', 'broadband', 'phone', 
      'mobile', 'bill', 'utility', 'service', 'postpaid', 'prepaid', 'recharge',
      'dth', 'cable', 'tv', 'connection'
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: 'medical-outline',
    color: '#795548',
    keywords: [
      'doctor', 'hospital', 'medicine', 'pharmacy', 'medical', 'health', 'clinic',
      'healthcare', 'insurance', 'dental', 'prescription', 'therapy', 'treatment',
      'consultation', 'diagnostic', 'test', 'checkup'
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'film-outline',
    color: '#F44336',
    keywords: [
      'movie', 'theatre', 'cinema', 'concert', 'show', 'event', 'netflix', 'amazon prime',
      'hotstar', 'disney+', 'subscription', 'streaming', 'entertainment', 'ticket',
      'game', 'gaming', 'music', 'spotify', 'apple music'
    ]
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'school-outline',
    color: '#3F51B5',
    keywords: [
      'school', 'college', 'university', 'course', 'class', 'tuition', 'fee', 'book',
      'stationery', 'education', 'learning', 'training', 'workshop', 'seminar',
      'certificate', 'degree', 'diploma', 'tutorial'
    ]
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: 'person-outline',
    color: '#607D8B',
    keywords: [
      'personal', 'gift', 'donation', 'charity', 'subscription', 'membership',
      'salon', 'spa', 'haircut', 'gym', 'fitness', 'beauty', 'grooming', 'care',
      'selfcare', 'wellness'
    ]
  },
  {
    id: 'others',
    name: 'Others',
    icon: 'ellipsis-horizontal-outline',
    color: '#9E9E9E',
    keywords: [
      'other', 'miscellaneous', 'misc', 'unknown'
    ]
  }
];

// Get category by ID
export const getCategoryById = (id: CategoryType): Category => {
  return CATEGORIES.find(category => category.id === id) || CATEGORIES[CATEGORIES.length - 1];
};

// Get all category names
export const getCategoryNames = (): string[] => {
  return CATEGORIES.map(category => category.name);
};

export default CATEGORIES;
