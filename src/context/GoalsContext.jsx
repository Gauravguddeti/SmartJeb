import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
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
  const { user } = useAuth();

  // Load user goals on auth state change
  useEffect(() => {
    if (!user) {
      setGoals([]);
      return;
    }

    setLoading(true);

    // Set up real-time listener for user's goals
    const goalsQuery = query(
      collection(db, 'goals'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      goalsQuery,
      (snapshot) => {
        const userGoals = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGoals(userGoals);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching goals:', error);
        toast.error('Failed to load goals');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Add new goal
  const addGoal = async (goalData) => {
    if (!user) {
      toast.error('You must be logged in to add goals');
      return;
    }

    try {
      setLoading(true);

      const goal = {
        ...goalData,
        userId: user.uid,
        progress: 0,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'goals'), goal);
      
      toast.success('Goal added successfully!');
      return { id: docRef.id, ...goal };
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
    if (!user) {
      toast.error('You must be logged in to update goals');
      return;
    }

    try {
      setLoading(true);

      const goalRef = doc(db, 'goals', id);
      const updatedData = {
        ...updates,
        updatedAt: new Date()
      };

      await updateDoc(goalRef, updatedData);
      
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
    if (!user) {
      toast.error('You must be logged in to delete goals');
      return;
    }

    try {
      setLoading(true);

      await deleteDoc(doc(db, 'goals', id));
      
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
