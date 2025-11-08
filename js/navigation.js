// Navigation and Filtering Logic for SCP Cases

// Store current filter for back navigation
let currentFilter = 'all';

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
  document.querySelectorAll('.case-card').forEach(card => {
    card.style.display = card.classList.contains(filter) ? 'flex' : 'none';
  });
  weekSections.forEach(week => {
    const grid = week.nextElementSibling;
    const hasCases = Array.from(grid.querySelectorAll('.case-card'))
      .some(c => c.classList.contains(filter));
    week.style.display = hasCases ? 'block' : 'none';
    grid.style.display = hasCases ? 'flex' : 'none';
  });
}

specialties.forEach(spec => {
  spec.addEventListener('click', () => {
    specialties.forEach(s => s.classList.remove('active'));
    groupHeaders.forEach(g => g.classList.remove('active'));
    spec.classList.add('active');
    saveCurrentFilter(spec.dataset.filter);
    applyFilterBySpecialty(spec.dataset.filter);
  });
});

// === Group Filters ===
const groupHeaders = document.querySelectorAll('h2[data-group]');
groupHeaders.forEach(group => {
  group.addEventListener('click', () => {
    specialties.forEach(s => s.classList.remove('active'));
    groupHeaders.forEach(g => g.classList.remove('active'));
    group.classList.add('active');
    const groupName = group.dataset.group;
    let filters = [];

    if (groupName === 'flagged') {
      // Show only flagged cases
      saveCurrentFilter('flagged');
      showFlaggedCasesOnly();
      return;
    } else if (groupName === 'all') {
      filters = ['cardiology', 'psychiatry', 'paediatrics', 'neurology', 'gastroenterology', 'endocrinology', 'renal', 'respiratory', 'rheumatology', 'haematology', 'og', 'git', 'general', 'breast', 'ortho', 'vascular'];
      saveCurrentFilter('all');
    } else if (groupName === 'medicine') {
      filters = ['cardiology', 'psychiatry', 'paediatrics', 'neurology', 'gastroenterology', 'endocrinology', 'renal', 'respiratory', 'rheumatology', 'haematology', 'og'];
      saveCurrentFilter('medicine');
    } else if (groupName === 'surgery') {
      filters = ['git', 'general', 'breast', 'ortho'];
      saveCurrentFilter('surgery');
    }

    document.querySelectorAll('.case-card').forEach(card => {
      card.style.display = filters.some(f => card.classList.contains(f)) ? 'flex' : 'none';
    });
    weekSections.forEach(week => {
      const grid = week.nextElementSibling;
      const hasCases = Array.from(grid.querySelectorAll('.case-card'))
        .some(c => filters.some(f => c.classList.contains(f)));
      week.style.display = hasCases ? 'block' : 'none';
      grid.style.display = hasCases ? 'flex' : 'none';
    });
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

  document.querySelectorAll('.case-card').forEach(card => {
    const href = card.getAttribute('href');
    const match = href ? href.match(/case(\d+_\d+)/) : null;

    if (match) {
      const caseId = match[1];
      card.style.display = flaggedCaseIds.includes(caseId) ? 'flex' : 'none';
    } else {
      card.style.display = 'none';
    }
  });

  weekSections.forEach(week => {
    const grid = week.nextElementSibling;
    const hasCases = Array.from(grid.querySelectorAll('.case-card'))
      .some(c => c.style.display === 'flex');
    week.style.display = hasCases ? 'block' : 'none';
    grid.style.display = hasCases ? 'flex' : 'none';
  });
}

// === Auto Count Script ===
function updateCounts() {
  const allSpecialties = document.querySelectorAll('.specialty');
  const groupTotals = { all: 0, medicine: 0, surgery: 0 };

  allSpecialties.forEach(spec => {
    const filter = spec.dataset.filter;
    const count = document.querySelectorAll('.case-card.' + filter).length;
    spec.querySelector('.count').textContent = `(${count})`;

    groupTotals.all += count;
    if (['cardiology','psychiatry','paediatrics','neurology','gastroenterology','endocrinology','renal','respiratory','rheumatology','haematology','og'].includes(filter)) {
      groupTotals.medicine += count;
    } else if (['git','general','breast','ortho','vascular'].includes(filter)) {
      groupTotals.surgery += count;
    }
  });

  document.querySelector('h2[data-group="all"] .count').textContent = `(${groupTotals.all})`;
  document.querySelector('h2[data-group="medicine"] .count').textContent = `(${groupTotals.medicine})`;
  document.querySelector('h2[data-group="surgery"] .count').textContent = `(${groupTotals.surgery})`;
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

// Check for filter parameter in URL or use stored filter
const urlParams = new URLSearchParams(window.location.search);
const filterParam = urlParams.get('filter');
// Use stored filter from localStorage if available
const storedFilter = localStorage.getItem('currentFilter');
const initialFilter = filterParam || storedFilter || 'all';

// Apply the initial filter
if (initialFilter === 'all' || initialFilter === 'medicine' || initialFilter === 'surgery') {
  // Click on group header
  const targetGroup = document.querySelector(`h2[data-group="${initialFilter}"]`);
  if (targetGroup) targetGroup.click();
} else {
  // Click on specific specialty
  const targetSpec = document.querySelector(`.specialty[data-filter="${initialFilter}"]`);
  if (targetSpec) {
    targetSpec.click();
  } else {
    // Fallback to All SCPs
    document.querySelector('h2[data-group="all"]').click();
  }
}

// === Scroll Position Management ===
// TODO: Implement scroll restoration in future session

// === Search Functionality ===
function performSearch(searchTerm) {
  const allCards = document.querySelectorAll('.case-card');

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
