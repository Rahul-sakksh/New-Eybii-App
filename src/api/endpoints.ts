// Central API endpoint registry
// Replace BASE_URL with your actual backend URL

const BASE_URL = 'https://www.eybii.com/api'; // TODO: update with real URL

export const API_BASE_URL = BASE_URL;

// Auth
export const ENDPOINTS = {
  // Auth
  LOGIN: '/login.php',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',

  // User
  PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile/update',

  // Check-In
  CHECKIN: '/checkin',
  CHECKIN_HISTORY: '/checkin/history',

  // Day
  DAY_START: '/day/start',
  DAY_END: '/day/end',
  DAY_STATUS: '/day/status',

  // Location
  UPDATE_LOCATION: '/location/update',

  // Home / Dashboard
  DASHBOARD: '/dashboard',
  TRACKING_DATA: '/sales_man_tracking_data.php',
};
