import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WorkoutProvider } from './src/context/WorkoutContext';
import { ProgressProvider } from './src/context/ProgressContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <WorkoutProvider>
        <ProgressProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </ProgressProvider>
      </WorkoutProvider>
    </SafeAreaProvider>
  );
}
