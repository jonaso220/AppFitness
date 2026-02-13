import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { WorkoutProvider } from './src/context/WorkoutContext';
import { ProgressProvider } from './src/context/ProgressContext';
import AppNavigator from './src/navigation/AppNavigator';
import PWAPrompts from './src/components/PWAPrompts';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WorkoutProvider>
          <ProgressProvider>
            <StatusBar style="light" />
            <AppNavigator />
            <PWAPrompts />
          </ProgressProvider>
        </WorkoutProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
