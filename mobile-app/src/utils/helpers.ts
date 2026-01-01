/**
 * Helper utility functions
 */

/**
 * Generate a unique UUID
 * @returns string - A unique ID
 */
export const uuid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Format a date as a string
 * @param date - Date to format
 * @param format - Format string (default: 'YYYY-MM-DD')
 * @returns string - Formatted date
 */
export const formatDate = (date: Date, format: string = 'YYYY-MM-DD'): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day);
};

/**
 * Format currency value
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'INR')
 * @returns string - Formatted currency
 */
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
};

/**
 * Get start and end timestamps for a day
 * @param date - The date
 * @returns Array with start and end timestamps for the day
 */
export const getDayTimestamps = (date: Date): [number, number] => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  return [startDate.getTime(), endDate.getTime()];
};

/**
 * Get start and end timestamps for a week
 * @param date - Any date in the week
 * @returns Array with start and end timestamps for the week
 */
export const getWeekTimestamps = (date: Date): [number, number] => {
  const currentDay = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const startDay = new Date(date);
  startDay.setDate(date.getDate() - currentDay);
  startDay.setHours(0, 0, 0, 0);
  
  const endDay = new Date(date);
  endDay.setDate(date.getDate() + (6 - currentDay));
  endDay.setHours(23, 59, 59, 999);
  
  return [startDay.getTime(), endDay.getTime()];
};

/**
 * Get start and end timestamps for a month
 * @param year - The year
 * @param month - The month (0-11)
 * @returns Array with start and end timestamps for the month
 */
export const getMonthTimestamps = (year: number, month: number): [number, number] => {
  const startDate = new Date(year, month, 1);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(year, month + 1, 0); // Last day of month
  endDate.setHours(23, 59, 59, 999);
  
  return [startDate.getTime(), endDate.getTime()];
};

/**
 * Group array items by a key function
 * @param array - Array to group
 * @param keyFn - Function to generate group key for each item
 * @returns Object with keys as groups and values as array items
 */
export const groupBy = <T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> => {
  return array.reduce((result: Record<string, T[]>, item: T) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});
};

/**
 * Format a timestamp as a readable date
 * @param timestamp - Unix timestamp
 * @returns string - Readable date
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Get the start and end timestamps for a day
 * @param date - Date object
 * @returns object - Start and end timestamps
 */
export const getDayTimestamps = (date: Date): { start: number; end: number } => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return {
    start: startOfDay.getTime(),
    end: endOfDay.getTime(),
  };
};

/**
 * Get the start and end timestamps for a week
 * @param date - Date object
 * @returns object - Start and end timestamps
 */
export const getWeekTimestamps = (date: Date): { start: number; end: number } => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return {
    start: startOfWeek.getTime(),
    end: endOfWeek.getTime(),
  };
};

/**
 * Get the start and end timestamps for a month
 * @param year - Year
 * @param month - Month (0-11)
 * @returns object - Start and end timestamps
 */
export const getMonthTimestamps = (
  year: number,
  month: number
): { start: number; end: number } => {
  const startOfMonth = new Date(year, month, 1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const endOfMonth = new Date(year, month + 1, 0); // Day 0 of next month = last day of current month
  endOfMonth.setHours(23, 59, 59, 999);
  
  return {
    start: startOfMonth.getTime(),
    end: endOfMonth.getTime(),
  };
};

/**
 * Calculate percentage change between two values
 * @param oldValue - Previous value
 * @param newValue - Current value
 * @returns number - Percentage change
 */
export const calculatePercentageChange = (
  oldValue: number,
  newValue: number
): number => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns string - Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
};

/**
 * Group an array by a key
 * @param array - Array to group
 * @param key - Key to group by
 * @returns Record - Grouped object
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    result[groupKey] = result[groupKey] || [];
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

export default {
  uuid,
  formatDate,
  formatCurrency,
  formatTimestamp,
  getDayTimestamps,
  getWeekTimestamps,
  getMonthTimestamps,
  calculatePercentageChange,
  truncateText,
  groupBy
};
