/**
 * AuthModule - Authentication logic (NO UI)
 *
 * Responsibilities:
 * - Manage authentication state
 * - Handle sign in/up/out operations
 * - Emit events when auth state changes
 * - NO direct UI manipulation
 * - NO dependencies on other modules
 *
 * Events emitted:
 * - auth:signed-in (user)
 * - auth:signed-out
 * - auth:error (error)
 * - auth:state-change (user)
 */

class AuthModule {
  constructor(app) {
    this.app = app;
    this.firebase = app.getFirebase();
    this.eventBus = app.getEventBus();
    this.currentUser = null;
    this.initialized = false;
  }

  /**
   * Initialize authentication module
   */
  async initialize() {
    if (this.initialized) {
      console.warn('[AuthModule] Already initialized');
      return;
    }

    console.log('[AuthModule] Initializing...');

    // Wait for Firebase to be ready
    await new Promise((resolve) => {
      this.firebase.onReady(resolve);
    });

    // Get current user if already signed in
    this.currentUser = this.firebase.getCurrentUser();

    // Listen for Firebase auth state changes
    this.firebase.getAuth().onAuthStateChanged((user) => {
      this.handleAuthStateChange(user);
    });

    this.initialized = true;
    console.log('[AuthModule] Initialized');

    // Emit initial state
    if (this.currentUser) {
      this.eventBus.emit('auth:signed-in', this.currentUser);
    }
  }

  /**
   * Handle Firebase auth state changes
   */
  handleAuthStateChange(user) {
    console.log('[AuthModule] Auth state changed:', user ? user.email : 'signed out');

    const wasSignedIn = this.currentUser !== null;
    const isSignedIn = user !== null;

    this.currentUser = user;

    // Emit specific events
    if (isSignedIn && !wasSignedIn) {
      // User just signed in
      this.eventBus.emit('auth:signed-in', user);
    } else if (!isSignedIn && wasSignedIn) {
      // User just signed out
      this.eventBus.emit('auth:signed-out');
    }

    // Always emit general state change
    this.eventBus.emit('auth:state-change', user);
  }

  /**
   * Sign in user
   */
  async signIn(email, password) {
    try {
      const result = await this.firebase.signIn(email, password);

      if (result.success) {
        console.log('[AuthModule] Sign in successful');
        // Migrate localStorage data if exists
        await this.migrateLocalStorageData(result.user.uid);
        return { success: true, user: result.user };
      } else {
        console.error('[AuthModule] Sign in failed:', result.error);
        this.eventBus.emit('auth:error', { type: 'signin', error: result.error });
        return result;
      }
    } catch (error) {
      console.error('[AuthModule] Sign in error:', error);
      this.eventBus.emit('auth:error', { type: 'signin', error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Sign up new user
   */
  async signUp(email, password, displayName = '') {
    try {
      const result = await this.firebase.signUp(email, password);

      if (result.success) {
        const user = result.user;

        // Update display name if provided
        if (displayName) {
          await user.updateProfile({ displayName });
        }

        // Create user document in Firestore
        const db = this.firebase.getDb();
        await db.collection('users').doc(user.uid).set({
          email: user.email,
          displayName: displayName || email.split('@')[0],
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          subscriptionStatus: 'free'
        });

        // Migrate localStorage data if exists
        await this.migrateLocalStorageData(user.uid);

        console.log('[AuthModule] Sign up successful');
        return { success: true, user };
      } else {
        console.error('[AuthModule] Sign up failed:', result.error);
        this.eventBus.emit('auth:error', { type: 'signup', error: result.error });
        return result;
      }
    } catch (error) {
      console.error('[AuthModule] Sign up error:', error);
      this.eventBus.emit('auth:error', { type: 'signup', error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      const result = await this.firebase.signOut();

      if (result.success) {
        console.log('[AuthModule] Sign out successful');
        return { success: true };
      } else {
        console.error('[AuthModule] Sign out failed:', result.error);
        this.eventBus.emit('auth:error', { type: 'signout', error: result.error });
        return result;
      }
    } catch (error) {
      console.error('[AuthModule] Sign out error:', error);
      this.eventBus.emit('auth:error', { type: 'signout', error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email) {
    try {
      const result = await this.firebase.sendPasswordResetEmail(email);

      if (result.success) {
        console.log('[AuthModule] Password reset email sent');
        return { success: true };
      } else {
        console.error('[AuthModule] Password reset failed:', result.error);
        this.eventBus.emit('auth:error', { type: 'password-reset', error: result.error });
        return result;
      }
    } catch (error) {
      console.error('[AuthModule] Password reset error:', error);
      this.eventBus.emit('auth:error', { type: 'password-reset', error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Migrate localStorage data to Firestore (for existing users)
   */
  async migrateLocalStorageData(userId) {
    try {
      const localData = localStorage.getItem('scp_completedCases');
      if (!localData) return;

      const completedCases = JSON.parse(localData);
      const db = this.firebase.getDb();
      const userProgressRef = db.collection('users').doc(userId).collection('progress');

      // Check if user already has data in Firestore
      const existingData = await userProgressRef.limit(1).get();

      // Only migrate if Firestore is empty
      if (existingData.empty && Object.keys(completedCases).length > 0) {
        const batch = db.batch();

        for (const [caseId, timestamp] of Object.entries(completedCases)) {
          const docRef = userProgressRef.doc(caseId);
          batch.set(docRef, {
            completedAt: new Date(timestamp),
            migratedFromLocalStorage: true
          });
        }

        await batch.commit();
        console.log('[AuthModule] Migrated localStorage data to Firestore');
      }
    } catch (error) {
      console.error('[AuthModule] Error migrating localStorage data:', error);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is signed in
   */
  isSignedIn() {
    return this.currentUser !== null;
  }

  /**
   * Get user initials for display
   */
  getUserInitials() {
    return window.helpers.getUserInitials(this.currentUser);
  }
}

// Make available globally
window.AuthModule = AuthModule;
