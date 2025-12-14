/**
 * ScpsModule - SCPs Filtering and Search Logic
 *
 * Responsibilities:
 * - Apply specialty filters
 * - Apply group filters (all, medicine, surgery, flagged)
 * - Search functionality
 * - Coordinate with CompletionModule and FlagModule
 *
 * NO UI manipulation - emit events for ScpsUI to handle
 */

class ScpsModule {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.firebaseService = app.firebaseService;

    // Filter state
    this.currentFilter = null;
    this.currentFilterType = null; // 'specialty', 'group', 'search'
    this.searchTerm = '';

    // Filter definitions
    this.groupFilters = {
      all: ['cardiology', 'psychiatry', 'paediatrics', 'neurology', 'gastroenterology', 'endocrinology', 'renal', 'respiratory', 'rheumatology', 'haematology', 'og', 'git', 'general', 'breast', 'ortho', 'vascular', 'medicine', 'surgery'],
      medicine: ['general', 'medicine', 'cardiology', 'psychiatry', 'paediatrics', 'neurology', 'gastroenterology', 'endocrinology', 'renal', 'respiratory', 'rheumatology', 'haematology', 'og'],
      surgery: ['git', 'breast', 'ortho', 'vascular', 'surgery']
    };

    this.initialized = false;
  }

  /**
   * Initialize the SCPs module
   */
  async initialize() {
    if (this.initialized) {
      console.warn('[ScpsModule] Already initialized');
      return;
    }

    console.log('[ScpsModule] Initializing...');

    // Set up event listeners
    this.setupEventListeners();

    this.initialized = true;
    console.log('[ScpsModule] Initialized successfully');
    this.eventBus.emit('scps:initialized');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for navigation view initialization
    this.eventBus.on('nav:initialize-view', (data) => {
      this.handleViewInitialization(data.filter);
    });

    // Listen for completion changes to update stats
    this.eventBus.on('completion:case-completed', () => {
      this.eventBus.emit('scps:stats-changed');
    });

    this.eventBus.on('completion:case-uncompleted', () => {
      this.eventBus.emit('scps:stats-changed');
    });
  }

  /**
   * Handle view initialization from navigation
   */
  handleViewInitialization(filter) {
    if (filter === 'none' || filter === 'past-exams' || filter.startsWith('weekly-')) {
      return; // Not an SCPs filter
    }

    // Check if it's a group filter
    if (['all', 'medicine', 'surgery', 'flagged'].includes(filter)) {
      this.applyGroupFilter(filter);
    } else {
      // It's a specialty filter
      this.applySpecialtyFilter(filter);
    }
  }

  /**
   * Apply specialty filter
   */
  applySpecialtyFilter(specialty) {
    console.log('[ScpsModule] Applying specialty filter:', specialty);

    this.currentFilter = specialty;
    this.currentFilterType = 'specialty';
    this.searchTerm = '';

    // Request view change
    this.eventBus.emit('scps:request-show');

    // Emit filter changed event for UI
    this.eventBus.emit('scps:filter-changed', {
      filter: specialty,
      type: 'specialty'
    });

    // Save to navigation
    const navModule = this.app.getModule('navigation');
    if (navModule) {
      navModule.saveFilter(specialty);
    }
  }

  /**
   * Apply group filter
   */
  applyGroupFilter(group) {
    console.log('[ScpsModule] Applying group filter:', group);

    this.currentFilter = group;
    this.currentFilterType = 'group';
    this.searchTerm = '';

    // Request view change
    this.eventBus.emit('scps:request-show');

    // Special handling for flagged filter
    if (group === 'flagged') {
      this.eventBus.emit('scps:filter-changed', {
        filter: 'flagged',
        type: 'flagged'
      });
    } else {
      const filters = this.groupFilters[group] || [];
      this.eventBus.emit('scps:filter-changed', {
        filter: group,
        type: 'group',
        filters: filters
      });
    }

    // Save to navigation
    const navModule = this.app.getModule('navigation');
    if (navModule) {
      navModule.saveFilter(group);
    }
  }

  /**
   * Apply search filter
   */
  applySearch(searchTerm) {
    console.log('[ScpsModule] Applying search:', searchTerm);

    this.searchTerm = searchTerm;
    this.currentFilterType = 'search';

    if (searchTerm === '') {
      // Restore previous filter
      if (this.currentFilter && this.currentFilterType) {
        if (this.currentFilterType === 'specialty') {
          this.applySpecialtyFilter(this.currentFilter);
        } else if (this.currentFilterType === 'group') {
          this.applyGroupFilter(this.currentFilter);
        }
      }
    } else {
      this.eventBus.emit('scps:search-changed', {
        searchTerm: searchTerm
      });
    }
  }

  /**
   * Get flagged case IDs from FlagModule
   */
  getFlaggedCaseIds() {
    // Support both new and old flag systems
    if (this.app.getModule('flag')) {
      return this.app.getModule('flag').getAllFlaggedCases().map(f => f.caseId);
    } else if (window.flagTracker) {
      return window.flagTracker.getAllFlaggedCases().map(f => f.caseId);
    }
    return [];
  }

  /**
   * Get completion stats for a specialty
   */
  getStatsBySpecialty(specialty) {
    const completionUI = this.app.getModule('completionUI') || window.completionTracker;
    if (completionUI && completionUI.getStatsBySpecialty) {
      return completionUI.getStatsBySpecialty(specialty);
    }
    return { total: 0, completed: 0, percentage: 0 };
  }

  /**
   * Get completion stats for a group
   */
  getStatsByGroup(filters) {
    const completionUI = this.app.getModule('completionUI') || window.completionTracker;
    if (completionUI && completionUI.getStatsByGroup) {
      return completionUI.getStatsByGroup(filters);
    }
    return { total: 0, completed: 0, percentage: 0 };
  }

  /**
   * Get group filters definition
   */
  getGroupFilters() {
    return this.groupFilters;
  }
}

// Make globally available
window.ScpsModule = ScpsModule;
