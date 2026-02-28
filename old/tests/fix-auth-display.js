// Manual Auth Display Fix Script
// Run this in the browser console if the user profile is not showing

console.log('=== Auth Display Fix Script ===');

// Check if auth system exists
if (typeof window.authSystem !== 'undefined') {
  console.log('✓ Auth system found');

  // Check current user
  const currentUser = window.authSystem.getCurrentUser();
  if (currentUser) {
    console.log('✓ User is signed in:', currentUser.email);
    console.log('Display name:', currentUser.displayName);

    // Check elements
    const authButton = document.getElementById('authButton');
    const userProfile = document.getElementById('userProfile');
    const userInitialCircle = document.getElementById('userInitialCircle');

    console.log('Elements:', {
      authButton: !!authButton,
      userProfile: !!userProfile,
      userInitialCircle: !!userInitialCircle
    });

    // Force UI update
    console.log('Forcing UI update...');

    if (authButton) {
      authButton.style.display = 'none';
      console.log('✓ Hidden auth button');
    }

    if (userProfile) {
      userProfile.style.display = 'flex';
      console.log('✓ Shown user profile');
    }

    if (userInitialCircle) {
      const initials = window.authSystem.getUserInitials(currentUser);
      userInitialCircle.textContent = initials;
      console.log('✓ Set initials to:', initials);
    }

    console.log('=== Fix complete! ===');
  } else {
    console.error('✗ No user is signed in');
  }
} else {
  console.error('✗ Auth system not found');
}
