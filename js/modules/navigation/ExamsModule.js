/**
 * ExamsModule - Exams State Management
 *
 * Responsibilities:
 * - Load exam progress from localStorage
 * - Calculate attempted/flagged question counts
 * - Toggle exam completion status
 * - Manage SAQ and MCQ exam data
 *
 * NO UI manipulation - emit events for ExamsUI to handle
 */

class ExamsModule {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.firebaseService = app.firebaseService;

    // Exam configurations
    this.saqExams = [
      { year: '2024', totalQuestions: 35 },
      { year: '2023', totalQuestions: 36 },
      { year: '2022', totalQuestions: 39 }
    ];

    this.mcqExams = [
      { year: 'mcq-2024', totalQuestions: 57 },
      { year: 'mcq-2023', totalQuestions: 92 }
    ];

    this.initialized = false;
  }

  /**
   * Initialize the exams module
   */
  async initialize() {
    if (this.initialized) {
      console.warn('[ExamsModule] Already initialized');
      return;
    }

    console.log('[ExamsModule] Initializing...');

    // Set up event listeners
    this.setupEventListeners();

    this.initialized = true;
    console.log('[ExamsModule] Initialized successfully');
    this.eventBus.emit('exams:initialized');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for navigation from hash
    this.eventBus.on('exams:navigate-from-hash', () => {
      this.show();
    });

    // Listen for navigation view initialization
    this.eventBus.on('nav:initialize-view', (data) => {
      if (data.filter === 'past-exams') {
        this.show();
      }
    });
  }

  /**
   * Show exams view
   */
  show() {
    console.log('[ExamsModule] Showing exams view');

    // Request view change
    this.eventBus.emit('exams:request-show');

    // Emit view changed event for UI
    this.eventBus.emit('exams:view-changed');

    // Save to navigation
    const navModule = this.app.getModule('navigation');
    if (navModule) {
      navModule.saveFilter('past-exams');
    }

    // Trigger progress update
    this.eventBus.emit('exams:progress-update-requested');
  }

  /**
   * Get SAQ exam progress
   */
  getSaqExamProgress(year) {
    const examProgress = JSON.parse(localStorage.getItem(`saq-${year}-progress`) || 'null');
    const examCompletion = localStorage.getItem(`saq-${year}-completed`) === 'true';

    let attemptedCount = 0;
    let flaggedCount = 0;

    if (examProgress && examProgress.questions) {
      attemptedCount = examProgress.questions.filter(q => q.answer && q.answer.trim()).length;
      flaggedCount = examProgress.questions.filter(q => q.flagged).length;
    }

    const examConfig = this.saqExams.find(e => e.year === year);
    const totalQuestions = examConfig ? examConfig.totalQuestions : 0;

    return {
      year,
      totalQuestions,
      attemptedCount,
      flaggedCount,
      completed: examCompletion,
      progressPercent: totalQuestions > 0 ? (attemptedCount / totalQuestions) * 100 : 0
    };
  }

  /**
   * Get MCQ exam progress
   */
  getMcqExamProgress(year) {
    const examProgress = JSON.parse(localStorage.getItem(`${year}-progress`) || 'null');
    const examCompletion = localStorage.getItem(`${year}-completed`) === 'true';

    let attemptedCount = 0;
    let flaggedCount = 0;

    if (examProgress && examProgress.questions) {
      attemptedCount = examProgress.questions.filter(q => q.selectedAnswer !== null && q.selectedAnswer !== undefined).length;
      flaggedCount = examProgress.questions.filter(q => q.flagged).length;
    }

    const examConfig = this.mcqExams.find(e => e.year === year);
    const totalQuestions = examConfig ? examConfig.totalQuestions : 0;

    return {
      year,
      totalQuestions,
      attemptedCount,
      flaggedCount,
      completed: examCompletion,
      progressPercent: totalQuestions > 0 ? (attemptedCount / totalQuestions) * 100 : 0
    };
  }

  /**
   * Toggle SAQ exam completion
   */
  toggleSaqExamCompletion(year) {
    const isCompleted = localStorage.getItem(`saq-${year}-completed`) === 'true';
    localStorage.setItem(`saq-${year}-completed`, isCompleted ? 'false' : 'true');

    console.log('[ExamsModule] Toggled SAQ exam completion:', year, !isCompleted);
    this.eventBus.emit('exams:progress-update-requested');
  }

  /**
   * Toggle MCQ exam completion
   */
  toggleMcqExamCompletion(year) {
    const isCompleted = localStorage.getItem(`${year}-completed`) === 'true';
    localStorage.setItem(`${year}-completed`, isCompleted ? 'false' : 'true');

    console.log('[ExamsModule] Toggled MCQ exam completion:', year, !isCompleted);
    this.eventBus.emit('exams:progress-update-requested');
  }

  /**
   * Toggle exam completion (detects type)
   */
  toggleExamCompletion(examYear) {
    if (examYear.startsWith('mcq-')) {
      this.toggleMcqExamCompletion(examYear);
    } else {
      this.toggleSaqExamCompletion(examYear);
    }
  }

  /**
   * Get all SAQ exams data
   */
  getAllSaqExams() {
    return this.saqExams.map(exam => this.getSaqExamProgress(exam.year));
  }

  /**
   * Get all MCQ exams data
   */
  getAllMcqExams() {
    return this.mcqExams.map(exam => this.getMcqExamProgress(exam.year));
  }
}

// Make globally available
window.ExamsModule = ExamsModule;

// Export legacy functions for compatibility
window.updateExamModal = function() {
  if (window.app && window.app.getModule('examsUI')) {
    window.app.getModule('examsUI').updateSaqExams();
  }
};

window.updateMcqExamModal = function() {
  if (window.app && window.app.getModule('examsUI')) {
    window.app.getModule('examsUI').updateMcqExams();
  }
};
