// User Analytics System
// Tracks user sessions, time on site, and last sign-in

class UserAnalytics {
  constructor() {
    this.db = null;
    this.auth = null;
    this.sessionStart = null;
    this.lastActivityTime = null;
    this.pageViewStart = null;
    this.currentPage = null;
    this.activityTimeout = null;
    this.INACTIVITY_THRESHOLD = 2 * 60 * 1000; // 2 minutes of inactivity pauses session
    this.HEARTBEAT_INTERVAL = 30 * 1000; // Update session every 30 seconds
    this.heartbeatTimer = null;
    this.activeDuration = 0; // Track only active time in seconds
    this.lastHeartbeatTime = null;
    this.isPaused = false; // Track if session is paused due to inactivity
  }

  // Initialize analytics system
  initialize() {
    console.log('UserAnalytics: Initializing...');
    console.log('UserAnalytics: Firebase typeof:', typeof firebase);

    // Wait for Firebase to be ready
    if (typeof firebase === 'undefined') {
      console.warn('UserAnalytics: Firebase not loaded');
      return;
    }

    this.auth = window.firebaseAuth || firebase.auth();
    this.db = window.firebaseDb || firebase.firestore();

    console.log('UserAnalytics: Auth:', this.auth ? 'OK' : 'NULL');
    console.log('UserAnalytics: DB:', this.db ? 'OK' : 'NULL');

    if (!this.auth || !this.db) {
      console.warn('UserAnalytics: Firebase auth or db not available');
      return;
    }

    // Check if user is already signed in (important for page refreshes)
    const currentUser = this.auth.currentUser;
    console.log('UserAnalytics: Current user:', currentUser ? currentUser.email : 'NONE');

    if (currentUser) {
      console.log('UserAnalytics: Found already signed-in user, starting session');
      this.startSession(currentUser);
    } else {
      console.log('UserAnalytics: No user signed in yet, waiting for auth state change');
    }

    // Listen for auth state changes
    this.auth.onAuthStateChanged((user) => {
      console.log('UserAnalytics: Auth state changed. User:', user ? user.email : 'NULL');

      if (user) {
        console.log('UserAnalytics: User signed in, currentSessionId:', this.currentSessionId);
        // Only start session if we don't already have one
        if (!this.currentSessionId) {
          console.log('UserAnalytics: No existing session, starting new one');
          this.startSession(user);
        } else {
          console.log('UserAnalytics: Session already exists, skipping');
        }
      } else {
        console.log('UserAnalytics: User signed out, ending session tracking');
        this.endSession();
      }
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handlePageHidden();
      } else {
        this.handlePageVisible();
      }
    });

    // Track user activity
    this.setupActivityTracking();

    // End session before page unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  // Start a new session
  async startSession(user) {
    if (!user || !this.db) return;

    this.sessionStart = new Date();
    this.lastActivityTime = new Date();
    this.lastHeartbeatTime = new Date();
    this.pageViewStart = new Date();
    this.currentPage = window.location.pathname;
    this.activeDuration = 0;
    this.isPaused = false;

    try {
      // Update user's last sign-in and create new session
      const userRef = this.db.collection('users').doc(user.uid);
      const sessionRef = userRef.collection('sessions').doc();

      // Update user document
      await userRef.set({
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        lastSignIn: firebase.firestore.FieldValue.serverTimestamp(),
        lastActive: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // Create session document
      await sessionRef.set({
        startTime: firebase.firestore.FieldValue.serverTimestamp(),
        endTime: null,
        duration: 0,
        pages: [{
          path: this.currentPage,
          title: document.title,
          timestamp: new Date() // Can't use serverTimestamp() in arrays
        }],
        isActive: true,
        userAgent: navigator.userAgent,
        platform: navigator.platform
      });

      this.currentSessionId = sessionRef.id;
      console.log('UserAnalytics: Session started', this.currentSessionId);

      // Start heartbeat to keep session updated
      this.startHeartbeat();

    } catch (error) {
      console.error('UserAnalytics: Error starting session:', error);
    }
  }

  // End the current session
  async endSession() {
    if (!this.currentSessionId || !this.auth?.currentUser || !this.db) {
      this.stopHeartbeat();
      return;
    }

    // Add any remaining active time since last heartbeat
    if (!this.isPaused && this.lastHeartbeatTime) {
      const now = new Date();
      const timeSinceLastHeartbeat = Math.floor((now - this.lastHeartbeatTime) / 1000);

      // Only add time if it's less than the inactivity threshold
      if (timeSinceLastHeartbeat < (this.INACTIVITY_THRESHOLD / 1000)) {
        this.activeDuration += timeSinceLastHeartbeat;
      }
    }

    try {
      const userRef = this.db.collection('users').doc(this.auth.currentUser.uid);
      const sessionRef = userRef.collection('sessions').doc(this.currentSessionId);

      // Update session document with ONLY active duration
      await sessionRef.update({
        endTime: firebase.firestore.FieldValue.serverTimestamp(),
        duration: this.activeDuration,
        isActive: false
      });

      // Update user's lastActive timestamp when session ends
      await userRef.update({
        lastActive: firebase.firestore.FieldValue.serverTimestamp()
      });

      console.log('UserAnalytics: Session ended', this.currentSessionId, `Active Duration: ${this.activeDuration}s`);

    } catch (error) {
      console.error('UserAnalytics: Error ending session:', error);
    }

    this.stopHeartbeat();
    this.currentSessionId = null;
    this.sessionStart = null;
    this.activeDuration = 0;
    this.isPaused = false;
  }

  // Start heartbeat to periodically update session
  startHeartbeat() {
    this.stopHeartbeat(); // Clear any existing heartbeat

    this.heartbeatTimer = setInterval(() => {
      this.updateSession();
    }, this.HEARTBEAT_INTERVAL);
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // Update current session with latest data
  async updateSession() {
    if (!this.currentSessionId || !this.auth?.currentUser || !this.db) return;

    const now = new Date();

    // Only increment active duration if user is not paused
    if (!this.isPaused && this.lastHeartbeatTime) {
      const timeSinceLastHeartbeat = Math.floor((now - this.lastHeartbeatTime) / 1000);

      // Check if user has been active recently (within inactivity threshold)
      const timeSinceLastActivity = now - this.lastActivityTime;

      if (timeSinceLastActivity < this.INACTIVITY_THRESHOLD) {
        // User is active, add the time since last heartbeat
        this.activeDuration += timeSinceLastHeartbeat;
        console.log(`UserAnalytics: Added ${timeSinceLastHeartbeat}s active time. Total: ${this.activeDuration}s`);
      } else {
        // User became inactive, don't add time
        console.log('UserAnalytics: User inactive, not adding time');
      }
    }

    this.lastHeartbeatTime = now;

    try {
      const userRef = this.db.collection('users').doc(this.auth.currentUser.uid);
      const sessionRef = userRef.collection('sessions').doc(this.currentSessionId);

      await sessionRef.update({
        duration: this.activeDuration,
        lastHeartbeat: firebase.firestore.FieldValue.serverTimestamp()
      });

      // ALWAYS update lastActive to show user is still on the site (even if paused)
      // This ensures admin dashboard shows accurate "last seen" times
      await userRef.update({
        lastActive: firebase.firestore.FieldValue.serverTimestamp()
      });

      console.log(`UserAnalytics: Heartbeat updated. Active: ${!this.isPaused}, Duration: ${this.activeDuration}s`);

    } catch (error) {
      console.error('UserAnalytics: Error updating session:', error);
    }
  }

  // Track page navigation
  async trackPageView(path, title) {
    if (!this.currentSessionId || !this.auth?.currentUser || !this.db) return;

    // Calculate time spent on previous page
    if (this.currentPage && this.pageViewStart) {
      const timeOnPage = Math.floor((new Date() - this.pageViewStart) / 1000);
      console.log(`UserAnalytics: Time on ${this.currentPage}: ${timeOnPage}s`);
    }

    this.currentPage = path;
    this.pageViewStart = new Date();

    try {
      const userRef = this.db.collection('users').doc(this.auth.currentUser.uid);
      const sessionRef = userRef.collection('sessions').doc(this.currentSessionId);

      // Add page to session's page array
      await sessionRef.update({
        pages: firebase.firestore.FieldValue.arrayUnion({
          path: path,
          title: title,
          timestamp: new Date() // Can't use serverTimestamp() in arrays
        })
      });

    } catch (error) {
      console.error('UserAnalytics: Error tracking page view:', error);
    }
  }

  // Setup activity tracking (mouse, keyboard, scroll)
  setupActivityTracking() {
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      // If session was paused, resume it
      if (this.isPaused) {
        this.resumeSession();
      }

      this.lastActivityTime = new Date();

      // Reset inactivity timeout
      if (this.activityTimeout) {
        clearTimeout(this.activityTimeout);
      }

      // Set new timeout to detect inactivity
      this.activityTimeout = setTimeout(() => {
        this.handleInactivity();
      }, this.INACTIVITY_THRESHOLD);
    };

    // Attach listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial activity
    handleActivity();
  }

  // Handle user inactivity
  handleInactivity() {
    console.log('UserAnalytics: Inactivity detected - pausing session tracking');
    this.isPaused = true;
    this.stopHeartbeat(); // Stop updating session while inactive
  }

  // Resume session tracking after activity
  resumeSession() {
    if (this.isPaused && this.currentSessionId) {
      console.log('UserAnalytics: Activity resumed - resuming session tracking');
      this.isPaused = false;
      this.lastActivityTime = new Date();
      this.lastHeartbeatTime = new Date();
      this.startHeartbeat(); // Resume heartbeat
    }
  }

  // Handle page hidden (tab switched or minimized)
  handlePageHidden() {
    console.log('UserAnalytics: Page hidden - pausing session');
    this.updateSession(); // Save current state before pausing
    this.isPaused = true;
    this.stopHeartbeat(); // Stop heartbeat to save resources
  }

  // Handle page visible again
  handlePageVisible() {
    console.log('UserAnalytics: Page visible - resuming session');
    this.isPaused = false;
    this.lastActivityTime = new Date();
    this.lastHeartbeatTime = new Date();
    this.startHeartbeat(); // Resume heartbeat
  }

  // Track case view
  async trackCaseView(caseId, caseTitle) {
    if (!this.auth?.currentUser || !this.db) return;

    try {
      const userRef = this.db.collection('users').doc(this.auth.currentUser.uid);

      // Update user's case views
      await userRef.set({
        lastViewedCase: caseId,
        lastViewedCaseTitle: caseTitle,
        lastViewedCaseTime: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // Add to session's pages if we have an active session
      if (this.currentSessionId) {
        const sessionRef = userRef.collection('sessions').doc(this.currentSessionId);
        await sessionRef.update({
          lastCaseViewed: caseId,
          lastCaseViewedTitle: caseTitle
        });
      }

      // Track in global case analytics
      const caseRef = this.db.collection('caseAnalytics').doc(caseId);
      await caseRef.set({
        caseId: caseId,
        title: caseTitle,
        viewCount: firebase.firestore.FieldValue.increment(1),
        lastViewed: firebase.firestore.FieldValue.serverTimestamp(),
        uniqueViewers: firebase.firestore.FieldValue.arrayUnion(this.auth.currentUser.uid)
      }, { merge: true });

    } catch (error) {
      console.error('UserAnalytics: Error tracking case view:', error);
    }
  }

  // Track feature usage
  async trackFeatureUsage(featureName, details = {}) {
    if (!this.auth?.currentUser || !this.db) return;

    try {
      const userRef = this.db.collection('users').doc(this.auth.currentUser.uid);

      // Update user's feature usage stats
      await userRef.set({
        featureUsage: {
          [featureName]: firebase.firestore.FieldValue.increment(1)
        },
        lastFeatureUsed: featureName,
        lastFeatureUsedTime: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // Log detailed feature usage
      await userRef.collection('featureUsage').add({
        feature: featureName,
        details: details,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });

    } catch (error) {
      console.error('UserAnalytics: Error tracking feature usage:', error);
    }
  }

  // Track filter usage
  async trackFilter(filterType, filterValue) {
    await this.trackFeatureUsage('filter', {
      filterType: filterType,
      filterValue: filterValue
    });
  }

  // Track search usage
  async trackSearch(searchQuery) {
    await this.trackFeatureUsage('search', {
      query: searchQuery
    });
  }

  // Track flag/bookmark usage
  async trackFlag(caseId, action) {
    await this.trackFeatureUsage('flag', {
      caseId: caseId,
      action: action // 'add' or 'remove'
    });
  }

  // Track exam resource view
  async trackExamResource(examType, examYear) {
    if (!this.auth?.currentUser || !this.db) return;

    try {
      const userRef = this.db.collection('users').doc(this.auth.currentUser.uid);

      // Update user's exam resource views
      await userRef.set({
        examResourceViews: {
          [`${examType}_${examYear}`]: firebase.firestore.FieldValue.increment(1)
        },
        lastExamResourceViewed: `${examType}_${examYear}`,
        lastExamResourceViewedTime: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // Track in global exam analytics
      const examRef = this.db.collection('examAnalytics').doc(`${examType}_${examYear}`);
      await examRef.set({
        examType: examType,
        examYear: examYear,
        viewCount: firebase.firestore.FieldValue.increment(1),
        lastViewed: firebase.firestore.FieldValue.serverTimestamp(),
        uniqueViewers: firebase.firestore.FieldValue.arrayUnion(this.auth.currentUser.uid)
      }, { merge: true });

    } catch (error) {
      console.error('UserAnalytics: Error tracking exam resource:', error);
    }
  }

  // Get user statistics (for display purposes)
  async getUserStats(userId) {
    if (!this.db) return null;

    try {
      const userRef = this.db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) return null;

      const userData = userDoc.data();

      // Get session count
      const sessionsSnapshot = await userRef.collection('sessions').get();
      const sessionCount = sessionsSnapshot.size;

      // Get active sessions count
      const activeSessionsSnapshot = await userRef.collection('sessions')
        .where('isActive', '==', true)
        .get();
      const activeSessionCount = activeSessionsSnapshot.size;

      return {
        email: userData.email,
        displayName: userData.displayName,
        lastSignIn: userData.lastSignIn?.toDate(),
        lastActive: userData.lastActive?.toDate(),
        totalTimeSpent: userData.totalTimeSpent || 0,
        sessionCount: sessionCount,
        activeSessionCount: activeSessionCount,
        createdAt: userData.createdAt?.toDate(),
        featureUsage: userData.featureUsage || {},
        examResourceViews: userData.examResourceViews || {},
        lastViewedCase: userData.lastViewedCase,
        lastViewedCaseTitle: userData.lastViewedCaseTitle
      };

    } catch (error) {
      console.error('UserAnalytics: Error getting user stats:', error);
      return null;
    }
  }
}

// Initialize analytics globally
window.userAnalytics = new UserAnalytics();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.userAnalytics.initialize();
  });
} else {
  window.userAnalytics.initialize();
}
