import { SESSION_CONFIG, SESSION_KEYS, SESSION_STATUS } from '../config/sessionConfig';

class SessionManager {
  constructor() {
    this.warningTimer = null;
    this.expirationTimer = null;
    this.activityTimer = null;
    this.onSessionExpired = null;
    this.onSessionWarning = null;
    this.onSessionExtended = null;
  }

  // Generate unique session ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
  }

  // Create new session
  createSession(employeeId, rememberMe = false) {
    const now = new Date();
    const duration = rememberMe ? SESSION_CONFIG.REMEMBER_ME_DURATION : SESSION_CONFIG.SESSION_DURATION;
    
    const sessionData = {
      sessionId: this.generateSessionId(),
      employeeId,
      loginTime: now.toISOString(),
      lastActivity: now.toISOString(),
      expiresAt: new Date(now.getTime() + duration).toISOString(),
      rememberMe,
      extensionCount: 0,
      status: SESSION_STATUS.ACTIVE
    };

    localStorage.setItem(SESSION_KEYS.USER_SESSION, JSON.stringify(sessionData));
    localStorage.setItem(SESSION_KEYS.SESSION_ACTIVITY, now.toISOString());
    
    this.startSessionMonitoring();
    return sessionData;
  }

  // Get current session
  getCurrentSession() {
    try {
      const sessionData = localStorage.getItem(SESSION_KEYS.USER_SESSION);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Check if session is valid
  isSessionValid() {
    const session = this.getCurrentSession();
    if (!session) return false;

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    return now < expiresAt;
  }

  // Update last activity timestamp
  updateActivity() {
    const session = this.getCurrentSession();
    if (!session) return false;

    const now = new Date();
    session.lastActivity = now.toISOString();
    
    localStorage.setItem(SESSION_KEYS.USER_SESSION, JSON.stringify(session));
    localStorage.setItem(SESSION_KEYS.SESSION_ACTIVITY, now.toISOString());
    
    return true;
  }

  // Get remaining session time in milliseconds
  getRemainingTime() {
    const session = this.getCurrentSession();
    if (!session) return 0;

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    return Math.max(0, expiresAt.getTime() - now.getTime());
  }

  // Check if session should show warning
  shouldShowWarning() {
    const remainingTime = this.getRemainingTime();
    return remainingTime > 0 && remainingTime <= SESSION_CONFIG.WARNING_TIME;
  }

  // Extend session
  extendSession() {
    const session = this.getCurrentSession();
    if (!session) return false;

    if (session.extensionCount >= SESSION_CONFIG.MAX_EXTENSIONS) {
      return false;
    }

    const now = new Date();
    const duration = session.rememberMe ? SESSION_CONFIG.REMEMBER_ME_DURATION : SESSION_CONFIG.SESSION_DURATION;
    
    session.expiresAt = new Date(now.getTime() + duration).toISOString();
    session.lastActivity = now.toISOString();
    session.extensionCount += 1;
    session.status = SESSION_STATUS.EXTENDED;

    localStorage.setItem(SESSION_KEYS.USER_SESSION, JSON.stringify(session));
    localStorage.setItem(SESSION_KEYS.SESSION_ACTIVITY, now.toISOString());

    // Reset timers
    this.clearTimers();
    this.startSessionMonitoring();

    if (this.onSessionExtended) {
      this.onSessionExtended(session);
    }

    return true;
  }

  // Destroy session
  destroySession() {
    this.clearTimers();
    localStorage.removeItem(SESSION_KEYS.USER_SESSION);
    localStorage.removeItem(SESSION_KEYS.SESSION_ACTIVITY);
    localStorage.removeItem(SESSION_KEYS.LAST_WARNING);
  }

  // Clear all timers
  clearTimers() {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.expirationTimer) {
      clearTimeout(this.expirationTimer);
      this.expirationTimer = null;
    }
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
  }

  // Start session monitoring
  startSessionMonitoring() {
    this.clearTimers();
    
    const checkSession = () => {
      if (!this.isSessionValid()) {
        this.handleSessionExpired();
        return;
      }

      const remainingTime = this.getRemainingTime();
      
      // Set warning timer
      if (remainingTime <= SESSION_CONFIG.WARNING_TIME && remainingTime > 0) {
        if (this.onSessionWarning) {
          this.onSessionWarning(remainingTime);
        }
      }

      // Set expiration timer
      if (remainingTime > 0) {
        this.expirationTimer = setTimeout(() => {
          this.handleSessionExpired();
        }, remainingTime);
      }
    };

    // Initial check
    checkSession();

    // Set up periodic activity monitoring
    this.activityTimer = setInterval(() => {
      checkSession();
    }, SESSION_CONFIG.ACTIVITY_CHECK_INTERVAL);
  }

  // Handle session expiration
  handleSessionExpired() {
    const session = this.getCurrentSession();
    if (session) {
      session.status = SESSION_STATUS.EXPIRED;
      localStorage.setItem(SESSION_KEYS.USER_SESSION, JSON.stringify(session));
    }

    this.clearTimers();

    if (this.onSessionExpired) {
      this.onSessionExpired();
    }
  }

  // Set event handlers
  setEventHandlers({ onExpired, onWarning, onExtended }) {
    if (onExpired) this.onSessionExpired = onExpired;
    if (onWarning) this.onSessionWarning = onWarning;
    if (onExtended) this.onSessionExtended = onExtended;
  }

  // Track user activity
  trackActivity() {
    if (this.isSessionValid()) {
      this.updateActivity();
    }
  }

  // Get session info for display
  getSessionInfo() {
    const session = this.getCurrentSession();
    if (!session) return null;

    const remainingTime = this.getRemainingTime();
    const remainingMinutes = Math.ceil(remainingTime / (1000 * 60));

    return {
      isValid: this.isSessionValid(),
      remainingTime,
      remainingMinutes,
      shouldShowWarning: this.shouldShowWarning(),
      extensionCount: session.extensionCount,
      maxExtensions: SESSION_CONFIG.MAX_EXTENSIONS,
      canExtend: session.extensionCount < SESSION_CONFIG.MAX_EXTENSIONS,
      loginTime: session.loginTime,
      lastActivity: session.lastActivity,
      status: session.status
    };
  }

  // Format time for display
  formatRemainingTime(timeInMs) {
    if (timeInMs <= 0) return '0 นาที';
    
    const minutes = Math.floor(timeInMs / (1000 * 60));
    const seconds = Math.floor((timeInMs % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes} นาที ${seconds} วินาที`;
    } else {
      return `${seconds} วินาที`;
    }
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

// Activity tracking function
export const trackUserActivity = () => {
  sessionManager.trackActivity();
};

// Add global activity listeners
if (typeof window !== 'undefined') {
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  let activityTimeout;
  const throttledTrackActivity = () => {
    clearTimeout(activityTimeout);
    activityTimeout = setTimeout(() => {
      trackUserActivity();
    }, 1000); // Throttle to once per second
  };

  events.forEach(event => {
    document.addEventListener(event, throttledTrackActivity, true);
  });
}

export default sessionManager;