import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const WorkoutContext = createContext();

export function WorkoutProvider({ children }) {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'workouts'),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const workouts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setHistory(workouts);
    });

    return unsubscribe;
  }, [user]);

  const addWorkout = useCallback(
    async (workout) => {
      if (!user) return;
      const { id, ...data } = workout;
      await addDoc(collection(db, 'users', user.uid, 'workouts'), {
        ...data,
        createdAt: serverTimestamp(),
      });
    },
    [user],
  );

  return (
    <WorkoutContext.Provider value={{ history, addWorkout }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkoutHistory() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error('useWorkoutHistory must be used within WorkoutProvider');
  return ctx;
}
