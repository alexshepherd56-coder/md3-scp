// Flag Tracker System for SCP Cases
// Allows users to flag difficult questions for later review

class FlagTracker {
  constructor() {
    this.flags = {};
    this.caseFlags = {};
    this.initialized = false;
    this.firebaseService = null;
  }

  // Initialize the flag tracker
  initialize() {
    if (this.initialized) return;

    // Load flags from localStorage first
    this.loadFromLocalStorage();
    this.loadCaseFlagsFromLocalStorage();

    // Use FirebaseService singleton
    if (window.firebaseService && window.firebaseService.isReady()) {
      this.firebaseService = window.firebaseService;
      const user = this.firebaseService.getCurrentUser();
      if (user) {
        this.syncWithFirestore();
        this.syncCaseFlagsWithFirestore();
      }
    } else if (window.firebaseService) {
      window.firebaseService.onReady(() => {
        this.firebaseService = window.firebaseService;
        const user = this.firebaseService.getCurrentUser();
        if (user) {
          this.syncWithFirestore();
          this.syncCaseFlagsWithFirestore();
        }
      });
    }

    this.initialized = true;
    console.log('[FlagTracker] Initialized');
  }

  // Cleanup method
  cleanup() {
    this.firebaseService = null;
  }

  // Get current case ID from URL
  getCurrentCaseId() {
    const path = window.location.pathname;
    const match = path.match(/case(\d+_\d+)/);
    if (!match) return null;

    // Determine year from path or window.CURRENT_YEAR
    let year = window.CURRENT_YEAR || 'year3'; // default to year3 for backwards compatibility

    // Override with path-based detection if available
    if (path.includes('/year3/')) {
      year = 'year3';
    } else if (path.includes('/year4/')) {
      year = 'year4';
    }

    // Return year-prefixed case ID (e.g., "year4_2_1" instead of just "2_1")
    return `${year}_${match[1]}`;
  }

  // Create a unique flag ID for a question
  createFlagId(caseId, questionNumber) {
    return `${caseId}_q${questionNumber}`;
  }

  // Parse flag ID to get case and question info
  parseFlagId(flagId) {
    const match = flagId.match(/^(\d+_\d+)_q(\d+)$/);
    if (match) {
      return {
        caseId: match[1],
        questionNumber: parseInt(match[2])
      };
    }
    return null;
  }

  // Toggle flag for a question
  toggleFlag(caseId, questionNumber, questionText) {
    // Validate inputs
    if (!caseId || questionNumber === undefined) {
      console.warn('[FlagTracker] Cannot toggle flag: missing caseId or questionNumber');
      return false;
    }

    const flagId = this.createFlagId(caseId, questionNumber);

    if (this.flags[flagId]) {
      // Remove flag
      delete this.flags[flagId];
      console.log(`[FlagTracker] Removed flag: ${flagId}`);
    } else {
      // Add flag
      this.flags[flagId] = {
        caseId: caseId,
        questionNumber: questionNumber,
        questionText: questionText || '',
        flaggedAt: new Date().toISOString()
      };
      console.log(`[FlagTracker] Added flag: ${flagId}`);
    }

    // Save to localStorage
    this.saveToLocalStorage();

    // Sync with Firestore if user is signed in
    if (this.firebaseService && this.firebaseService.isReady()) {
      const user = this.firebaseService.getCurrentUser();
      if (user) {
        this.syncFlagToFirestore(flagId);
      }
    }

    // Update UI
    this.updateFlagButton(caseId, questionNumber);

    return this.isFlagged(caseId, questionNumber);
  }

  // Check if a question is flagged
  isFlagged(caseId, questionNumber) {
    const flagId = this.createFlagId(caseId, questionNumber);
    return !!this.flags[flagId];
  }

  // Get all flags
  getAllFlags() {
    return Object.entries(this.flags).map(([flagId, data]) => ({
      flagId,
      ...data
    }));
  }

  // Get flags for a specific case
  getFlagsForCase(caseId) {
    return this.getAllFlags().filter(flag => flag.caseId === caseId);
  }

  // Get count of flagged questions for a specific case
  getFlaggedQuestionCountForCase(caseId) {
    return this.getFlagsForCase(caseId).length;
  }

  // Get total flag count
  getFlagCount() {
    return Object.keys(this.flags).length;
  }

  // Load flags from localStorage
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('scp_flaggedQuestions');
      if (stored) {
        this.flags = JSON.parse(stored);
        console.log(`Loaded ${this.getFlagCount()} flags from localStorage`);
      }
    } catch (error) {
      console.error('Error loading flags from localStorage:', error);
      this.flags = {};
    }
  }

  // Save flags to localStorage
  saveToLocalStorage() {
    try {
      localStorage.setItem('scp_flaggedQuestions', JSON.stringify(this.flags));
    } catch (error) {
      console.error('Error saving flags to localStorage:', error);
    }
  }

  // Sync all flags with Firestore
  async syncWithFirestore() {
    if (!this.firebaseService || !this.firebaseService.isReady()) {
      return;
    }

    const user = this.firebaseService.getCurrentUser();
    if (!user) return;

    try {
      const db = this.firebaseService.getDb();
      const flagsRef = db.collection('users').doc(user.uid).collection('flags');

      // Get all flags from Firestore
      const snapshot = await flagsRef.get();
      const firestoreFlags = {};

      snapshot.forEach(doc => {
        firestoreFlags[doc.id] = doc.data();
      });

      // Merge with local flags (local takes precedence)
      this.flags = { ...firestoreFlags, ...this.flags };

      // Upload any local-only flags to Firestore
      const batch = db.batch();
      let batchCount = 0;

      for (const [flagId, flagData] of Object.entries(this.flags)) {
        if (!firestoreFlags[flagId]) {
          batch.set(flagsRef.doc(flagId), flagData);
          batchCount++;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
        console.log(`Synced ${batchCount} flags to Firestore`);
      }

      // Save merged data to localStorage
      this.saveToLocalStorage();

      console.log('[FlagTracker] Flags synced with Firestore');
    } catch (error) {
      console.error('[FlagTracker] Error syncing flags with Firestore:', error);
    }
  }

  // Sync a single flag to Firestore
  async syncFlagToFirestore(flagId) {
    if (!this.firebaseService || !this.firebaseService.isReady()) {
      return;
    }

    const user = this.firebaseService.getCurrentUser();
    if (!user) return;

    try {
      const db = this.firebaseService.getDb();
      const flagRef = db.collection('users').doc(user.uid).collection('flags').doc(flagId);

      if (this.flags[flagId]) {
        // Add/update flag in Firestore
        await flagRef.set(this.flags[flagId]);
      } else {
        // Remove flag from Firestore
        await flagRef.delete();
      }
    } catch (error) {
      console.error('[FlagTracker] Error syncing flag to Firestore:', error);
    }
  }

  // Update the flag button UI for a specific question
  updateFlagButton(caseId, questionNumber) {
    const flagButton = document.querySelector(`[data-flag-question="${questionNumber}"]`);
    if (!flagButton) return;

    const isFlagged = this.isFlagged(caseId, questionNumber);
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
  }

  // Update all flag buttons on the current page
  updateAllFlagButtons() {
    const caseId = this.getCurrentCaseId();
    if (!caseId) return;

    const flagButtons = document.querySelectorAll('[data-flag-question]');
    flagButtons.forEach(button => {
      const questionNumber = parseInt(button.getAttribute('data-flag-question'));
      this.updateFlagButton(caseId, questionNumber);
    });
  }

  // Clear all flags (with confirmation)
  clearAllFlags() {
    if (confirm('Are you sure you want to remove all flagged questions?')) {
      this.flags = {};
      this.saveToLocalStorage();

      // Clear from Firestore if signed in
      if (this.firebaseService && this.firebaseService.isReady()) {
        const user = this.firebaseService.getCurrentUser();
        if (user) {
          this.clearFirestoreFlags();
        }
      }

      // Update UI
      this.updateAllFlagButtons();

      return true;
    }
    return false;
  }

  // Clear all flags from Firestore
  async clearFirestoreFlags() {
    if (!this.firebaseService || !this.firebaseService.isReady()) {
      return;
    }

    const user = this.firebaseService.getCurrentUser();
    if (!user) return;

    try {
      const db = this.firebaseService.getDb();
      const flagsRef = db.collection('users').doc(user.uid).collection('flags');
      const snapshot = await flagsRef.get();

      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log('[FlagTracker] Cleared all flags from Firestore');
    } catch (error) {
      console.error('[FlagTracker] Error clearing flags from Firestore:', error);
    }
  }

  // ========== CASE FLAGGING METHODS ==========

  // Toggle flag for an entire case
  toggleCaseFlag(caseId) {
    // Validate input
    if (!caseId) {
      console.warn('[FlagTracker] toggleCaseFlag: No caseId provided');
      return false;
    }

    if (this.caseFlags[caseId]) {
      // Remove flag
      delete this.caseFlags[caseId];
      console.log(`[FlagTracker] Removed case flag: ${caseId}`);
    } else {
      // Add flag
      this.caseFlags[caseId] = {
        flaggedAt: new Date().toISOString()
      };
      console.log(`[FlagTracker] Added case flag: ${caseId}`);
    }

    // Update UI immediately (before async operations)
    this.updateCaseFlagButton(caseId);
    this.updateSingleCaseFlagBookmark(caseId);

    // Save to localStorage
    this.saveCaseFlagsToLocalStorage();

    // Sync with Firestore if user is signed in (async - don't wait)
    if (this.firebaseService && this.firebaseService.isReady()) {
      const user = this.firebaseService.getCurrentUser();
      if (user) {
        this.syncCaseFlagToFirestore(caseId);
      }
    }

    return this.isCaseFlagged(caseId);
  }

  // Check if a case is flagged
  isCaseFlagged(caseId) {
    return !!this.caseFlags[caseId];
  }

  // Get all flagged cases
  getAllFlaggedCases() {
    return Object.entries(this.caseFlags).map(([caseId, data]) => ({
      caseId,
      ...data
    }));
  }

  // Get total flagged case count
  getFlaggedCaseCount() {
    return Object.keys(this.caseFlags).length;
  }

  // Load case flags from localStorage
  loadCaseFlagsFromLocalStorage() {
    try {
      const stored = localStorage.getItem('scp_flaggedCases');
      if (stored) {
        this.caseFlags = JSON.parse(stored);
        console.log(`Loaded ${this.getFlaggedCaseCount()} case flags from localStorage`);
      }
    } catch (error) {
      console.error('Error loading case flags from localStorage:', error);
      this.caseFlags = {};
    }
  }

  // Save case flags to localStorage
  saveCaseFlagsToLocalStorage() {
    try {
      localStorage.setItem('scp_flaggedCases', JSON.stringify(this.caseFlags));
    } catch (error) {
      console.error('Error saving case flags to localStorage:', error);
    }
  }

  // Sync case flags with Firestore
  async syncCaseFlagsWithFirestore() {
    if (!this.firebaseService || !this.firebaseService.isReady()) {
      return;
    }

    const user = this.firebaseService.getCurrentUser();
    if (!user) return;

    try {
      const db = this.firebaseService.getDb();
      const caseFlagsRef = db.collection('users').doc(user.uid).collection('caseFlags');

      // Get all case flags from Firestore
      const snapshot = await caseFlagsRef.get();
      const firestoreCaseFlags = {};

      snapshot.forEach(doc => {
        firestoreCaseFlags[doc.id] = doc.data();
      });

      // Merge with local flags (local takes precedence)
      this.caseFlags = { ...firestoreCaseFlags, ...this.caseFlags };

      // Upload any local-only flags to Firestore
      const batch = db.batch();
      let batchCount = 0;

      for (const [caseId, flagData] of Object.entries(this.caseFlags)) {
        if (!firestoreCaseFlags[caseId]) {
          batch.set(caseFlagsRef.doc(caseId), flagData);
          batchCount++;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
        console.log(`Synced ${batchCount} case flags to Firestore`);
      }

      // Save merged data to localStorage
      this.saveCaseFlagsToLocalStorage();

      console.log('[FlagTracker] Case flags synced with Firestore');
    } catch (error) {
      console.error('[FlagTracker] Error syncing case flags with Firestore:', error);
    }
  }

  // Sync a single case flag to Firestore
  async syncCaseFlagToFirestore(caseId) {
    if (!this.firebaseService || !this.firebaseService.isReady()) {
      return;
    }

    const user = this.firebaseService.getCurrentUser();
    if (!user) return;

    try {
      const db = this.firebaseService.getDb();
      const caseFlagRef = db.collection('users').doc(user.uid).collection('caseFlags').doc(caseId);

      if (this.caseFlags[caseId]) {
        // Add/update case flag in Firestore
        await caseFlagRef.set(this.caseFlags[caseId]);
      } else {
        // Remove case flag from Firestore
        await caseFlagRef.delete();
      }
    } catch (error) {
      console.error('[FlagTracker] Error syncing case flag to Firestore:', error);
    }
  }

  // Update the case flag button UI
  updateCaseFlagButton(caseId) {
    const flagButton = document.getElementById('caseFlagButton');
    if (!flagButton) return;

    const isFlagged = this.isCaseFlagged(caseId);

    if (isFlagged) {
      flagButton.classList.add('flagged');
      flagButton.textContent = 'Unflag Case';
    } else {
      flagButton.classList.remove('flagged');
      flagButton.textContent = 'Flag Case';
    }
  }

  // Update a single case flag bookmark (for instant feedback)
  updateSingleCaseFlagBookmark(caseId) {
    const bookmark = document.querySelector(`.case-flag-bookmark[data-case-id="${caseId}"]`);
    if (bookmark) {
      const isFlagged = this.isCaseFlagged(caseId);
      if (isFlagged) {
        bookmark.classList.add('flagged');
      } else {
        bookmark.classList.remove('flagged');
      }
    }
  }

  // Update all case flag bookmarks on the main page
  updateAllCaseFlagIndicators() {
    const caseCards = document.querySelectorAll('.case-card');

    caseCards.forEach(card => {
      const href = card.getAttribute('href');
      const match = href ? href.match(/case(\d+_\d+)/) : null;

      if (match) {
        const caseId = match[1];
        const isFlagged = this.isCaseFlagged(caseId);

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
            console.log('Bookmark clicked for case:', caseId);
            this.toggleCaseFlag(caseId);
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
}

// Initialize flag tracker globally
window.flagTracker = new FlagTracker();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.flagTracker.initialize();
  // Add flag indicators to case cards
  window.flagTracker.updateAllCaseFlagIndicators();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.flagTracker) {
    window.flagTracker.cleanup();
  }
});
