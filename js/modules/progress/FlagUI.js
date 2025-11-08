// FlagUI.js - Flag tracking UI handling (no business logic)
// Listens to flag events and updates the DOM

class FlagUI {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.flagModule = null;
  }

  /**
   * Initialize the UI module
   * @param {FlagModule} flagModule - Reference to flag module
   */
  initialize(flagModule) {
    console.log('[FlagUI] Initializing...');
    this.flagModule = flagModule;

    // Listen to flag events
    this.setupEventListeners();

    // Initial UI update
    this.updateAllUI();

    console.log('[FlagUI] Initialized successfully');
  }

  /**
   * Set up event listeners for flag events
   */
  setupEventListeners() {
    // Listen for question flag events
    this.eventBus.on('flag:question-flagged', (data) => {
      console.log('[FlagUI] Question flagged:', data);
      this.updateFlagButton(data.caseId, data.questionNumber);
      this.updateCaseFlaggedQuestionsBadge(data.caseId);
    });

    this.eventBus.on('flag:question-unflagged', (data) => {
      console.log('[FlagUI] Question unflagged:', data);
      this.updateFlagButton(data.caseId, data.questionNumber);
      this.updateCaseFlaggedQuestionsBadge(data.caseId);
    });

    // Listen for case flag events
    this.eventBus.on('flag:case-flagged', (data) => {
      console.log('[FlagUI] Case flagged:', data.caseId);
      this.updateCaseFlagButton(data.caseId);
      this.updateSingleCaseFlagBookmark(data.caseId);
    });

    this.eventBus.on('flag:case-unflagged', (data) => {
      console.log('[FlagUI] Case unflagged:', data.caseId);
      this.updateCaseFlagButton(data.caseId);
      this.updateSingleCaseFlagBookmark(data.caseId);
    });

    // Listen for sync events
    this.eventBus.on('flag:synced', (data) => {
      console.log('[FlagUI] Flags synced:', data);
      this.updateAllUI();
    });

    // Listen for clear events
    this.eventBus.on('flag:all-cleared', () => {
      console.log('[FlagUI] All question flags cleared');
      this.updateAllUI();
    });

    this.eventBus.on('flag:all-case-flags-cleared', () => {
      console.log('[FlagUI] All case flags cleared');
      this.updateAllUI();
    });

    // Listen for errors
    this.eventBus.on('flag:error', (data) => {
      console.error('[FlagUI] Flag error:', data);
    });
  }

  /**
   * Update all UI elements
   */
  updateAllUI() {
    this.updateAllFlagButtons();
    this.updateAllCaseFlagIndicators();
    this.updateAllFlaggedQuestionsBadges();
  }

  // ========== QUESTION FLAG UI METHODS ==========

  /**
   * Get current case ID from URL
   */
  getCurrentCaseId() {
    const path = window.location.pathname;
    const match = path.match(/case(\d+_\d+)/);
    return match ? match[1] : null;
  }

  /**
   * Update a single question flag button
   */
  updateFlagButton(caseId, questionNumber) {
    const flagButton = document.querySelector(`[data-flag-question="${questionNumber}"]`);
    if (!flagButton) return;

    const isFlagged = this.flagModule.isFlagged(caseId, questionNumber);
    const questionDiv = flagButton.closest('.question');

    if (isFlagged) {
      flagButton.classList.add('flagged');
      flagButton.innerHTML = '<span class="flag-text">Flag</span>🚩';
      flagButton.setAttribute('title', 'Remove flag');

      // Add flagged class to question div for background color
      if (questionDiv) {
        questionDiv.classList.add('flagged');
      }
    } else {
      flagButton.classList.remove('flagged');
      flagButton.innerHTML = '<span class="flag-text">Flag</span>🏳️';
      flagButton.setAttribute('title', 'Flag this question as difficult');

      // Remove flagged class from question div
      if (questionDiv) {
        questionDiv.classList.remove('flagged');
      }
    }

    // Update the case tile badge
    this.updateCaseFlaggedQuestionsBadge(caseId);
  }

  /**
   * Update all question flag buttons on the current page
   */
  updateAllFlagButtons() {
    const caseId = this.getCurrentCaseId();
    if (!caseId) return;

    const flagButtons = document.querySelectorAll('[data-flag-question]');
    flagButtons.forEach(button => {
      const questionNumber = parseInt(button.getAttribute('data-flag-question'));
      this.updateFlagButton(caseId, questionNumber);
    });
  }

  /**
   * Set up click handlers for question flag buttons
   * This should be called after flag buttons are added to the DOM
   */
  setupFlagButtonHandlers() {
    const caseId = this.getCurrentCaseId();
    if (!caseId) return;

    const flagButtons = document.querySelectorAll('[data-flag-question]');
    flagButtons.forEach(button => {
      // Remove existing listeners to avoid duplicates
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);

      // Add new listener
      newButton.addEventListener('click', () => {
        const questionNumber = parseInt(newButton.getAttribute('data-flag-question'));
        const questionDiv = newButton.closest('.question');
        const questionText = questionDiv ?
          questionDiv.querySelector('p')?.textContent?.trim() || '' : '';

        this.flagModule.toggleFlag(caseId, questionNumber, questionText);
      });
    });
  }

  // ========== CASE FLAG UI METHODS ==========

  /**
   * Update the case flag button UI
   */
  updateCaseFlagButton(caseId) {
    const flagButton = document.getElementById('caseFlagButton');
    if (!flagButton) return;

    const isFlagged = this.flagModule.isCaseFlagged(caseId);

    if (isFlagged) {
      flagButton.classList.add('flagged');
      flagButton.textContent = 'Unflag Case';
    } else {
      flagButton.classList.remove('flagged');
      flagButton.textContent = 'Flag Case';
    }
  }

  /**
   * Set up click handler for case flag button
   */
  setupCaseFlagButtonHandler() {
    const flagButton = document.getElementById('caseFlagButton');
    if (!flagButton) return;

    const caseId = this.getCurrentCaseId();
    if (!caseId) return;

    // Remove existing listener
    const newButton = flagButton.cloneNode(true);
    flagButton.parentNode.replaceChild(newButton, flagButton);

    // Add new listener
    newButton.addEventListener('click', () => {
      this.flagModule.toggleCaseFlag(caseId);
    });

    // Initial update
    this.updateCaseFlagButton(caseId);
  }

  /**
   * Update a single case flag bookmark (for instant feedback)
   */
  updateSingleCaseFlagBookmark(caseId) {
    const bookmark = document.querySelector(`.case-flag-bookmark[data-case-id="${caseId}"]`);
    if (bookmark) {
      const isFlagged = this.flagModule.isCaseFlagged(caseId);
      if (isFlagged) {
        bookmark.classList.add('flagged');
      } else {
        bookmark.classList.remove('flagged');
      }
    }
  }

  /**
   * Update all case flag bookmarks on the main page
   */
  updateAllCaseFlagIndicators() {
    const caseCards = document.querySelectorAll('.case-card');

    caseCards.forEach(card => {
      const href = card.getAttribute('href');
      const match = href ? href.match(/case(\d+_\d+)/) : null;

      if (match) {
        const caseId = match[1];
        const isFlagged = this.flagModule.isCaseFlagged(caseId);

        // Find or create bookmark
        let bookmark = card.querySelector('.case-flag-bookmark');

        if (!bookmark) {
          // Create bookmark if it doesn't exist
          bookmark = document.createElement('div');
          bookmark.className = 'case-flag-bookmark';
          bookmark.setAttribute('data-case-id', caseId);

          // Add click handler
          bookmark.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[FlagUI] Bookmark clicked for case:', caseId);
            this.flagModule.toggleCaseFlag(caseId);
          });

          card.appendChild(bookmark);
        }

        // Update flagged state
        if (isFlagged) {
          bookmark.classList.add('flagged');
        } else {
          bookmark.classList.remove('flagged');
        }
      }
    });
  }

  /**
   * Update flagged question count badge on a single case card
   */
  updateCaseFlaggedQuestionsBadge(caseId) {
    const card = document.querySelector(`a.case-card[href*="case${caseId}"]`);
    if (!card) return;

    const flaggedQuestions = this.flagModule.getFlagsForCase(caseId);
    const count = flaggedQuestions.length;

    const existingBadge = card.querySelector('.flagged-questions-count');
    if (existingBadge) existingBadge.remove();

    if (count > 0) {
      const badge = document.createElement('div');
      badge.className = 'flagged-questions-count';
      badge.textContent = `🚩 ${count} flagged question${count !== 1 ? 's' : ''}`;
      badge.title = `${count} flagged question${count !== 1 ? 's' : ''}`;
      card.appendChild(badge);
    }
  }

  /**
   * Update all flagged question count badges
   */
  updateAllFlaggedQuestionsBadges() {
    const caseCards = document.querySelectorAll('.case-card');

    caseCards.forEach(card => {
      const href = card.getAttribute('href');
      const match = href ? href.match(/case(\d+_\d+)/) : null;

      if (match) {
        const caseId = match[1];
        this.updateCaseFlaggedQuestionsBadge(caseId);
      }
    });
  }

  // ========== STATISTICS METHODS ==========

  /**
   * Get flag statistics
   */
  getStats() {
    return this.flagModule.getStats();
  }

  /**
   * Get all question flags
   */
  getAllFlags() {
    return this.flagModule.getAllFlags();
  }

  /**
   * Get flags for a specific case
   */
  getFlagsForCase(caseId) {
    return this.flagModule.getFlagsForCase(caseId);
  }

  /**
   * Get all flagged cases
   */
  getAllFlaggedCases() {
    return this.flagModule.getAllFlaggedCases();
  }

  // ========== EXPORT/IMPORT/CLEAR METHODS ==========

  /**
   * Handle export button click
   */
  handleExport() {
    const data = this.flagModule.exportData();

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scp-flags-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('[FlagUI] Exported flag data');
  }

  /**
   * Handle import button click
   */
  async handleImport(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const result = await this.flagModule.importData(data);

      if (result.success) {
        console.log('[FlagUI] Import successful');
        alert('Flag data imported successfully!');
        this.updateAllUI();
      } else {
        console.error('[FlagUI] Import failed:', result.error);
        alert('Import failed: ' + result.error);
      }
    } catch (error) {
      console.error('[FlagUI] Import error:', error);
      alert('Failed to import data: ' + error.message);
    }
  }

  /**
   * Handle clear all question flags
   */
  async handleClearAllFlags() {
    if (!confirm('Are you sure you want to remove all flagged questions?')) {
      return;
    }

    const result = await this.flagModule.clearAllFlags();

    if (result.success) {
      console.log('[FlagUI] Clear successful');
      alert('All question flags cleared');
      this.updateAllUI();
    } else {
      console.error('[FlagUI] Clear failed');
      alert('Failed to clear flags');
    }
  }

  /**
   * Handle clear all case flags
   */
  async handleClearAllCaseFlags() {
    if (!confirm('Are you sure you want to remove all flagged cases?')) {
      return;
    }

    const result = await this.flagModule.clearAllCaseFlags();

    if (result.success) {
      console.log('[FlagUI] Clear case flags successful');
      alert('All case flags cleared');
      this.updateAllUI();
    } else {
      console.error('[FlagUI] Clear case flags failed');
      alert('Failed to clear case flags');
    }
  }

  /**
   * Handle clear ALL flags (questions + cases)
   */
  async handleClearAll() {
    if (!confirm('Are you sure you want to remove ALL flags (questions and cases)? This cannot be undone.')) {
      return;
    }

    await this.flagModule.clearAllFlags();
    await this.flagModule.clearAllCaseFlags();

    console.log('[FlagUI] Cleared all flags');
    alert('All flags cleared');
    this.updateAllUI();
  }
}

// Export for use in App.js
window.FlagUI = FlagUI;
