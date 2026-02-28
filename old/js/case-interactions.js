// Case Page Interactions

// Back navigation function
function goBack(event) {
  event.preventDefault();

  // Get saved filter - if none exists or is 'none', default to 'all'
  const storedFilter = localStorage.getItem('currentFilter');
  console.log('[goBack] Stored filter from localStorage:', storedFilter);

  let filter = storedFilter || 'all';

  // If filter is 'none' (welcome page was showing), default to 'all' to show cases
  if (filter === 'none') {
    console.log('[goBack] Filter was none, changing to all');
    filter = 'all';
  }

  // Get saved scroll positions
  const mainScrollPosition = localStorage.getItem('mainScrollPosition') || '0';
  const sidebarScrollPosition = localStorage.getItem('sidebarScrollPosition') || '0';

  console.log('[goBack] Navigating to index with filter:', filter, 'scroll:', mainScrollPosition, 'sidebarScroll:', sidebarScrollPosition);

  // Navigate back to index with filter and scroll positions
  // This will show the filtered view (e.g., All SCPs, Medicine, etc.) instead of welcome page
  window.location.href = `../index.html?filter=${filter}&scroll=${mainScrollPosition}&sidebarScroll=${sidebarScrollPosition}`;
}

// Toggle Answers and Initialize Flag Buttons
document.addEventListener('DOMContentLoaded', function() {
  // Toggle answer visibility
  document.querySelectorAll('.toggle').forEach(btn => {
    btn.addEventListener('click', function () {
      const ans = this.nextElementSibling;
      ans.style.display = ans.style.display === 'block' ? 'none' : 'block';
      this.textContent = ans.style.display === 'block' ? 'Hide Answer' : 'Show Answer';
    });
  });

  // Add flag buttons to each question
  addFlagButtons();

  // Update flag button states
  if (window.flagTracker) {
    window.flagTracker.updateAllFlagButtons();
  }
});

// Add flag buttons to each question
function addFlagButtons() {
  const questions = document.querySelectorAll('.question');
  const caseId = window.flagTracker ? window.flagTracker.getCurrentCaseId() : null;

  if (!caseId) return;

  questions.forEach((questionDiv, index) => {
    const questionNumber = index + 1;

    // Extract question text
    const strongElement = questionDiv.querySelector('strong');
    const questionText = strongElement ? strongElement.textContent.trim() : `Question ${questionNumber}`;

    // Check if flag button already exists
    if (questionDiv.querySelector('.flag-button')) return;

    // Create flag button
    const flagButton = document.createElement('button');
    flagButton.className = 'flag-button';
    flagButton.setAttribute('data-flag-question', questionNumber);
    // Bookmark icon with visible chevron notch at bottom
    flagButton.innerHTML = '<span class="flag-text">Flag</span><svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1 L15 1 L15 15 L8 11 L1 15 L1 1 Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    flagButton.title = 'Flag this question as difficult';

    // Add click handler
    flagButton.addEventListener('click', function(e) {
      e.preventDefault();
      if (window.flagTracker) {
        window.flagTracker.toggleFlag(caseId, questionNumber, questionText);
      }
    });

    // Insert flag button at the top right of the question div
    questionDiv.appendChild(flagButton);
  });
}

// Function to handle flag button click
function toggleQuestionFlag(questionNumber) {
  if (window.flagTracker) {
    const caseId = window.flagTracker.getCurrentCaseId();
    const questionDiv = document.querySelectorAll('.question')[questionNumber - 1];
    const questionText = questionDiv ? questionDiv.querySelector('strong').textContent : `Question ${questionNumber}`;

    window.flagTracker.toggleFlag(caseId, questionNumber, questionText);
  }
}
