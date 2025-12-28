/**
 * ExamsUI - Exams User Interface Handler
 *
 * Responsibilities:
 * - Show/hide Past Exams section
 * - Update exam progress displays
 * - Handle exam modal interactions
 * - Handle completion icon clicks
 * - Handle exam card click navigation
 *
 * NO business logic - all logic in ExamsModule
 */

class ExamsUI {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.examsModule = null;

    // DOM references
    this.pastExamsSection = null;
    this.saqExamModal = null;
    this.mcqExamModal = null;
  }

  /**
   * Initialize UI handlers
   */
  initialize(examsModule) {
    console.log('[ExamsUI] Initializing...');

    this.examsModule = examsModule;

    // Cache DOM references
    this.cacheDOMReferences();

    // Set up event listeners
    this.setupEventListeners();

    // Set up click handlers
    this.setupClickHandlers();

    // Initial update
    this.updateSaqExams();
    this.updateMcqExams();

    console.log('[ExamsUI] Initialized successfully');
  }

  /**
   * Cache DOM element references
   */
  cacheDOMReferences() {
    this.pastExamsSection = document.getElementById('pastExamsSection');
    this.saqExamModal = document.getElementById('saqExamModal');
    this.mcqExamModal = document.getElementById('mcqExamModal');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for view changes
    this.eventBus.on('exams:view-changed', () => {
      this.handleViewChange();
    });

    // Listen for progress update requests
    this.eventBus.on('exams:progress-update-requested', () => {
      this.updateSaqExams();
      this.updateMcqExams();
    });
  }

  /**
   * Set up click handlers
   */
  setupClickHandlers() {
    // Past Exams section click handler
    if (this.pastExamsSection) {
      this.pastExamsSection.addEventListener('click', (e) => {
        e.stopPropagation();
        window._userInteracted = true; // Mark user interaction
        this.examsModule.show();
      });
    }

    // SAQ modal close handlers
    const closeSaqModal = document.getElementById('closeSaqModal');
    if (closeSaqModal) {
      closeSaqModal.addEventListener('click', () => {
        if (this.saqExamModal) {
          this.saqExamModal.style.display = 'none';
        }
      });
    }

    if (this.saqExamModal) {
      this.saqExamModal.addEventListener('click', (e) => {
        if (e.target === this.saqExamModal) {
          this.saqExamModal.style.display = 'none';
        }
      });
    }

    // MCQ modal close handlers
    const closeMcqModal = document.getElementById('closeMcqModal');
    if (closeMcqModal) {
      closeMcqModal.addEventListener('click', () => {
        if (this.mcqExamModal) {
          this.mcqExamModal.style.display = 'none';
        }
      });
    }

    if (this.mcqExamModal) {
      this.mcqExamModal.addEventListener('click', (e) => {
        if (e.target === this.mcqExamModal) {
          this.mcqExamModal.style.display = 'none';
        }
      });
    }

    // Exam item navigation
    document.querySelectorAll('.exam-item').forEach(item => {
      item.addEventListener('click', (e) => {
        // Don't navigate if clicking the mark complete button
        if (e.target.classList.contains('mark-complete-btn')) {
          return;
        }

        const examYear = item.dataset.exam;
        if (examYear && examYear.startsWith('mcq-')) {
          window.location.href = `exams/${examYear}.html`;
        } else {
          window.location.href = `exams/saq-${examYear}.html`;
        }
      });
    });

    // SAQ completion icon clicks
    ['2024', '2023', '2022'].forEach(year => {
      const examCompletionIcon = document.getElementById(`exam${year}CompletionIcon`);
      if (examCompletionIcon) {
        examCompletionIcon.addEventListener('click', (e) => {
          e.stopPropagation();
          this.examsModule.toggleSaqExamCompletion(year);
        });
      }
    });

    // Exam card completion area clicks
    document.addEventListener('click', (e) => {
      const examCard = e.target.closest('.exam-card-style[data-exam]');
      if (examCard) {
        const examYear = examCard.dataset.exam;
        const rect = examCard.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // If clicked in top right corner (where icon is), toggle completion
        if (clickX > rect.width - 60 && clickY < 60) {
          e.stopPropagation();

          let examProgress, attemptedCount;
          if (examYear && examYear.startsWith('mcq-')) {
            examProgress = JSON.parse(localStorage.getItem(`${examYear}-progress`) || 'null');
            attemptedCount = examProgress?.questions?.filter(q => q.selectedAnswer !== null && q.selectedAnswer !== undefined).length || 0;
          } else {
            examProgress = JSON.parse(localStorage.getItem(`saq-${examYear}-progress`) || 'null');
            attemptedCount = examProgress?.questions?.filter(q => q.answer && q.answer.trim()).length || 0;
          }

          // Only allow marking complete if at least some progress
          if (attemptedCount > 0) {
            this.examsModule.toggleExamCompletion(examYear);
          }
          return;
        }
      }
    });
  }

  /**
   * Handle view change
   */
  handleViewChange() {
    console.log('[ExamsUI] Handling view change');

    // Update sidebar active states
    document.querySelectorAll('.sidebar h2').forEach(h => h.classList.remove('active'));
    document.querySelectorAll('.specialty').forEach(s => s.classList.remove('active'));

    // Add active to Past Exams
    if (this.pastExamsSection) {
      this.pastExamsSection.classList.add('active');
    }

    // Collapse SCPs section
    if (window.collapseScps) {
      window.collapseScps();
    }

    // Update exam progress
    this.updateSaqExams();
    this.updateMcqExams();
  }

  /**
   * Update SAQ exams display
   */
  updateSaqExams() {
    const exams = this.examsModule.getAllSaqExams();

    exams.forEach(exam => {
      // Update progress bar
      const progressBar = document.getElementById(`exam${exam.year}Progress`);
      if (progressBar) {
        progressBar.style.width = `${exam.progressPercent}%`;
      }

      // Update attempts count
      const attemptsCount = document.getElementById(`exam${exam.year}Attempts`);
      if (attemptsCount) {
        attemptsCount.textContent = `${exam.attemptedCount}/${exam.totalQuestions} Questions Attempted`;
      }

      // Update flagged badge
      const flaggedBadge = document.getElementById(`exam${exam.year}Flagged`);
      if (flaggedBadge) {
        if (exam.flaggedCount > 0) {
          flaggedBadge.textContent = `${exam.flaggedCount} Question${exam.flaggedCount !== 1 ? 's' : ''} Flagged`;
          flaggedBadge.style.display = 'inline-block';
        } else {
          flaggedBadge.style.display = 'none';
        }
      }

      // Update completion icon
      const completionIcon = document.getElementById(`exam${exam.year}CompletionIcon`);
      if (completionIcon) {
        completionIcon.style.display = exam.completed ? 'flex' : 'none';
      }
    });
  }

  /**
   * Update MCQ exams display
   */
  updateMcqExams() {
    const exams = this.examsModule.getAllMcqExams();

    exams.forEach(exam => {
      // Convert exam year to capitalized format for ID (mcq-2024 -> Mcq2024)
      const examId = exam.year.replace('mcq-', 'Mcq');

      // Update progress bar
      const progressBar = document.getElementById(`exam${examId}Progress`);
      if (progressBar) {
        progressBar.style.width = `${exam.progressPercent}%`;
      }

      // Update attempts count
      const attemptsCount = document.getElementById(`exam${examId}Attempts`);
      if (attemptsCount) {
        attemptsCount.textContent = `${exam.attemptedCount}/${exam.totalQuestions} Questions Attempted`;
      }

      // Update flagged badge
      const flaggedBadge = document.getElementById(`exam${examId}Flagged`);
      if (flaggedBadge) {
        if (exam.flaggedCount > 0) {
          flaggedBadge.textContent = `${exam.flaggedCount} Question${exam.flaggedCount !== 1 ? 's' : ''} Flagged`;
          flaggedBadge.style.display = 'inline-block';
        } else {
          flaggedBadge.style.display = 'none';
        }
      }

      // Update completion icon
      const completionIcon = document.getElementById(`exam${examId}CompletionIcon`);
      if (completionIcon) {
        completionIcon.style.display = exam.completed ? 'flex' : 'none';
      }
    });
  }
}

// Make globally available
window.ExamsUI = ExamsUI;
