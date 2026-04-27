import React, { useEffect, useState } from 'react';
import { LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { requestAllPermissions } from './src/utils/permissions';
import { getData, STORAGE_KEYS } from './src/utils/storage';
import Authentication from './src/components/Authentication';

// Suppress known non-critical warnings in dev
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'AsyncStorage has been extracted',
  'Non-serializable values were found in the navigation state',
]);

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Home'>('Login');

  useEffect(() => {
    // Request all permissions on app launch
    requestAllPermissions().catch(err =>
      console.warn('[App] Permission error:', err),
    );

    const checkLoginStatus = async () => {
      try {
        const loggedIn = await getData(STORAGE_KEYS.LOGGED_IN);
        if (loggedIn === 'true') {
          setInitialRoute('Home');
        } else {
          setInitialRoute('Login');
        }
      } catch (e) {
        console.error('[App] Init error:', e);
      } finally {
        // Leave a 1-second delay for branding animation to be visible
        setTimeout(() => {
          setIsInitializing(false);
        }, 1000);
      }
    };

    checkLoginStatus();
  }, []);

  if (isInitializing) {
    return <Authentication />;
  }

  return <AppNavigator initialRouteName={initialRoute} />;
};

export default App;
