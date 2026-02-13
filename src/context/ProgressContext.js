import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const ProgressContext = createContext();

export function ProgressProvider({ children }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoaded(true);
      return;
    }

    setLoaded(false);

    const q = query(
      collection(db, 'users', user.uid, 'progress'),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setEntries(data);
      setLoaded(true);
    });

    return unsubscribe;
  }, [user]);

  const addEntry = useCallback(
    async (entry) => {
      if (!user) return;
      const { id, photos, ...data } = entry;
      await addDoc(collection(db, 'users', user.uid, 'progress'), {
        ...data,
        photos: photos || [],
        createdAt: serverTimestamp(),
      });
    },
    [user],
  );

  const deleteEntry = useCallback(
    async (id) => {
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'progress', id));
    },
    [user],
  );

  return (
    <ProgressContext.Provider value={{ entries, loaded, addEntry, deleteEntry }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
