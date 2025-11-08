// CompletionModule.js - Core completion tracking logic (no UI)
// Handles completion state, Firebase sync, and emits events

class CompletionModule {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.firebaseService = app.firebaseService;
    this.completedCases = {};
    this.listeners = [];
  }

  /**
   * Initialize the completion module
   * Sets up Firebase listeners and loads initial data
   */
  async initialize() {
    console.log('[CompletionModule] Initializing...');

    if (!this.eventBus) {
      console.error('[CompletionModule] EventBus not available!');
      throw new Error('EventBus is required for CompletionModule');
    }

    // Load from localStorage first (works offline)
    this.loadFromLocalStorage();

    // Listen for auth state changes
    this.eventBus.on('auth:state-change', (user) => {
      this.handleAuthStateChange(user);
    });

    // Listen for auth:signed-in specifically
    this.eventBus.on('auth:signed-in', (user) => {
      this.handleUserSignedIn(user);
    });

    // Listen for auth:signed-out
    this.eventBus.on('auth:signed-out', () => {
      this.handleUserSignedOut();
    });

    console.log('[CompletionModule] Initialized successfully');
    this.eventBus.emit('completion:initialized');
  }

  /**
   * Handle auth state changes
   * @param {Object|null} user - Firebase user object or null
   */
  handleAuthStateChange(user) {
    if (user) {
      // User is signed in, sync with Firestore
      this.syncWithFirestore();
    }
  }

  /**
   * Handle user sign in
   * @param {Object} user - Firebase user object
   */
  handleUserSignedIn(user) {
    console.log('[CompletionModule] User signed in, syncing with Firestore');
    // Clear localStorage and load from Firestore
    this.completedCases = {};
    localStorage.removeItem('scp_completedCases');
    this.syncWithFirestore();
  }

  /**
   * Handle user sign out
   */
  handleUserSignedOut() {
    console.log('[CompletionModule] User signed out, clearing data');
    // Clear all completion data
    this.completedCases = {};
    localStorage.removeItem('scp_completedCases');
    this.eventBus.emit('completion:data-cleared');
  }

  /**
   * Load completed cases from localStorage
   */
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('scp_completedCases');
      if (stored) {
        this.completedCases = JSON.parse(stored);
        console.log('[CompletionModule] Loaded from localStorage:', Object.keys(this.completedCases).length, 'cases');
        if (this.eventBus) {
          this.eventBus.emit('completion:loaded-from-local', {
            count: Object.keys(this.completedCases).length
          });
        }
      }
    } catch (error) {
      console.error('[CompletionModule] Error loading from localStorage:', error);
      this.completedCases = {};
      if (this.eventBus) {
        this.eventBus.emit('completion:error', {
          type: 'load-local',
          error: error.message
        });
      }
    }
  }

  /**
   * Save to localStorage
   */
  saveToLocalStorage() {
    try {
      localStorage.setItem('scp_completedCases', JSON.stringify(this.completedCases));
    } catch (error) {
      console.error('[CompletionModule] Error saving to localStorage:', error);
      this.eventBus.emit('completion:error', {
        type: 'save-local',
        error: error.message
      });
    }
  }

  /**
   * Sync with Firestore
   * Merges localStorage and Firestore data, Firestore takes precedence
   */
  async syncWithFirestore() {
    const user = this.firebaseService.getCurrentUser();
    if (!user) {
      console.log('[CompletionModule] No user, skipping Firestore sync');
      return;
    }

    try {
      console.log('[CompletionModule] Syncing with Firestore...');
      const db = this.firebaseService.getDb();
      const progressRef = db.collection('users').doc(user.uid).collection('progress');
      const snapshot = await progressRef.get();

      const firestoreData = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        firestoreData[doc.id] = data.completedAt?.toDate?.()?.toISOString() || new Date().toISOString();
      });

      console.log('[CompletionModule] Loaded from Firestore:', Object.keys(firestoreData).length, 'cases');

      // Merge localStorage and Firestore data (Firestore takes precedence)
      const merged = { ...this.completedCases, ...firestoreData };

      // Update Firestore with any cases that were in localStorage but not in Firestore
      const batch = db.batch();
      let hasUpdates = false;

      for (const [caseId, timestamp] of Object.entries(this.completedCases)) {
        if (!firestoreData[caseId]) {
          const docRef = progressRef.doc(caseId);
          batch.set(docRef, {
            completedAt: new Date(timestamp),
            syncedFromLocalStorage: true
          });
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        await batch.commit();
        console.log('[CompletionModule] Uploaded localStorage data to Firestore');
      }

      // Update local state
      this.completedCases = merged;
      this.saveToLocalStorage();

      console.log('[CompletionModule] Sync complete, total cases:', Object.keys(this.completedCases).length);
      this.eventBus.emit('completion:synced', {
        count: Object.keys(this.completedCases).length,
        fromFirestore: Object.keys(firestoreData).length,
        fromLocal: Object.keys(this.completedCases).length - Object.keys(firestoreData).length
      });
    } catch (error) {
      console.error('[CompletionModule] Error syncing with Firestore:', error);
      this.eventBus.emit('completion:error', {
        type: 'sync',
        error: error.message
      });
    }
  }

  /**
   * Mark a case as completed
   * @param {string} caseId - Case identifier (e.g., "1_1")
   */
  async markCompleted(caseId) {
    if (!caseId) {
      console.warn('[CompletionModule] Cannot mark completed: no caseId provided');
      return;
    }

    const timestamp = new Date().toISOString();
    this.completedCases[caseId] = timestamp;

    // Save to localStorage immediately
    this.saveToLocalStorage();

    console.log('[CompletionModule] Marked case completed:', caseId);

    // Emit event for UI to update
    this.eventBus.emit('completion:case-completed', {
      caseId,
      timestamp,
      stats: this.getStats()
    });

    // Notify listeners (legacy support)
    this.notifyListeners('completed', caseId);

    // Save to Firestore if authenticated (async, doesn't block)
    const user = this.firebaseService.getCurrentUser();
    if (user) {
      try {
        const db = this.firebaseService.getDb();
        await db.collection('users')
          .doc(user.uid)
          .collection('progress')
          .doc(caseId)
          .set({
            completedAt: new Date(timestamp)
          });
        console.log('[CompletionModule] Saved to Firestore:', caseId);
      } catch (error) {
        console.error('[CompletionModule] Error saving to Firestore:', error);
        this.eventBus.emit('completion:error', {
          type: 'save-firestore',
          caseId,
          error: error.message
        });
      }
    }
  }

  /**
   * Mark a case as incomplete (remove completion)
   * @param {string} caseId - Case identifier (e.g., "1_1")
   */
  async markIncomplete(caseId) {
    if (!caseId) {
      console.warn('[CompletionModule] Cannot mark incomplete: no caseId provided');
      return;
    }

    delete this.completedCases[caseId];

    // Remove from localStorage
    this.saveToLocalStorage();

    console.log('[CompletionModule] Marked case incomplete:', caseId);

    // Emit event for UI to update
    this.eventBus.emit('completion:case-uncompleted', {
      caseId,
      stats: this.getStats()
    });

    // Notify listeners (legacy support)
    this.notifyListeners('incomplete', caseId);

    // Remove from Firestore if authenticated (async, doesn't block)
    const user = this.firebaseService.getCurrentUser();
    if (user) {
      try {
        const db = this.firebaseService.getDb();
        await db.collection('users')
          .doc(user.uid)
          .collection('progress')
          .doc(caseId)
          .delete();
        console.log('[CompletionModule] Removed from Firestore:', caseId);
      } catch (error) {
        console.error('[CompletionModule] Error removing from Firestore:', error);
        this.eventBus.emit('completion:error', {
          type: 'delete-firestore',
          caseId,
          error: error.message
        });
      }
    }
  }

  /**
   * Toggle completion status
   * @param {string} caseId - Case identifier (e.g., "1_1")
   */
  toggleCompletion(caseId) {
    if (this.isCompleted(caseId)) {
      this.markIncomplete(caseId);
    } else {
      this.markCompleted(caseId);
    }
  }

  /**
   * Check if a case is completed
   * @param {string} caseId - Case identifier
   * @returns {boolean}
   */
  isCompleted(caseId) {
    return caseId in this.completedCases;
  }

  /**
   * Get all completed cases
   * @returns {Object} Object with caseId: timestamp pairs
   */
  getCompletedCases() {
    return { ...this.completedCases };
  }

  /**
   * Get completion statistics
   * @param {number} totalCases - Optional total case count
   * @returns {Object} { total, completed, percentage }
   */
  getStats(totalCases = null) {
    const completed = Object.keys(this.completedCases).length;
    const total = totalCases || completed; // Can't know total without DOM
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  }

  /**
   * Export completion data as JSON
   * @returns {Object} Exportable data object
   */
  exportData() {
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      completedCases: this.completedCases,
      stats: this.getStats()
    };
  }

  /**
   * Import completion data from object
   * @param {Object} data - Data object with completedCases property
   * @returns {Promise<Object>} { success, error? }
   */
  async importData(data) {
    try {
      if (!data.completedCases) {
        return { success: false, error: 'Invalid data format: missing completedCases' };
      }

      // Merge imported data with existing
      this.completedCases = { ...this.completedCases, ...data.completedCases };
      this.saveToLocalStorage();

      console.log('[CompletionModule] Imported data:', Object.keys(data.completedCases).length, 'cases');

      // Sync to Firestore if authenticated
      const user = this.firebaseService.getCurrentUser();
      if (user) {
        await this.syncWithFirestore();
      }

      this.eventBus.emit('completion:data-imported', {
        count: Object.keys(data.completedCases).length
      });

      return { success: true };
    } catch (error) {
      console.error('[CompletionModule] Error importing data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all completion data
   * @returns {Promise<Object>} { success, error? }
   */
  async clearAll() {
    try {
      this.completedCases = {};
      this.saveToLocalStorage();

      console.log('[CompletionModule] Cleared all local data');

      // Clear from Firestore if authenticated
      const user = this.firebaseService.getCurrentUser();
      if (user) {
        const db = this.firebaseService.getDb();
        const progressRef = db.collection('users').doc(user.uid).collection('progress');
        const snapshot = await progressRef.get();

        const batch = db.batch();
        snapshot.forEach(doc => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        console.log('[CompletionModule] Cleared Firestore data');
      }

      this.eventBus.emit('completion:data-cleared');
      return { success: true };
    } catch (error) {
      console.error('[CompletionModule] Error clearing data:', error);
      this.eventBus.emit('completion:error', {
        type: 'clear-all',
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Add listener for completion events (legacy support)
   * @param {Function} callback - Callback function(event, caseId)
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify listeners of completion events (legacy support)
   * @param {string} event - Event type ('completed' or 'incomplete')
   * @param {string} caseId - Case identifier
   */
  notifyListeners(event, caseId) {
    this.listeners.forEach(callback => {
      try {
        callback(event, caseId);
      } catch (error) {
        console.error('[CompletionModule] Error in listener:', error);
      }
    });
  }
}

// Export for use in App.js
window.CompletionModule = CompletionModule;
