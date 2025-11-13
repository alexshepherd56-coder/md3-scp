// Diagnostic Script - Copy and paste this entire script into the console

console.log('=== AUTHENTICATION DIAGNOSIS ===\n');

// 1. Check if auth system exists
console.log('1. AUTH SYSTEM CHECK');
console.log('   window.authSystem exists:', !!window.authSystem);

if (window.authSystem) {
  // 2. Check user state
  console.log('\n2. USER STATE');
  const currentUser = window.authSystem.getCurrentUser();
  console.log('   Current user:', currentUser ? currentUser.email : 'null');
  console.log('   Is signed in:', window.authSystem.isSignedIn());

  if (currentUser) {
    console.log('   Display name:', currentUser.displayName || 'Not set');
    console.log('   Email:', currentUser.email);
    console.log('   UID:', currentUser.uid);
  }
}

// 3. Check DOM elements
console.log('\n3. DOM ELEMENTS');
const authButton = document.getElementById('authButton');
const userProfile = document.getElementById('userProfile');
const userInitialCircle = document.getElementById('userInitialCircle');

console.log('   authButton element:', !!authButton);
console.log('   userProfile element:', !!userProfile);
console.log('   userInitialCircle element:', !!userInitialCircle);

if (authButton) {
  console.log('   authButton display:', authButton.style.display);
  console.log('   authButton computed display:', window.getComputedStyle(authButton).display);
}

if (userProfile) {
  console.log('   userProfile display:', userProfile.style.display);
  console.log('   userProfile computed display:', window.getComputedStyle(userProfile).display);
}

if (userInitialCircle) {
  console.log('   userInitialCircle text:', userInitialCircle.textContent);
}

// 4. Show current visibility
console.log('\n4. CURRENT VISIBILITY');
console.log('   Auth button visible:', authButton && window.getComputedStyle(authButton).display !== 'none');
console.log('   User profile visible:', userProfile && window.getComputedStyle(userProfile).display !== 'none');

// 5. Suggest fix
console.log('\n5. RECOMMENDED ACTION');
if (window.authSystem && window.authSystem.isSignedIn()) {
  console.log('   ✓ User is signed in');
  if (!userProfile || window.getComputedStyle(userProfile).display === 'none') {
    console.log('   ✗ User profile is hidden or missing');
    console.log('   → Run this command to show profile:');
    console.log('     document.getElementById("authButton").style.display = "none"');
    console.log('     document.getElementById("userProfile").style.display = "flex"');
    console.log('     document.getElementById("userInitialCircle").textContent = "' +
      (window.authSystem.getUserInitials(window.authSystem.getCurrentUser())) + '"');
  } else {
    console.log('   ✓ User profile should be visible');
  }
} else {
  console.log('   ✗ User is not signed in');
  console.log('   → You need to sign in first');
}

console.log('\n=== END DIAGNOSIS ===');
