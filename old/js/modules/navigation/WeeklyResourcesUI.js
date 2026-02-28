/**
 * WeeklyResourcesUI - Weekly Resources User Interface Handler
 *
 * Responsibilities:
 * - Show/hide weekly resource content
 * - Update active states on resource items
 * - Expand/collapse resource dropdown
 *
 * NO business logic - all logic in WeeklyResourcesModule
 */

class WeeklyResourcesUI {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.resourcesModule = null;

    // DOM references
    this.weeklyResourcesToggle = null;
  }

  /**
   * Initialize UI handlers
   */
  initialize(resourcesModule) {
    console.log('[WeeklyResourcesUI] Initializing...');

    this.resourcesModule = resourcesModule;

    // Cache DOM references
    this.cacheDOMReferences();

    // Set up event listeners
    this.setupEventListeners();

    console.log('[WeeklyResourcesUI] Initialized successfully');
  }

  /**
   * Cache DOM element references
   */
  cacheDOMReferences() {
    this.weeklyResourcesToggle = document.getElementById('weeklyResourcesToggle');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for resource changes
    this.eventBus.on('resources:resource-changed', (data) => {
      this.handleResourceChange(data);
    });

    // Set up click handlers for weekly resource items
    document.querySelectorAll('[data-weekly-resource]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation(); // Prevent any other handlers

        // Mark that user has interacted
        window._userInteracted = true;

        const resourceId = item.dataset.weeklyResource;
        console.log('[WeeklyResourcesUI] Resource item clicked:', resourceId);
        this.resourcesModule.showResource(resourceId);
      }, true); // Use capture phase to run before other handlers
    });
  }

  /**
   * Handle resource change
   */
  handleResourceChange(data) {
    console.log('[WeeklyResourcesUI] Handling resource change:', data);

    const resourceId = data.resourceId;

    // Hide all weekly resource content divs
    const weeklyResourcesMainContent = document.getElementById('weeklyResourcesMainContent');
    if (weeklyResourcesMainContent) {
      const allWeeklyContents = weeklyResourcesMainContent.querySelectorAll('div[id^="w"][id$="-content"]');
      console.log('[WeeklyResourcesUI] Found weekly content divs:', allWeeklyContents.length);

      // Log which divs are currently visible before hiding
      allWeeklyContents.forEach(content => {
        const computedStyle = window.getComputedStyle(content);
        if (computedStyle.display !== 'none') {
          console.log('[WeeklyResourcesUI] Currently visible:', content.id);
        }
        content.style.display = 'none';
      });
      console.log('[WeeklyResourcesUI] All weekly content divs hidden');
    }

    // Show the selected weekly resource content
    const selectedContent = document.getElementById(resourceId + '-content');
    if (selectedContent) {
      selectedContent.style.display = 'block';
      console.log('[WeeklyResourcesUI] Showing content:', resourceId + '-content');

      // Notify other modules that content has changed (for badge updates, etc.)
      this.eventBus.emit('navigation:content-changed', { contentId: resourceId });
    } else {
      console.error('[WeeklyResourcesUI] Could not find content:', resourceId + '-content');
    }

    // Expand weekly resources dropdown
    if (this.weeklyResourcesToggle && window.expandWeeklyResources) {
      window.expandWeeklyResources();
      this.weeklyResourcesToggle.classList.add('active');
    }

    // Set active state on the weekly resource item
    document.querySelectorAll('[data-weekly-resource]').forEach(item => {
      item.classList.remove('active');
    });

    const weeklyResourceItem = document.querySelector(`[data-weekly-resource="${resourceId}"]`);
    if (weeklyResourceItem) {
      weeklyResourceItem.classList.add('active');
    }

    // Ensure SCPs is collapsed and not active
    if (window.collapseScps) {
      window.collapseScps();
    }

    const scpsToggle = document.getElementById('scpsToggle');
    if (scpsToggle) {
      scpsToggle.classList.remove('active');
    }
  }
}

// Make globally available
window.WeeklyResourcesUI = WeeklyResourcesUI;
