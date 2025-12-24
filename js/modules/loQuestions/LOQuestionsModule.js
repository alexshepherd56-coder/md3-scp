/**
 * LOQuestionsModule - Manages rich text editors and image uploads for LO questions
 *
 * Features:
 * - Quill.js editor initialization for each question
 * - Auto-save with debouncing
 * - Firebase Firestore sync
 * - localStorage fallback
 * - Image upload management
 * - Data migration from plain text
 */
class LOQuestionsModule {
  constructor(app, config) {
    this.app = app;
    this.eventBus = app?.eventBus;
    this.firebaseService = app?.firebaseService;

    // Configuration
    this.config = {
      moduleId: config.moduleId || 'w1-questions',
      questionIds: config.questionIds || [],  // ['w1-q1', 'w1-q2', ...]
      year: config.year || 'year4',
      autoSaveDelay: config.autoSaveDelay || 2000  // 2 seconds
    };

    // State
    this.editors = {};           // Quill instances by questionId
    this.imageManagers = {};     // ImageUploadManager instances
    this.autoSaveTimers = {};    // Debounce timers
    this.pendingSyncs = new Set(); // Track pending Firestore writes
    this.initialized = false;
  }

  /**
   * Initialize the module
   */
  async initialize() {
    console.log('[LOQuestions] Initializing...');

    // Check if Quill is loaded
    if (typeof Quill === 'undefined') {
      console.error('[LOQuestions] Quill.js not loaded!');
      return false;
    }

    // Migrate existing plain text data
    this.migrateExistingData();

    // Initialize editors for all questions
    this.initializeEditors();

    // Initialize image managers
    this.initializeImageManagers();

    // Set up auth state listeners
    this.setupAuthListeners();

    // Set up online/offline detection
    this.setupNetworkListeners();

    this.initialized = true;
    console.log('[LOQuestions] Initialized successfully');
    return true;
  }

  /**
   * Initialize Quill editors for each question
   */
  initializeEditors() {
    this.config.questionIds.forEach(questionId => {
      const editorContainer = document.getElementById(`editor-${questionId}`);
      const toolbarContainer = document.getElementById(`toolbar-${questionId}`);

      if (!editorContainer || !toolbarContainer) {
        console.warn(`[LOQuestions] Editor elements not found for ${questionId}`);
        return;
      }

      // Create Quill instance with custom toolbar
      const quill = new Quill(editorContainer, {
        theme: 'snow',
        modules: {
          toolbar: toolbarContainer
        },
        placeholder: 'Type your answer here...',
        formats: [
          'font', 'size', 'bold', 'italic', 'underline',
          'color', 'background', 'list', 'align'
        ]
      });

      // Store editor instance
      this.editors[questionId] = quill;

      // Set up auto-save on text change
      quill.on('text-change', (delta, oldDelta, source) => {
        if (source === 'user') {
          this.scheduleAutoSave(questionId);
          this.markQuestionAttempted(questionId);
        }
      });

      // Load saved content
      this.loadQuestionData(questionId);

      console.log(`[LOQuestions] Initialized editor for ${questionId}`);
    });
  }

  /**
   * Schedule auto-save with debouncing
   */
  scheduleAutoSave(questionId) {
    // Clear existing timer
    if (this.autoSaveTimers[questionId]) {
      clearTimeout(this.autoSaveTimers[questionId]);
    }

    // Schedule new save
    this.autoSaveTimers[questionId] = setTimeout(() => {
      this.saveQuestionData(questionId);
    }, this.config.autoSaveDelay);
  }

  /**
   * Save question data to localStorage and Firestore
   */
  async saveQuestionData(questionId) {
    const editor = this.editors[questionId];
    if (!editor) return;

    // Get content in both formats
    const delta = editor.getContents();
    const html = editor.root.innerHTML;

    // Get images from image manager
    const images = this.imageManagers[questionId]?.getImages() || [];

    // Create data object
    const data = {
      content: delta,
      html: html,
      images: images,
      lastUpdated: new Date().toISOString(),
      version: 1
    };

    // Save to localStorage immediately (synchronous)
    try {
      localStorage.setItem(`${questionId}-data`, JSON.stringify(data));
      console.log(`[LOQuestions] Saved ${questionId} to localStorage`);
    } catch (error) {
      console.error(`[LOQuestions] localStorage save error:`, error);
      if (error.name === 'QuotaExceededError') {
        this.handleStorageQuotaExceeded(questionId);
      }
    }

    // Save to Firestore asynchronously (doesn't block)
    this.saveToFirestore(questionId, data);
  }

  /**
   * Load question data from localStorage and sync with Firestore
   */
  async loadQuestionData(questionId) {
    // Load from localStorage first (instant)
    const localData = this.loadFromLocalStorage(questionId);
    if (localData) {
      this.applyDataToEditor(questionId, localData);
    }

    // Sync with Firestore if authenticated
    const user = this.firebaseService?.getCurrentUser();
    if (user) {
      await this.syncWithFirestore(questionId);
    }
  }

  /**
   * Load data from localStorage
   */
  loadFromLocalStorage(questionId) {
    try {
      const stored = localStorage.getItem(`${questionId}-data`);
      if (!stored) return null;

      const data = JSON.parse(stored);
      console.log(`[LOQuestions] Loaded ${questionId} from localStorage`);
      return data;
    } catch (error) {
      console.error(`[LOQuestions] Error loading from localStorage:`, error);
      return null;
    }
  }

  /**
   * Apply data to Quill editor
   */
  applyDataToEditor(questionId, data) {
    const editor = this.editors[questionId];
    if (!editor || !data) return;

    // Set content using Delta format for precise formatting
    if (data.content) {
      editor.setContents(data.content);
    }

    // Load images
    if (data.images && this.imageManagers[questionId]) {
      this.imageManagers[questionId].loadImages(data.images);
    }
  }

  /**
   * Save to Firestore
   */
  async saveToFirestore(questionId, data) {
    const user = this.firebaseService?.getCurrentUser();
    if (!user) {
      console.log(`[LOQuestions] Not authenticated, skipping Firestore save for ${questionId}`);
      return;
    }

    // Check if Firebase is available
    if (typeof firebase === 'undefined' || !firebase.firestore) {
      console.log(`[LOQuestions] Firebase not available, skipping Firestore save`);
      return;
    }

    // Prevent duplicate saves
    if (this.pendingSyncs.has(questionId)) {
      console.log(`[LOQuestions] Sync already pending for ${questionId}`);
      return;
    }

    this.pendingSyncs.add(questionId);

    try {
      const db = firebase.firestore();
      const docRef = db.collection('users')
        .doc(user.uid)
        .collection(this.config.year)
        .doc('loQuestions')
        .collection('questions')
        .doc(questionId);

      // Prepare data with server timestamp
      const firestoreData = {
        ...data,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Only set createdAt if document doesn't exist
      const doc = await docRef.get();
      if (!doc.exists) {
        firestoreData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      }

      await docRef.set(firestoreData, { merge: true });

      console.log(`[LOQuestions] Saved ${questionId} to Firestore`);

      // Update synced flag in localStorage
      data.synced = true;
      localStorage.setItem(`${questionId}-data`, JSON.stringify(data));

    } catch (error) {
      console.error(`[LOQuestions] Firestore save error for ${questionId}:`, error);

      // Mark as unsynced
      data.synced = false;
      localStorage.setItem(`${questionId}-data`, JSON.stringify(data));
    } finally {
      this.pendingSyncs.delete(questionId);
    }
  }

  /**
   * Sync with Firestore (merge local and remote data)
   */
  async syncWithFirestore(questionId) {
    const user = this.firebaseService?.getCurrentUser();
    if (!user) return;

    // Check if Firebase is available
    if (typeof firebase === 'undefined' || !firebase.firestore) {
      console.log(`[LOQuestions] Firebase not available for sync`);
      return;
    }

    try {
      const db = firebase.firestore();
      const docRef = db.collection('users')
        .doc(user.uid)
        .collection(this.config.year)
        .doc('loQuestions')
        .collection('questions')
        .doc(questionId);

      const doc = await docRef.get();

      if (doc.exists) {
        const firestoreData = doc.data();
        const localData = this.loadFromLocalStorage(questionId);

        // Convert Firestore timestamp to ISO string for comparison
        const firestoreTime = firestoreData.lastUpdated?.toDate?.() || new Date(0);
        const localTime = localData ? new Date(localData.lastUpdated) : new Date(0);

        // Use most recent data
        if (firestoreTime > localTime) {
          console.log(`[LOQuestions] Using Firestore data for ${questionId} (newer)`);
          this.applyDataToEditor(questionId, firestoreData);
          localStorage.setItem(`${questionId}-data`, JSON.stringify({
            ...firestoreData,
            lastUpdated: firestoreTime.toISOString()
          }));
        } else if (localData && localTime > firestoreTime) {
          console.log(`[LOQuestions] Uploading local data for ${questionId} (newer)`);
          await this.saveToFirestore(questionId, localData);
        }
      } else {
        // No Firestore data, upload local if exists
        const localData = this.loadFromLocalStorage(questionId);
        if (localData) {
          console.log(`[LOQuestions] Uploading local data for ${questionId} (first sync)`);
          await this.saveToFirestore(questionId, localData);
        }
      }
    } catch (error) {
      console.error(`[LOQuestions] Sync error for ${questionId}:`, error);
    }
  }

  /**
   * Migrate existing plain text data to rich text format
   */
  migrateExistingData() {
    console.log('[LOQuestions] Checking for data to migrate...');

    this.config.questionIds.forEach(questionId => {
      // Check if new format already exists
      const newDataKey = `${questionId}-data`;
      if (localStorage.getItem(newDataKey)) {
        return; // Already migrated
      }

      // Check for old format (plain text)
      const oldDataKey = `${questionId}-answer`;
      const oldAnswer = localStorage.getItem(oldDataKey);

      if (oldAnswer && oldAnswer.trim().length > 0) {
        console.log(`[LOQuestions] Migrating ${questionId}...`);

        // Convert plain text to Quill Delta format
        const delta = {
          ops: [
            { insert: oldAnswer + '\n' }
          ]
        };

        // Create HTML representation
        const paragraphs = oldAnswer.split('\n').map(line =>
          `<p>${line || '<br>'}</p>`
        ).join('');

        // Create new data structure
        const newData = {
          content: delta,
          html: paragraphs,
          images: [],
          lastUpdated: new Date().toISOString(),
          version: 1,
          migratedFrom: 'plainText'
        };

        // Save in new format
        localStorage.setItem(newDataKey, JSON.stringify(newData));
        console.log(`[LOQuestions] ✓ Migrated ${questionId}`);

        // Keep old data for safety (can be manually removed later)
      }
    });
  }

  /**
   * Mark question as attempted (updates navigation UI)
   */
  markQuestionAttempted(questionId) {
    const editor = this.editors[questionId];
    if (!editor) return;

    const content = editor.getText().trim();
    const images = this.imageManagers[questionId]?.getImages() || [];

    const hasContent = content.length > 0 || images.length > 0;

    // Update navigation button
    const questionNum = questionId.split('-q')[1];
    const navBtn = document.querySelector(`.lo-question-nav-btn[data-question="${questionNum}"]`);

    if (navBtn) {
      if (hasContent) {
        navBtn.classList.add('attempted');
      } else {
        navBtn.classList.remove('attempted');
      }
    }

    // Update progress
    this.updateProgress();
  }

  /**
   * Update progress display
   */
  updateProgress() {
    const progressText = document.getElementById('loQuestionsProgress');
    const progressBar = document.getElementById('loQuestionsProgressBar');

    if (!progressText || !progressBar) return;

    // Count attempted questions
    let attemptedCount = 0;
    this.config.questionIds.forEach(questionId => {
      const editor = this.editors[questionId];
      if (!editor) return;

      const content = editor.getText().trim();
      const images = this.imageManagers[questionId]?.getImages() || [];

      if (content.length > 0 || images.length > 0) {
        attemptedCount++;
      }
    });

    const totalCount = this.config.questionIds.length;

    // Update text
    progressText.textContent = `${attemptedCount}/${totalCount} Question(s) Attempted`;

    // Update progress bar
    const percentage = (attemptedCount / totalCount) * 100;
    progressBar.style.width = `${percentage}%`;

    // Update completion icon
    const completionIcon = document.getElementById('loQuestionsCompletionIcon');
    if (completionIcon) {
      if (attemptedCount === totalCount && totalCount > 0) {
        completionIcon.style.display = 'flex';
      } else {
        completionIcon.style.display = 'none';
      }
    }
  }

  /**
   * Initialize image upload managers for each question
   */
  initializeImageManagers() {
    this.config.questionIds.forEach(questionId => {
      this.imageManagers[questionId] = new ImageUploadManager(questionId, {
        maxImages: 10,
        maxSize: 5 * 1024 * 1024,  // 5MB
        firebaseService: this.firebaseService,
        onImageChange: () => {
          this.scheduleAutoSave(questionId);
          this.markQuestionAttempted(questionId);
        }
      });
    });
  }

  /**
   * Set up Firebase auth state listeners
   */
  setupAuthListeners() {
    if (!this.eventBus) return;

    this.eventBus.on('auth:signed-in', async (user) => {
      console.log('[LOQuestions] User signed in, syncing...');
      await this.syncAllQuestions();
    });

    this.eventBus.on('auth:signed-out', () => {
      console.log('[LOQuestions] User signed out');
      // Keep localStorage data but mark as unsynced
    });
  }

  /**
   * Set up network online/offline detection
   */
  setupNetworkListeners() {
    window.addEventListener('online', async () => {
      console.log('[LOQuestions] Network online, syncing...');
      await this.syncAllQuestions();
    });

    window.addEventListener('offline', () => {
      console.log('[LOQuestions] Network offline, using localStorage only');
    });
  }

  /**
   * Sync all questions with Firestore
   */
  async syncAllQuestions() {
    for (const questionId of this.config.questionIds) {
      await this.syncWithFirestore(questionId);
    }
  }

  /**
   * Handle localStorage quota exceeded error
   */
  handleStorageQuotaExceeded(questionId) {
    console.warn('[LOQuestions] localStorage quota exceeded');

    alert(`Storage limit reached. Consider:\n` +
          `1. Removing some images\n` +
          `2. Signing in to use cloud storage\n` +
          `3. Clearing browser data for other sites`);
  }
}

// Make available globally
window.LOQuestionsModule = LOQuestionsModule;
