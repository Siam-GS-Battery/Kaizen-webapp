// Session Management Configuration
export const SESSION_CONFIG = {
  // Session duration in milliseconds (30 minutes)
  SESSION_DURATION: 30 * 60 * 1000,
  
  // Warning time before session expires (5 minutes)
  WARNING_TIME: 5 * 60 * 1000,
  
  // Activity check interval (1 minute)
  ACTIVITY_CHECK_INTERVAL: 60 * 1000,
  
  // Maximum number of session extensions allowed
  MAX_EXTENSIONS: 3,
  
  // Session refresh interval for UI updates (10 seconds)
  UI_REFRESH_INTERVAL: 10 * 1000,
  
  // Remember me session duration (7 days)
  REMEMBER_ME_DURATION: 7 * 24 * 60 * 60 * 1000,
};

// Session storage keys
export const SESSION_KEYS = {
  USER_SESSION: 'userSession',
  SESSION_ACTIVITY: 'sessionActivity',
  LAST_WARNING: 'lastWarning'
};

// Session status constants
export const SESSION_STATUS = {
  ACTIVE: 'active',
  WARNING: 'warning', 
  EXPIRED: 'expired',
  EXTENDED: 'extended'
};