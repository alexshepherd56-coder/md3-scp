// CompletionUI.js - Completion tracking UI handling (no business logic)
// Listens to completion events and updates the DOM

class CompletionUI {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.completionModule = null;
  }

  /**
   * Initialize the UI module
   * @param {CompletionModule} completionModule - Reference to completion module
   */
  initialize(completionModule) {
    console.log('[CompletionUI] Initializing...');
    this.completionModule = completionModule;

    // Listen to completion events
    this.setupEventListeners();

    // Initial UI update
    this.updateAllUI();

    console.log('[CompletionUI] Initialized successfully');
  }

  /**
   * Set up event listeners for completion events
   */
  setupEventListeners() {
    // Listen for case completed
    this.eventBus.on('completion:case-completed', (data) => {
      console.log('[CompletionUI] Case completed:', data.caseId);
      this.updateAllUI();
      this.showCompletionFeedback(data.caseId);
    });

    // Listen for case uncompleted
    this.eventBus.on('completion:case-uncompleted', (data) => {
      console.log('[CompletionUI] Case uncompleted:', data.caseId);
      this.updateAllUI();
    });

    // Listen for data sync
    this.eventBus.on('completion:synced', (data) => {
      console.log('[CompletionUI] Data synced:', data);
      this.updateAllUI();
    });

    // Listen for data cleared
    this.eventBus.on('completion:data-cleared', () => {
      console.log('[CompletionUI] Data cleared');
      this.updateAllUI();
    });

    // Listen for errors
    this.eventBus.on('completion:error', (data) => {
      console.error('[CompletionUI] Completion error:', data);
      this.showError(data.error);
    });

    // Dispatch legacy event for backwards compatibility
    this.eventBus.on('completion:synced', () => {
      window.dispatchEvent(new CustomEvent('completionDataLoaded'));
    });
  }

  /**
   * Update all UI elements
   */
  updateAllUI() {
    this.updateCaseCards();
    this.updateProgressStats();
    this.updateCurrentCaseButton();
  }

  /**
   * Update case cards with completion badges
   */
  updateCaseCards() {
    const cards = document.querySelectorAll('.case-card');

    cards.forEach(card => {
      const caseId = this.getCaseIdFromCard(card);
      if (!caseId) return;

      // Remove existing badges
      const existingBadge = card.querySelector('.completion-badge');
      const existingIncompleteBadge = card.querySelector('.completion-badge-incomplete');
      if (existingBadge) existingBadge.remove();
      if (existingIncompleteBadge) existingIncompleteBadge.remove();

      // Add badge based on completion status
      if (this.completionModule.isCompleted(caseId)) {
        // Completed case - green checkmark
        card.classList.add('completed');
        const badge = document.createElement('span');
        badge.className = 'completion-badge';
        badge.textContent = '✓';
        badge.title = 'Completed - Click to mark incomplete';
        badge.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.completionModule.markIncomplete(caseId);
        };
        card.appendChild(badge);
      } else {
        // Incomplete case - grey outline checkmark
        card.classList.remove('completed');
        const badge = document.createElement('span');
        badge.className = 'completion-badge-incomplete';
        badge.textContent = '✓';
        badge.title = 'Click to mark as complete';
        badge.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.completionModule.markCompleted(caseId);
        };
        card.appendChild(badge);
      }
    });
  }

  /**
   * Update progress statistics in sidebar
   * (Currently removes legacy stats element)
   */
  updateProgressStats() {
    // Remove legacy progress stats element if it exists
    const statsElement = document.getElementById('progressStats');
    if (statsElement) {
      statsElement.remove();
    }

    // Future: Could add new stats display here
    // For now, we're keeping it clean
  }

  /**
   * Update completion button on case page
   */
  updateCurrentCaseButton() {
    const button = document.getElementById('completionButton');
    if (!button) return;

    const caseId = this.getCurrentCaseId();
    if (!caseId) return;

    const isCompleted = this.completionModule.isCompleted(caseId);
    button.textContent = isCompleted ? 'Completed' : 'Mark as Complete';
    button.className = isCompleted ? 'completion-button completed' : 'completion-button';

    // Ensure click handler is set up
    button.onclick = () => {
      this.completionModule.toggleCompletion(caseId);
    };
  }

  /**
   * Show visual feedback when case is completed
   * @param {string} caseId - Case identifier
   */
  showCompletionFeedback(caseId) {
    // Future: Add confetti or celebration animation
    // For now, just a console message
    console.log('[CompletionUI] 🎉 Case completed:', caseId);

    // Could add confetti here in the future:
    // if (window.confetti) {
    //   confetti({ ... });
    // }
  }

  /**
   * Show error message to user
   * @param {string} message - Error message
   */
  showError(message) {
    console.error('[CompletionUI] Error:', message);
    // Future: Could show toast notification or modal
    // For now, errors are logged to console
  }

  /**
   * Extract case ID from card element
   * @param {HTMLElement} card - Case card element
   * @returns {string|null} Case ID or null
   */
  getCaseIdFromCard(card) {
    const href = card.getAttribute('href');
    if (!href) return null;

    // Match both /cases/case1_1 and /cases/case1_1.html
    const match = href.match(/case(\d+_\d+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract case ID from current page URL
   * @returns {string|null} Case ID or null
   */
  getCurrentCaseId() {
    const path = window.location.pathname;
    const match = path.match(/case(\d+_\d+)/);
    return match ? match[1] : null;
  }

  /**
   * Get completion statistics for UI display
   * @param {Array<string>} caseIds - Optional array of case IDs to calculate stats for
   * @returns {Object} { total, completed, percentage }
   */
  getStats(caseIds = null) {
    if (caseIds) {
      // Calculate stats for specific cases
      const completed = caseIds.filter(id => this.completionModule.isCompleted(id)).length;
      const total = caseIds.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { total, completed, percentage };
    } else {
      // Get overall stats from DOM
      const cards = document.querySelectorAll('.case-card');
      const total = cards.length;
      let completed = 0;

      cards.forEach(card => {
        const caseId = this.getCaseIdFromCard(card);
        if (caseId && this.completionModule.isCompleted(caseId)) {
          completed++;
        }
      });

      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { total, completed, percentage };
    }
  }

  /**
   * Get stats by specialty (e.g., "cardiology", "neuro")
   * @param {string} specialty - Specialty class name
   * @returns {Object} { total, completed, percentage }
   */
  getStatsBySpecialty(specialty) {
    const allCards = document.querySelectorAll(`.case-card.${specialty}`);
    const total = allCards.length;
    let completed = 0;

    allCards.forEach(card => {
      const caseId = this.getCaseIdFromCard(card);
      if (caseId && this.completionModule.isCompleted(caseId)) {
        completed++;
      }
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }

  /**
   * Get stats by group (e.g., medicine, surgery)
   * @param {Array<string>} groupFilters - Array of specialty class names
   * @returns {Object} { total, completed, percentage }
   */
  getStatsByGroup(groupFilters) {
    let total = 0;
    let completed = 0;

    groupFilters.forEach(filter => {
      const cards = document.querySelectorAll(`.case-card.${filter}`);
      total += cards.length;

      cards.forEach(card => {
        const caseId = this.getCaseIdFromCard(card);
        if (caseId && this.completionModule.isCompleted(caseId)) {
          completed++;
        }
      });
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }

  /**
   * Handle export button click
   * Creates and downloads JSON file with completion data
   */
  handleExport() {
    const data = this.completionModule.exportData();

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scp-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('[CompletionUI] Exported completion data');
  }

  /**
   * Handle import button click
   * Reads JSON file and imports completion data
   * @param {File} file - File object from input
   */
  async handleImport(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const result = await this.completionModule.importData(data);

      if (result.success) {
        console.log('[CompletionUI] Import successful');
        alert('Completion data imported successfully!');
      } else {
        console.error('[CompletionUI] Import failed:', result.error);
        alert('Import failed: ' + result.error);
      }
    } catch (error) {
      console.error('[CompletionUI] Import error:', error);
      alert('Failed to import data: ' + error.message);
    }
  }

  /**
   * Handle clear all button click
   * Confirms and clears all completion data
   */
  async handleClearAll() {
    if (!confirm('Are you sure you want to clear all completion data? This cannot be undone.')) {
      return;
    }

    const result = await this.completionModule.clearAll();

    if (result.success) {
      console.log('[CompletionUI] Clear successful');
      alert('All completion data cleared');
    } else {
      console.error('[CompletionUI] Clear failed:', result.error);
      alert('Failed to clear data: ' + result.error);
    }
  }
}

// Export for use in App.js
window.CompletionUI = CompletionUI;
