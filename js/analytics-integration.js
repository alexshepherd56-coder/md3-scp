// Analytics Integration Helper
// Automatically tracks user interactions with the platform

(function() {
  'use strict';

  // Wait for analytics to be ready
  function waitForAnalytics(callback) {
    if (window.userAnalytics && window.firebaseAuth) {
      callback();
    } else {
      setTimeout(() => waitForAnalytics(callback), 100);
    }
  }

  // Auto-track case views on case pages
  function trackCasePageView() {
    // Extract case ID from URL (e.g., case1_1.html -> case1_1)
    const path = window.location.pathname;
    const caseMatch = path.match(/case(\d+_\d+|3\.3)\.html/);

    if (caseMatch) {
      const caseId = 'case' + caseMatch[1];

      // Get case title from page
      const titleElement = document.querySelector('h1.case-title') ||
                          document.querySelector('h1') ||
                          document.querySelector('title');
      const caseTitle = titleElement ? titleElement.textContent : caseId;

      // Track the case view
      waitForAnalytics(() => {
        window.userAnalytics.trackCaseView(caseId, caseTitle);
        console.log('Analytics: Tracked case view -', caseId);
      });
    }
  }

  // Auto-track exam resource views
  function trackExamPageView() {
    const path = window.location.pathname;

    // Match SAQ or MCQ pages (e.g., saq-2024.html, mcq-2024.html)
    const examMatch = path.match(/(saq|mcq)-(\d{4})\.html/);

    if (examMatch) {
      const examType = examMatch[1].toUpperCase(); // SAQ or MCQ
      const examYear = examMatch[2]; // 2024, 2023, etc.

      waitForAnalytics(() => {
        window.userAnalytics.trackExamResource(examType, examYear);
        console.log('Analytics: Tracked exam resource -', examType, examYear);
      });
    }
  }

  // Track filter usage
  function setupFilterTracking() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupFilterTracking);
      return;
    }

    // Track filter buttons if they exist
    const filterButtons = document.querySelectorAll('.filter-btn, [data-filter]');
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        const filterValue = this.dataset.filter || this.textContent;
        waitForAnalytics(() => {
          window.userAnalytics.trackFilter('specialty', filterValue);
          console.log('Analytics: Tracked filter -', filterValue);
        });
      });
    });

    // Track sidebar filter clicks if they exist
    const sidebarFilters = document.querySelectorAll('.sidebar-section');
    sidebarFilters.forEach(section => {
      section.addEventListener('click', function() {
        const filterText = this.querySelector('h3')?.textContent || 'Unknown';
        waitForAnalytics(() => {
          window.userAnalytics.trackFilter('sidebar', filterText);
          console.log('Analytics: Tracked sidebar filter -', filterText);
        });
      });
    });
  }

  // Track search usage
  function setupSearchTracking() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupSearchTracking);
      return;
    }

    const searchInput = document.querySelector('#searchInput, input[type="search"], .search-input');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();

        // Only track searches with 3+ characters after user stops typing
        if (query.length >= 3) {
          searchTimeout = setTimeout(() => {
            waitForAnalytics(() => {
              window.userAnalytics.trackSearch(query);
              console.log('Analytics: Tracked search -', query);
            });
          }, 1000); // Wait 1 second after user stops typing
        }
      });
    }
  }

  // Track flag/bookmark usage
  function setupFlagTracking() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupFlagTracking);
      return;
    }

    // Monitor for flag button clicks
    document.addEventListener('click', function(e) {
      const flagButton = e.target.closest('.flag-button, [data-flag], .bookmark-button');
      if (flagButton) {
        const path = window.location.pathname;
        const caseMatch = path.match(/case(\d+_\d+|3\.3)\.html/);

        if (caseMatch) {
          const caseId = 'case' + caseMatch[1];
          const isFlagged = flagButton.classList.contains('flagged') ||
                          flagButton.classList.contains('active');
          const action = isFlagged ? 'remove' : 'add';

          waitForAnalytics(() => {
            window.userAnalytics.trackFlag(caseId, action);
            console.log('Analytics: Tracked flag -', caseId, action);
          });
        }
      }
    });
  }

  // Integrate with existing completion tracker
  function integrateCompletionTracking() {
    // Hook into the existing completion tracker if it exists
    if (window.completionTracker) {
      const originalMarkComplete = window.completionTracker.markCaseComplete;
      if (originalMarkComplete) {
        window.completionTracker.markCaseComplete = function(caseId) {
          // Call original function
          originalMarkComplete.call(this, caseId);

          // Track completion in analytics
          waitForAnalytics(() => {
            window.userAnalytics.trackFeatureUsage('case_completion', {
              caseId: caseId,
              timestamp: new Date().toISOString()
            });
            console.log('Analytics: Tracked case completion -', caseId);
          });
        };
      }
    }
  }

  // Initialize all tracking
  function initialize() {
    console.log('Analytics Integration: Initializing...');

    // Track page views
    trackCasePageView();
    trackExamPageView();

    // Setup event tracking
    setupFilterTracking();
    setupSearchTracking();
    setupFlagTracking();

    // Integrate with existing systems
    integrateCompletionTracking();

    console.log('Analytics Integration: Ready');
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();
