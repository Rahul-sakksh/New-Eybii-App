import { Platform } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
  openSettings,
} from 'react-native-permissions';

// ----------- Types -----------
export type PermissionResult =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable';

// ----------- Request single permission (cross-platform) -----------
export const requestPermission = async (
  permission: Permission,
): Promise<PermissionResult> => {
  try {
    const result = await request(permission);
    switch (result) {
      case RESULTS.GRANTED:
        return 'granted';
      case RESULTS.DENIED:
        return 'denied';
      case RESULTS.BLOCKED:
        return 'blocked';
      default:
        return 'unavailable';
    }
  } catch (error) {
    console.error('[Permission] Request error:', error);
    return 'unavailable';
  }
};

// ----------- Check single permission -----------
export const checkPermission = async (
  permission: Permission,
): Promise<PermissionResult> => {
  try {
    const result = await check(permission);
    switch (result) {
      case RESULTS.GRANTED:
        return 'granted';
      case RESULTS.DENIED:
        return 'denied';
      case RESULTS.BLOCKED:
        return 'blocked';
      default:
        return 'unavailable';
    }
  } catch (error) {
    console.error('[Permission] Check error:', error);
    return 'unavailable';
  }
};

// ----------- Camera Permission -----------
export const requestCameraPermission =
  async (): Promise<PermissionResult> => {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.CAMERA,
      android: PERMISSIONS.ANDROID.CAMERA,
    }) as Permission;
    return requestPermission(permission);
  };

// ----------- Gallery / Photo Library Permission -----------
export const requestGalleryPermission = async (): Promise<PermissionResult> => {
  // On Android 13+ (API 33), the System Photo Picker is used which doesn't need permissions
  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    return 'granted';
  }
  const permission = Platform.select({
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
    android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  }) as Permission;

  return requestPermission(permission);
};

// ----------- Location Permission -----------
export const requestLocationPermission =
  async (): Promise<PermissionResult> => {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    }) as Permission;
    return requestPermission(permission);
  };

// ----------- Request all common permissions at once -----------
export const requestAllPermissions = async (): Promise<{
  camera: PermissionResult;
  gallery: PermissionResult;
  location: PermissionResult;
}> => {
  const [camera, gallery, location] = await Promise.all([
    requestCameraPermission(),
    requestGalleryPermission(),
    requestLocationPermission(),
  ]);

  console.log('[Permissions]', { camera, gallery, location });
  return { camera, gallery, location };
};

// ----------- Open device settings (for blocked permissions) -----------
export const openAppSettings = (): void => {
  openSettings().catch(() =>
    console.warn('[Permission] Unable to open settings'),
  );
};
