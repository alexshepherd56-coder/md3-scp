// auth-prompt.js - Show prompts when unauthenticated users try to save data

(function() {
  'use strict';

  // Create toast container
  const toastContainer = document.createElement('div');
  toastContainer.id = 'auth-toast-container';
  toastContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
  `;
  document.body.appendChild(toastContainer);

  function showAuthPrompt(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      background: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 15px;
      max-width: 400px;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
      border-left: 4px solid #D97757;
    `;

    const textDiv = document.createElement('div');
    textDiv.style.cssText = `
      flex: 1;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 14px;
      color: #2c3e50;
    `;
    textDiv.textContent = message || 'Create an account to save your progress';

    const button = document.createElement('button');
    button.textContent = 'Sign Up';
    button.style.cssText = `
      background: #D97757;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.background = '#c66847';
      button.style.transform = 'translateY(-1px)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = '#D97757';
      button.style.transform = 'translateY(0)';
    });

    button.addEventListener('click', () => {
      // Open auth modal
      const authModal = document.getElementById('authModal');
      if (authModal) {
        authModal.style.display = 'block';

        // Switch to sign up tab
        const signUpTab = document.getElementById('signUpTab');
        if (signUpTab) {
          signUpTab.click();
        }
      }

      // Remove toast
      toast.remove();
    });

    toast.appendChild(textDiv);
    toast.appendChild(button);
    toastContainer.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  // Add animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Export to window
  window.showAuthPrompt = showAuthPrompt;

  // Listen for completion/flag events when user is not authenticated
  document.addEventListener('DOMContentLoaded', () => {
    // Track if we've already shown a prompt recently to avoid spam
    let lastPromptTime = 0;
    const PROMPT_COOLDOWN = 3000; // 3 seconds

    function maybeShowPrompt(message) {
      const now = Date.now();
      if (now - lastPromptTime > PROMPT_COOLDOWN) {
        const user = firebase.auth().currentUser;
        if (!user) {
          showAuthPrompt(message);
          lastPromptTime = now;
        }
      }
    }

    // Listen for completion events
    if (window.eventBus) {
      window.eventBus.on('completion:case-completed', () => {
        maybeShowPrompt('Create an account to save your progress across devices');
      });

      window.eventBus.on('flag:case-flagged', () => {
        maybeShowPrompt('Create an account to save your flagged cases');
      });

      window.eventBus.on('flag:question-flagged', () => {
        maybeShowPrompt('Create an account to save your flagged questions');
      });
    }
  });
})();
