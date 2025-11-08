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
    // Note: These are set in the constructor but EventBus/FirebaseService
    // scripts must be loaded BEFORE App.js
    this.eventBus = window.eventBus || null;
    this.firebaseService = window.firebaseService || null;

    // Ensure critical services are available
    if (!this.eventBus) {
      console.error('[App] EventBus not found! Make sure EventBus.js is loaded before App.js');
    }
    if (!this.firebaseService) {
      console.error('[App] FirebaseService not found! Make sure FirebaseService.js is loaded before App.js');
    }
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
    this.firebaseService.initialize();

    // Wait for Firebase to be ready
    await new Promise((resolve) => {
      this.firebaseService.onReady(resolve);
    });

    console.log('[App] Core services initialized');
  }

  /**
   * Initialize modules
   * Modules will be added here as we refactor them
   */
  async initializeModules() {
    console.log('[App] Initializing modules...');
    console.log('[App] Checking for modules: CompletionModule=' + (typeof window.CompletionModule) + ', FlagModule=' + (typeof window.FlagModule));

    // Initialize AuthModule (if available)
    if (window.AuthModule) {
      console.log('[App] Initializing AuthModule...');
      this.modules.auth = new window.AuthModule(this);
      await this.modules.auth.initialize();

      // Initialize AuthUI (if available)
      if (window.AuthUI) {
        console.log('[App] Initializing AuthUI...');
        this.modules.authUI = new window.AuthUI(this);
        this.modules.authUI.initialize(this.modules.auth);
      }
    }

    // Initialize CompletionModule (if available)
    if (window.CompletionModule) {
      console.log('[App] Initializing CompletionModule...');
      try {
        this.modules.completion = new window.CompletionModule(this);
        await this.modules.completion.initialize();

        // Initialize CompletionUI (if available)
        if (window.CompletionUI) {
          console.log('[App] Initializing CompletionUI...');
          this.modules.completionUI = new window.CompletionUI(this);
          this.modules.completionUI.initialize(this.modules.completion);
        }
      } catch (error) {
        console.error('[App] Error initializing CompletionModule:', error);
      }
    } else {
      console.warn('[App] CompletionModule not found in window object');
    }

    // Initialize FlagModule (if available)
    if (window.FlagModule) {
      console.log('[App] Initializing FlagModule...');
      try {
        this.modules.flag = new window.FlagModule(this);
        await this.modules.flag.initialize();

        // Initialize FlagUI (if available)
        if (window.FlagUI) {
          console.log('[App] Initializing FlagUI...');
          this.modules.flagUI = new window.FlagUI(this);
          this.modules.flagUI.initialize(this.modules.flag);
        }
      } catch (error) {
        console.error('[App] Error initializing FlagModule:', error);
      }
    } else {
      console.warn('[App] FlagModule not found in window object');
    }

    // For now, other modules will initialize themselves
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
    return this.firebaseService;
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
    return this.firebaseService.getCurrentUser();
  }

  /**
   * Check if user is signed in (shortcut)
   * @returns {boolean}
   */
  isSignedIn() {
    return this.firebaseService.isSignedIn();
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
