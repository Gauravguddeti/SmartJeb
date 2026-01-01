import React, { useState, useEffect } from 'react';
import { Trophy, Star, Target, Zap, Gift, Award, Medal, Crown } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import toast from 'react-hot-toast';

/**
 * Achievement System - Gamify expense tracking with achievements
 */
const Achievements = () => {
  const { expenses } = useExpenses();
  const [achievements, setAchievements] = useState([]);
  const [unlockedToday, setUnlockedToday] = useState([]);

  const achievementList = [
    {
      id: 'first_expense',
      title: 'Getting Started',
      description: 'Log your first expense',
      icon: Star,
      color: 'yellow',
      condition: () => expenses.length >= 1
    },
    {
      id: 'week_tracker',
      title: 'Weekly Warrior',
      description: 'Track expenses for 7 consecutive days',
      icon: Target,
      color: 'blue',
      condition: () => {
        const last7Days = [...Array(7)].map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        });
        return last7Days.every(date => 
          expenses.some(expense => expense.date === date)
        );
      }
    },
    {
      id: 'big_spender',
      title: 'Big Spender',
      description: 'Log an expense over ₹5,000',
      icon: Crown,
      color: 'purple',
      condition: () => expenses.some(expense => expense.amount > 5000)
    },
    {
      id: 'penny_pincher',
      title: 'Penny Pincher',
      description: 'Log an expense under ₹10',
      icon: Gift,
      color: 'green',
      condition: () => expenses.some(expense => expense.amount < 10)
    },
    {
      id: 'categorizer',
      title: 'Organized Spender',
      description: 'Use 5 different categories',
      icon: Award,
      color: 'indigo',
      condition: () => {
        const categories = new Set(expenses.map(expense => expense.category));
        return categories.size >= 5;
      }
    },
    {
      id: 'centurion',
      title: 'Centurion',
      description: 'Log 100 expenses',
      icon: Medal,
      color: 'red',
      condition: () => expenses.length >= 100
    },
    {
      id: 'speed_tracker',
      title: 'Speed Tracker',
      description: 'Log 10 expenses in one day',
      icon: Zap,
      color: 'orange',
      condition: () => {
        const today = new Date().toISOString().split('T')[0];
        const todayExpenses = expenses.filter(expense => expense.date === today);
        return todayExpenses.length >= 10;
      }
    },
    {
      id: 'monthly_master',
      title: 'Monthly Master',
      description: 'Track expenses for a full month',
      icon: Trophy,
      color: 'gold',
      condition: () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const last30Days = [...Array(30)].map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        });
        return last30Days.every(date => 
          expenses.some(expense => expense.date === date)
        );
      }
    }
  ];

  // Check achievements
  useEffect(() => {
    const savedAchievements = JSON.parse(localStorage.getItem('smartjeb-achievements') || '[]');
    const newlyUnlocked = [];

    achievementList.forEach(achievement => {
      const alreadyUnlocked = savedAchievements.includes(achievement.id);
      const isUnlocked = achievement.condition();

      if (isUnlocked && !alreadyUnlocked) {
        newlyUnlocked.push(achievement);
        savedAchievements.push(achievement.id);
        
        // Show achievement toast
        toast.success(
          `🎉 Achievement Unlocked: ${achievement.title}!`,
          {
            duration: 5000,
            style: {
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
              fontWeight: 'bold'
            }
          }
        );
      }
    });

    if (newlyUnlocked.length > 0) {
      setUnlockedToday(prev => [...prev, ...newlyUnlocked]);
      localStorage.setItem('smartjeb-achievements', JSON.stringify(savedAchievements));
    }

    setAchievements(savedAchievements);
  }, [expenses]);

  const getColorClasses = (color) => {
    switch (color) {
      case 'yellow':
        return 'from-yellow-400 to-yellow-500 text-yellow-900';
      case 'blue':
        return 'from-blue-400 to-blue-500 text-blue-900';
      case 'purple':
        return 'from-purple-400 to-purple-500 text-purple-900';
      case 'green':
        return 'from-green-400 to-green-500 text-green-900';
      case 'indigo':
        return 'from-indigo-400 to-indigo-500 text-indigo-900';
      case 'red':
        return 'from-red-400 to-red-500 text-red-900';
      case 'orange':
        return 'from-orange-400 to-orange-500 text-orange-900';
      case 'gold':
        return 'from-yellow-300 to-yellow-400 text-yellow-900';
      default:
        return 'from-gray-400 to-gray-500 text-gray-900';
    }
  };

  const unlockedCount = achievements.length;
  const totalCount = achievementList.length;
  const progressPercent = (unlockedCount / totalCount) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent mb-2">
          Achievements
        </h2>
        <p className="text-gray-600">
          {unlockedCount} of {totalCount} achievements unlocked
        </p>
        
        {/* Progress Bar */}
        <div className="mt-4 max-w-md mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{progressPercent.toFixed(0)}% Complete</p>
        </div>
      </div>

      {/* Newly Unlocked Today */}
      {unlockedToday.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>🎉 Newly Unlocked Today!</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unlockedToday.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-green-200 animate-bounce-gentle"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${getColorClasses(achievement.color)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{achievement.title}</div>
                      <div className="text-sm text-gray-600">{achievement.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievementList.map((achievement) => {
          const Icon = achievement.icon;
          const isUnlocked = achievements.includes(achievement.id);
          const colorClasses = getColorClasses(achievement.color);
          
          return (
            <div
              key={achievement.id}
              className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                isUnlocked
                  ? 'bg-white shadow-lg border-gray-200 hover:shadow-xl'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl transition-all duration-300 ${
                  isUnlocked
                    ? `bg-gradient-to-br ${colorClasses} shadow-lg animate-glow`
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className={`font-semibold ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                      {achievement.title}
                    </h3>
                    {isUnlocked && (
                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Unlocked
                      </div>
                    )}
                  </div>
                  <p className={`text-sm ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational Message */}
      <div className="text-center bg-gradient-to-r from-primary-50 to-indigo-50 p-6 rounded-2xl border border-primary-200">
        <h3 className="text-lg font-semibold text-primary-800 mb-2">Keep Going! 🚀</h3>
        <p className="text-primary-700">
          {unlockedCount === 0 ? (
            "Start tracking your expenses to unlock your first achievement!"
          ) : unlockedCount < totalCount / 2 ? (
            "You're off to a great start! Keep tracking to unlock more achievements."
          ) : unlockedCount < totalCount ? (
            "Excellent progress! You're almost there - just a few more to go!"
          ) : (
            "🎊 Congratulations! You've unlocked all achievements! You're a SmartJeb master!"
          )}
        </p>
      </div>
    </div>
  );
};

export default Achievements;
