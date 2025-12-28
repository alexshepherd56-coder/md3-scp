// Authentication UI Handler
// Manages the authentication modal forms and user interactions

document.addEventListener('DOMContentLoaded', () => {
  console.log('auth-ui.js: DOMContentLoaded event fired');
  console.log('auth-ui.js: window.authSystem exists:', !!window.authSystem);

  // Form elements
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const authModalTitle = document.getElementById('authModalTitle');
  const authError = document.getElementById('authError');

  console.log('auth-ui.js: Form elements found:', {
    signInForm: !!signInForm,
    signUpForm: !!signUpForm,
    forgotPasswordForm: !!forgotPasswordForm
  });

  if (!signInForm || !signUpForm) {
    console.error('auth-ui.js: Critical form elements not found!');
    return;
  }

  // Form toggle links
  const showSignUp = document.getElementById('showSignUp');
  const showSignIn = document.getElementById('showSignIn');
  const showForgotPassword = document.getElementById('showForgotPassword');
  const backToSignIn = document.getElementById('backToSignIn');

  // Show error message
  function showError(message) {
    authError.textContent = message;
    authError.style.display = 'block';
    setTimeout(() => {
      authError.style.display = 'none';
    }, 5000);
  }

  // Show success message
  function showSuccess(message) {
    authError.textContent = message;
    authError.style.display = 'block';
    authError.style.backgroundColor = '#4CAF50';
    setTimeout(() => {
      authError.style.display = 'none';
      authError.style.backgroundColor = '#f44336';
    }, 3000);
  }

  // Toggle forms
  function showSignInForm() {
    const authModalSubtitle = document.getElementById('authModalSubtitle');
    signInForm.style.display = 'block';
    signUpForm.style.display = 'none';
    forgotPasswordForm.style.display = 'none';
    authModalTitle.textContent = 'Sign In';
    if (authModalSubtitle) {
      authModalSubtitle.style.display = 'none';
      authModalSubtitle.textContent = '';
    }
    authError.style.display = 'none';
  }

  function showSignUpFormView() {
    const authModalSubtitle = document.getElementById('authModalSubtitle');
    signInForm.style.display = 'none';
    signUpForm.style.display = 'block';
    forgotPasswordForm.style.display = 'none';
    authModalTitle.textContent = 'Sign Up';
    if (authModalSubtitle) {
      authModalSubtitle.style.display = 'block';
      authModalSubtitle.textContent = "don't worry it's free";
    }
    authError.style.display = 'none';
  }

  function showForgotPasswordForm() {
    const authModalSubtitle = document.getElementById('authModalSubtitle');
    signInForm.style.display = 'none';
    signUpForm.style.display = 'none';
    forgotPasswordForm.style.display = 'block';
    authModalTitle.textContent = 'Reset Password';
    if (authModalSubtitle) {
      authModalSubtitle.style.display = 'none';
    }
    authError.style.display = 'none';
  }

  // Event listeners for form toggles
  if (showSignUp) {
    showSignUp.addEventListener('click', (e) => {
      e.preventDefault();
      showSignUpFormView();
    });
  }

  if (showSignIn) {
    showSignIn.addEventListener('click', (e) => {
      e.preventDefault();
      showSignInForm();
    });
  }

  if (showForgotPassword) {
    showForgotPassword.addEventListener('click', (e) => {
      e.preventDefault();
      showForgotPasswordForm();
    });
  }

  if (backToSignIn) {
    backToSignIn.addEventListener('click', (e) => {
      e.preventDefault();
      showSignInForm();
    });
  }

  // Sign In Form Handler
  if (signInForm) {
    console.log('auth-ui.js: Attaching submit handler to signInForm');
    signInForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('auth-ui.js: Sign in form submitted');

      const emailInput = document.getElementById('signInEmail');
      const passwordInput = document.getElementById('signInPassword');

      console.log('auth-ui.js: Email input found:', !!emailInput);
      console.log('auth-ui.js: Password input found:', !!passwordInput);

      const email = emailInput ? emailInput.value : '';
      const password = passwordInput ? passwordInput.value : '';

      console.log('auth-ui.js: Email:', email, 'Password length:', password.length);

      if (!email || !password) {
        console.warn('auth-ui.js: Missing email or password');
        showError('Please enter email and password');
        return;
      }

      // Check if authSystem is available
      if (!window.authSystem) {
        console.error('auth-ui.js: authSystem not available');
        showError('Authentication system not initialized. Please refresh the page.');
        return;
      }

      console.log('auth-ui.js: Auth system available, attempting sign in');

      const submitButton = signInForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Signing in...';

      try {
        console.log('auth-ui.js: Calling authSystem.signIn');
        const result = await window.authSystem.signIn(email, password);
        console.log('auth-ui.js: Sign in result:', result);

        if (result.success) {
          console.log('auth-ui.js: Sign in successful');
          signInForm.reset();
          // Modal will be closed by auth state change
        } else {
          console.error('auth-ui.js: Sign in failed:', result.error);
          showError(result.error || 'Failed to sign in');
          submitButton.disabled = false;
          submitButton.textContent = 'Sign In';
        }
      } catch (error) {
        console.error('auth-ui.js: Sign in exception:', error);
        showError('An error occurred during sign in: ' + error.message);
        submitButton.disabled = false;
        submitButton.textContent = 'Sign In';
      }
    });
  }

  // Sign Up Form Handler
  if (signUpForm) {
    console.log('auth-ui.js: Attaching submit handler to signUpForm');
    signUpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('auth-ui.js: Sign up form submitted');

      const email = document.getElementById('signUpEmail').value;
      const name = document.getElementById('signUpName').value.trim();
      const password = document.getElementById('signUpPassword').value;

      if (!email) {
        showError('Please enter your email');
        return;
      }

      if (!name) {
        showError('Please enter your full name');
        return;
      }

      if (!password) {
        showError('Please enter a password');
        return;
      }

      if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
      }

      // Check if authSystem is available
      if (!window.authSystem) {
        showError('Authentication system not initialized. Please refresh the page.');
        return;
      }

      const submitButton = signUpForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Creating account...';

      try {
        const result = await window.authSystem.signUp(email, password, name);

        if (result.success) {
          signUpForm.reset();
          showSuccess('Account created successfully!');
          setTimeout(showSignInForm, 2000);
        } else {
          showError(result.error || 'Failed to create account');
          submitButton.disabled = false;
          submitButton.textContent = 'Sign Up';
        }
      } catch (error) {
        console.error('Sign up error:', error);
        showError('An error occurred during sign up');
        submitButton.disabled = false;
        submitButton.textContent = 'Sign Up';
      }
    });
  }

  // Forgot Password Form Handler
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('forgotPasswordEmail').value;

      if (!email) {
        showError('Please enter your email');
        return;
      }

      const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';

      const result = await window.authSystem.sendPasswordResetEmail(email);

      if (result.success) {
        showSuccess('Password reset email sent! Check your inbox.');
        forgotPasswordForm.reset();
        setTimeout(showSignInForm, 3000);
      } else {
        showError(result.error || 'Failed to send reset email');
      }

      submitButton.disabled = false;
      submitButton.textContent = 'Send Reset Link';
    });
  }

  // Close modal on outside click (only if signed in)
  const authModal = document.getElementById('authModal');
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal && window.authSystem.isSignedIn()) {
        window.authSystem.closeAuthModal();
      }
    });
  }
});
