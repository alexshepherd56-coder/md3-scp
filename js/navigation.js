// Navigation and Filtering Logic for SCP Cases

// Store current filter for back navigation
let currentFilter = 'none'; // Start with 'none' to show welcome page

// === Welcome Page Functions ===
async function showWelcomePage() {
  console.log('[Navigation] Showing welcome page');
  const welcomePage = document.getElementById('welcomePage');
  const pastExamsContent = document.getElementById('pastExamsContent');
  const scpsMainContent = document.getElementById('scpsMainContent');

  if (welcomePage) welcomePage.style.display = 'flex';
  if (pastExamsContent) pastExamsContent.style.display = 'none';
  if (scpsMainContent) scpsMainContent.style.display = 'none';

  // Clear active states
  document.querySelectorAll('.sidebar h2').forEach(h => h.classList.remove('active'));
  document.querySelectorAll('.specialty').forEach(s => s.classList.remove('active'));

  // Collapse SCPs section using global function
  if (window.collapseScps) {
    window.collapseScps();
  }

  // Update greeting with user's first name
  await updateWelcomeGreeting();

  currentFilter = 'none';
  localStorage.setItem('currentFilter', 'none');

  // Emit event for exam countdown to update
  if (window.eventBus) {
    window.eventBus.emit('welcome:shown');
  }
}

async function updateWelcomeGreeting() {
  const greetingElement = document.getElementById('welcomeGreeting');
  if (!greetingElement) return;

  let firstName = null;

  if (window.authSystem && window.authSystem.currentUser) {
    const user = window.authSystem.currentUser;

    // Try to get from Firestore first (more reliable for new users)
    try {
      const db = window.firebaseDb || firebase.firestore();
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        console.log('[Navigation] Firestore user data:', userData);
        if (userData.displayName && userData.displayName.trim()) {
          const displayName = userData.displayName.trim();
          // Check if it looks like an email (contains @)
          if (displayName.includes('@')) {
            console.log('[Navigation] Firestore displayName is email, extracting name from email');
            firstName = extractNameFromEmail(displayName);
          } else if (displayName.length > 0) {
            // Check if it's just an email username (like "alex.shepherd56")
            if (isEmailUsername(displayName)) {
              console.log('[Navigation] Firestore displayName is email username, extracting name');
              firstName = extractNameFromEmailUsername(displayName);
            } else {
              // It's a proper name
              firstName = displayName.split(' ')[0];
              console.log('[Navigation] Got first name from Firestore:', firstName);
            }
          }
        }
      }
    } catch (error) {
      console.warn('[Navigation] Could not fetch user data from Firestore:', error);
    }

    // If still null, try Firebase user profile
    if (!firstName && user.displayName && user.displayName.trim()) {
      const displayName = user.displayName.trim();
      if (displayName.includes('@')) {
        firstName = extractNameFromEmail(displayName);
      } else if (isEmailUsername(displayName)) {
        firstName = extractNameFromEmailUsername(displayName);
      } else {
        firstName = displayName.split(' ')[0];
        console.log('[Navigation] Got first name from user.displayName:', firstName);
      }
    }

    // Last resort: extract from email address
    if (!firstName && user.email) {
      console.log('[Navigation] No displayName found, extracting from email');
      firstName = extractNameFromEmail(user.email);
    }
  }

  // Use "there" as friendly fallback if no valid name found
  greetingElement.textContent = `Hey there${firstName ? ', ' + firstName : ''}`;
}

// Helper function to check if a string looks like an email username
function isEmailUsername(str) {
  // Check if it contains dots, numbers, or underscores but no spaces
  // and doesn't look like a proper name (no uppercase in middle)
  return /[._\d]/.test(str) && !/\s/.test(str);
}

// Helper function to extract name from email username (before @)
function extractNameFromEmailUsername(username) {
  // Remove numbers and special characters
  let name = username.split(/[._\d]/)[0];
  // Capitalize first letter
  if (name && name.length > 0) {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }
  return null;
}

// Helper function to extract name from full email
function extractNameFromEmail(email) {
  const username = email.split('@')[0];
  return extractNameFromEmailUsername(username);
}

function hideWelcomePage() {
  const welcomePage = document.getElementById('welcomePage');
  if (welcomePage) welcomePage.style.display = 'none';
}

// Make showWelcomePage globally accessible
window.showWelcomePage = showWelcomePage;

// === Mobile Menu Functionality ===
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function toggleMobileMenu() {
  sidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('active');
}

function closeMobileMenu() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
}

if (mobileMenuToggle) {
  mobileMenuToggle.addEventListener('click', toggleMobileMenu);
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', closeMobileMenu);
}

// Close mobile menu when a filter is selected
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('specialty') || e.target.closest('h2[data-group]')) {
    // Delay closing to allow the click to register
    setTimeout(closeMobileMenu, 200);
  }
});

// Save filter to localStorage whenever it changes
function saveCurrentFilter(filter) {
  currentFilter = filter;
  localStorage.setItem('currentFilter', filter);
}

// === Filtering Logic ===
const specialties = document.querySelectorAll('.specialty');
const weekSections = document.querySelectorAll('.week');

function applyFilterBySpecialty(filter) {
  // Only filter case-cards inside scpsMainContent
  document.querySelectorAll('#scpsMainContent .case-card').forEach(card => {
    card.style.display = card.classList.contains(filter) ? 'flex' : 'none';
  });

  let firstVisibleWeek = null;

  weekSections.forEach(week => {
    const grid = week.nextElementSibling;
    const hasCases = Array.from(grid.querySelectorAll('.case-card'))
      .some(c => c.classList.contains(filter));
    week.style.display = hasCases ? 'block' : 'none';
    grid.style.display = hasCases ? 'flex' : 'none';

    // Track first visible week
    if (hasCases && !firstVisibleWeek) {
      firstVisibleWeek = week;
    }

    // Remove first-visible class from all
    week.classList.remove('first-visible-week');
  });

  // Add first-visible class to the first visible week
  if (firstVisibleWeek) {
    firstVisibleWeek.classList.add('first-visible-week');
  }
}

specialties.forEach(spec => {
  spec.addEventListener('click', () => {
    // Hide welcome page
    hideWelcomePage();

    // Show SCPs content, hide Past Exams content
    const scpsMainContent = document.getElementById('scpsMainContent');
    const pastExamsContent = document.getElementById('pastExamsContent');
    if (scpsMainContent) scpsMainContent.style.display = 'block';
    if (pastExamsContent) pastExamsContent.style.display = 'none';

    specialties.forEach(s => s.classList.remove('active'));
    groupHeaders.forEach(g => g.classList.remove('active'));
    // Remove active from Past Exams section
    const pastExamsSection = document.getElementById('pastExamsSection');
    if (pastExamsSection) pastExamsSection.classList.remove('active');
    spec.classList.add('active');

    const filter = spec.dataset.filter;
    saveCurrentFilter(filter);
    applyFilterBySpecialty(filter);

    // Scroll to top of main content
    const mainElement = document.querySelector('.main');
    if (mainElement) {
      mainElement.scrollTop = 0;
    }

    // Expand SCPs if collapsed
    if (window.expandScps && window.scpsState && !window.scpsState.isExpanded) {
      window.expandScps();
    }
  });
});

// === Group Filters ===
const groupHeaders = document.querySelectorAll('h2[data-group]');
groupHeaders.forEach(group => {
  group.addEventListener('click', () => {
    // Hide welcome page
    hideWelcomePage();

    // Show SCPs content, hide Past Exams content
    const scpsMainContent = document.getElementById('scpsMainContent');
    const pastExamsContent = document.getElementById('pastExamsContent');
    if (scpsMainContent) scpsMainContent.style.display = 'block';
    if (pastExamsContent) pastExamsContent.style.display = 'none';

    specialties.forEach(s => s.classList.remove('active'));
    groupHeaders.forEach(g => g.classList.remove('active'));
    // Remove active from Past Exams section
    const pastExamsSection = document.getElementById('pastExamsSection');
    if (pastExamsSection) pastExamsSection.classList.remove('active');
    group.classList.add('active');
    const groupName = group.dataset.group;
    let filters = [];

    if (groupName === 'flagged') {
      // Show only flagged cases
      saveCurrentFilter('flagged');
      showFlaggedCasesOnly();
      return;
    } else if (groupName === 'all') {
      // Show all cases (all specialties)
      filters = ['cardiology', 'psychiatry', 'paediatrics', 'neurology', 'gastroenterology', 'endocrinology', 'renal', 'respiratory', 'rheumatology', 'haematology', 'og', 'git', 'general', 'breast', 'ortho', 'vascular'];
      saveCurrentFilter('all');
    } else if (groupName === 'medicine') {
      // Show all medicine cases (for Year 4, this includes all cases since Week 1 is Anaesthesia/General)
      filters = ['general', 'cardiology', 'psychiatry', 'paediatrics', 'neurology', 'gastroenterology', 'endocrinology', 'renal', 'respiratory', 'rheumatology', 'haematology', 'og'];
      saveCurrentFilter('medicine');
    } else if (groupName === 'surgery') {
      // Show all surgery cases
      filters = ['git', 'general', 'breast', 'ortho', 'vascular'];
      saveCurrentFilter('surgery');
    }

    // Only filter case-cards inside scpsMainContent
    document.querySelectorAll('#scpsMainContent .case-card').forEach(card => {
      card.style.display = filters.some(f => card.classList.contains(f)) ? 'flex' : 'none';
    });

    let firstVisibleWeek = null;

    weekSections.forEach(week => {
      const grid = week.nextElementSibling;
      const hasCases = Array.from(grid.querySelectorAll('.case-card'))
        .some(c => filters.some(f => c.classList.contains(f)));
      week.style.display = hasCases ? 'block' : 'none';
      grid.style.display = hasCases ? 'flex' : 'none';

      // Track first visible week
      if (hasCases && !firstVisibleWeek) {
        firstVisibleWeek = week;
      }

      // Remove first-visible class from all
      week.classList.remove('first-visible-week');
    });

    // Add first-visible class to the first visible week
    if (firstVisibleWeek) {
      firstVisibleWeek.classList.add('first-visible-week');
    }

    // Scroll to top of main content
    const mainElement = document.querySelector('.main');
    if (mainElement) {
      mainElement.scrollTop = 0;
    }
  });
});

// Show only flagged cases
function showFlaggedCasesOnly() {
  // Support both old (window.flagTracker) and new (window.app.getModule('flag')) systems
  let flaggedCaseIds = [];

  if (window.app && window.app.getModule && window.app.getModule('flag')) {
    // Use new flag module
    flaggedCaseIds = window.app.getModule('flag').getAllFlaggedCases().map(f => f.caseId);
  } else if (window.flagTracker) {
    // Fallback to old flag tracker
    flaggedCaseIds = window.flagTracker.getAllFlaggedCases().map(f => f.caseId);
  } else {
    return; // No flag system available
  }

  // Only filter case-cards inside scpsMainContent
  document.querySelectorAll('#scpsMainContent .case-card').forEach(card => {
    const href = card.getAttribute('href');
    const match = href ? href.match(/case(\d+_\d+)/) : null;

    if (match) {
      const caseId = match[1];
      card.style.display = flaggedCaseIds.includes(caseId) ? 'flex' : 'none';
    } else {
      card.style.display = 'none';
    }
  });

  let firstVisibleWeek = null;

  weekSections.forEach(week => {
    const grid = week.nextElementSibling;
    const hasCases = Array.from(grid.querySelectorAll('.case-card'))
      .some(c => c.style.display === 'flex');
    week.style.display = hasCases ? 'block' : 'none';
    grid.style.display = hasCases ? 'flex' : 'none';

    // Track first visible week
    if (hasCases && !firstVisibleWeek) {
      firstVisibleWeek = week;
    }

    // Remove first-visible class from all
    week.classList.remove('first-visible-week');
  });

  // Add first-visible class to the first visible week
  if (firstVisibleWeek) {
    firstVisibleWeek.classList.add('first-visible-week');
  }

  // Scroll to top of main content
  const mainElement = document.querySelector('.main');
  if (mainElement) {
    mainElement.scrollTop = 0;
  }
}

// === Auto Count Script ===
function updateCounts() {
  // Count all case cards by their specialty classes
  const allCaseCards = document.querySelectorAll('#scpsMainContent .case-card');
  const groupTotals = { all: 0, medicine: 0, surgery: 0 };

  // Define which specialties belong to which groups
  const medicineSpecialties = ['general', 'cardiology', 'psychiatry', 'paediatrics', 'neurology', 'gastroenterology', 'endocrinology', 'renal', 'respiratory', 'rheumatology', 'haematology', 'og'];
  const surgerySpecialties = ['git', 'general', 'breast', 'ortho', 'vascular'];

  allCaseCards.forEach(card => {
    groupTotals.all += 1;

    // Check if card belongs to medicine or surgery
    const isMedicine = medicineSpecialties.some(spec => card.classList.contains(spec));
    const isSurgery = surgerySpecialties.some(spec => card.classList.contains(spec));

    if (isMedicine) {
      groupTotals.medicine += 1;
    }
    if (isSurgery) {
      groupTotals.surgery += 1;
    }
  });

  // Update the counts in the sidebar
  const allCountElement = document.querySelector('h2[data-group="all"] .count');
  const medicineCountElement = document.querySelector('h2[data-group="medicine"] .count');
  const surgeryCountElement = document.querySelector('h2[data-group="surgery"] .count');

  if (allCountElement) allCountElement.textContent = `(${groupTotals.all})`;
  if (medicineCountElement) medicineCountElement.textContent = `(${groupTotals.medicine})`;
  if (surgeryCountElement) surgeryCountElement.textContent = `(${groupTotals.surgery})`;
}

// === Progress Bar Update Script ===
function updateSidebarProgress() {
  // Support both old (window.completionTracker) and new (window.app.getModule('completionUI')) systems
  let completionUI = null;

  if (window.app && window.app.getModule && window.app.getModule('completionUI')) {
    // Use new completion module
    completionUI = window.app.getModule('completionUI');
  } else if (window.completionTracker) {
    // Fallback to old completion tracker
    completionUI = window.completionTracker;
  } else {
    return; // No completion system available
  }

  // Define group filters
  const groupFilters = {
    all: ['cardiology', 'psychiatry', 'paediatrics', 'neurology', 'gastroenterology', 'endocrinology', 'renal', 'respiratory', 'rheumatology', 'haematology', 'og', 'git', 'general', 'breast', 'ortho', 'vascular'],
    medicine: ['cardiology', 'psychiatry', 'paediatrics', 'neurology', 'gastroenterology', 'endocrinology', 'renal', 'respiratory', 'rheumatology', 'haematology', 'og'],
    surgery: ['git', 'general', 'breast', 'ortho', 'vascular']
  };

  // Update group progress bars
  ['all', 'medicine', 'surgery'].forEach(group => {
    const groupHeader = document.querySelector(`h2[data-group="${group}"]`);
    if (!groupHeader) return;

    const stats = completionUI.getStatsByGroup(groupFilters[group]);
    updateHeadingProgress(groupHeader, stats);
  });

  // Update specialty progress bars
  document.querySelectorAll('.specialty').forEach(spec => {
    const filter = spec.dataset.filter;
    const stats = completionUI.getStatsBySpecialty(filter);
    updateHeadingProgress(spec, stats);
  });
}

// Helper function to add/update progress bar for a heading
function updateHeadingProgress(element, stats) {
  // Check if completion elements already exist
  let completionText = element.querySelector('.completion-text');
  let completionBar = element.querySelector('.completion-bar');

  if (!completionText) {
    // Create completion text
    completionText = document.createElement('div');
    completionText.className = 'completion-text';
    element.appendChild(completionText);
  }

  if (!completionBar) {
    // Create completion bar
    completionBar = document.createElement('div');
    completionBar.className = 'completion-bar';
    completionBar.innerHTML = '<div class="completion-bar-fill" style="width: 0%"></div>';
    element.appendChild(completionBar);
  }

  // Update completion text (remove "completed" word)
  completionText.textContent = `${stats.completed}/${stats.total}`;

  // Update the progress bar width
  const progressFill = element.querySelector('.completion-bar-fill');
  if (progressFill) {
    progressFill.style.width = `${stats.percentage}%`;
  }
}

updateCounts();

// Update progress bars when completion data is loaded
window.addEventListener('completionDataLoaded', () => {
  updateSidebarProgress();
});

// Listen for completion changes using new event system
if (window.eventBus) {
  // Initial update when completion module is ready
  eventBus.on('completion:initialized', () => {
    console.log('[Navigation] Completion initialized, updating sidebar progress');
    setTimeout(updateSidebarProgress, 100);
  });

  eventBus.on('completion:loaded-from-local', () => {
    updateSidebarProgress();
  });

  eventBus.on('completion:case-completed', () => {
    updateSidebarProgress();
  });

  eventBus.on('completion:case-uncompleted', () => {
    updateSidebarProgress();
  });

  eventBus.on('completion:synced', () => {
    updateSidebarProgress();
  });

  // Also update when app is fully ready
  eventBus.on('app:ready', () => {
    console.log('[Navigation] App ready, updating sidebar progress');
    setTimeout(updateSidebarProgress, 500);
  });
}

// Legacy support: Listen for completion changes from old system
if (window.completionTracker) {
  window.completionTracker.addListener(() => {
    updateSidebarProgress();
  });
} else {
  // Wait for completion tracker to initialize (legacy support)
  const checkTracker = setInterval(() => {
    if (window.completionTracker) {
      clearInterval(checkTracker);
      window.completionTracker.addListener(() => {
        updateSidebarProgress();
      });
    }
  }, 100);
}

// Initial filter will be applied in DOMContentLoaded to ensure elements exist

// === Scroll Position Management ===
// Save scroll positions periodically for reload scenarios
document.addEventListener('DOMContentLoaded', () => {
  const mainElement = document.querySelector('.main');
  const sidebarElement = document.querySelector('.sidebar');

  // Debounce function to limit how often we save
  let scrollSaveTimeout;
  function saveScrollPositions() {
    clearTimeout(scrollSaveTimeout);
    scrollSaveTimeout = setTimeout(() => {
      if (mainElement) {
        localStorage.setItem('mainScrollPosition', mainElement.scrollTop);
      }
      if (sidebarElement) {
        localStorage.setItem('sidebarScrollPosition', sidebarElement.scrollTop);
      }
    }, 100);
  }

  // Listen for scroll events
  if (mainElement) {
    mainElement.addEventListener('scroll', saveScrollPositions);
  }
  if (sidebarElement) {
    sidebarElement.addEventListener('scroll', saveScrollPositions);
  }
});

// === Case Card Click Handlers ===
// Ensure filter and scroll position are saved when clicking on case cards
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.case-card:not(.exam-type-card)').forEach(card => {
    card.addEventListener('click', (e) => {
      // Get current active filter
      const activeSpec = document.querySelector('.specialty.active');
      const activeGroup = document.querySelector('h2[data-group].active');

      let filterToSave = 'all';

      if (activeSpec) {
        filterToSave = activeSpec.dataset.filter;
        console.log('[Navigation] Saving filter from active specialty:', filterToSave);
      } else if (activeGroup) {
        filterToSave = activeGroup.dataset.group;
        console.log('[Navigation] Saving filter from active group:', filterToSave);
      } else {
        // No active filter, check which category this card belongs to
        const cardClasses = Array.from(card.classList);
        const specialtyClass = cardClasses.find(cls =>
          ['cardiology', 'psychiatry', 'paediatrics', 'neurology', 'gastroenterology',
           'endocrinology', 'renal', 'respiratory', 'rheumatology', 'haematology', 'og',
           'git', 'general', 'breast', 'ortho', 'vascular'].includes(cls)
        );
        if (specialtyClass) {
          filterToSave = specialtyClass;
          console.log('[Navigation] No active filter, detected from card classes:', filterToSave);
        }
      }

      // Save scroll positions (main content and sidebar)
      const mainElement = document.querySelector('.main');
      const sidebarElement = document.querySelector('.sidebar');
      const mainScrollPosition = mainElement ? mainElement.scrollTop : 0;
      const sidebarScrollPosition = sidebarElement ? sidebarElement.scrollTop : 0;

      console.log('[Navigation] Case card clicked, saving filter:', filterToSave, 'main scroll:', mainScrollPosition, 'sidebar scroll:', sidebarScrollPosition);
      localStorage.setItem('currentFilter', filterToSave);
      localStorage.setItem('mainScrollPosition', mainScrollPosition);
      localStorage.setItem('sidebarScrollPosition', sidebarScrollPosition);
    }, true); // Use capturing phase to run before navigation
  });
});

// === Search Functionality ===
function performSearch(searchTerm) {
  // Only search case-cards inside scpsMainContent
  const allCards = document.querySelectorAll('#scpsMainContent .case-card');

  if (searchTerm === '') {
    // If search is empty, restore current filter view
    const activeSpec = document.querySelector('.specialty.active');
    const activeGroup = document.querySelector('h2[data-group].active');

    if (activeSpec) {
      activeSpec.click();
    } else if (activeGroup) {
      activeGroup.click();
    }
    return;
  }

  // Clear active states when searching
  specialties.forEach(s => s.classList.remove('active'));
  groupHeaders.forEach(g => g.classList.remove('active'));

  // Show all weeks initially
  weekSections.forEach(week => {
    week.style.display = 'block';
    week.nextElementSibling.style.display = 'flex';
  });

  let hasResults = false;

  // Filter cards based on search term
  allCards.forEach(card => {
    const cardText = card.textContent.toLowerCase();
    if (cardText.includes(searchTerm)) {
      card.style.display = 'flex';
      hasResults = true;
    } else {
      card.style.display = 'none';
    }
  });

  // Hide empty weeks
  weekSections.forEach(week => {
    const grid = week.nextElementSibling;
    const visibleCards = Array.from(grid.querySelectorAll('.case-card'))
      .filter(card => card.style.display !== 'none');

    if (visibleCards.length === 0) {
      week.style.display = 'none';
      grid.style.display = 'none';
    }
  });

  // If no results, could add a "no results" message here
  if (!hasResults) {
    console.log('No cases found for: ' + searchTerm);
  }
}

// Desktop search
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    performSearch(searchTerm);

    // Sync with mobile search
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    if (mobileSearchInput) {
      mobileSearchInput.value = e.target.value;
    }
  });
}

// Mobile search
const mobileSearchInput = document.getElementById('mobileSearchInput');
if (mobileSearchInput) {
  mobileSearchInput.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    performSearch(searchTerm);

    // Sync with desktop search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = e.target.value;
    }
  });
}

// === Past Exams Section ===
const pastExamsSection = document.getElementById('pastExamsSection');
const pastExamsContent = document.getElementById('pastExamsContent');
const scpsMainContent = document.getElementById('scpsMainContent');
const saqExamCard = document.getElementById('saqExamCard');
const saqExamModal = document.getElementById('saqExamModal');
const closeSaqModal = document.getElementById('closeSaqModal');

// Handle Past Exams click
if (pastExamsSection) {
  pastExamsSection.addEventListener('click', (e) => {
    console.log('Past Exams clicked in navigation.js');
    e.stopPropagation(); // Prevent event bubbling

    // Hide welcome page
    hideWelcomePage();

    // Hide SCPs content, show Past Exams content
    if (scpsMainContent) {
      scpsMainContent.style.display = 'none';
      console.log('SCPs content hidden');
    }
    if (pastExamsContent) {
      pastExamsContent.style.display = 'block';
      console.log('Past Exams content shown');
    }

    // Collapse SCPs section using global function
    if (window.collapseScps) {
      window.collapseScps();
      console.log('SCPs section collapsed');
    }

    // Update sidebar active states - remove active from all
    document.querySelectorAll('.sidebar h2').forEach(h => h.classList.remove('active'));
    document.querySelectorAll('.specialty').forEach(s => s.classList.remove('active'));

    // Add active to Past Exams only
    pastExamsSection.classList.add('active');

    // Update exam tiles with progress data
    updateExamModal();
    updateMcqExamModal();

    saveCurrentFilter('past-exams');
  });
} else {
  console.log('pastExamsSection not found!');
}

// SAQ card click is now handled below with updateExamModal

// Handle SAQ modal close
if (closeSaqModal) {
  closeSaqModal.addEventListener('click', () => {
    if (saqExamModal) {
      saqExamModal.style.display = 'none';
    }
    // Ensure we stay on Past Exams page when modal closes
    if (pastExamsSection && !pastExamsSection.classList.contains('active')) {
      pastExamsSection.click();
    }
  });
}

// Close modal when clicking outside
if (saqExamModal) {
  saqExamModal.addEventListener('click', (e) => {
    if (e.target === saqExamModal) {
      saqExamModal.style.display = 'none';
      // Ensure we stay on Past Exams page when modal closes
      if (pastExamsSection && !pastExamsSection.classList.contains('active')) {
        pastExamsSection.click();
      }
    }
  });
}

// Handle exam item clicks
document.querySelectorAll('.exam-item').forEach(item => {
  item.addEventListener('click', (e) => {
    // Don't navigate if clicking the mark complete button
    if (e.target.classList.contains('mark-complete-btn')) {
      return;
    }
    const examYear = item.dataset.exam;
    // Check if it's an MCQ exam
    if (examYear && examYear.startsWith('mcq-')) {
      // Navigate to MCQ exam page
      window.location.href = `exams/${examYear}.html`;
    } else {
      // Navigate to SAQ exam page
      window.location.href = `exams/saq-${examYear}.html`;
    }
  });
});

// Update exam modal with progress info
function updateExamModal() {
  // Update all exams
  const exams = [
    { year: '2024', totalQuestions: 35 },
    { year: '2023', totalQuestions: 36 },
    { year: '2022', totalQuestions: 39 }
  ];

  exams.forEach(exam => {
    const examProgress = JSON.parse(localStorage.getItem(`saq-${exam.year}-progress`) || 'null');
    const examCompletion = localStorage.getItem(`saq-${exam.year}-completed`) === 'true';

    let attemptedCount = 0;
    let flaggedCount = 0;

    if (examProgress && examProgress.questions) {
      // Count attempted (questions with answers) and flagged questions
      attemptedCount = examProgress.questions.filter(q => q.answer && q.answer.trim()).length;
      flaggedCount = examProgress.questions.filter(q => q.flagged).length;
    }

    // Update progress bar
    const progressBar = document.getElementById(`exam${exam.year}Progress`);
    if (progressBar) {
      const progressPercent = (attemptedCount / exam.totalQuestions) * 100;
      progressBar.style.width = `${progressPercent}%`;
    }

    // Update attempts count
    const attemptsCount = document.getElementById(`exam${exam.year}Attempts`);
    if (attemptsCount) {
      attemptsCount.textContent = `${attemptedCount}/${exam.totalQuestions} Questions Attempted`;
    }

    // Update flagged badge
    const flaggedBadge = document.getElementById(`exam${exam.year}Flagged`);
    if (flaggedBadge) {
      if (flaggedCount > 0) {
        flaggedBadge.textContent = `${flaggedCount} Question${flaggedCount !== 1 ? 's' : ''} Flagged`;
        flaggedBadge.style.display = 'inline-block';
      } else {
        flaggedBadge.style.display = 'none';
      }
    }

    // Update completion icon
    const completionIcon = document.getElementById(`exam${exam.year}CompletionIcon`);
    if (completionIcon) {
      if (examCompletion) {
        completionIcon.style.display = 'flex';
      } else {
        completionIcon.style.display = 'none';
      }
    }
  });
}

// Handle completion icon click for all exams
['2024', '2023', '2022'].forEach(year => {
  const examCompletionIcon = document.getElementById(`exam${year}CompletionIcon`);
  if (examCompletionIcon) {
    examCompletionIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCompleted = localStorage.getItem(`saq-${year}-completed`) === 'true';

      if (isCompleted) {
        // Uncomplete
        localStorage.setItem(`saq-${year}-completed`, 'false');
      } else {
        // Mark as completed
        localStorage.setItem(`saq-${year}-completed`, 'true');
      }

      updateExamModal();
    });
  }
});

// Handle clicking on exam card to mark as complete if all questions attempted
document.addEventListener('click', (e) => {
  const examCard = e.target.closest('.exam-card-style[data-exam]');
  if (examCard) {
    const examYear = examCard.dataset.exam;

    // Check if clicked on completion icon area (top right)
    const rect = examCard.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // If clicked in top right corner (where icon is), toggle completion
    if (clickX > rect.width - 60 && clickY < 60) {
      e.stopPropagation();

      // Check if it's MCQ or SAQ exam
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
        const storageKey = examYear && examYear.startsWith('mcq-') ? `${examYear}-completed` : `saq-${examYear}-completed`;
        const isCompleted = localStorage.getItem(storageKey) === 'true';
        localStorage.setItem(storageKey, isCompleted ? 'false' : 'true');

        // Update the appropriate modal
        if (examYear && examYear.startsWith('mcq-')) {
          updateMcqExamModal();
        } else {
          updateExamModal();
        }
      }
      return;
    }

    // Otherwise, handled by the exam-item click handler above
  }
});

// SAQ exam card click no longer needed - exams displayed directly on Past Exams page
// if (saqExamCard) {
//   saqExamCard.addEventListener('click', () => {
//     updateExamModal();
//     if (saqExamModal) {
//       saqExamModal.style.display = 'flex';
//     }
//   });
// }

// === MCQ Exam Modal Handling ===
const mcqExamCard = document.getElementById('mcqExamCard');
const mcqExamModal = document.getElementById('mcqExamModal');
const closeMcqModal = document.getElementById('closeMcqModal');

// Handle MCQ modal close
if (closeMcqModal) {
  closeMcqModal.addEventListener('click', () => {
    if (mcqExamModal) {
      mcqExamModal.style.display = 'none';
    }
    // Ensure we stay on Past Exams page when modal closes
    if (pastExamsSection && !pastExamsSection.classList.contains('active')) {
      pastExamsSection.click();
    }
  });
}

// Close modal when clicking outside
if (mcqExamModal) {
  mcqExamModal.addEventListener('click', (e) => {
    if (e.target === mcqExamModal) {
      mcqExamModal.style.display = 'none';
      // Ensure we stay on Past Exams page when modal closes
      if (pastExamsSection && !pastExamsSection.classList.contains('active')) {
        pastExamsSection.click();
      }
    }
  });
}

// Update MCQ exam modal with progress info
function updateMcqExamModal() {
  const exams = [
    { year: 'mcq-2024', totalQuestions: 57 },
    { year: 'mcq-2023', totalQuestions: 92 }
  ];

  exams.forEach(exam => {
    const examProgress = JSON.parse(localStorage.getItem(`${exam.year}-progress`) || 'null');
    const examCompletion = localStorage.getItem(`${exam.year}-completed`) === 'true';

    let attemptedCount = 0;
    let flaggedCount = 0;

    if (examProgress && examProgress.questions) {
      // Count attempted (questions with selected answers) and flagged questions
      attemptedCount = examProgress.questions.filter(q => q.selectedAnswer !== null && q.selectedAnswer !== undefined).length;
      flaggedCount = examProgress.questions.filter(q => q.flagged).length;
    }

    // Convert exam year to capitalized format for ID (mcq-2024 -> Mcq2024)
    const examId = exam.year.replace('mcq-', 'Mcq');

    // Update progress bar
    const progressBar = document.getElementById(`exam${examId}Progress`);
    if (progressBar) {
      const progressPercent = (attemptedCount / exam.totalQuestions) * 100;
      progressBar.style.width = `${progressPercent}%`;
    }

    // Update attempts count
    const attemptsCount = document.getElementById(`exam${examId}Attempts`);
    if (attemptsCount) {
      attemptsCount.textContent = `${attemptedCount}/${exam.totalQuestions} Questions Attempted`;
    }

    // Update flagged badge
    const flaggedBadge = document.getElementById(`exam${examId}Flagged`);
    if (flaggedBadge) {
      if (flaggedCount > 0) {
        flaggedBadge.textContent = `${flaggedCount} Question${flaggedCount !== 1 ? 's' : ''} Flagged`;
        flaggedBadge.style.display = 'inline-block';
      } else {
        flaggedBadge.style.display = 'none';
      }
    }

    // Update completion icon
    const completionIcon = document.getElementById(`exam${examId}CompletionIcon`);
    if (completionIcon) {
      if (examCompletion) {
        completionIcon.style.display = 'flex';
      } else {
        completionIcon.style.display = 'none';
      }
    }
  });
}

// MCQ exam card click no longer needed - exams displayed directly on Past Exams page
// if (mcqExamCard) {
//   mcqExamCard.addEventListener('click', () => {
//     updateMcqExamModal();
//     if (mcqExamModal) {
//       mcqExamModal.style.display = 'flex';
//     }
//   });
// }

// Initialize correct content based on URL parameter or saved filter
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Navigation] DOMContentLoaded - Initializing filter');

  // Update exam progress on initial load
  updateExamModal();
  updateMcqExamModal();

  // Check for hash first - it takes priority over stored filter
  if (window.location.hash === '#past-exams') {
    console.log('[Navigation] Navigating to Past Exams page from hash');
    // Clear the hash
    history.replaceState(null, null, ' ');

    // Navigate to Past Exams section
    const pastExamsSection = document.getElementById('pastExamsSection');
    if (pastExamsSection) {
      pastExamsSection.click();
    }
    return; // Exit early, don't apply stored filter
  }

  // Check for filter parameter in URL - only use URL param, ignore stored filter
  const urlParams = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get('filter');
  // Always default to 'none' (welcome page) unless URL explicitly has a filter
  const initialFilter = filterParam || 'none';

  console.log('[Navigation] Initial filter:', initialFilter, 'from URL:', filterParam);

  // Apply the initial filter
  if (initialFilter === 'none') {
    // Show welcome page
    showWelcomePage();
  } else if (initialFilter === 'all' || initialFilter === 'medicine' || initialFilter === 'surgery' || initialFilter === 'flagged') {
    // Click on group header
    const targetGroup = document.querySelector(`h2[data-group="${initialFilter}"]`);
    if (targetGroup) {
      console.log('[Navigation] Clicking group:', initialFilter);
      targetGroup.click();
    } else {
      console.warn('[Navigation] Group not found:', initialFilter);
      showWelcomePage();
    }
  } else if (initialFilter === 'past-exams') {
    // Show past exams
    const pastExamsSection = document.getElementById('pastExamsSection');
    if (pastExamsSection) {
      console.log('[Navigation] Clicking past exams');
      pastExamsSection.click();
    }
  } else {
    // Click on specific specialty
    const targetSpec = document.querySelector(`.specialty[data-filter="${initialFilter}"]`);
    if (targetSpec) {
      console.log('[Navigation] Clicking specialty:', initialFilter);
      targetSpec.click();
    } else {
      console.warn('[Navigation] Specialty not found:', initialFilter, '- showing welcome page');
      // Fallback to welcome page
      showWelcomePage();
    }
  }

  // Restore scroll positions if provided in URL or localStorage
  const scrollParam = urlParams.get('scroll');
  const sidebarScrollParam = urlParams.get('sidebarScroll');

  // Also check localStorage for scroll positions (in case of simple reload without URL params)
  const storedMainScroll = localStorage.getItem('mainScrollPosition');
  const storedSidebarScroll = localStorage.getItem('sidebarScrollPosition');

  const mainScrollPosition = scrollParam ? parseInt(scrollParam, 10) : (storedMainScroll ? parseInt(storedMainScroll, 10) : 0);
  const sidebarScrollPosition = sidebarScrollParam ? parseInt(sidebarScrollParam, 10) : (storedSidebarScroll ? parseInt(storedSidebarScroll, 10) : 0);

  if (mainScrollPosition > 0 || sidebarScrollPosition > 0) {
    console.log('[Navigation] Restoring scroll positions - main:', mainScrollPosition, 'sidebar:', sidebarScrollPosition);

    // Restore scroll immediately to prevent flash
    const mainElement = document.querySelector('.main');
    const sidebarElement = document.querySelector('.sidebar');

    if (mainElement && mainScrollPosition > 0) {
      mainElement.scrollTop = mainScrollPosition;
    }
    if (sidebarElement && sidebarScrollPosition > 0) {
      sidebarElement.scrollTop = sidebarScrollPosition;
    }

    // Also restore after a delay to ensure content is fully rendered
    setTimeout(() => {
      if (mainElement && mainScrollPosition > 0) {
        mainElement.scrollTop = mainScrollPosition;
        console.log('[Navigation] Main scroll restored to:', mainScrollPosition);
      }
      if (sidebarElement && sidebarScrollPosition > 0) {
        sidebarElement.scrollTop = sidebarScrollPosition;
        console.log('[Navigation] Sidebar scroll restored to:', sidebarScrollPosition);
      }
    }, 150);
  }

  // Check if URL has #exams hash and open the SAQ Exams modal (legacy support)
  if (window.location.hash === '#exams') {
    console.log('[Navigation] Opening SAQ Exams modal from hash');
    // Clear the hash
    history.replaceState(null, null, ' ');

    // Navigate to Past Exams section first
    if (pastExamsSection) {
      pastExamsSection.click();
    }

    // Then update and open the modal
    setTimeout(() => {
      updateExamModal();
      if (saqExamModal) {
        saqExamModal.style.display = 'flex';
      }
    }, 100);
  }

  // Check if URL has #mcq-exams hash and open the MCQ Exams modal (legacy support)
  if (window.location.hash === '#mcq-exams') {
    console.log('[Navigation] Opening MCQ Exams modal from hash');
    // Clear the hash
    history.replaceState(null, null, ' ');

    // Navigate to Past Exams section first
    if (pastExamsSection) {
      pastExamsSection.click();
    }

    // Then update and open the modal
    setTimeout(() => {
      updateMcqExamModal();
      if (mcqExamModal) {
        mcqExamModal.style.display = 'flex';
      }
    }, 100);
  }
});
