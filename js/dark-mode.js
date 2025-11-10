// Dark Mode Toggle Functionality

(function() {
  const darkModeToggle = document.getElementById('darkModeToggle');

  // Check if dark mode is saved in localStorage
  const isDarkMode = localStorage.getItem('darkMode') === 'true';

  // Apply dark mode on load if it was previously enabled
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    if (darkModeToggle) {
      darkModeToggle.checked = true;
    }
  }

  // Toggle dark mode when switch is clicked
  if (darkModeToggle) {
    darkModeToggle.addEventListener('change', function() {
      if (this.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
      }
    });
  }
})();
