import React, { useEffect, useState } from 'react';
import { LogBox, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { requestAllPermissions } from './src/utils/permissions';
import { getData, STORAGE_KEYS } from './src/utils/storage';
import Authentication from './src/components/Authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import ForceUpdateModal from './src/components/ForceUpdateModal';

// Suppress known non-critical warnings in dev
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'AsyncStorage has been extracted',
  'Non-serializable values were found in the navigation state',
]);

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Home'>('Login');






  const APP_VERSION_KEY = 'APP_VERSION_CACHE';

  const [showUpdate, setShowUpdate] = useState(false);
  const [storeUrl, setStoreUrl] = useState('');


  // 🔹 Version Compare (unchanged)
  const compareVersions = (current: string, latest: string) => {
    const cParts = current.split('.').map(n => parseInt(n, 10));
    const lParts = latest.split('.').map(n => parseInt(n, 10));

    const maxLength = Math.max(cParts.length, lParts.length);

    for (let i = 0; i < maxLength; i++) {
      const c = cParts[i] ?? 0;
      const l = lParts[i] ?? 0;

      if (c < l) return -1;
      if (c > l) return 1;
    }

    return 0;
  };


  useEffect(() => {
    checkAppVersion();
  }, []);


  // 🔥 MAIN FUNCTION
  const checkAppVersion = async () => {
    try {
      const currentVersion = DeviceInfo.getVersion();
      let updateData = null;

      // ✅ 1. Try API Call
      try {
        const response = await fetch('https://api.sakksh.com/auth/appVersion');

        const json = await response.json();

        const data = json?.filter(
          (item: any) =>
            item.avc_device?.toLowerCase() === (Platform.OS.toLowerCase() === 'android' ? "eybii_android" : "eybii_ios" )
        )?.[0];

        if (data) {
          updateData = data;

          // ✅ Save in AsyncStorage
          await AsyncStorage.setItem(APP_VERSION_KEY, JSON.stringify(data));
        }

        console.log('API success:', data);
      } catch (apiError) {
        console.log('API failed, fallback to cache');
      }

      // ✅ 2. Fallback to AsyncStorage
      if (!updateData) {
        const cached = await AsyncStorage.getItem(APP_VERSION_KEY);

        if (cached) {
          updateData = JSON.parse(cached);
          console.log('Using cached version data:', updateData);
        }
      }

      // ❌ No data at all
      if (!updateData) {
        console.log('No version data available');
        return;
      }

      // ✅ 3. Compare Versions
      const result = compareVersions(
        currentVersion,
        updateData.avc_version ?? '0'
      );

      if (result === -1) {
        setStoreUrl(updateData.avc_store_url);
        setShowUpdate(true);
      } else {
        setShowUpdate(false);
      }

    } catch (e) {
      console.log('Version check failed:', e);
    }
  };

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

  return (
    <>

      <AppNavigator initialRouteName={initialRoute} />
      <ForceUpdateModal visible={showUpdate} storeUrl={storeUrl} />

    </>
  )
};

export default App;
