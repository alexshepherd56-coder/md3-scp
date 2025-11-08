/**
 * EventBus - Central communication system for modules
 *
 * Allows modules to communicate without direct dependencies.
 * Modules emit events, other modules listen - no tight coupling!
 *
 * Example:
 *   eventBus.emit('user:signed-in', userData);
 *   eventBus.on('user:signed-in', (userData) => { ... });
 */

class EventBus {
  constructor() {
    // Store all event listeners
    this.listeners = {};

    // Track event history for debugging
    this.eventHistory = [];
    this.maxHistorySize = 50;

    // Enable/disable debug logging
    this.debug = false;
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name (e.g., 'user:signed-in')
   * @param {function} callback - Function to call when event fires
   * @returns {function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(callback);

    if (this.debug) {
      console.log(`[EventBus] Listener added for: ${event}`);
    }

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event, but only fire once
   * @param {string} event - Event name
   * @param {function} callback - Function to call when event fires
   * @returns {function} Unsubscribe function
   */
  once(event, callback) {
    const onceWrapper = (...args) => {
      callback(...args);
      this.off(event, onceWrapper);
    };

    return this.on(event, onceWrapper);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {function} callback - Original callback function
   */
  off(event, callback) {
    if (!this.listeners[event]) return;

    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);

    if (this.debug) {
      console.log(`[EventBus] Listener removed for: ${event}`);
    }
  }

  /**
   * Emit an event to all listeners
   * @param {string} event - Event name
   * @param {*} data - Data to pass to listeners
   */
  emit(event, data) {
    // Add to history
    this.eventHistory.push({
      event,
      data,
      timestamp: new Date().toISOString()
    });

    // Keep history size manageable
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    if (this.debug) {
      console.log(`[EventBus] Event emitted: ${event}`, data);
    }

    // Call all listeners for this event
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[EventBus] Error in listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event (or all events)
   * @param {string} event - Event name (optional)
   */
  clear(event) {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }

  /**
   * Get list of all events being listened to
   * @returns {Array} Array of event names
   */
  getEvents() {
    return Object.keys(this.listeners);
  }

  /**
   * Get number of listeners for an event
   * @param {string} event - Event name
   * @returns {number} Number of listeners
   */
  getListenerCount(event) {
    return this.listeners[event]?.length || 0;
  }

  /**
   * Get event history (for debugging)
   * @param {number} count - Number of recent events to return
   * @returns {Array} Recent events
   */
  getHistory(count = 10) {
    return this.eventHistory.slice(-count);
  }

  /**
   * Enable debug logging
   */
  enableDebug() {
    this.debug = true;
    console.log('[EventBus] Debug mode enabled');
  }

  /**
   * Disable debug logging
   */
  disableDebug() {
    this.debug = false;
  }
}

// Create and export a singleton instance
const eventBus = new EventBus();

// Make it available globally for backward compatibility
window.eventBus = eventBus;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventBus;
}
