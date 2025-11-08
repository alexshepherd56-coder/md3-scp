/**
 * App - Main application coordinator
 *
 * Responsibilities:
 * - Initialize all core services
 * - Initialize all modules in the correct order
 * - Coordinate module lifecycle
 * - Provide access to shared services
 *
 * This is the "brain" of the application that starts everything.
 */

class App {
  constructor() {
    this.modules = {};
    this.initialized = false;

    // Core services (available to all modules)
    this.eventBus = window.eventBus;
    this.firebase = window.firebaseService;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    if (this.initialized) {
      console.warn('[App] Already initialized');
      return;
    }

    console.log('[App] Initializing application...');

    try {
      // Step 1: Initialize core services
      await this.initializeCoreServices();

      // Step 2: Initialize modules (when we have them)
      await this.initializeModules();

      this.initialized = true;
      console.log('[App] Application initialized successfully');

      // Emit app-ready event
      this.eventBus.emit('app:ready');

      return true;
    } catch (error) {
      console.error('[App] Initialization error:', error);
      return false;
    }
  }

  /**
   * Initialize core services
   */
  async initializeCoreServices() {
    console.log('[App] Initializing core services...');

    // Initialize Firebase
    this.firebase.initialize();

    // Wait for Firebase to be ready
    await new Promise((resolve) => {
      this.firebase.onReady(resolve);
    });

    console.log('[App] Core services initialized');
  }

  /**
   * Initialize modules
   * Modules will be added here as we refactor them
   */
  async initializeModules() {
    console.log('[App] Initializing modules...');

    // Future: Initialize auth module
    // if (window.AuthModule) {
    //   this.modules.auth = new AuthModule(this);
    //   await this.modules.auth.initialize();
    // }

    // Future: Initialize completion module
    // if (window.CompletionModule) {
    //   this.modules.completion = new CompletionModule(this);
    //   await this.modules.completion.initialize();
    // }

    // For now, modules will initialize themselves
    // Once refactored, they'll register here

    console.log('[App] Modules initialized');
  }

  /**
   * Register a module
   * @param {string} name - Module name
   * @param {object} module - Module instance
   */
  registerModule(name, module) {
    this.modules[name] = module;
    console.log(`[App] Module registered: ${name}`);
  }

  /**
   * Get a module
   * @param {string} name - Module name
   * @returns {object|null}
   */
  getModule(name) {
    return this.modules[name] || null;
  }

  /**
   * Get EventBus instance
   * @returns {EventBus}
   */
  getEventBus() {
    return this.eventBus;
  }

  /**
   * Get FirebaseService instance
   * @returns {FirebaseService}
   */
  getFirebase() {
    return this.firebase;
  }

  /**
   * Emit an event (shortcut to eventBus.emit)
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    this.eventBus.emit(event, data);
  }

  /**
   * Listen to an event (shortcut to eventBus.on)
   * @param {string} event - Event name
   * @param {function} callback - Event handler
   * @returns {function} Unsubscribe function
   */
  on(event, callback) {
    return this.eventBus.on(event, callback);
  }

  /**
   * Get current user (shortcut to firebase.getCurrentUser)
   * @returns {firebase.User|null}
   */
  getCurrentUser() {
    return this.firebase.getCurrentUser();
  }

  /**
   * Check if user is signed in (shortcut)
   * @returns {boolean}
   */
  isSignedIn() {
    return this.firebase.isSignedIn();
  }
}

// Create singleton instance
const scpApp = new App();

// Make it available globally
window.app = scpApp;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] DOM ready, initializing app...');
    scpApp.initialize();
  });
} else {
  // DOM already loaded
  console.log('[App] DOM already ready, initializing app...');
  scpApp.initialize();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}
