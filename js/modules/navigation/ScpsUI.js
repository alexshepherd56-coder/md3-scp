/**
 * ScpsUI - SCPs User Interface Handler
 *
 * Responsibilities:
 * - Render filtered case cards
 * - Update sidebar progress bars
 * - Update case counts
 * - Handle specialty/group click events
 * - Handle search input events
 * - Show/hide weeks based on filters
 *
 * NO business logic - all logic in ScpsModule
 */

class ScpsUI {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.scpsModule = null;

    // DOM references
    this.specialties = null;
    this.weekSections = null;
    this.groupHeaders = null;
    this.searchInput = null;
    this.mobileSearchInput = null;
    this.mainElement = null;
  }

  /**
   * Initialize UI handlers
   */
  initialize(scpsModule) {
    console.log('[ScpsUI] Initializing...');

    this.scpsModule = scpsModule;

    // Cache DOM references
    this.cacheDOMReferences();

    // Set up event listeners
    this.setupEventListeners();

    // Set up click handlers
    this.setupClickHandlers();

    // Set up search handlers
    this.setupSearchHandlers();

    // Initial counts update
    this.updateCounts();

    console.log('[ScpsUI] Initialized successfully');
  }

  /**
   * Cache DOM element references
   */
  cacheDOMReferences() {
    this.specialties = document.querySelectorAll('.specialty');
    this.weekSections = document.querySelectorAll('.week');
    this.groupHeaders = document.querySelectorAll('h2[data-group]');
    this.searchInput = document.getElementById('searchInput');
    this.mobileSearchInput = document.getElementById('mobileSearchInput');
    this.mainElement = document.querySelector('.main');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for filter changes
    this.eventBus.on('scps:filter-changed', (data) => {
      this.handleFilterChange(data);
    });

    // Listen for search changes
    this.eventBus.on('scps:search-changed', (data) => {
      this.handleSearchChange(data);
    });

    // Listen for completion changes
    this.eventBus.on('completion:initialized', () => {
      setTimeout(() => this.updateSidebarProgress(), 100);
    });

    this.eventBus.on('completion:loaded-from-local', () => {
      this.updateSidebarProgress();
    });

    this.eventBus.on('completion:case-completed', () => {
      this.updateSidebarProgress();
    });

    this.eventBus.on('completion:case-uncompleted', () => {
      this.updateSidebarProgress();
    });

    this.eventBus.on('completion:synced', () => {
      this.updateSidebarProgress();
    });

    this.eventBus.on('app:ready', () => {
      setTimeout(() => this.updateSidebarProgress(), 500);
    });

    // Legacy support
    window.addEventListener('completionDataLoaded', () => {
      this.updateSidebarProgress();
    });
  }

  /**
   * Set up specialty and group click handlers
   */
  setupClickHandlers() {
    // Specialty click handlers
    this.specialties.forEach(spec => {
      spec.addEventListener('click', () => {
        window._userInteracted = true; // Mark user interaction
        const filter = spec.dataset.filter;
        this.scpsModule.applySpecialtyFilter(filter);

        // Expand SCPs if collapsed
        if (window.expandScps && window.scpsState && !window.scpsState.isExpanded) {
          window.expandScps();
        }
      });
    });

    // Group click handlers
    this.groupHeaders.forEach(group => {
      group.addEventListener('click', () => {
        window._userInteracted = true; // Mark user interaction
        const groupName = group.dataset.group;
        this.scpsModule.applyGroupFilter(groupName);
      });
    });
  }

  /**
   * Set up search input handlers
   */
  setupSearchHandlers() {
    // Desktop search
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        this.scpsModule.applySearch(searchTerm);

        // Sync with mobile
        if (this.mobileSearchInput) {
          this.mobileSearchInput.value = e.target.value;
        }
      });
    }

    // Mobile search
    if (this.mobileSearchInput) {
      this.mobileSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        this.scpsModule.applySearch(searchTerm);

        // Sync with desktop
        if (this.searchInput) {
          this.searchInput.value = e.target.value;
        }
      });
    }
  }

  /**
   * Handle filter change from module
   */
  handleFilterChange(data) {
    console.log('[ScpsUI] Handling filter change:', data);

    // Clear active states
    this.specialties.forEach(s => s.classList.remove('active'));
    this.groupHeaders.forEach(g => g.classList.remove('active'));

    // Remove active from Past Exams section
    const pastExamsSection = document.getElementById('pastExamsSection');
    if (pastExamsSection) pastExamsSection.classList.remove('active');

    if (data.type === 'specialty') {
      // Set active on specialty
      const spec = document.querySelector(`.specialty[data-filter="${data.filter}"]`);
      if (spec) spec.classList.add('active');

      // Apply filter to cards
      this.applyFilterBySpecialty(data.filter);
    } else if (data.type === 'group') {
      // Set active on group
      const group = document.querySelector(`h2[data-group="${data.filter}"]`);
      if (group) group.classList.add('active');

      // Apply filter to cards
      this.applyFilterByGroup(data.filters);
    } else if (data.type === 'flagged') {
      // Set active on flagged group
      const group = document.querySelector('h2[data-group="flagged"]');
      if (group) group.classList.add('active');

      // Apply flagged filter
      this.showFlaggedCasesOnly();
    }

    // Scroll to top
    this.scrollToTop();
  }

  /**
   * Handle search change from module
   */
  handleSearchChange(data) {
    console.log('[ScpsUI] Handling search change:', data);

    const searchTerm = data.searchTerm;

    // Clear active states when searching
    this.specialties.forEach(s => s.classList.remove('active'));
    this.groupHeaders.forEach(g => g.classList.remove('active'));

    // Show all weeks initially
    this.weekSections.forEach(week => {
      week.style.display = 'block';
      week.nextElementSibling.style.display = 'flex';
    });

    let hasResults = false;

    // Filter cards based on search term
    const allCards = document.querySelectorAll('#scpsMainContent .case-card');
    allCards.forEach(card => {
      const cardText = card.textContent.toLowerCase();
      if (cardText.includes(searchTerm)) {
        card.style.display = 'flex';
        hasResults = true;
      } else {
        card.style.display = 'none';
      }
    });

    // Hide empty weeks
    this.weekSections.forEach(week => {
      const grid = week.nextElementSibling;
      const visibleCards = Array.from(grid.querySelectorAll('.case-card'))
        .filter(card => card.style.display !== 'none');

      if (visibleCards.length === 0) {
        week.style.display = 'none';
        grid.style.display = 'none';
      }
    });

    if (!hasResults) {
      console.log('[ScpsUI] No cases found for:', searchTerm);
    }
  }

  /**
   * Apply specialty filter to cards
   */
  applyFilterBySpecialty(filter) {
    document.querySelectorAll('#scpsMainContent .case-card').forEach(card => {
      card.style.display = card.classList.contains(filter) ? 'flex' : 'none';
    });

    this.updateWeekVisibility((card) => card.classList.contains(filter));
  }

  /**
   * Apply group filter to cards
   */
  applyFilterByGroup(filters) {
    document.querySelectorAll('#scpsMainContent .case-card').forEach(card => {
      card.style.display = filters.some(f => card.classList.contains(f)) ? 'flex' : 'none';
    });

    this.updateWeekVisibility((card) => filters.some(f => card.classList.contains(f)));
  }

  /**
   * Show only flagged cases
   */
  showFlaggedCasesOnly() {
    const flaggedCaseIds = this.scpsModule.getFlaggedCaseIds();

    document.querySelectorAll('#scpsMainContent .case-card').forEach(card => {
      const href = card.getAttribute('href');
      const match = href ? href.match(/case(\d+_\d+)/) : null;

      if (match) {
        const caseId = match[1];
        card.style.display = flaggedCaseIds.includes(caseId) ? 'flex' : 'none';
      } else {
        card.style.display = 'none';
      }
    });

    this.updateWeekVisibility((card) => card.style.display === 'flex');
  }

  /**
   * Update week visibility based on filter function
   */
  updateWeekVisibility(filterFn) {
    let firstVisibleWeek = null;

    this.weekSections.forEach(week => {
      const grid = week.nextElementSibling;
      const hasCases = Array.from(grid.querySelectorAll('.case-card')).some(filterFn);

      week.style.display = hasCases ? 'block' : 'none';
      grid.style.display = hasCases ? 'flex' : 'none';

      // Track first visible week
      if (hasCases && !firstVisibleWeek) {
        firstVisibleWeek = week;
      }

      // Remove first-visible class from all
      week.classList.remove('first-visible-week');
    });

    // Add first-visible class to the first visible week
    if (firstVisibleWeek) {
      firstVisibleWeek.classList.add('first-visible-week');
    }
  }

  /**
   * Scroll to top of main content
   */
  scrollToTop() {
    if (this.mainElement) {
      this.mainElement.scrollTop = 0;
    }
  }

  /**
   * Update case counts in sidebar
   */
  updateCounts() {
    const allCaseCards = document.querySelectorAll('#scpsMainContent .case-card');
    const groupTotals = { all: 0, medicine: 0, surgery: 0 };

    const medicineSpecialties = ['general', 'medicine', 'cardiology', 'psychiatry', 'paediatrics', 'neurology', 'gastroenterology', 'endocrinology', 'renal', 'respiratory', 'rheumatology', 'haematology', 'og'];
    const surgerySpecialties = ['git', 'breast', 'ortho', 'vascular', 'surgery'];

    allCaseCards.forEach(card => {
      groupTotals.all += 1;

      const isMedicine = medicineSpecialties.some(spec => card.classList.contains(spec));
      const isSurgery = surgerySpecialties.some(spec => card.classList.contains(spec));

      if (isMedicine) groupTotals.medicine += 1;
      if (isSurgery) groupTotals.surgery += 1;
    });

    // Update the counts in the sidebar
    const allCountElement = document.querySelector('h2[data-group="all"] .count');
    const medicineCountElement = document.querySelector('h2[data-group="medicine"] .count');
    const surgeryCountElement = document.querySelector('h2[data-group="surgery"] .count');

    if (allCountElement) allCountElement.textContent = `(${groupTotals.all})`;
    if (medicineCountElement) medicineCountElement.textContent = `(${groupTotals.medicine})`;
    if (surgeryCountElement) surgeryCountElement.textContent = `(${groupTotals.surgery})`;
  }

  /**
   * Update sidebar progress bars
   */
  updateSidebarProgress() {
    const groupFilters = this.scpsModule.getGroupFilters();

    // Update group progress bars
    ['all', 'medicine', 'surgery'].forEach(group => {
      const groupHeader = document.querySelector(`h2[data-group="${group}"]`);
      if (!groupHeader) return;

      const stats = this.scpsModule.getStatsByGroup(groupFilters[group]);
      this.updateHeadingProgress(groupHeader, stats);
    });

    // Update specialty progress bars
    this.specialties.forEach(spec => {
      const filter = spec.dataset.filter;
      const stats = this.scpsModule.getStatsBySpecialty(filter);
      this.updateHeadingProgress(spec, stats);
    });
  }

  /**
   * Update progress bar for a heading element
   */
  updateHeadingProgress(element, stats) {
    let completionText = element.querySelector('.completion-text');
    let completionBar = element.querySelector('.completion-bar');

    if (!completionText) {
      completionText = document.createElement('div');
      completionText.className = 'completion-text';
      element.appendChild(completionText);
    }

    if (!completionBar) {
      completionBar = document.createElement('div');
      completionBar.className = 'completion-bar';
      completionBar.innerHTML = '<div class="completion-bar-fill" style="width: 0%"></div>';
      element.appendChild(completionBar);
    }

    // Update completion text - HIDDEN per user request
    completionText.textContent = ``;

    // Update progress bar width
    const progressFill = element.querySelector('.completion-bar-fill');
    if (progressFill) {
      progressFill.style.width = `${stats.percentage}%`;
    }
  }
}

// Make globally available
window.ScpsUI = ScpsUI;
