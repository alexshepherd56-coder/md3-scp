/**
 * NavigationModule - Central Navigation Coordinator
 *
 * Responsibilities:
 * - Welcome page show/hide
 * - Mobile menu toggle
 * - View switching (scps/exams/resources)
 * - Scroll position save/restore
 * - Filter state persistence
 * - URL parameter handling
 *
 * NO feature-specific logic (SCPs, Exams, Resources)
 * Coordinates between features via EventBus
 */

class NavigationModule {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.firebaseService = app.firebaseService;

    // Navigation state
    this.currentFilter = 'none';
    this.initialized = false;

    // DOM references
    this.welcomePage = null;
    this.pastExamsContent = null;
    this.scpsMainContent = null;
    this.weeklyResourcesMainContent = null;
    this.sidebar = null;
    this.mainElement = null;
    this.mobileMenuToggle = null;
    this.sidebarOverlay = null;
  }

  /**
   * Initialize the navigation module
   */
  async initialize() {
    if (this.initialized) {
      console.warn('[NavigationModule] Already initialized');
      return;
    }

    console.log('[NavigationModule] Initializing...');

    // Cache DOM references
    this.cacheDOMReferences();

    // Set up event listeners
    this.setupEventListeners();

    // Set up mobile menu
    this.setupMobileMenu();

    // Set up scroll position saving
    this.setupScrollPositionSaving();

    this.initialized = true;
    console.log('[NavigationModule] Initialized successfully');
    this.eventBus.emit('navigation:initialized');
  }

  /**
   * Cache DOM element references
   */
  cacheDOMReferences() {
    this.welcomePage = document.getElementById('welcomePage');
    this.pastExamsContent = document.getElementById('pastExamsContent');
    this.scpsMainContent = document.getElementById('scpsMainContent');
    this.weeklyResourcesMainContent = document.getElementById('weeklyResourcesMainContent');
    this.sidebar = document.querySelector('.sidebar');
    this.mainElement = document.querySelector('.main');
    this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
    this.sidebarOverlay = document.getElementById('sidebarOverlay');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for view change requests from feature modules
    this.eventBus.on('scps:request-show', () => this.showScpsView());
    this.eventBus.on('exams:request-show', () => this.showExamsView());
    this.eventBus.on('resources:request-show', () => this.showResourcesView());

    // Listen for case card clicks to save state
    this.setupCaseCardClickHandlers();
  }

  /**
   * Set up mobile menu functionality
   */
  setupMobileMenu() {
    if (this.mobileMenuToggle) {
      this.mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());
    }

    if (this.sidebarOverlay) {
      this.sidebarOverlay.addEventListener('click', () => this.closeMobileMenu());
    }

    // Close mobile menu when filter is selected
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('specialty') || e.target.closest('h2[data-group]')) {
        setTimeout(() => this.closeMobileMenu(), 200);
      }
    });
  }

  /**
   * Set up scroll position saving
   */
  setupScrollPositionSaving() {
    let scrollSaveTimeout;
    const saveScrollPositions = () => {
      clearTimeout(scrollSaveTimeout);
      scrollSaveTimeout = setTimeout(() => {
        if (this.mainElement) {
          localStorage.setItem('mainScrollPosition', this.mainElement.scrollTop);
        }
        if (this.sidebar) {
          localStorage.setItem('sidebarScrollPosition', this.sidebar.scrollTop);
        }
      }, 100);
    };

    if (this.mainElement) {
      this.mainElement.addEventListener('scroll', saveScrollPositions);
    }
    if (this.sidebar) {
      this.sidebar.addEventListener('scroll', saveScrollPositions);
    }
  }

  /**
   * Set up case card click handlers to save state
   */
  setupCaseCardClickHandlers() {
    document.querySelectorAll('.case-card:not(.exam-type-card)').forEach(card => {
      card.addEventListener('click', (e) => {
        // Get current active filter
        const activeSpec = document.querySelector('.specialty.active');
        const activeGroup = document.querySelector('h2[data-group].active');

        let filterToSave = 'all';

        if (activeSpec) {
          filterToSave = activeSpec.dataset.filter;
        } else if (activeGroup) {
          filterToSave = activeGroup.dataset.group;
        } else {
          // No active filter, detect from card classes
          const cardClasses = Array.from(card.classList);
          const specialtyClass = cardClasses.find(cls =>
            ['cardiology', 'psychiatry', 'paediatrics', 'neurology', 'gastroenterology',
             'endocrinology', 'renal', 'respiratory', 'rheumatology', 'haematology', 'og',
             'git', 'general', 'breast', 'ortho', 'vascular'].includes(cls)
          );
          if (specialtyClass) {
            filterToSave = specialtyClass;
          }
        }

        // Save scroll positions
        const mainScrollPosition = this.mainElement ? this.mainElement.scrollTop : 0;
        const sidebarScrollPosition = this.sidebar ? this.sidebar.scrollTop : 0;

        console.log('[NavigationModule] Case card clicked, saving filter:', filterToSave);
        this.saveFilter(filterToSave);
        localStorage.setItem('mainScrollPosition', mainScrollPosition);
        localStorage.setItem('sidebarScrollPosition', sidebarScrollPosition);
      }, true); // Use capturing phase
    });
  }

  /**
   * Show welcome page
   */
  async showWelcomePage() {
    console.log('[NavigationModule] Showing welcome page');

    if (this.welcomePage) this.welcomePage.style.display = 'flex';
    if (this.pastExamsContent) this.pastExamsContent.style.display = 'none';
    if (this.scpsMainContent) this.scpsMainContent.style.display = 'none';
    if (this.weeklyResourcesMainContent) this.weeklyResourcesMainContent.style.display = 'none';

    // Clear active states
    document.querySelectorAll('.sidebar h2').forEach(h => h.classList.remove('active'));
    document.querySelectorAll('.specialty').forEach(s => s.classList.remove('active'));

    // Collapse SCPs section
    if (window.collapseScps) {
      window.collapseScps();
    }

    // Update greeting with user's first name
    await this.updateWelcomeGreeting();

    this.saveFilter('none');

    this.eventBus.emit('nav:welcome-shown');
    this.eventBus.emit('welcome:shown'); // Legacy event for exam countdown
  }

  /**
   * Update welcome greeting with user's name
   */
  async updateWelcomeGreeting() {
    const greetingElement = document.getElementById('welcomeGreeting');
    if (!greetingElement) return;

    let firstName = null;
    const user = this.firebaseService.getCurrentUser();

    if (user) {
      // Try to get from Firestore first
      try {
        const db = this.firebaseService.getDb();
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData.displayName && userData.displayName.trim()) {
            const displayName = userData.displayName.trim();
            if (displayName.includes('@')) {
              firstName = this.extractNameFromEmail(displayName);
            } else if (this.isEmailUsername(displayName)) {
              firstName = this.extractNameFromEmailUsername(displayName);
            } else {
              firstName = displayName.split(' ')[0];
            }
          }
        }
      } catch (error) {
        console.warn('[NavigationModule] Could not fetch user data from Firestore:', error);
      }

      // Fallback to Firebase user profile
      if (!firstName && user.displayName && user.displayName.trim()) {
        const displayName = user.displayName.trim();
        if (displayName.includes('@')) {
          firstName = this.extractNameFromEmail(displayName);
        } else if (this.isEmailUsername(displayName)) {
          firstName = this.extractNameFromEmailUsername(displayName);
        } else {
          firstName = displayName.split(' ')[0];
        }
      }

      // Last resort: extract from email
      if (!firstName && user.email) {
        firstName = this.extractNameFromEmail(user.email);
      }
    }

    greetingElement.textContent = `Hey there${firstName ? ', ' + firstName : ''}`;
  }

  /**
   * Helper: Check if string looks like an email username
   */
  isEmailUsername(str) {
    return /[._\d]/.test(str) && !/\s/.test(str);
  }

  /**
   * Helper: Extract name from email username
   */
  extractNameFromEmailUsername(username) {
    let name = username.split(/[._\d]/)[0];
    if (name && name.length > 0) {
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    return null;
  }

  /**
   * Helper: Extract name from full email
   */
  extractNameFromEmail(email) {
    const username = email.split('@')[0];
    return this.extractNameFromEmailUsername(username);
  }

  /**
   * Hide welcome page
   */
  hideWelcomePage() {
    if (this.welcomePage) this.welcomePage.style.display = 'none';
  }

  /**
   * Show SCPs view
   */
  showScpsView() {
    this.hideWelcomePage();
    if (this.scpsMainContent) this.scpsMainContent.style.display = 'block';
    if (this.pastExamsContent) this.pastExamsContent.style.display = 'none';
    if (this.weeklyResourcesMainContent) this.weeklyResourcesMainContent.style.display = 'none';

    this.eventBus.emit('nav:view-changed', { view: 'scps' });
  }

  /**
   * Show Exams view
   */
  showExamsView() {
    this.hideWelcomePage();
    if (this.pastExamsContent) this.pastExamsContent.style.display = 'block';
    if (this.scpsMainContent) this.scpsMainContent.style.display = 'none';
    if (this.weeklyResourcesMainContent) this.weeklyResourcesMainContent.style.display = 'none';

    this.eventBus.emit('nav:view-changed', { view: 'exams' });
  }

  /**
   * Show Resources view
   */
  showResourcesView() {
    this.hideWelcomePage();
    if (this.weeklyResourcesMainContent) this.weeklyResourcesMainContent.style.display = 'block';
    if (this.scpsMainContent) this.scpsMainContent.style.display = 'none';
    if (this.pastExamsContent) this.pastExamsContent.style.display = 'none';

    this.eventBus.emit('nav:view-changed', { view: 'resources' });
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    if (this.sidebar) this.sidebar.classList.toggle('open');
    if (this.sidebarOverlay) this.sidebarOverlay.classList.toggle('active');
    this.eventBus.emit('nav:mobile-menu-toggled');
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    if (this.sidebar) this.sidebar.classList.remove('open');
    if (this.sidebarOverlay) this.sidebarOverlay.classList.remove('active');
  }

  /**
   * Save current filter to localStorage
   */
  saveFilter(filter) {
    this.currentFilter = filter;
    localStorage.setItem('currentFilter', filter);
    console.log('[NavigationModule] Filter saved:', filter);
  }

  /**
   * Get current filter
   */
  getCurrentFilter() {
    return this.currentFilter;
  }

  /**
   * Restore scroll positions from localStorage
   */
  restoreScrollPositions() {
    const urlParams = new URLSearchParams(window.location.search);
    const scrollParam = urlParams.get('scroll');
    const sidebarScrollParam = urlParams.get('sidebarScroll');

    const storedMainScroll = localStorage.getItem('mainScrollPosition');
    const storedSidebarScroll = localStorage.getItem('sidebarScrollPosition');

    const mainScrollPosition = scrollParam ? parseInt(scrollParam, 10) :
                              (storedMainScroll ? parseInt(storedMainScroll, 10) : 0);
    const sidebarScrollPosition = sidebarScrollParam ? parseInt(sidebarScrollParam, 10) :
                                 (storedSidebarScroll ? parseInt(storedSidebarScroll, 10) : 0);

    if (mainScrollPosition > 0 || sidebarScrollPosition > 0) {
      console.log('[NavigationModule] Restoring scroll positions - main:', mainScrollPosition, 'sidebar:', sidebarScrollPosition);

      // Restore immediately
      if (this.mainElement && mainScrollPosition > 0) {
        this.mainElement.scrollTop = mainScrollPosition;
      }
      if (this.sidebar && sidebarScrollPosition > 0) {
        this.sidebar.scrollTop = sidebarScrollPosition;
      }

      // Also restore after delay to ensure content is rendered
      setTimeout(() => {
        if (this.mainElement && mainScrollPosition > 0) {
          this.mainElement.scrollTop = mainScrollPosition;
        }
        if (this.sidebar && sidebarScrollPosition > 0) {
          this.sidebar.scrollTop = sidebarScrollPosition;
        }
      }, 150);
    }
  }

  /**
   * Initialize correct view based on URL params or saved filter
   * Called after all modules are loaded
   */
  initializeView() {
    console.log('[NavigationModule] Initializing view...');

    // Check for hash first - takes priority
    if (window.location.hash === '#past-exams') {
      console.log('[NavigationModule] Navigating to Past Exams from hash');
      history.replaceState(null, null, ' ');
      this.eventBus.emit('exams:navigate-from-hash');
      return;
    }

    // Check for URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    const storedFilter = localStorage.getItem('currentFilter');

    const initialFilter = filterParam || storedFilter || 'none';
    console.log('[NavigationModule] Initial filter:', initialFilter);

    // Emit initialization event with filter
    this.eventBus.emit('nav:initialize-view', { filter: initialFilter });

    // Restore scroll positions
    this.restoreScrollPositions();
  }
}

// Make globally available
window.NavigationModule = NavigationModule;

// Also export for legacy compatibility
window.showWelcomePage = async function() {
  if (window.app && window.app.getModule('navigation')) {
    await window.app.getModule('navigation').showWelcomePage();
  }
};
