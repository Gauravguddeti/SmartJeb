import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const GoalsContext = createContext();

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};

export const GoalsProvider = ({ children }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load goals from localStorage on mount
  useEffect(() => {
    const loadGoals = () => {
      try {
        const savedGoals = localStorage.getItem('smartjeb-goals');
        if (savedGoals) {
          const goalsData = JSON.parse(savedGoals);
          setGoals(goalsData);
        }
      } catch (error) {
        console.error('Error loading goals:', error);
        toast.error('Failed to load goals');
      }
    };

    loadGoals();
  }, []);

  // Helper function to save goals to localStorage
  const saveToStorage = (goalsData) => {
    try {
      localStorage.setItem('smartjeb-goals', JSON.stringify(goalsData));
    } catch (error) {
      console.error('Error saving goals to localStorage:', error);
      toast.error('Failed to save goals');
    }
  };

  // Add new goal
  const addGoal = async (goalData) => {
    try {
      setLoading(true);

      const goal = {
        ...goalData,
        id: Date.now().toString(), // Simple ID generation
        progress: 0,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newGoals = [goal, ...goals];
      setGoals(newGoals);
      saveToStorage(newGoals);
      
      toast.success('Goal added successfully!');
      return goal;
    } catch (error) {
      console.error('Error adding goal:', error);
      toast.error('Failed to add goal');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update goal
  const updateGoal = async (id, updates) => {
    try {
      setLoading(true);

      const updatedData = {
        ...updates,
        updatedAt: new Date()
      };

      const updatedGoals = goals.map(goal => 
        goal.id === id ? { ...goal, ...updatedData } : goal
      );

      setGoals(updatedGoals);
      saveToStorage(updatedGoals);
      
      toast.success('Goal updated successfully!');
    } catch (error) {
      console.error('Error updating goal:', error);
      toast.error('Failed to update goal');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete goal
  const deleteGoal = async (id) => {
    try {
      setLoading(true);

      const updatedGoals = goals.filter(goal => goal.id !== id);
      setGoals(updatedGoals);
      saveToStorage(updatedGoals);
      
      toast.success('Goal deleted successfully!');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update goal progress
  const updateGoalProgress = async (id, progress) => {
    const completed = progress >= 100;
    await updateGoal(id, { progress, completed });
    
    if (completed) {
      toast.success('🎉 Congratulations! Goal completed!');
    }
  };

  const value = {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    updateGoalProgress
  };

  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
};

export default GoalsContext;
