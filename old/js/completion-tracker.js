// Completion Tracker with Firestore Integration
// Tracks user progress through SCP cases with cloud sync

class CompletionTracker {
  constructor() {
    this.completedCases = {};
    this.firebaseService = null;
    this.listeners = [];
    this.authUnsubscribe = null;
  }

  // Initialize the tracker
  initialize() {
    // Load from localStorage first (for offline or unauthenticated users)
    this.loadFromLocalStorage();

    // Update UI on page load
    this.updateAllUI();

    // Use FirebaseService singleton for Firebase access
    if (window.firebaseService && window.firebaseService.isReady()) {
      this.setupFirebaseSync();
    } else if (window.firebaseService) {
      // Wait for Firebase to be ready
      window.firebaseService.onReady(() => {
        this.setupFirebaseSync();
      });
    } else {
      console.warn('[CompletionTracker] FirebaseService not available. Using localStorage only.');
    }
  }

  // Setup Firebase synchronization
  setupFirebaseSync() {
    this.firebaseService = window.firebaseService;
    let isInitialAuth = true;

    // Listen for auth changes
    this.authUnsubscribe = this.firebaseService.getAuth().onAuthStateChanged((user) => {
      if (isInitialAuth) {
        // First auth state check - user is already signed in or not
        isInitialAuth = false;
        if (user) {
          // User already signed in - load from Firestore
          this.syncWithFirestore();
        }
        // If no user, keep localStorage data (already loaded above)
      } else {
        // Subsequent auth changes - user signing in/out
        if (user) {
          // User just signed in - clear localStorage and load from Firestore
          this.completedCases = {};
          localStorage.removeItem('scp_completedCases');
          this.syncWithFirestore();
        } else {
          // User just signed out - clear all data
          this.completedCases = {};
          localStorage.removeItem('scp_completedCases');
          this.updateAllUI();
        }
      }
    });
  }

  // Cleanup method to remove event listeners
  cleanup() {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
      this.authUnsubscribe = null;
    }
    this.listeners = [];
  }

  // Load completed cases from localStorage
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('scp_completedCases');
      if (stored) {
        this.completedCases = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      this.completedCases = {};
    }
  }

  // Save to localStorage
  saveToLocalStorage() {
    try {
      localStorage.setItem('scp_completedCases', JSON.stringify(this.completedCases));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Sync with Firestore
  async syncWithFirestore() {
    if (!this.firebaseService || !this.firebaseService.isReady()) return;

    const db = this.firebaseService.getDb();
    const user = this.firebaseService.getCurrentUser();
    if (!user) return;

    try {
      // Load from Firestore
      const progressRef = db.collection('users').doc(user.uid).collection('progress');
      const snapshot = await progressRef.get();

      const firestoreData = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        firestoreData[doc.id] = data.completedAt?.toDate?.()?.toISOString() || new Date().toISOString();
      });

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
      }

      // Update local state
      this.completedCases = merged;
      this.saveToLocalStorage();
      this.updateAllUI();

      console.log('[CompletionTracker] Synced with Firestore successfully');
    } catch (error) {
      console.error('[CompletionTracker] Error syncing with Firestore:', error);
    }
  }

  // Mark a case as completed
  async markCompleted(caseId) {
    // Validate input
    if (!caseId) {
      console.warn('[CompletionTracker] Cannot mark completed: missing caseId');
      return;
    }

    const timestamp = new Date().toISOString();
    this.completedCases[caseId] = timestamp;

    // Save to localStorage immediately
    this.saveToLocalStorage();

    // Update UI immediately (optimistic update)
    this.updateAllUI();
    this.notifyListeners('completed', caseId);

    // Save to Firestore if authenticated (async, doesn't block UI)
    if (this.firebaseService && this.firebaseService.isReady()) {
      const db = this.firebaseService.getDb();
      const user = this.firebaseService.getCurrentUser();
      if (user) {
        db.collection('users')
          .doc(user.uid)
          .collection('progress')
          .doc(caseId)
          .set({
            completedAt: new Date(timestamp)
          })
          .catch(error => {
            console.error('[CompletionTracker] Error saving to Firestore:', error);
          });
      }
    }
  }

  // Mark a case as not completed
  async markIncomplete(caseId) {
    // Validate input
    if (!caseId) {
      console.warn('[CompletionTracker] Cannot mark incomplete: missing caseId');
      return;
    }

    delete this.completedCases[caseId];

    // Remove from localStorage
    this.saveToLocalStorage();

    // Update UI immediately (optimistic update)
    this.updateAllUI();
    this.notifyListeners('incomplete', caseId);

    // Remove from Firestore if authenticated (async, doesn't block UI)
    if (this.firebaseService && this.firebaseService.isReady()) {
      const db = this.firebaseService.getDb();
      const user = this.firebaseService.getCurrentUser();
      if (user) {
        db.collection('users')
          .doc(user.uid)
          .collection('progress')
          .doc(caseId)
          .delete()
          .catch(error => {
            console.error('[CompletionTracker] Error deleting from Firestore:', error);
          });
      }
    }
  }

  // Toggle completion status
  toggleCompletion(caseId) {
    if (this.isCompleted(caseId)) {
      this.markIncomplete(caseId);
    } else {
      this.markCompleted(caseId);
    }
  }

  // Check if a case is completed
  isCompleted(caseId) {
    return caseId in this.completedCases;
  }

  // Get completion statistics
  getStats() {
    const total = this.getTotalCasesCount();
    const completed = Object.keys(this.completedCases).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  }

  // Get stats by specialty
  getStatsBySpecialty(specialty) {
    const allCards = document.querySelectorAll(`.case-card.${specialty}`);
    const total = allCards.length;

    let completed = 0;
    allCards.forEach(card => {
      const caseId = this.getCaseIdFromCard(card);
      if (this.isCompleted(caseId)) {
        completed++;
      }
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }

  // Get stats by group (e.g., medicine, surgery)
  getStatsByGroup(groupFilters) {
    let total = 0;
    let completed = 0;

    // For each filter in the group, count cases
    groupFilters.forEach(filter => {
      const cards = document.querySelectorAll(`.case-card.${filter}`);
      total += cards.length;

      cards.forEach(card => {
        const caseId = this.getCaseIdFromCard(card);
        if (this.isCompleted(caseId)) {
          completed++;
        }
      });
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }

  // Get total number of cases
  getTotalCasesCount() {
    return document.querySelectorAll('.case-card').length;
  }

  // Extract case ID from card element or URL
  getCaseIdFromCard(card) {
    const href = card.getAttribute('href');
    if (href) {
      // Match both /cases/case1_1 and /cases/case1_1.html
      const match = href.match(/case(\d+_\d+)/);
      return match ? match[1] : null;
    }
    return null;
  }

  // Extract case ID from current page URL
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

  // Update all UI elements
  updateAllUI() {
    this.updateCaseCards();
    this.updateProgressStats();
    this.updateCurrentCaseButton();

    // Dispatch event to notify that completion data is loaded
    window.dispatchEvent(new CustomEvent('completionDataLoaded'));
  }

  // Update case cards with completion badges
  updateCaseCards() {
    const cards = document.querySelectorAll('.case-card');
    cards.forEach(card => {
      const caseId = this.getCaseIdFromCard(card);
      if (caseId) {
        // Remove existing badges
        const existingBadge = card.querySelector('.completion-badge');
        const existingIncompleteBadge = card.querySelector('.completion-badge-incomplete');
        if (existingBadge) {
          existingBadge.remove();
        }
        if (existingIncompleteBadge) {
          existingIncompleteBadge.remove();
        }

        // Add badge based on completion status
        if (this.isCompleted(caseId)) {
          card.classList.add('completed');
          const badge = document.createElement('span');
          badge.className = 'completion-badge';
          badge.textContent = '✓';
          badge.title = 'Completed';
          badge.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.markIncomplete(caseId);
          };
          card.appendChild(badge);
        } else {
          card.classList.remove('completed');
          // Add grey outline badge for incomplete cases
          const badge = document.createElement('span');
          badge.className = 'completion-badge-incomplete';
          badge.textContent = '✓';
          badge.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.markCompleted(caseId);
          };
          card.appendChild(badge);
        }
      }
    });
  }

  // Update progress statistics in sidebar
  updateProgressStats() {
    // Remove the progress stats element if it exists
    const statsElement = document.getElementById('progressStats');
    if (statsElement) {
      statsElement.remove();
    }
  }

  // Update completion button on case page
  updateCurrentCaseButton() {
    const button = document.getElementById('completionButton');
    if (button) {
      const caseId = this.getCurrentCaseId();
      if (caseId) {
        const isCompleted = this.isCompleted(caseId);
        button.textContent = isCompleted ? 'Completed' : 'Mark as Complete';
        button.className = isCompleted ? 'completion-button completed' : 'completion-button';
      }
    }
  }

  // Export completion data as JSON
  exportData() {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      completedCases: this.completedCases,
      stats: this.getStats()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scp-progress-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import completion data from JSON
  async importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.completedCases) {
        this.completedCases = { ...this.completedCases, ...data.completedCases };
        this.saveToLocalStorage();

        // Sync to Firestore if authenticated
        if (this.firebaseService && this.firebaseService.isReady()) {
          const user = this.firebaseService.getCurrentUser();
          if (user) {
            await this.syncWithFirestore();
          }
        }

        this.updateAllUI();
        return { success: true };
      }
      return { success: false, error: 'Invalid data format' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Clear all completion data
  async clearAll() {
    if (confirm('Are you sure you want to clear all completion data? This cannot be undone.')) {
      this.completedCases = {};
      this.saveToLocalStorage();

      // Clear from Firestore if authenticated
      if (this.firebaseService && this.firebaseService.isReady()) {
        const db = this.firebaseService.getDb();
        const user = this.firebaseService.getCurrentUser();
        if (user) {
          try {
            const progressRef = db.collection('users').doc(user.uid).collection('progress');
            const snapshot = await progressRef.get();

            const batch = db.batch();
            snapshot.forEach(doc => {
              batch.delete(doc.ref);
            });

            await batch.commit();
          } catch (error) {
            console.error('[CompletionTracker] Error clearing Firestore data:', error);
          }
        }
      }

      this.updateAllUI();
      alert('All completion data cleared');
    }
  }

  // Add listener for completion events
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Notify listeners of completion events
  notifyListeners(event, caseId) {
    this.listeners.forEach(callback => {
      try {
        callback(event, caseId);
      } catch (error) {
        console.error('Error in completion listener:', error);
      }
    });
  }
}

// Initialize completion tracker globally
window.completionTracker = new CompletionTracker();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize immediately - it will wait for FirebaseService internally
  window.completionTracker.initialize();
  console.log('[CompletionTracker] Initialization started');
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.completionTracker) {
    window.completionTracker.cleanup();
  }
});
