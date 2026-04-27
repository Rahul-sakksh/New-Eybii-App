import {useEffect} from 'react';
import {BackHandler, Alert} from 'react-native';

/**
 * useBackHandler — Custom hook to handle Android back button press.
 *
 * @param handler - Return `true` to prevent default back action, `false` to allow.
 *
 * Usage:
 * ```tsx
 * // Exit app confirmation on root screen
 * useBackHandler(() => {
 *   Alert.alert('Exit', 'Do you want to exit?', [
 *     { text: 'No', onPress: () => null },
 *     { text: 'Yes', onPress: () => BackHandler.exitApp() },
 *   ]);
 *   return true; // prevents default back
 * });
 * ```
 */
export const useBackHandler = (handler: () => boolean): void => {
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handler,
    );
    return () => subscription.remove();
  }, [handler]);
};

/**
 * showExitAlert — Shows an exit confirmation dialog and exits app on confirm.
 * Use this on root/home screens.
 */
export const showExitAlert = (): boolean => {
  Alert.alert(
    'Exit Eybii',
    'Are you sure you want to exit?',
    [
      {text: 'Cancel', onPress: () => null, style: 'cancel'},
      {text: 'Exit', onPress: () => BackHandler.exitApp(), style: 'destructive'},
    ],
    {cancelable: false},
  );
  return true; // Prevents default OS back action while alert is visible
};
