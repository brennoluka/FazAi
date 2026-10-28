import { Platform } from 'react-native';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyB4A7_mGXB-Iq5R1DQTMNQHugokM-T2whM',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'fazai-c084b.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'fazai-c084b',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'fazai-c084b.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '423130477976',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:423130477976:web:6b854fa19f3e2271daa7ed',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-KVDZX96CEM',
};

const chavesObrigatorias = [
  'apiKey',
  'authDomain',
  'projectId',
  'appId',
];

export const firebaseConfigurado = chavesObrigatorias.every(
  (chave) => Boolean(firebaseConfig[chave]),
);

let auth = null;
let analytics = null;

if (firebaseConfigurado) {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
    } catch (_erro) {
      analytics = null;
    }
  }

  try {
    auth = Platform.OS === 'web'
      ? getAuth(app)
      : initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
  } catch (_erro) {
    auth = getAuth(app);
  }
}

export { analytics, auth };
