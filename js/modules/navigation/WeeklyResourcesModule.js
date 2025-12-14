/**
 * WeeklyResourcesModule - Weekly Resources State Management
 *
 * Responsibilities:
 * - Track current resource view
 * - Switch between weekly resources
 * - Manage resource state
 *
 * NO UI manipulation - emit events for WeeklyResourcesUI to handle
 */

class WeeklyResourcesModule {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.firebaseService = app.firebaseService;

    // State
    this.currentResource = null;
    this.initialized = false;
  }

  /**
   * Initialize the weekly resources module
   */
  async initialize() {
    if (this.initialized) {
      console.warn('[WeeklyResourcesModule] Already initialized');
      return;
    }

    console.log('[WeeklyResourcesModule] Initializing...');

    // Set up event listeners
    this.setupEventListeners();

    this.initialized = true;
    console.log('[WeeklyResourcesModule] Initialized successfully');
    this.eventBus.emit('resources:initialized');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for navigation view initialization
    this.eventBus.on('nav:initialize-view', (data) => {
      if (data.filter && data.filter.startsWith('weekly-')) {
        const resourceId = data.filter.replace('weekly-', '');
        this.showResource(resourceId);
      }
    });
  }

  /**
   * Show a specific weekly resource
   */
  showResource(resourceId) {
    console.log('[WeeklyResourcesModule] Showing resource:', resourceId);

    this.currentResource = resourceId;

    // Request view change
    this.eventBus.emit('resources:request-show');

    // Emit resource changed event for UI
    this.eventBus.emit('resources:resource-changed', {
      resourceId: resourceId
    });

    // Save to navigation
    const navModule = this.app.getModule('navigation');
    if (navModule) {
      navModule.saveFilter(`weekly-${resourceId}`);
    }
  }

  /**
   * Get current resource
   */
  getCurrentResource() {
    return this.currentResource;
  }
}

// Make globally available
window.WeeklyResourcesModule = WeeklyResourcesModule;
