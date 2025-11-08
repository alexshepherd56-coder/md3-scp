/**
 * AuthUI - Authentication UI Handler (NO AUTH LOGIC)
 *
 * Responsibilities:
 * - Update UI based on auth events
 * - Handle user interactions with auth UI
 * - Manage auth modal display
 * - Enable/disable content protection
 * - NO authentication logic
 * - NO direct Firebase calls
 *
 * Listens to events:
 * - auth:signed-in
 * - auth:signed-out
 * - auth:error
 */

class AuthUI {
  constructor(app) {
    this.app = app;
    this.eventBus = app.getEventBus();
    this.authModule = null; // Will be set after auth module loads
    this.initialized = false;
  }

  /**
   * Initialize UI handlers
   */
  initialize(authModule) {
    if (this.initialized) {
      console.warn('[AuthUI] Already initialized');
      return;
    }

    this.authModule = authModule;
    console.log('[AuthUI] Initializing...');

    // Inject auth modal if needed
    this.injectAuthModalIfNeeded();

    // Set up event listeners
    this.setupEventListeners();

    // Set up form handlers
    this.setupFormHandlers();

    // Initial UI state (disable content until authenticated)
    this.disableContent();

    this.initialized = true;
    console.log('[AuthUI] Initialized');
  }

  /**
   * Set up event listeners for auth events
   */
  setupEventListeners() {
    // Listen for sign in
    this.eventBus.on('auth:signed-in', (user) => {
      console.log('[AuthUI] User signed in, updating UI');
      this.showAuthenticatedUI(user);
      this.enableContent();
      this.closeAuthModal();
    });

    // Listen for sign out
    this.eventBus.on('auth:signed-out', () => {
      console.log('[AuthUI] User signed out, updating UI');
      this.showUnauthenticatedUI();
      this.disableContent();
      setTimeout(() => this.openAuthModal(), 100);
    });

    // Listen for errors
    this.eventBus.on('auth:error', (error) => {
      console.error('[AuthUI] Auth error:', error);
      this.showError(error.error);
    });

    // Set up auth button click handler
    const authButton = document.getElementById('authButton');
    if (authButton) {
      authButton.onclick = () => this.openAuthModal();
    }
  }

  /**
   * Set up form submission handlers
   */
  setupFormHandlers() {
    // Sign in form
    const signInForm = document.getElementById('signInForm');
    if (signInForm) {
      signInForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSignIn();
      });
    }

    // Sign up form
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
      signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSignUp();
      });
    }

    // Forgot password form
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
      forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleForgotPassword();
      });
    }

    // Sign out button
    const signOutButton = document.getElementById('dropdownSignOut');
    if (signOutButton) {
      signOutButton.onclick = () => this.handleSignOut();
    }
  }

  /**
   * Handle sign in form submission
   */
  async handleSignIn() {
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;

    this.clearError();
    const result = await this.authModule.signIn(email, password);

    if (!result.success) {
      this.showError(result.error);
    }
  }

  /**
   * Handle sign up form submission
   */
  async handleSignUp() {
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    const name = document.getElementById('signUpName').value;

    this.clearError();
    const result = await this.authModule.signUp(email, password, name);

    if (!result.success) {
      this.showError(result.error);
    }
  }

  /**
   * Handle forgot password form submission
   */
  async handleForgotPassword() {
    const email = document.getElementById('forgotPasswordEmail').value;

    this.clearError();
    const result = await this.authModule.sendPasswordResetEmail(email);

    if (result.success) {
      alert('Password reset email sent! Check your inbox.');
      this.switchToSignIn();
    } else {
      this.showError(result.error);
    }
  }

  /**
   * Handle sign out
   */
  async handleSignOut() {
    if (confirm('Are you sure you want to sign out?')) {
      await this.authModule.signOut();
    }
  }

  /**
   * Show authenticated UI
   */
  showAuthenticatedUI(user) {
    const authButton = document.getElementById('authButton');
    const userProfile = document.getElementById('userProfile');
    const userInitialCircle = document.getElementById('userInitialCircle');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');

    // Hide sign in button, show user profile
    if (authButton) {
      authButton.style.display = 'none';
    }

    if (userProfile) {
      userProfile.style.display = 'flex';

      // Set user initials
      if (userInitialCircle) {
        const initials = this.authModule.getUserInitials();
        userInitialCircle.textContent = initials;
      }

      // Set dropdown info
      if (dropdownUserName) {
        dropdownUserName.textContent = user.displayName || user.email.split('@')[0];
      }
      if (dropdownUserEmail) {
        dropdownUserEmail.textContent = user.email;
      }

      // Setup dropdown toggle
      this.setupDropdownToggle();
    }
  }

  /**
   * Show unauthenticated UI
   */
  showUnauthenticatedUI() {
    const authButton = document.getElementById('authButton');
    const userProfile = document.getElementById('userProfile');

    if (authButton) {
      authButton.textContent = 'Sign In';
      authButton.style.display = 'block';
    }

    if (userProfile) {
      userProfile.style.display = 'none';
    }
  }

  /**
   * Disable content access (blur and disable interactions)
   */
  disableContent() {
    const main = document.querySelector('.main');
    const sidebar = document.querySelector('.sidebar');

    if (main) {
      main.style.pointerEvents = 'none';
      main.style.opacity = '0.3';
      main.style.filter = 'blur(3px)';
    }

    if (sidebar) {
      sidebar.style.pointerEvents = 'none';
      sidebar.style.opacity = '0.3';
      sidebar.style.filter = 'blur(3px)';
    }
  }

  /**
   * Enable content access
   */
  enableContent() {
    const main = document.querySelector('.main');
    const sidebar = document.querySelector('.sidebar');

    if (main) {
      main.style.pointerEvents = 'auto';
      main.style.opacity = '1';
      main.style.filter = 'none';
    }

    if (sidebar) {
      sidebar.style.pointerEvents = 'auto';
      sidebar.style.opacity = '1';
      sidebar.style.filter = 'none';
    }
  }

  /**
   * Open authentication modal
   */
  openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.style.display = 'flex';
      this.eventBus.emit('auth:modal-opened');
    }
  }

  /**
   * Close authentication modal
   */
  closeAuthModal() {
    // Only allow closing if user is signed in
    if (!this.authModule.isSignedIn()) {
      return;
    }

    const modal = document.getElementById('authModal');
    if (modal) {
      modal.style.display = 'none';
      this.eventBus.emit('auth:modal-closed');
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorDiv = document.getElementById('authError');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
  }

  /**
   * Clear error message
   */
  clearError() {
    const errorDiv = document.getElementById('authError');
    if (errorDiv) {
      errorDiv.textContent = '';
      errorDiv.style.display = 'none';
    }
  }

  /**
   * Switch to sign in form
   */
  switchToSignIn() {
    document.getElementById('signInForm').style.display = 'block';
    document.getElementById('signUpForm').style.display = 'none';
    document.getElementById('forgotPasswordForm').style.display = 'none';
    document.getElementById('authModalTitle').textContent = 'Sign In';
  }

  /**
   * Setup dropdown toggle functionality
   */
  setupDropdownToggle() {
    const userInitialCircle = document.getElementById('userInitialCircle');
    const userDropdown = document.getElementById('userDropdown');

    if (userInitialCircle && userDropdown) {
      // Toggle dropdown on click
      userInitialCircle.onclick = (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
      };

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target) && e.target !== userInitialCircle) {
          userDropdown.classList.remove('show');
        }
      });
    }
  }

  /**
   * Inject auth modal HTML if it doesn't exist (for case pages)
   */
  injectAuthModalIfNeeded() {
    if (!document.getElementById('authModal')) {
      const modalHTML = `
        <div id="authModal" class="auth-modal">
          <div class="auth-hologram-container">
            <div class="hologram-logo">
              <img src="${window.location.pathname.includes('/cases/') ? '../' : ''}assets/ShepTech logo.png" alt="ShepTech Logo" class="hologram-image">
              <span class="hologram-text">SHEPTECH</span>
            </div>
          </div>
          <h1 class="auth-hero-text">EVERY Y3 SCP</h1>
          <div class="auth-modal-content">
            <button class="auth-modal-close" id="authModalClose" onclick="window.authUI.closeAuthModal()">&times;</button>
            <h2 id="authModalTitle">Sign In</h2>
            <p id="authModalSubtitle" class="auth-subtitle" style="display: none;"></p>
            <div id="authError" class="auth-error" style="display: none;"></div>

            <form id="signInForm" class="auth-form">
              <input type="email" id="signInEmail" placeholder="Email" required>
              <input type="password" id="signInPassword" placeholder="Password" required>
              <button type="submit" class="auth-submit-button">Sign In</button>
              <div class="auth-divider">
                <span>or</span>
              </div>
              <button type="button" class="auth-signup-button" id="showSignUp">Create New Account</button>
              <p class="auth-link">
                <a href="#" id="showForgotPassword">Forgot password?</a>
              </p>
            </form>

            <form id="signUpForm" class="auth-form" style="display: none;">
              <input type="email" id="signUpEmail" placeholder="Email" required>
              <input type="text" id="signUpName" placeholder="Full Name" required>
              <input type="password" id="signUpPassword" placeholder="Password (min 6 characters)" required>
              <button type="submit" class="auth-submit-button">Sign Up</button>
              <p class="auth-link">
                Already have an account? <a href="#" id="showSignIn">Sign in</a>
              </p>
            </form>

            <form id="forgotPasswordForm" class="auth-form" style="display: none;">
              <p class="auth-description">Enter your email to receive a password reset link</p>
              <input type="email" id="forgotPasswordEmail" placeholder="Email" required>
              <button type="submit" class="auth-submit-button">Send Reset Link</button>
              <p class="auth-link">
                <a href="#" id="backToSignIn">Back to sign in</a>
              </p>
            </form>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('afterbegin', modalHTML);

      // Set up form switching
      document.getElementById('showSignUp').addEventListener('click', () => {
        document.getElementById('signInForm').style.display = 'none';
        document.getElementById('signUpForm').style.display = 'block';
        document.getElementById('authModalTitle').textContent = 'Sign Up';
      });

      document.getElementById('showSignIn').addEventListener('click', (e) => {
        e.preventDefault();
        this.switchToSignIn();
      });

      document.getElementById('showForgotPassword').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('signInForm').style.display = 'none';
        document.getElementById('forgotPasswordForm').style.display = 'block';
        document.getElementById('authModalTitle').textContent = 'Reset Password';
      });

      document.getElementById('backToSignIn').addEventListener('click', (e) => {
        e.preventDefault();
        this.switchToSignIn();
      });
    }
  }
}

// Make available globally
window.AuthUI = AuthUI;
