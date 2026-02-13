import React, { useEffect } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { WorkoutProvider } from './src/context/WorkoutContext';
import { ProgressProvider } from './src/context/ProgressContext';
import AppNavigator from './src/navigation/AppNavigator';
import PWAPrompts from './src/components/PWAPrompts';
import { colors } from './src/theme';

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.body.style.backgroundColor = colors.background;
    }
  }, []);

  return (
    <View style={styles.root}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
