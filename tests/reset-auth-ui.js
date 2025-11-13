// RESET AUTH UI - Copy and paste this into console

console.log('Resetting auth UI...');

const authButton = document.getElementById('authButton');
const userProfile = document.getElementById('userProfile');
const userInitialCircle = document.getElementById('userInitialCircle');

if (!authButton || !userProfile) {
  console.error('ERROR: Required elements not found!');
  console.log('authButton:', !!authButton);
  console.log('userProfile:', !!userProfile);
} else {
  // Check if user is signed in
  if (window.authSystem && window.authSystem.isSignedIn()) {
    const user = window.authSystem.getCurrentUser();
    console.log('✓ User is signed in:', user.email);

    // Show user profile, hide auth button
    authButton.style.display = 'none';
    userProfile.style.display = 'flex';

    if (userInitialCircle) {
      const initials = window.authSystem.getUserInitials(user);
      userInitialCircle.textContent = initials;
      console.log('✓ Set initials to:', initials);
    }

    console.log('✓ Auth button hidden, user profile shown');
  } else {
    console.log('✗ User is NOT signed in');

    // Show auth button, hide user profile
    authButton.style.display = 'block';
    userProfile.style.display = 'none';

    console.log('✓ Auth button shown, user profile hidden');
  }

  console.log('✓ Reset complete!');
}
