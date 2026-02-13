import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// CONFIGURACION DE FIREBASE
// ============================================================
// Reemplaza estos valores con los de tu proyecto de Firebase.
// Puedes encontrarlos en: Firebase Console > Configuracion del proyecto > Tus apps > Firebase SDK snippet
// ============================================================
const firebaseConfig = {
  apiKey: 'AIzaSyAiZIa7881YCK0V1jn67N4eb_DXdL99Xx8',
  authDomain: 'appfitness-c7daa.firebaseapp.com',
  projectId: 'appfitness-c7daa',
  storageBucket: 'appfitness-c7daa.firebasestorage.app',
  messagingSenderId: '573447119261',
  appId: '1:573447119261:web:294237b4d4ddedf881cf74',
  measurementId: 'G-XM5BSZLEME',
};

const app = initializeApp(firebaseConfig);

const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

const db = getFirestore(app);

export { auth, db };
