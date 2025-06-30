import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase, TABLES, isSupabaseConfigured } from '../lib/supabase';
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
  const { user, isGuest } = useAuth();

  // Supabase operations
  const loadGoalsFromSupabase = async () => {
    if (!user || !isSupabaseConfigured || !supabase) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(TABLES.GOALS)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals from Supabase:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const saveGoalToSupabase = async (goal) => {
    if (!user || !isSupabaseConfigured || !supabase) return;
    
    try {
      const goalData = {
        ...goal,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(TABLES.GOALS)
        .insert([goalData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving goal to Supabase:', error);
      throw error;
    }
  };

  const updateGoalInSupabase = async (id, updates) => {
    if (!user || !isSupabaseConfigured || !supabase) return;
    
    try {
      const { data, error } = await supabase
        .from(TABLES.GOALS)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating goal in Supabase:', error);
      throw error;
    }
  };

  const deleteGoalFromSupabase = async (id) => {
    if (!user || !isSupabaseConfigured || !supabase) return;
    
    try {
      const { error } = await supabase
        .from(TABLES.GOALS)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting goal from Supabase:', error);
      throw error;
    }
  };

  // Load goals based on auth state
  useEffect(() => {
    const loadGoals = () => {
      if (user && !isGuest && isSupabaseConfigured) {
        // Load from Supabase for authenticated users
        loadGoalsFromSupabase();
      } else {
        // Load from localStorage for guests or when Supabase not configured
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
      }
    };

    loadGoals();
  }, [user, isGuest]);

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
        id: user && !isGuest ? undefined : Date.now().toString(), // Let Supabase generate ID for authenticated users
        progress: 0,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (user && !isGuest && isSupabaseConfigured) {
        // Save to Supabase for authenticated users
        const savedGoal = await saveGoalToSupabase(goal);
        setGoals([savedGoal, ...goals]);
      } else {
        // Save to localStorage for guests or when Supabase not configured
        goal.id = Date.now().toString();
        const newGoals = [goal, ...goals];
        setGoals(newGoals);
        saveToStorage(newGoals);
      }
      
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

      if (user && !isGuest && isSupabaseConfigured) {
        // Update in Supabase for authenticated users
        const updatedGoal = await updateGoalInSupabase(id, updatedData);
        const updatedGoals = goals.map(goal => 
          goal.id === id ? updatedGoal : goal
        );
        setGoals(updatedGoals);
      } else {
        // Update in localStorage for guests or when Supabase not configured
        const updatedGoals = goals.map(goal => 
          goal.id === id ? { ...goal, ...updatedData } : goal
        );
        setGoals(updatedGoals);
        saveToStorage(updatedGoals);
      }
      
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

      if (user && !isGuest && isSupabaseConfigured) {
        // Delete from Supabase for authenticated users
        await deleteGoalFromSupabase(id);
        const updatedGoals = goals.filter(goal => goal.id !== id);
        setGoals(updatedGoals);
      } else {
        // Delete from localStorage for guests or when Supabase not configured
        const updatedGoals = goals.filter(goal => goal.id !== id);
        setGoals(updatedGoals);
        saveToStorage(updatedGoals);
      }
      
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
