// Text Markup Module - Highlighting and Underlining for Case Content
// Saves markups to Firebase per user/case

console.log('[TextMarkup] Script loaded');

(function() {
  'use strict';

  // Configuration
  const MARKUP_COLORS = {
    yellow: '#fff176',
    green: '#a5d6a7',
    blue: '#90caf9',
    pink: '#f48fb1',
    orange: '#ffcc80'
  };

  let currentUser = null;
  let caseId = null;
  let markupToolbar = null;
  let isInitialized = false;

  // Get current case ID from URL
  function getCurrentCaseId() {
    const path = window.location.pathname;
    // Match patterns like case1_1.html, case10_2.html, case3.3.html
    const match = path.match(/case[\d_.]+\.html/i);
    if (match) {
      // Extract just the case identifier
      const caseFile = match[0].replace('.html', '');
      return caseFile;
    }
    return null;
  }

  // Initialize the markup system
  function init() {
    if (isInitialized) return;

    console.log('[TextMarkup] Initializing...');
    console.log('[TextMarkup] Pathname:', window.location.pathname);

    caseId = getCurrentCaseId();
    console.log('[TextMarkup] Case ID:', caseId);

    // Always create toolbar on case pages (check for container)
    const container = document.querySelector('.container');
    if (!container) {
      console.log('[TextMarkup] No container found, skipping');
      return;
    }

    createToolbar();
    addSelectionListener();

    if (caseId) {
      loadMarkups();
    }

    isInitialized = true;
    console.log('[TextMarkup] Initialized successfully');
  }

  // Create the floating toolbar
  function createToolbar() {
    markupToolbar = document.createElement('div');
    markupToolbar.className = 'markup-toolbar';
    markupToolbar.innerHTML = `
      <div class="markup-toolbar-inner">
        <button class="markup-btn highlight-btn" data-action="highlight" data-color="yellow" title="Highlight Yellow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 2H15L14 10H10L9 2Z"/>
            <path d="M8 14H16L18 22H6L8 14Z"/>
            <line x1="10" y1="10" x2="8" y2="14"/>
            <line x1="14" y1="10" x2="16" y2="14"/>
          </svg>
        </button>
        <div class="color-picker">
          <button class="color-btn" data-color="yellow" style="background: ${MARKUP_COLORS.yellow}" title="Yellow"></button>
          <button class="color-btn" data-color="green" style="background: ${MARKUP_COLORS.green}" title="Green"></button>
          <button class="color-btn" data-color="blue" style="background: ${MARKUP_COLORS.blue}" title="Blue"></button>
          <button class="color-btn" data-color="pink" style="background: ${MARKUP_COLORS.pink}" title="Pink"></button>
          <button class="color-btn" data-color="orange" style="background: ${MARKUP_COLORS.orange}" title="Orange"></button>
        </div>
        <div class="markup-divider"></div>
        <button class="markup-btn underline-btn" data-action="underline" title="Underline">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 3v7a6 6 0 0 0 12 0V3"/>
            <line x1="4" y1="21" x2="20" y2="21"/>
          </svg>
        </button>
        <div class="markup-divider"></div>
        <button class="markup-btn remove-btn" data-action="remove" title="Remove Markup">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `;
    document.body.appendChild(markupToolbar);

    // Add event listeners for toolbar buttons
    markupToolbar.querySelectorAll('.markup-btn').forEach(btn => {
      btn.addEventListener('mousedown', handleToolbarAction);
    });

    markupToolbar.querySelectorAll('.color-btn').forEach(btn => {
      btn.addEventListener('mousedown', handleColorSelect);
    });
  }

  // Handle text selection
  function addSelectionListener() {
    let selectionTimeout = null;

    document.addEventListener('mouseup', (e) => {
      // Don't trigger if clicking on toolbar
      if (markupToolbar && markupToolbar.contains(e.target)) return;

      // Small delay to allow selection to complete
      clearTimeout(selectionTimeout);
      selectionTimeout = setTimeout(() => handleSelection(e), 10);
    });

    document.addEventListener('keyup', (e) => {
      // Only handle selection on Shift key releases (for shift+arrow selections)
      if (e.shiftKey || e.key === 'Shift') {
        clearTimeout(selectionTimeout);
        selectionTimeout = setTimeout(() => handleSelection(e), 10);
      }
    });

    // Hide toolbar when clicking outside
    document.addEventListener('mousedown', (e) => {
      if (markupToolbar && !markupToolbar.contains(e.target)) {
        hideToolbar();
      }
    });
  }

  // Handle text selection event
  function handleSelection(e) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    console.log('[TextMarkup] Selection:', selectedText.substring(0, 30) + '...');

    if (selectedText.length > 0) {
      // Check if selection is within valid content area
      const container = document.querySelector('.container');
      if (container && container.contains(selection.anchorNode)) {
        console.log('[TextMarkup] Valid selection, showing toolbar');
        positionToolbar(selection);
        showToolbar();
      }
    }
  }

  // Position the toolbar near the selection
  function positionToolbar(selection) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const toolbarWidth = 260;
    const toolbarHeight = 44;

    // Use viewport-relative positioning (fixed)
    let left = rect.left + (rect.width / 2) - (toolbarWidth / 2);
    let top = rect.top - toolbarHeight - 10;

    // Keep toolbar within viewport
    if (left < 10) left = 10;
    if (left + toolbarWidth > window.innerWidth - 10) {
      left = window.innerWidth - toolbarWidth - 10;
    }

    // If not enough space above, show below
    if (top < 10) {
      top = rect.bottom + 10;
    }

    console.log('[TextMarkup] Positioning toolbar at:', left, top);

    markupToolbar.style.left = `${left}px`;
    markupToolbar.style.top = `${top}px`;
  }

  // Show the toolbar
  function showToolbar() {
    markupToolbar.classList.add('visible');
  }

  // Hide the toolbar
  function hideToolbar() {
    markupToolbar.classList.remove('visible');
  }

  // Handle toolbar button actions
  function handleToolbarAction(e) {
    e.preventDefault();
    e.stopPropagation();

    const action = e.currentTarget.dataset.action;
    const color = e.currentTarget.dataset.color || 'yellow';

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    switch (action) {
      case 'highlight':
        applyHighlight(selection, color);
        break;
      case 'underline':
        applyUnderline(selection);
        break;
      case 'remove':
        removeMarkup(selection);
        break;
    }

    hideToolbar();
    selection.removeAllRanges();
    saveMarkups();
  }

  // Handle color selection
  function handleColorSelect(e) {
    e.preventDefault();
    e.stopPropagation();

    const color = e.currentTarget.dataset.color;
    const selection = window.getSelection();

    if (selection.rangeCount) {
      applyHighlight(selection, color);
      hideToolbar();
      selection.removeAllRanges();
      saveMarkups();
    }
  }

  // Apply highlight to selected text
  function applyHighlight(selection, color) {
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    // Check if we're inside an existing markup
    const existingMarkup = getExistingMarkup(range);
    if (existingMarkup && existingMarkup.classList.contains('text-highlight')) {
      // Update color of existing highlight
      existingMarkup.style.backgroundColor = MARKUP_COLORS[color];
      existingMarkup.dataset.color = color;
      return;
    }

    try {
      const span = document.createElement('span');
      span.className = 'text-highlight';
      span.style.backgroundColor = MARKUP_COLORS[color];
      span.dataset.color = color;
      span.dataset.markupId = generateMarkupId();

      range.surroundContents(span);
    } catch (err) {
      // Handle complex selections (spanning multiple elements)
      wrapComplexSelection(range, 'highlight', color);
    }
  }

  // Apply underline to selected text
  function applyUnderline(selection) {
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    // Check if we're inside an existing underline
    const existingMarkup = getExistingMarkup(range);
    if (existingMarkup && existingMarkup.classList.contains('text-underline')) {
      return; // Already underlined
    }

    try {
      const span = document.createElement('span');
      span.className = 'text-underline';
      span.dataset.markupId = generateMarkupId();

      range.surroundContents(span);
    } catch (err) {
      // Handle complex selections
      wrapComplexSelection(range, 'underline');
    }
  }

  // Remove markup from selected text
  function removeMarkup(selection) {
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    // Find all markup spans in the selection
    const markupSpans = [];

    if (container.nodeType === Node.TEXT_NODE) {
      // Check parent for markup
      const parent = container.parentElement;
      if (parent && (parent.classList.contains('text-highlight') || parent.classList.contains('text-underline'))) {
        markupSpans.push(parent);
      }
    } else {
      // Find all markup spans within the container
      const highlights = container.querySelectorAll ? container.querySelectorAll('.text-highlight, .text-underline') : [];
      markupSpans.push(...highlights);
    }

    // Remove each markup span
    markupSpans.forEach(span => {
      const parent = span.parentNode;
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span);
      }
      parent.removeChild(span);
    });
  }

  // Get existing markup element if selection is inside one
  function getExistingMarkup(range) {
    let node = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentElement;
    }

    while (node && node !== document.body) {
      if (node.classList && (node.classList.contains('text-highlight') || node.classList.contains('text-underline'))) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  // Handle complex selections spanning multiple elements
  function wrapComplexSelection(range, type, color) {
    const fragment = range.extractContents();
    const span = document.createElement('span');
    span.className = type === 'highlight' ? 'text-highlight' : 'text-underline';
    span.dataset.markupId = generateMarkupId();

    if (type === 'highlight') {
      span.style.backgroundColor = MARKUP_COLORS[color];
      span.dataset.color = color;
    }

    span.appendChild(fragment);
    range.insertNode(span);
  }

  // Generate unique markup ID
  function generateMarkupId() {
    return 'markup_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Save markups to Firebase
  function saveMarkups() {
    // Check if Firebase is available
    if (typeof firebase === 'undefined' || !firebase.auth) {
      saveToLocalStorage();
      return;
    }

    let user;
    try {
      user = firebase.auth().currentUser;
    } catch (err) {
      saveToLocalStorage();
      return;
    }

    if (!user || !caseId) {
      saveToLocalStorage();
      return;
    }

    const markups = collectMarkups();
    const db = firebase.firestore();

    db.collection('users').doc(user.uid)
      .collection('caseMarkups').doc(caseId)
      .set({
        markups: markups,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(() => {
        console.log('[TextMarkup] Markups saved to Firebase');
      })
      .catch(err => {
        console.error('[TextMarkup] Error saving markups:', err);
        saveToLocalStorage();
      });
  }

  // Collect all markups from the page
  function collectMarkups() {
    const markups = [];
    const container = document.querySelector('.container');
    if (!container) return markups;

    container.querySelectorAll('.text-highlight, .text-underline').forEach(span => {
      const markup = {
        id: span.dataset.markupId,
        type: span.classList.contains('text-highlight') ? 'highlight' : 'underline',
        text: span.textContent,
        xpath: getXPath(span),
        parentText: getParentContext(span)
      };

      if (markup.type === 'highlight') {
        markup.color = span.dataset.color || 'yellow';
      }

      markups.push(markup);
    });

    return markups;
  }

  // Get XPath for an element
  function getXPath(element) {
    if (!element) return '';

    const parts = [];
    let current = element;

    while (current && current !== document.body) {
      let index = 1;
      let sibling = current.previousElementSibling;

      while (sibling) {
        if (sibling.tagName === current.tagName) index++;
        sibling = sibling.previousElementSibling;
      }

      parts.unshift(`${current.tagName.toLowerCase()}[${index}]`);
      current = current.parentElement;
    }

    return '//' + parts.join('/');
  }

  // Get parent context for fuzzy matching
  function getParentContext(element) {
    const parent = element.parentElement;
    if (!parent) return '';

    // Get surrounding text for context
    const text = parent.textContent || '';
    const markupText = element.textContent || '';
    const index = text.indexOf(markupText);

    if (index === -1) return text.substring(0, 100);

    const start = Math.max(0, index - 30);
    const end = Math.min(text.length, index + markupText.length + 30);

    return text.substring(start, end);
  }

  // Save to localStorage as fallback
  function saveToLocalStorage() {
    if (!caseId) return;

    const markups = collectMarkups();
    const key = `caseMarkups_${caseId}`;

    try {
      localStorage.setItem(key, JSON.stringify(markups));
      console.log('[TextMarkup] Markups saved to localStorage');
    } catch (err) {
      console.error('[TextMarkup] Error saving to localStorage:', err);
    }
  }

  // Load markups from Firebase or localStorage
  function loadMarkups() {
    // Check if Firebase is available
    if (typeof firebase === 'undefined' || !firebase.auth) {
      console.log('[TextMarkup] Firebase not available, using localStorage');
      loadFromLocalStorage();
      return;
    }

    try {
      const user = firebase.auth().currentUser;

      if (user && caseId) {
        loadFromFirebase(user.uid);
      } else {
        // Wait for auth state change
        firebase.auth().onAuthStateChanged((user) => {
          if (user && caseId) {
            loadFromFirebase(user.uid);
          } else {
            loadFromLocalStorage();
          }
        });
      }
    } catch (err) {
      console.log('[TextMarkup] Firebase error, using localStorage:', err);
      loadFromLocalStorage();
    }
  }

  // Load markups from Firebase
  function loadFromFirebase(userId) {
    const db = firebase.firestore();

    db.collection('users').doc(userId)
      .collection('caseMarkups').doc(caseId)
      .get()
      .then(doc => {
        if (doc.exists) {
          const data = doc.data();
          applyMarkups(data.markups || []);
          console.log('[TextMarkup] Markups loaded from Firebase');
        } else {
          // Check localStorage for any existing markups
          loadFromLocalStorage();
        }
      })
      .catch(err => {
        console.error('[TextMarkup] Error loading from Firebase:', err);
        loadFromLocalStorage();
      });
  }

  // Load markups from localStorage
  function loadFromLocalStorage() {
    if (!caseId) return;

    const key = `caseMarkups_${caseId}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const markups = JSON.parse(stored);
        applyMarkups(markups);
        console.log('[TextMarkup] Markups loaded from localStorage');
      }
    } catch (err) {
      console.error('[TextMarkup] Error loading from localStorage:', err);
    }
  }

  // Apply saved markups to the page
  function applyMarkups(markups) {
    if (!markups || !markups.length) return;

    const container = document.querySelector('.container');
    if (!container) return;

    markups.forEach(markup => {
      try {
        // Try to find the text in the document
        const found = findAndMarkText(container, markup);
        if (!found) {
          console.log('[TextMarkup] Could not restore markup:', markup.text.substring(0, 30));
        }
      } catch (err) {
        console.error('[TextMarkup] Error applying markup:', err);
      }
    });
  }

  // Find and mark text in the document
  function findAndMarkText(container, markup) {
    const treeWalker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = treeWalker.nextNode()) {
      const text = node.textContent;
      const index = text.indexOf(markup.text);

      if (index !== -1) {
        // Check if already marked
        if (node.parentElement.classList.contains('text-highlight') ||
            node.parentElement.classList.contains('text-underline')) {
          continue;
        }

        // Create range for the text
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + markup.text.length);

        // Apply the markup
        const span = document.createElement('span');
        span.className = markup.type === 'highlight' ? 'text-highlight' : 'text-underline';
        span.dataset.markupId = markup.id;

        if (markup.type === 'highlight') {
          span.style.backgroundColor = MARKUP_COLORS[markup.color] || MARKUP_COLORS.yellow;
          span.dataset.color = markup.color || 'yellow';
        }

        try {
          range.surroundContents(span);
          return true;
        } catch (err) {
          console.log('[TextMarkup] Could not surround contents:', err);
        }
      }
    }

    return false;
  }

  // Clear all markups from the page
  function clearAllMarkups() {
    const container = document.querySelector('.container');
    if (!container) return;

    container.querySelectorAll('.text-highlight, .text-underline').forEach(span => {
      const parent = span.parentNode;
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span);
      }
      parent.removeChild(span);
    });

    saveMarkups();
  }

  // Expose public API
  window.textMarkup = {
    init: init,
    clearAll: clearAllMarkups,
    save: saveMarkups
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
