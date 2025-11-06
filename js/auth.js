// Authentication System for SCP Cases
// Handles user login, signup, logout, and auth state management

class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.auth = null;
    this.db = null;
  }

  // Initialize auth system
  initialize() {
    console.log('auth.js: initialize() called');

    // ALWAYS disable content on page load until authenticated
    this.disableContent();

    try {
      // Check if Firebase is available and initialized
      if (typeof firebase === 'undefined') {
        console.error('auth.js: Firebase SDK not loaded. Please refresh the page.');
        this.auth = null;
        this.db = null;
        this.showUnauthenticatedUI();
        this.openAuthModal();
        return;
      }

      // Use the global Firebase auth/db if already initialized, otherwise create new
      this.auth = window.firebaseAuth || firebase.auth();
      this.db = window.firebaseDb || firebase.firestore();

      console.log('auth.js: Firebase auth initialized:', !!this.auth);
      console.log('auth.js: Firebase firestore initialized:', !!this.db);

      if (!this.auth || !this.db) {
        console.error('auth.js: Firebase auth or db not available. Please refresh the page.');
        this.showUnauthenticatedUI();
        this.openAuthModal();
        return;
      }

      // Inject auth modal if it doesn't exist (for case pages)
      this.injectAuthModalIfNeeded();

      // Check current user immediately (synchronous check)
      const immediateUser = this.auth.currentUser;
      if (immediateUser) {
        console.log('auth.js: Found existing user session:', immediateUser.email);
        this.currentUser = immediateUser;
        // Wait for DOM to be ready, then show authenticated UI
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            this.showAuthenticatedUI();
            this.enableContent();
          });
        } else {
          this.showAuthenticatedUI();
          this.enableContent();
        }
      }

      // Listen for auth state changes
      this.auth.onAuthStateChanged((user) => {
        console.log('auth.js: Auth state changed, user:', user ? user.email : 'null');
        this.handleAuthStateChange(user);
      });

      console.log('auth.js: Auth state listener attached');
    } catch (error) {
      console.error('auth.js: Error during initialization:', error);
      console.error('auth.js: Authentication required. Please refresh the page.');
      this.auth = null;
      this.db = null;
      this.showUnauthenticatedUI();
      this.openAuthModal();
    }
  }

  // Inject auth modal HTML if it doesn't exist (for case pages)
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
            <button class="auth-modal-close" id="authModalClose" onclick="window.authSystem.closeAuthModal()">&times;</button>
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

      // Load auth-ui script if not already loaded
      if (!document.querySelector('script[src*="auth-ui.js"]')) {
        const script = document.createElement('script');
        script.src = (window.location.pathname.includes('/cases/') ? '../' : '') + 'js/auth-ui.js';
        document.body.appendChild(script);
      }
    }
  }

  // Handle authentication state changes
  handleAuthStateChange(user) {
    this.currentUser = user;

    if (user) {
      // User is signed in
      console.log('User signed in:', user.email);

      // Ensure DOM is ready before updating UI
      if (document.readyState === 'loading') {
        console.log('DOM still loading, waiting...');
        document.addEventListener('DOMContentLoaded', () => {
          console.log('DOM now loaded, updating UI');
          this.showAuthenticatedUI();
        });
      } else {
        this.showAuthenticatedUI();
      }

      this.enableContent();

      // Initialize completion tracker for this user
      if (window.completionTracker) {
        window.completionTracker.syncWithFirestore();
      }
    } else {
      // User is signed out
      console.log('User signed out');

      // Ensure DOM is ready before updating UI
      if (document.readyState === 'loading') {
        console.log('DOM still loading, waiting...');
        document.addEventListener('DOMContentLoaded', () => {
          console.log('DOM now loaded, updating UI');
          this.showUnauthenticatedUI();
          setTimeout(() => {
            this.openAuthModal();
          }, 100);
        });
      } else {
        this.showUnauthenticatedUI();
        // Show auth modal immediately if not signed in
        setTimeout(() => {
          this.openAuthModal();
        }, 100);
      }

      this.disableContent();
    }
  }

  // Disable content access when not logged in
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

  // Enable content access when logged in
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

  // Sign up new user
  async signUp(email, password, displayName = '') {
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Update display name if provided
      if (displayName) {
        await user.updateProfile({ displayName });
      }

      // Create user document in Firestore
      await this.db.collection('users').doc(user.uid).set({
        email: user.email,
        displayName: displayName || email.split('@')[0],
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        subscriptionStatus: 'free' // For future monetization
      });

      // Migrate localStorage data if exists
      this.migrateLocalStorageData(user.uid);

      return { success: true, user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign in existing user
  async signIn(email, password) {
    try {
      // Check if Firebase auth is available
      if (!this.auth) {
        console.error('Firebase auth not initialized');
        return {
          success: false,
          error: 'Authentication system not available. Please make sure you are connected to the internet and refresh the page.'
        };
      }

      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);

      // Migrate localStorage data if exists (for returning users)
      this.migrateLocalStorageData(userCredential.user.uid);

      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign out
  async signOut() {
    try {
      await this.auth.signOut();
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Password reset
  async sendPasswordResetEmail(email) {
    try {
      await this.auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  }

  // Migrate localStorage completion data to Firestore
  async migrateLocalStorageData(userId) {
    try {
      const localData = localStorage.getItem('scp_completedCases');
      if (localData) {
        const completedCases = JSON.parse(localData);

        // Check if user already has data in Firestore
        const userProgressRef = this.db.collection('users').doc(userId).collection('progress');
        const existingData = await userProgressRef.limit(1).get();

        // Only migrate if Firestore is empty
        if (existingData.empty && Object.keys(completedCases).length > 0) {
          const batch = this.db.batch();

          for (const [caseId, timestamp] of Object.entries(completedCases)) {
            const docRef = userProgressRef.doc(caseId);
            batch.set(docRef, {
              completedAt: new Date(timestamp),
              migratedFromLocalStorage: true
            });
          }

          await batch.commit();
          console.log('Migrated localStorage data to Firestore');

          // Keep localStorage as backup for now
          // localStorage.removeItem('scp_completedCases');
        }
      }
    } catch (error) {
      console.error('Error migrating localStorage data:', error);
    }
  }

  // Get user initials from display name or email
  getUserInitials(user) {
    if (user.displayName && user.displayName.trim()) {
      const names = user.displayName.trim().split(/\s+/).filter(n => n.length > 0);
      if (names.length >= 2) {
        // First and last initial
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      } else if (names.length === 1) {
        // Just first initial if only one name
        return names[0][0].toUpperCase();
      }
    }
    // Fallback to email first letter
    return user.email[0].toUpperCase();
  }

  // Show authenticated UI
  showAuthenticatedUI() {
    console.log('showAuthenticatedUI called, currentUser:', this.currentUser);
    const authButton = document.getElementById('authButton');
    const userProfile = document.getElementById('userProfile');
    const userInitialCircle = document.getElementById('userInitialCircle');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');
    const authModalClose = document.getElementById('authModalClose');

    console.log('Elements found:', { authButton: !!authButton, userProfile: !!userProfile, userInitialCircle: !!userInitialCircle });

    // Hide sign in button, show user profile
    if (authButton) {
      authButton.style.display = 'none';
      console.log('Auth button hidden');
    } else {
      console.warn('authButton element not found!');
    }

    if (userProfile && this.currentUser) {
      userProfile.style.display = 'flex';
      console.log('User profile shown');

      // Set user initial
      if (userInitialCircle) {
        const initials = this.getUserInitials(this.currentUser);
        userInitialCircle.textContent = initials;
        console.log('User initials set to:', initials);
      } else {
        console.warn('userInitialCircle element not found!');
      }

      // Set dropdown info
      if (dropdownUserName) {
        dropdownUserName.textContent = this.currentUser.displayName || this.currentUser.email.split('@')[0];
      }
      if (dropdownUserEmail) {
        dropdownUserEmail.textContent = this.currentUser.email;
      }

      // Setup dropdown toggle
      this.setupDropdownToggle();
    } else {
      if (!userProfile) {
        console.warn('userProfile element not found!');
      }
      if (!this.currentUser) {
        console.warn('currentUser is null!');
      }
    }

    // Show close button when signed in
    if (authModalClose) {
      authModalClose.style.display = 'block';
    }

    // Hide auth modal if open
    this.closeAuthModal();
  }

  // Show unauthenticated UI
  showUnauthenticatedUI() {
    const authButton = document.getElementById('authButton');
    const userProfile = document.getElementById('userProfile');
    const authModalClose = document.getElementById('authModalClose');

    console.log('auth.js: Setting up unauthenticated UI');
    if (authButton) {
      authButton.textContent = 'Sign In';
      authButton.style.display = 'block';
      authButton.onclick = () => {
        console.log('auth.js: Sign In button clicked');
        this.openAuthModal();
      };
      console.log('auth.js: Auth button onclick handler attached');
    } else {
      console.error('auth.js: authButton element not found');
    }

    if (userProfile) {
      userProfile.style.display = 'none';
    }

    // Hide close button when not signed in
    if (authModalClose) {
      authModalClose.style.display = 'none';
    }
  }

  // Setup dropdown toggle functionality
  setupDropdownToggle() {
    const userInitialCircle = document.getElementById('userInitialCircle');
    const userDropdown = document.getElementById('userDropdown');
    const dropdownSignOut = document.getElementById('dropdownSignOut');

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

      // Handle sign out
      if (dropdownSignOut) {
        dropdownSignOut.onclick = () => {
          userDropdown.classList.remove('show');
          this.handleSignOut();
        };
      }
    }
  }

  // Handle sign out button click
  async handleSignOut() {
    if (confirm('Are you sure you want to sign out?')) {
      const result = await this.signOut();
      if (result.success) {
        alert('Signed out successfully');
      }
    }
  }

  // Open authentication modal
  openAuthModal() {
    console.log('auth.js: openAuthModal called');
    const modal = document.getElementById('authModal');
    console.log('auth.js: authModal element found:', !!modal);
    if (modal) {
      modal.style.display = 'flex';
      console.log('auth.js: Modal display set to flex');
    } else {
      console.error('auth.js: authModal element not found!');
    }
  }

  // Close authentication modal
  closeAuthModal() {
    // Only allow closing if user is signed in
    if (!this.isSignedIn()) {
      console.log('auth.js: Cannot close modal - user not signed in');
      return;
    }

    const modal = document.getElementById('authModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is signed in
  isSignedIn() {
    return this.currentUser !== null;
  }
}

// Initialize auth system globally
window.authSystem = new AuthSystem();
console.log('auth.js: AuthSystem instance created');

// Attach click handler to auth button immediately (before Firebase loads)
function setupAuthButton() {
  const authButton = document.getElementById('authButton');
  if (authButton && !authButton.dataset.handlerAttached) {
    console.log('auth.js: Setting up auth button click handler (early)');
    authButton.onclick = () => {
      console.log('auth.js: Auth button clicked (early handler)');
      if (window.authSystem) {
        window.authSystem.openAuthModal();
      }
    };
    authButton.dataset.handlerAttached = 'true';
  }
}

// Try to setup button immediately if DOM already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupAuthButton);
} else {
  setupAuthButton();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('auth.js: DOMContentLoaded event fired');
  console.log('auth.js: typeof firebase:', typeof firebase);

  // Setup auth button again (in case it wasn't done earlier)
  setupAuthButton();

  // Always initialize - the initialize() method will handle Firebase availability
  window.authSystem.initialize();

  // Fallback: Check auth state again after a short delay to ensure UI is updated
  setTimeout(() => {
    if (window.authSystem.isSignedIn()) {
      console.log('auth.js: Fallback check - user is signed in, ensuring UI is updated');
      window.authSystem.showAuthenticatedUI();
    }
  }, 500);
});
