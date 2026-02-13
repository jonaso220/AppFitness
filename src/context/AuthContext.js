import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithCredential,
  signOut,
  GoogleAuthProvider,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../config/firebase';

if (Platform.OS !== 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Google auth request for native platforms
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: 'TU_WEB_CLIENT_ID.apps.googleusercontent.com',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Handle native Google auth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  const signInWithGoogle = useCallback(async () => {
    if (Platform.OS === 'web') {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } else {
      await promptAsync();
    }
  }, [promptAsync]);

  const logout = useCallback(() => signOut(auth), []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
