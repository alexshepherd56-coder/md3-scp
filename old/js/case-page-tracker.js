// Case Page View Tracker
// Automatically tracks when a case page is viewed

(function() {
  'use strict';

  // Wait for DOM and analytics to be ready
  function initCaseTracking() {
    if (!window.userAnalytics) {
      console.log('[Case Tracker] userAnalytics not available yet, retrying...');
      setTimeout(initCaseTracking, 500);
      return;
    }

    try {
      // Get case ID from URL or from flagTracker
      let caseId;
      if (window.flagTracker && window.flagTracker.getCurrentCaseId) {
        caseId = window.flagTracker.getCurrentCaseId();
      }

      // Fallback: extract from URL
      if (!caseId) {
        const path = window.location.pathname;
        const fileName = path.split('/').pop();
        caseId = fileName.replace('.html', '');
      }

      // Get case title from document title
      const fullTitle = document.title;
      const caseTitle = fullTitle.split('|')[0].trim();

      console.log('[Case Tracker] Tracking case view:', caseId, caseTitle);

      // Track the case view
      window.userAnalytics.trackCaseView(caseId, caseTitle);

    } catch (error) {
      console.error('[Case Tracker] Error tracking case view:', error);
    }
  }

  // Start tracking when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initCaseTracking, 500);
    });
  } else {
    setTimeout(initCaseTracking, 500);
  }
})();
