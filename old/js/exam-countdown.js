// Real-time Exam Countdown and Progress Bar
// Updates countdown timers and progress bar on the welcome page

(function() {
  'use strict';

  // Exam dates - UPDATE THESE DATES AS NEEDED
  const SAQ_EXAM_DATE = new Date('2025-11-24T09:00:00+11:00'); // Monday 24 Nov 2025, 9:00 AM AEST
  const MCQ_EXAM_DATE = new Date('2025-11-28T23:59:59+11:00'); // Friday 28 Nov 2025, end of day AEST

  // Course start date (for progress calculation)
  // Calculated so that: Today (Tue) = 75%, Tomorrow (Wed) = 85%, Friday = 100%
  const COURSE_START_DATE = new Date('2025-11-18T23:59:59+11:00'); // 10 days before MCQ exam

  function updateCountdowns() {
    const now = new Date();

    // Calculate days until MCQ exam
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysUntilMCQ = Math.floor((MCQ_EXAM_DATE - now) / msPerDay);

    // Update MCQ countdown only
    const mcqDaysElement = document.getElementById('mcqDays');
    const mcqCountdownElement = document.getElementById('mcqCountdown');
    if (mcqDaysElement && mcqCountdownElement) {
      if (daysUntilMCQ > 0) {
        mcqDaysElement.textContent = daysUntilMCQ;
        mcqCountdownElement.innerHTML = `<strong id="mcqDays">${daysUntilMCQ}</strong> day${daysUntilMCQ !== 1 ? 's' : ''} until MCQ`;
      } else if (daysUntilMCQ === 0) {
        mcqCountdownElement.innerHTML = '<strong>TODAY</strong> - MCQ Exam!';
      } else {
        mcqCountdownElement.innerHTML = '';
      }
    }
  }

  function updateProgressBar() {
    const now = new Date();

    // Calculate total duration from course start to MCQ exam (end of exam period)
    const totalDuration = MCQ_EXAM_DATE - COURSE_START_DATE;

    // Calculate how much time has elapsed
    const elapsed = now - COURSE_START_DATE;

    // Calculate progress percentage (0-100)
    let progressPercent = (elapsed / totalDuration) * 100;

    // Clamp between 0 and 100
    progressPercent = Math.max(0, Math.min(100, progressPercent));

    // Update progress bar
    const timelineProgress = document.getElementById('timelineProgress');
    if (timelineProgress) {
      timelineProgress.style.width = `${progressPercent}%`;
    }

    // Update running student position - aligned with progress bar
    const runningStudent = document.getElementById('runningStudent');
    if (runningStudent) {
      // Position the student exactly at the end of the progress bar
      runningStudent.style.left = `${progressPercent}%`;

      // Add running animation class if not already present
      if (!runningStudent.classList.contains('running')) {
        runningStudent.classList.add('running');
      }

      // Check if reached end (100%)
      if (progressPercent >= 100) {
        runningStudent.classList.add('finished');
        runningStudent.textContent = '🍺'; // Change to beer when finished!
      }
    }
  }

  function updateExamMarkers() {
    // MCQ marker stays at 100% (end of timeline)
    const mcqMarker = document.querySelector('.mcq-marker');
    if (mcqMarker) {
      mcqMarker.style.left = '100%';
    }
  }

  function formatDate(date) {
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-GB', options);
  }

  function updateExamDates() {
    // Update date label on MCQ marker only
    const mcqDateElement = document.querySelector('.mcq-marker .marker-date');
    if (mcqDateElement) {
      mcqDateElement.textContent = formatDate(MCQ_EXAM_DATE);
    }
  }

  function init() {
    console.log('[ExamCountdown] Initializing real-time countdown...');

    // Update everything immediately
    updateCountdowns();
    updateProgressBar();
    updateExamMarkers();
    updateExamDates();

    // Update countdowns every minute (60000ms)
    setInterval(updateCountdowns, 60000);

    // Update progress bar every hour (3600000ms)
    setInterval(updateProgressBar, 3600000);

    console.log('[ExamCountdown] Real-time updates enabled');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also update when welcome page is shown
  if (window.eventBus) {
    window.eventBus.on('welcome:shown', () => {
      updateCountdowns();
      updateProgressBar();
    });
  }

  // Make exam dates available globally for easy updates
  window.examDates = {
    SAQ: SAQ_EXAM_DATE,
    MCQ: MCQ_EXAM_DATE,
    COURSE_START: COURSE_START_DATE,
    update: function(saqDate, mcqDate, courseStart) {
      if (saqDate) SAQ_EXAM_DATE = new Date(saqDate);
      if (mcqDate) MCQ_EXAM_DATE = new Date(mcqDate);
      if (courseStart) COURSE_START_DATE = new Date(courseStart);
      updateCountdowns();
      updateProgressBar();
      updateExamMarkers();
      updateExamDates();
    }
  };

})();
