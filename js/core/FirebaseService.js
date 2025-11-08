/**
 * FirebaseService - Centralized Firebase access
 *
 * Single source of truth for Firebase instances.
 * Prevents duplicate initialization and provides consistent access.
 *
 * Benefits:
 * - No duplicate Firebase code across modules
 * - Easy to mock for testing
 * - Handles initialization gracefully
 */

class FirebaseService {
  constructor() {
    this.initialized = false;
    this.auth = null;
    this.db = null;
    this.currentUser = null;

    // Callbacks for when Firebase becomes available
    this.readyCallbacks = [];
  }

  /**
   * Initialize Firebase (call this once at app start)
   */
  initialize() {
    if (this.initialized) {
      console.warn('[FirebaseService] Already initialized');
      return;
    }

    try {
      // Check if Firebase is loaded
      if (typeof firebase === 'undefined') {
        console.error('[FirebaseService] Firebase SDK not loaded');
        return false;
      }

      // Get Firebase instances
      this.auth = firebase.auth();
      this.db = firebase.firestore();

      // Get current user if already signed in
      this.currentUser = this.auth.currentUser;

      // Listen for auth state changes
      this.auth.onAuthStateChanged((user) => {
        this.currentUser = user;

        // Emit event through EventBus
        if (window.eventBus) {
          if (user) {
            window.eventBus.emit('firebase:user-signed-in', user);
          } else {
            window.eventBus.emit('firebase:user-signed-out');
          }
        }
      });

      this.initialized = true;
      console.log('[FirebaseService] Initialized successfully');

      // Notify any waiting callbacks
      this.readyCallbacks.forEach(callback => callback());
      this.readyCallbacks = [];

      return true;
    } catch (error) {
      console.error('[FirebaseService] Initialization error:', error);
      return false;
    }
  }

  /**
   * Execute callback when Firebase is ready
   * @param {function} callback - Function to call when ready
   */
  onReady(callback) {
    if (this.initialized) {
      callback();
    } else {
      this.readyCallbacks.push(callback);
    }
  }

  /**
   * Check if Firebase is initialized and ready
   * @returns {boolean}
   */
  isReady() {
    return this.initialized && this.auth !== null && this.db !== null;
  }

  /**
   * Get Firebase Auth instance
   * @returns {firebase.auth.Auth|null}
   */
  getAuth() {
    if (!this.initialized) {
      console.warn('[FirebaseService] Not initialized. Call initialize() first.');
      return null;
    }
    return this.auth;
  }

  /**
   * Get Firestore instance
   * @returns {firebase.firestore.Firestore|null}
   */
  getDb() {
    if (!this.initialized) {
      console.warn('[FirebaseService] Not initialized. Call initialize() first.');
      return null;
    }
    return this.db;
  }

  /**
   * Get current user
   * @returns {firebase.User|null}
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is signed in
   * @returns {boolean}
   */
  isSignedIn() {
    return this.currentUser !== null;
  }

  /**
   * Get user document reference in Firestore
   * @param {string} userId - User ID (defaults to current user)
   * @returns {firebase.firestore.DocumentReference|null}
   */
  getUserRef(userId = null) {
    if (!this.db) return null;

    const uid = userId || this.currentUser?.uid;
    if (!uid) return null;

    return this.db.collection('users').doc(uid);
  }

  /**
   * Get user's progress collection reference
   * @param {string} userId - User ID (defaults to current user)
   * @returns {firebase.firestore.CollectionReference|null}
   */
  getUserProgressRef(userId = null) {
    const userRef = this.getUserRef(userId);
    return userRef ? userRef.collection('progress') : null;
  }

  /**
   * Get user's flags collection reference
   * @param {string} userId - User ID (defaults to current user)
   * @returns {firebase.firestore.CollectionReference|null}
   */
  getUserFlagsRef(userId = null) {
    const userRef = this.getUserRef(userId);
    return userRef ? userRef.collection('flags') : null;
  }

  /**
   * Get user's case flags collection reference
   * @param {string} userId - User ID (defaults to current user)
   * @returns {firebase.firestore.CollectionReference|null}
   */
  getUserCaseFlagsRef(userId = null) {
    const userRef = this.getUserRef(userId);
    return userRef ? userRef.collection('caseFlags') : null;
  }

  /**
   * Helper: Sign in user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{success: boolean, user?: any, error?: string}>}
   */
  async signIn(email, password) {
    if (!this.auth) {
      return { success: false, error: 'Firebase not initialized' };
    }

    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper: Sign up user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{success: boolean, user?: any, error?: string}>}
   */
  async signUp(email, password) {
    if (!this.auth) {
      return { success: false, error: 'Firebase not initialized' };
    }

    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper: Sign out user
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async signOut() {
    if (!this.auth) {
      return { success: false, error: 'Firebase not initialized' };
    }

    try {
      await this.auth.signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper: Send password reset email
   * @param {string} email
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async sendPasswordResetEmail(email) {
    if (!this.auth) {
      return { success: false, error: 'Firebase not initialized' };
    }

    try {
      await this.auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create and export singleton instance
const firebaseService = new FirebaseService();

// Make it available globally
window.firebaseService = firebaseService;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FirebaseService;
}
