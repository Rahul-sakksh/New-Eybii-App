import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key constants
export const STORAGE_KEYS = {
  USER_ID: 'user_id',
  USER_NAME: 'user_name',
  USER_CODE: 'user_code',
  TOKEN: 'token',
  USER_ROLE: 'user_role',
  RETAILER_ID: 'retailer_id',
  LOGGED_IN: 'logged_in',
  DEVICE_ID: 'device_id',
};

export const storeData = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error('[Storage] storeData error:', error);
  }
};

export const getData = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (error) {
    console.error('[Storage] getData error:', error);
    return null;
  }
};

export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('[Storage] removeData error:', error);
  }
};

export const clearAll = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('[Storage] clearAll error:', error);
  }
};
