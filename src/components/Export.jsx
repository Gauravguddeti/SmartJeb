import React, { useState } from 'react';
import { Download, Upload, FileText, Calendar, BarChart3, Share2, Smartphone } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import toast from 'react-hot-toast';
import MonthPicker from './MonthPicker';

/**
 * Export Component - Export and share expense data
 */
const Export = () => {
  const { expenses, addExpense } = useExpenses();
  const { isGuest } = useAuth();
  const [exportType, setExportType] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [customMonth, setCustomMonth] = useState(null);

  const generateCSV = (data) => {
    const headers = ['Date', 'Description', 'Category', 'Amount (₹)', 'Note', 'Receipt'];
    const csvContent = [
      headers.join(','),
      ...data.map(expense => [
        expense.date,
        `"${expense.description}"`,
        expense.category,
        expense.amount,
        `"${expense.note || ''}"`,
        expense.receiptUrl || expense.receipt || ''
      ].join(','))
    ].join('\n');
    
    return csvContent;
  };

  const generateJSON = (data) => {
    return JSON.stringify(data, null, 2);
  };

  const generateSummaryReport = (data) => {
    const total = data.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryTotals = data.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const report = {
      summary: {
        totalExpenses: data.length,
        totalAmount: total,
        averageExpense: data.length > 0 ? total / data.length : 0,
        dateRange: dateRange
      },
      categoryBreakdown: categoryTotals,
      expenses: data
    };

    return JSON.stringify(report, null, 2);
  };

  const getFilteredExpenses = () => {
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        return expenses.filter(exp => exp.date === format(now, 'yyyy-MM-dd'));
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return expenses.filter(exp => new Date(exp.date) >= weekAgo);
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return expenses.filter(exp => new Date(exp.date) >= monthAgo);
      case 'custom-month':
        if (customMonth) {
          const monthDate = new Date(customMonth);
          const monthStart = startOfMonth(monthDate);
          const monthEnd = endOfMonth(monthDate);
          return expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate >= monthStart && expDate <= monthEnd;
          });
        }
        return expenses;
      default:
        return expenses;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const filteredData = getFilteredExpenses();
      let content, filename, type;

      switch (exportType) {
        case 'csv':
          content = generateCSV(filteredData);
          filename = `smartjeb-expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
          type = 'text/csv';
          break;
        case 'json':
          content = generateJSON(filteredData);
          filename = `smartjeb-expenses-${format(new Date(), 'yyyy-MM-dd')}.json`;
          type = 'application/json';
          break;
        case 'summary':
          content = generateSummaryReport(filteredData);
          filename = `smartjeb-summary-${format(new Date(), 'yyyy-MM-dd')}.json`;
          type = 'application/json';
          break;
        default:
          throw new Error('Invalid export type');
      }

      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show success message with helpful info for guest users
      const hasReceipts = filteredData.some(exp => exp.receiptUrl || exp.receipt);
      if (isGuest) {
        toast.success(`📁 Exported ${filteredData.length} expenses${hasReceipts ? ' with receipts' : ''}! You can import this file after signing up.`);
      } else {
        toast.success(`📁 Exported ${filteredData.length} expenses successfully!`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target.result;
        
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          await importExpensesData(data);
        } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          // Enhanced CSV parsing - handle different line endings and escape sequences
          let processedContent = content
            .replace(/\\n/g, '\n')  // Convert escaped newlines to actual newlines
            .replace(/\r\n/g, '\n') // Normalize Windows line endings
            .replace(/\r/g, '\n');  // Normalize Mac line endings
            
          const lines = processedContent.split('\n').filter(line => line.trim());
          console.log('Total lines found:', lines.length, 'Content preview:', processedContent.substring(0, 200));
          
          if (lines.length < 2) {
            console.error('CSV parsing failed. Lines:', lines);
            toast.error(`CSV file appears empty or invalid. Found ${lines.length} lines. Please check the file format.`);
            return;
          }
          
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          console.log('CSV Headers:', headers);
          console.log('Sample data line:', lines[1]);
          
          const expenses = [];
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            console.log(`Processing line ${i}:`, line);
            
            // Enhanced CSV parsing using regex for better quoted field handling
            const csvRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
            const values = line.split(csvRegex).map(value => {
              // Remove surrounding quotes and unescape internal quotes
              return value.trim().replace(/^"(.*)"$/, '$1').replace(/""/g, '"');
            });
            
            console.log(`Parsed values for line ${i}:`, values);
            
            if (values.length < headers.length) {
              console.warn(`Line ${i + 1} has ${values.length} values but expected ${headers.length}`);
              continue;
            }
            
            // Map CSV data to expense format
            const expense = {};
            headers.forEach((header, index) => {
              const value = values[index] || '';
              
              switch (header.toLowerCase().trim()) {
                case 'date':
                  expense.date = value;
                  break;
                case 'description':
                  expense.description = value;
                  break;
                case 'category':
                  expense.category = value;
                  break;
                case 'amount (₹)':
                case 'amount':
                  expense.amount = parseFloat(value.replace(/[₹,]/g, '')) || 0;
                  break;
                case 'note':
                case 'notes':
                  expense.note = value;
                  break;
                default:
                  expense[header.toLowerCase().replace(/[^a-z0-9]/g, '_')] = value;
              }
            });
            
            // Validate required fields
            if (expense.description && expense.amount > 0 && expense.date && expense.category) {
              expenses.push({
                id: `imported-${Date.now()}-${i}`,
                description: expense.description,
                amount: expense.amount,
                category: expense.category,
                date: expense.date,
                note: expense.note || '',
                paymentMethod: 'cash',
                createdAt: new Date().toISOString()
              });
            } else {
              console.warn(`Skipping invalid expense on line ${i + 1}:`, expense);
            }
          }
          
          console.log(`Parsed ${expenses.length} valid expenses from CSV`);
          
          if (expenses.length > 0) {
            await importExpensesData(expenses);
          } else {
            alert('No valid expenses found in CSV file. Please check the format and required fields (Date, Description, Category, Amount).');
          }
        }
      } catch (error) {
        console.error('Import failed:', error);
        alert('Failed to import file. Please check the format and try again.');
      }
      
      // Clear the file input so the same file can be imported again
      event.target.value = '';
    };
    
    reader.readAsText(file);
  };

  const importExpensesData = async (expensesData) => {
    try {
      let importedCount = 0;
      
      for (const expenseData of expensesData) {
        try {
          await addExpense(expenseData);
          importedCount++;
        } catch (error) {
          console.error('Error importing expense:', error);
        }
      }
      
      if (importedCount > 0) {
        alert(`Successfully imported ${importedCount} expenses!`);
      } else {
        alert('No expenses were imported. Please check the file format.');
      }
    } catch (error) {
      console.error('Import process failed:', error);
      alert('Import failed. Please try again.');
    }
  };

  const generateShareableLink = () => {
    const filteredData = getFilteredExpenses();
    const summary = {
      total: filteredData.reduce((sum, exp) => sum + exp.amount, 0),
      count: filteredData.length,
      period: dateRange
    };
    
    // Create a simple summary text for sharing
    const shareText = `💰 My SmartJeb Summary\\n\\n` +
      `📅 Period: ${dateRange}\\n` +
      `💸 Total Expenses: ${formatCurrency(summary.total)}\\n` +
      `📊 Number of Transactions: ${summary.count}\\n\\n` +
      `Track your expenses with SmartJeb! 🚀`;

    if (navigator.share) {
      navigator.share({
        title: 'My SmartJeb Summary',
        text: shareText,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Summary copied to clipboard!');
    }
  };

  const filteredExpenses = getFilteredExpenses();
  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="animate-slide-up">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 dark:from-gray-100 to-primary-600 bg-clip-text text-transparent">
          Export & Share
        </h2>
        <p className="text-gray-600 dark:text-gray-300 font-medium mt-1">Export your expense data and share insights</p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-primary-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">{filteredExpenses.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total Expenses</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">{formatCurrency(totalAmount)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total Amount</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {filteredExpenses.length > 0 ? formatCurrency(totalAmount / filteredExpenses.length) : '₹0'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Average Expense</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Section */}
        <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 p-2 rounded-xl">
              <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Export Data</h3>
          </div>

          <div className="space-y-4">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {dateRange === 'custom-month' && customMonth
                  ? `Time Period: ${format(new Date(customMonth), 'MMMM yyyy')}`
                  : 'Time Period'
                }
              </label>
              <div className="flex gap-2">
                <select
                  value={dateRange === 'custom-month' && customMonth ? 'custom-month' : dateRange}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'custom-month') {
                      setShowMonthPicker(true);
                    } else {
                      setDateRange(value);
                      setCustomMonth(null);
                    }
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="custom-month">
                    {customMonth ? format(new Date(customMonth), 'MMMM yyyy') : 'Custom Month...'}
                  </option>
                </select>
                {dateRange === 'custom-month' && customMonth && (
                  <button
                    onClick={() => setShowMonthPicker(true)}
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                    title="Change month"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Export Format</label>
              <div className="space-y-2">
                <label className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <input
                    type="radio"
                    value="csv"
                    checked={exportType === 'csv'}
                    onChange={(e) => setExportType(e.target.value)}
                    className="mr-3"
                  />
                  <FileText className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">CSV File</span>
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">For Excel/Sheets</span>
                </label>
                
                <label className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <input
                    type="radio"
                    value="json"
                    checked={exportType === 'json'}
                    onChange={(e) => setExportType(e.target.value)}
                    className="mr-3"
                  />
                  <BarChart3 className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">JSON Data</span>
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">Raw data</span>
                </label>
                
                <label className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <input
                    type="radio"
                    value="summary"
                    checked={exportType === 'summary'}
                    onChange={(e) => setExportType(e.target.value)}
                    className="mr-3"
                  />
                  <Calendar className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">Summary Report</span>
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">With analytics</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting || filteredExpenses.length === 0}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export ({filteredExpenses.length} expenses)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share & Import Section */}
        <div className="space-y-6">
          {/* Share Section */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 p-2 rounded-xl">
                <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Share Summary</h3>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">Share your expense summary on social media or with friends.</p>
              
              <button
                onClick={generateShareableLink}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                Share Summary
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-700 p-2 rounded-xl">
                <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Import Data</h3>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">Import expense data from CSV or JSON files.</p>
              
              <label className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Choose File to Import
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">Supported formats: CSV, JSON</p>
            </div>
          </div>
        </div>
      </div>

      {/* Month Picker Modal */}
      <MonthPicker
        isOpen={showMonthPicker}
        onClose={() => setShowMonthPicker(false)}
        onSelectMonth={(monthDate) => {
          setCustomMonth(monthDate);
          setDateRange('custom-month');
        }}
        selectedMonth={customMonth}
      />
    </div>
  );
};

export default Export;
