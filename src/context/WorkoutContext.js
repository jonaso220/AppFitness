import React, { createContext, useContext, useState, useCallback } from 'react';

const WorkoutContext = createContext();

export function WorkoutProvider({ children }) {
  const [history, setHistory] = useState([]);

  const addWorkout = useCallback((workout) => {
    setHistory((prev) => [workout, ...prev]);
  }, []);

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
