/**
 * Utility Helper Functions
 * Shared utilities used across modules
 */

/**
 * Extract case ID from URL or href
 * @param {string} url - URL or href string
 * @returns {string|null} Case ID (e.g., "1_1") or null
 */
function getCaseIdFromUrl(url) {
  const match = url.match(/case(\d+_\d+)/);
  return match ? match[1] : null;
}

/**
 * Get current case ID from window location
 * @returns {string|null}
 */
function getCurrentCaseId() {
  return getCaseIdFromUrl(window.location.pathname);
}

/**
 * Get user initials from name or email
 * @param {object} user - User object with displayName and/or email
 * @returns {string} User initials
 */
function getUserInitials(user) {
  if (!user) return '?';

  if (user.displayName && user.displayName.trim()) {
    const names = user.displayName.trim().split(/\s+/).filter(n => n.length > 0);
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    } else if (names.length === 1) {
      return names[0][0].toUpperCase();
    }
  }

  // Fallback to email first letter
  if (user.email) {
    return user.email[0].toUpperCase();
  }

  return '?';
}

/**
 * Debounce function - prevents function from being called too frequently
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {function}
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - limits function calls to once per time period
 * @param {function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {function}
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Safe localStorage get - handles errors
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if not found or error
 * @returns {*}
 */
function getLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safe localStorage set - handles errors
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success
 */
function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Remove from localStorage
 * @param {string} key - Storage key
 */
function removeLocalStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

/**
 * Migrate localStorage completion data to Firestore
 * Centralized migration function to avoid duplication
 * @param {string} userId - User ID
 * @param {object} firebaseService - Firebase service instance
 * @returns {Promise<{success: boolean, migratedCount: number}>}
 */
async function migrateLocalStorageToFirestore(userId, firebaseService) {
  try {
    if (!userId || !firebaseService || !firebaseService.isReady()) {
      console.warn('[Helpers] Cannot migrate: invalid parameters');
      return { success: false, migratedCount: 0 };
    }

    const localData = localStorage.getItem('scp_completedCases');
    if (!localData) {
      return { success: true, migratedCount: 0 };
    }

    const completedCases = JSON.parse(localData);
    const db = firebaseService.getDb();
    const userProgressRef = db.collection('users').doc(userId).collection('progress');

    // Check if user already has data in Firestore
    const existingData = await userProgressRef.limit(1).get();

    // Only migrate if Firestore is empty
    if (existingData.empty && Object.keys(completedCases).length > 0) {
      const batch = db.batch();

      for (const [caseId, timestamp] of Object.entries(completedCases)) {
        const docRef = userProgressRef.doc(caseId);
        batch.set(docRef, {
          completedAt: new Date(timestamp),
          migratedFromLocalStorage: true
        });
      }

      await batch.commit();
      const migratedCount = Object.keys(completedCases).length;
      console.log(`[Helpers] Migrated ${migratedCount} cases from localStorage to Firestore`);

      return { success: true, migratedCount };
    }

    return { success: true, migratedCount: 0 };
  } catch (error) {
    console.error('[Helpers] Error migrating localStorage data:', error);
    return { success: false, migratedCount: 0, error: error.message };
  }
}

// Export functions for use in modules
if (typeof window !== 'undefined') {
  window.helpers = {
    getCaseIdFromUrl,
    getCurrentCaseId,
    getUserInitials,
    debounce,
    throttle,
    getLocalStorage,
    setLocalStorage,
    removeLocalStorage,
    migrateLocalStorageToFirestore
  };
}
