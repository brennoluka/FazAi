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
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
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
      // O Analytics é opcional e não deve impedir o login caso não esteja disponível.
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
    // O Fast Refresh pode tentar registrar o Auth mais de uma vez.
    auth = getAuth(app);
  }
}

export { analytics, auth };
