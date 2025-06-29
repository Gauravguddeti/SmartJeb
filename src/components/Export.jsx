import React, { useState } from 'react';
import { Download, Upload, FileText, Calendar, BarChart3, Share2, Smartphone } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/formatters';
import { format } from 'date-fns';

/**
 * Export Component - Export and share expense data
 */
const Export = () => {
  const { expenses } = useExpenses();
  const [exportType, setExportType] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const generateCSV = (data) => {
    const headers = ['Date', 'Description', 'Category', 'Amount (₹)', 'Note'];
    const csvContent = [
      headers.join(','),
      ...data.map(expense => [
        expense.date,
        `"${expense.description}"`,
        expense.category,
        expense.amount,
        `"${expense.note || ''}"`
      ].join(','))
    ].join('\\n');
    
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
          filename = `pennylog-expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
          type = 'text/csv';
          break;
        case 'json':
          content = generateJSON(filteredData);
          filename = `pennylog-expenses-${format(new Date(), 'yyyy-MM-dd')}.json`;
          type = 'application/json';
          break;
        case 'summary':
          content = generateSummaryReport(filteredData);
          filename = `pennylog-summary-${format(new Date(), 'yyyy-MM-dd')}.json`;
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
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          console.log('Imported data:', data);
          // Here you would integrate with your expense context to import data
        } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          // Basic CSV parsing
          const lines = content.split('\\n');
          const headers = lines[0].split(',');
          const data = lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, index) => {
              obj[header.toLowerCase()] = values[index];
              return obj;
            }, {});
          });
          console.log('Imported CSV data:', data);
        }
      } catch (error) {
        console.error('Import failed:', error);
      }
    };
    
    reader.readAsText(file);
  };

  const generateShareableLink = () => {
    const filteredData = getFilteredExpenses();
    const summary = {
      total: filteredData.reduce((sum, exp) => sum + exp.amount, 0),
      count: filteredData.length,
      period: dateRange
    };
    
    // Create a simple summary text for sharing
    const shareText = `💰 My PennyLog Summary\\n\\n` +
      `📅 Period: ${dateRange}\\n` +
      `💸 Total Expenses: ${formatCurrency(summary.total)}\\n` +
      `📊 Number of Transactions: ${summary.count}\\n\\n` +
      `Track your expenses with PennyLog! 🚀`;

    if (navigator.share) {
      navigator.share({
        title: 'My PennyLog Summary',
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
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
          Export & Share
        </h2>
        <p className="text-gray-600 font-medium mt-1">Export your expense data and share insights</p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-primary-50 to-indigo-100 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">{filteredExpenses.length}</div>
            <div className="text-sm text-gray-600 font-medium">Total Expenses</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">{formatCurrency(totalAmount)}</div>
            <div className="text-sm text-gray-600 font-medium">Total Amount</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">
              {filteredExpenses.length > 0 ? formatCurrency(totalAmount / filteredExpenses.length) : '₹0'}
            </div>
            <div className="text-sm text-gray-600 font-medium">Average Expense</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-green-100 to-green-200 p-2 rounded-xl">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Export Data</h3>
          </div>

          <div className="space-y-4">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <div className="space-y-2">
                <label className="flex items-center p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="radio"
                    value="csv"
                    checked={exportType === 'csv'}
                    onChange={(e) => setExportType(e.target.value)}
                    className="mr-3"
                  />
                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium">CSV File</span>
                  <span className="ml-auto text-xs text-gray-500">For Excel/Sheets</span>
                </label>
                
                <label className="flex items-center p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="radio"
                    value="json"
                    checked={exportType === 'json'}
                    onChange={(e) => setExportType(e.target.value)}
                    className="mr-3"
                  />
                  <BarChart3 className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium">JSON Data</span>
                  <span className="ml-auto text-xs text-gray-500">Raw data</span>
                </label>
                
                <label className="flex items-center p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="radio"
                    value="summary"
                    checked={exportType === 'summary'}
                    onChange={(e) => setExportType(e.target.value)}
                    className="mr-3"
                  />
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="font-medium">Summary Report</span>
                  <span className="ml-auto text-xs text-gray-500">With analytics</span>
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2 rounded-xl">
                <Share2 className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Share Summary</h3>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">Share your expense summary on social media or with friends.</p>
              
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-2 rounded-xl">
                <Upload className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Import Data</h3>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">Import expense data from CSV or JSON files.</p>
              
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
              
              <p className="text-xs text-gray-500">Supported formats: CSV, JSON</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Export;
