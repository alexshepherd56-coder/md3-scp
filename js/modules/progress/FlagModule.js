// FlagModule.js - Core flag tracking logic (no UI)
// Handles question flags and case flags, emits events

class FlagModule {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.firebaseService = app.firebaseService;
    this.flags = {}; // Question flags: { "1_1_q1": { caseId, questionNumber, questionText, flaggedAt }, ... }
    this.caseFlags = {}; // Case flags: { "1_1": { flaggedAt }, ... }
  }

  /**
   * Initialize the flag module
   * Sets up Firebase listeners and loads initial data
   */
  async initialize() {
    console.log('[FlagModule] Initializing...');

    if (!this.eventBus) {
      console.error('[FlagModule] EventBus not available!');
      throw new Error('EventBus is required for FlagModule');
    }

    // Load from localStorage first
    this.loadFromLocalStorage();
    this.loadCaseFlagsFromLocalStorage();

    // Listen for auth events
    this.eventBus.on('auth:signed-in', (user) => {
      this.handleUserSignedIn(user);
    });

    this.eventBus.on('auth:signed-out', () => {
      this.handleUserSignedOut();
    });

    console.log('[FlagModule] Initialized successfully');
    if (this.eventBus) {
      this.eventBus.emit('flag:initialized');
    }
  }

  /**
   * Handle user sign in
   */
  handleUserSignedIn(user) {
    console.log('[FlagModule] User signed in, syncing with Firestore');
    this.syncWithFirestore();
    this.syncCaseFlagsWithFirestore();
  }

  /**
   * Handle user sign out
   */
  handleUserSignedOut() {
    console.log('[FlagModule] User signed out, keeping local data');
    // Keep flags in localStorage for offline use
  }

  // ========== QUESTION FLAG METHODS ==========

  /**
   * Create a unique flag ID for a question
   */
  createFlagId(caseId, questionNumber) {
    return `${caseId}_q${questionNumber}`;
  }

  /**
   * Parse flag ID to get case and question info
   */
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

  /**
   * Toggle flag for a question
   */
  async toggleFlag(caseId, questionNumber, questionText = '') {
    if (!caseId || questionNumber === undefined) {
      console.warn('[FlagModule] Cannot toggle: missing caseId or questionNumber');
      return false;
    }

    const flagId = this.createFlagId(caseId, questionNumber);
    const wasFlagged = this.isFlagged(caseId, questionNumber);

    if (wasFlagged) {
      // Remove flag
      delete this.flags[flagId];
      console.log('[FlagModule] Removed flag:', flagId);
    } else {
      // Add flag
      this.flags[flagId] = {
        caseId,
        questionNumber,
        questionText,
        flaggedAt: new Date().toISOString()
      };
      console.log('[FlagModule] Added flag:', flagId);
    }

    // Save to localStorage
    this.saveToLocalStorage();

    // Emit event
    if (this.eventBus) {
      this.eventBus.emit(wasFlagged ? 'flag:question-unflagged' : 'flag:question-flagged', {
        flagId,
        caseId,
        questionNumber,
        questionText,
        stats: this.getStats()
      });
    }

    // Sync with Firestore if authenticated
    const user = this.firebaseService.getCurrentUser();
    if (user) {
      this.syncFlagToFirestore(flagId);
    }

    return this.isFlagged(caseId, questionNumber);
  }

  /**
   * Check if a question is flagged
   */
  isFlagged(caseId, questionNumber) {
    const flagId = this.createFlagId(caseId, questionNumber);
    return !!this.flags[flagId];
  }

  /**
   * Get all question flags
   */
  getAllFlags() {
    return Object.entries(this.flags).map(([flagId, data]) => ({
      flagId,
      ...data
    }));
  }

  /**
   * Get flags for a specific case
   */
  getFlagsForCase(caseId) {
    return this.getAllFlags().filter(flag => flag.caseId === caseId);
  }

  /**
   * Get count of flagged questions for a specific case
   */
  getFlaggedQuestionCountForCase(caseId) {
    return this.getFlagsForCase(caseId).length;
  }

  /**
   * Get total flag count
   */
  getFlagCount() {
    return Object.keys(this.flags).length;
  }

  /**
   * Load question flags from localStorage
   */
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('scp_flaggedQuestions');
      if (stored) {
        this.flags = JSON.parse(stored);
        console.log('[FlagModule] Loaded', this.getFlagCount(), 'question flags from localStorage');
        if (this.eventBus) {
          this.eventBus.emit('flag:loaded-from-local', {
            questionCount: this.getFlagCount()
          });
        }
      }
    } catch (error) {
      console.error('[FlagModule] Error loading flags from localStorage:', error);
      this.flags = {};
    }
  }

  /**
   * Save question flags to localStorage
   */
  saveToLocalStorage() {
    try {
      localStorage.setItem('scp_flaggedQuestions', JSON.stringify(this.flags));
    } catch (error) {
      console.error('[FlagModule] Error saving flags to localStorage:', error);
    }
  }

  /**
   * Sync all question flags with Firestore
   */
  async syncWithFirestore() {
    const user = this.firebaseService.getCurrentUser();
    if (!user) {
      console.log('[FlagModule] No user, skipping question flag sync');
      return;
    }

    try {
      console.log('[FlagModule] Syncing question flags with Firestore...');
      const db = this.firebaseService.getDb();
      const flagsRef = db.collection('users').doc(user.uid).collection('flags');
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
        console.log('[FlagModule] Synced', batchCount, 'question flags to Firestore');
      }

      // Save merged data to localStorage
      this.saveToLocalStorage();

      if (this.eventBus) {
        this.eventBus.emit('flag:synced', {
          questionCount: this.getFlagCount(),
          caseCount: this.getFlaggedCaseCount()
        });
      }
    } catch (error) {
      console.error('[FlagModule] Error syncing flags with Firestore:', error);
      if (this.eventBus) {
        this.eventBus.emit('flag:error', {
          type: 'sync-questions',
          error: error.message
        });
      }
    }
  }

  /**
   * Sync a single question flag to Firestore
   */
  async syncFlagToFirestore(flagId) {
    const user = this.firebaseService.getCurrentUser();
    if (!user) return;

    try {
      const db = this.firebaseService.getDb();
      const flagRef = db.collection('users').doc(user.uid).collection('flags').doc(flagId);

      if (this.flags[flagId]) {
        await flagRef.set(this.flags[flagId]);
      } else {
        await flagRef.delete();
      }
    } catch (error) {
      console.error('[FlagModule] Error syncing flag to Firestore:', error);
    }
  }

  /**
   * Clear all question flags
   */
  async clearAllFlags() {
    this.flags = {};
    this.saveToLocalStorage();

    // Clear from Firestore if authenticated
    const user = this.firebaseService.getCurrentUser();
    if (user) {
      try {
        const db = this.firebaseService.getDb();
        const flagsRef = db.collection('users').doc(user.uid).collection('flags');
        const snapshot = await flagsRef.get();

        const batch = db.batch();
        snapshot.forEach(doc => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        console.log('[FlagModule] Cleared all question flags from Firestore');
      } catch (error) {
        console.error('[FlagModule] Error clearing flags from Firestore:', error);
      }
    }

    if (this.eventBus) {
      this.eventBus.emit('flag:all-cleared');
    }

    return { success: true };
  }

  // ========== CASE FLAG METHODS ==========

  /**
   * Toggle flag for an entire case
   */
  async toggleCaseFlag(caseId) {
    if (!caseId) {
      console.warn('[FlagModule] Cannot toggle case flag: no caseId provided');
      return false;
    }

    const wasFlagged = this.isCaseFlagged(caseId);

    if (wasFlagged) {
      // Remove flag
      delete this.caseFlags[caseId];
      console.log('[FlagModule] Removed case flag:', caseId);
    } else {
      // Add flag
      this.caseFlags[caseId] = {
        flaggedAt: new Date().toISOString()
      };
      console.log('[FlagModule] Added case flag:', caseId);
    }

    // Save to localStorage
    this.saveCaseFlagsToLocalStorage();

    // Emit event
    if (this.eventBus) {
      this.eventBus.emit(wasFlagged ? 'flag:case-unflagged' : 'flag:case-flagged', {
        caseId,
        stats: this.getStats()
      });
    }

    // Sync with Firestore if authenticated
    const user = this.firebaseService.getCurrentUser();
    if (user) {
      this.syncCaseFlagToFirestore(caseId);
    }

    return this.isCaseFlagged(caseId);
  }

  /**
   * Check if a case is flagged
   */
  isCaseFlagged(caseId) {
    return !!this.caseFlags[caseId];
  }

  /**
   * Get all flagged cases
   */
  getAllFlaggedCases() {
    return Object.entries(this.caseFlags).map(([caseId, data]) => ({
      caseId,
      ...data
    }));
  }

  /**
   * Get total flagged case count
   */
  getFlaggedCaseCount() {
    return Object.keys(this.caseFlags).length;
  }

  /**
   * Load case flags from localStorage
   */
  loadCaseFlagsFromLocalStorage() {
    try {
      const stored = localStorage.getItem('scp_flaggedCases');
      if (stored) {
        this.caseFlags = JSON.parse(stored);
        console.log('[FlagModule] Loaded', this.getFlaggedCaseCount(), 'case flags from localStorage');
        if (this.eventBus) {
          this.eventBus.emit('flag:cases-loaded-from-local', {
            caseCount: this.getFlaggedCaseCount()
          });
        }
      }
    } catch (error) {
      console.error('[FlagModule] Error loading case flags from localStorage:', error);
      this.caseFlags = {};
    }
  }

  /**
   * Save case flags to localStorage
   */
  saveCaseFlagsToLocalStorage() {
    try {
      localStorage.setItem('scp_flaggedCases', JSON.stringify(this.caseFlags));
    } catch (error) {
      console.error('[FlagModule] Error saving case flags to localStorage:', error);
    }
  }

  /**
   * Sync all case flags with Firestore
   */
  async syncCaseFlagsWithFirestore() {
    const user = this.firebaseService.getCurrentUser();
    if (!user) {
      console.log('[FlagModule] No user, skipping case flag sync');
      return;
    }

    try {
      console.log('[FlagModule] Syncing case flags with Firestore...');
      const db = this.firebaseService.getDb();
      const caseFlagsRef = db.collection('users').doc(user.uid).collection('caseFlags');
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
        console.log('[FlagModule] Synced', batchCount, 'case flags to Firestore');
      }

      // Save merged data to localStorage
      this.saveCaseFlagsToLocalStorage();
    } catch (error) {
      console.error('[FlagModule] Error syncing case flags with Firestore:', error);
      if (this.eventBus) {
        this.eventBus.emit('flag:error', {
          type: 'sync-cases',
          error: error.message
        });
      }
    }
  }

  /**
   * Sync a single case flag to Firestore
   */
  async syncCaseFlagToFirestore(caseId) {
    const user = this.firebaseService.getCurrentUser();
    if (!user) return;

    try {
      const db = this.firebaseService.getDb();
      const caseFlagRef = db.collection('users').doc(user.uid).collection('caseFlags').doc(caseId);

      if (this.caseFlags[caseId]) {
        await caseFlagRef.set(this.caseFlags[caseId]);
      } else {
        await caseFlagRef.delete();
      }
    } catch (error) {
      console.error('[FlagModule] Error syncing case flag to Firestore:', error);
    }
  }

  /**
   * Clear all case flags
   */
  async clearAllCaseFlags() {
    this.caseFlags = {};
    this.saveCaseFlagsToLocalStorage();

    // Clear from Firestore if authenticated
    const user = this.firebaseService.getCurrentUser();
    if (user) {
      try {
        const db = this.firebaseService.getDb();
        const caseFlagsRef = db.collection('users').doc(user.uid).collection('caseFlags');
        const snapshot = await caseFlagsRef.get();

        const batch = db.batch();
        snapshot.forEach(doc => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        console.log('[FlagModule] Cleared all case flags from Firestore');
      } catch (error) {
        console.error('[FlagModule] Error clearing case flags from Firestore:', error);
      }
    }

    if (this.eventBus) {
      this.eventBus.emit('flag:all-case-flags-cleared');
    }

    return { success: true };
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      questionFlags: this.getFlagCount(),
      caseFlags: this.getFlaggedCaseCount(),
      total: this.getFlagCount() + this.getFlaggedCaseCount()
    };
  }

  /**
   * Export flag data
   */
  exportData() {
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      flags: this.flags,
      caseFlags: this.caseFlags,
      stats: this.getStats()
    };
  }

  /**
   * Import flag data
   */
  async importData(data) {
    try {
      if (!data.flags && !data.caseFlags) {
        return { success: false, error: 'Invalid data format: missing flags or caseFlags' };
      }

      // Merge imported data with existing
      if (data.flags) {
        this.flags = { ...this.flags, ...data.flags };
        this.saveToLocalStorage();
      }

      if (data.caseFlags) {
        this.caseFlags = { ...this.caseFlags, ...data.caseFlags };
        this.saveCaseFlagsToLocalStorage();
      }

      console.log('[FlagModule] Imported data');

      // Sync to Firestore if authenticated
      const user = this.firebaseService.getCurrentUser();
      if (user) {
        await this.syncWithFirestore();
        await this.syncCaseFlagsWithFirestore();
      }

      if (this.eventBus) {
        this.eventBus.emit('flag:data-imported', this.getStats());
      }

      return { success: true };
    } catch (error) {
      console.error('[FlagModule] Error importing data:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export for use in App.js
window.FlagModule = FlagModule;
