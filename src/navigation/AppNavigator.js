import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize } from '../theme';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import TrainScreen from '../screens/TrainScreen';
import ExercisePickerScreen from '../screens/ExercisePickerScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HistoryDetailScreen from '../screens/HistoryDetailScreen';
import RestScreen from '../screens/RestScreen';
import ExercisesScreen from '../screens/ExercisesScreen';
import ProgressScreen from '../screens/ProgressScreen';

const Tab = createBottomTabNavigator();
const HistoryStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const TrainStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </HomeStack.Navigator>
  );
}

function TrainStackScreen() {
  return (
    <TrainStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <TrainStack.Screen
        name="TrainMain"
        component={TrainScreen}
        options={{ headerShown: false }}
      />
      <TrainStack.Screen
        name="ExercisePicker"
        component={ExercisePickerScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </TrainStack.Navigator>
  );
}

function HistoryStackScreen() {
  return (
    <HistoryStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <HistoryStack.Screen
        name="HistoryList"
        component={HistoryScreen}
        options={{ headerShown: false }}
      />
      <HistoryStack.Screen
        name="HistoryDetail"
        component={HistoryDetailScreen}
        options={{
          title: 'Detalle',
          headerBackTitle: 'Atrás',
        }}
      />
    </HistoryStack.Navigator>
  );
}

const tabIcons = {
  InicioTab: { focused: 'home', unfocused: 'home-outline' },
  EntrenarTab: { focused: 'barbell', unfocused: 'barbell-outline' },
  HistorialTab: { focused: 'time', unfocused: 'time-outline' },
  DescansoTab: { focused: 'timer', unfocused: 'timer-outline' },
  EjerciciosTab: { focused: 'list', unfocused: 'list-outline' },
};

const RootStack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const icons = tabIcons[route.name];
            const iconName = focused ? icons.focused : icons.unfocused;
            return <Ionicons name={iconName} size={22} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 88,
            paddingBottom: 28,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: fontSize.xs,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        })}
      >
        <Tab.Screen
          name="InicioTab"
          component={HomeStackScreen}
          options={{ title: 'Inicio', headerShown: false }}
        />
        <Tab.Screen
          name="EntrenarTab"
          component={TrainStackScreen}
          options={{ title: 'Entrenar', headerShown: false }}
        />
        <Tab.Screen
          name="HistorialTab"
          component={HistoryStackScreen}
          options={{ title: 'Historial', headerShown: false }}
        />
        <Tab.Screen
          name="DescansoTab"
          component={RestScreen}
          options={{ title: 'Descanso', headerShown: false }}
        />
        <Tab.Screen
          name="EjerciciosTab"
          component={ExercisesScreen}
          options={{ title: 'Ejercicios', headerShown: false }}
        />
      </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={loadingStyles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="Main" component={MainTabs} />
        ) : (
          <RootStack.Screen name="Login" component={LoginScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
