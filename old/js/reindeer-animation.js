// Reindeer Walking and Grazing Animation
(function() {
  'use strict';

  let reindeerContainer;
  let reindeerSvg;
  let isAnimating = false;
  let animationFrame;

  // Reindeer state
  let position = -150; // Start off-screen to the left
  let isWalking = true;
  let grazingTimeout;
  let walkingTimeout;

  function initReindeer() {
    console.log('[Reindeer] Initializing reindeer animation...');
    reindeerContainer = document.getElementById('reindeerContainer');
    if (!reindeerContainer) {
      console.error('[Reindeer] Container not found!');
      return;
    }

    reindeerSvg = reindeerContainer.querySelector('.reindeer-svg');
    if (!reindeerSvg) {
      console.error('[Reindeer] SVG not found!');
      return;
    }

    console.log('[Reindeer] Reindeer initialized');
  }

  function startAnimation() {
    if (!reindeerContainer || isAnimating) return;

    console.log('[Reindeer] Starting reindeer animation');
    isAnimating = true;
    reindeerContainer.style.display = 'block';

    // Start walking from the left
    startWalking();
    animate();
  }

  function stopAnimation() {
    if (!isAnimating) return;

    console.log('[Reindeer] Stopping reindeer animation');
    isAnimating = false;

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }

    if (grazingTimeout) {
      clearTimeout(grazingTimeout);
    }

    if (walkingTimeout) {
      clearTimeout(walkingTimeout);
    }

    if (reindeerContainer) {
      reindeerContainer.style.display = 'none';
    }

    // Reset position
    position = -150;
    isWalking = true;
  }

  function startWalking() {
    if (!reindeerSvg) return;

    isWalking = true;
    reindeerSvg.classList.remove('grazing');
    reindeerSvg.classList.add('walking');
    console.log('[Reindeer] Reindeer is walking');

    // Schedule stop for grazing after random time (5-10 seconds)
    const walkDuration = Math.random() * 5000 + 5000;
    walkingTimeout = setTimeout(() => {
      startGrazing();
    }, walkDuration);
  }

  function startGrazing() {
    if (!reindeerSvg) return;

    isWalking = false;
    reindeerSvg.classList.remove('walking');
    reindeerSvg.classList.add('grazing');
    console.log('[Reindeer] Reindeer is grazing');

    // Schedule start walking again after random time (3-6 seconds)
    const grazeDuration = Math.random() * 3000 + 3000;
    grazingTimeout = setTimeout(() => {
      startWalking();
    }, grazeDuration);
  }

  function animate() {
    if (!isAnimating) return;

    // Move reindeer when walking
    if (isWalking) {
      position += 0.5; // Move right slowly

      // If reindeer goes off-screen to the right, reset to left
      if (position > window.innerWidth + 150) {
        position = -150;
        console.log('[Reindeer] Reindeer looped back to start');
      }

      reindeerContainer.style.left = position + 'px';
    }

    animationFrame = requestAnimationFrame(animate);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReindeer);
  } else {
    initReindeer();
  }

  // Watch for welcome page visibility
  document.addEventListener('DOMContentLoaded', () => {
    const welcomePage = document.getElementById('welcomePage');
    if (welcomePage) {
      console.log('[Reindeer] Setting up welcome page observer');
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'style') {
            const display = welcomePage.style.display;
            console.log('[Reindeer] Welcome page display changed to:', display);
            if (display === 'none' || display === '') {
              stopAnimation();
            } else if (display === 'flex' || display === 'block') {
              // Small delay to ensure everything is loaded
              setTimeout(startAnimation, 500);
            }
          }
        });
      });

      observer.observe(welcomePage, {
        attributes: true,
        attributeFilter: ['style']
      });

      // Check if welcome page is already visible
      setTimeout(() => {
        if (welcomePage.style.display !== 'none' && welcomePage.style.display !== '') {
          console.log('[Reindeer] Welcome page already visible, starting animation');
          startAnimation();
        }
      }, 1000);
    }
  });

  // Listen for welcome page shown event
  if (window.eventBus) {
    window.eventBus.on('welcome:shown', () => {
      console.log('[Reindeer] Welcome page shown event received');
      setTimeout(startAnimation, 500);
    });
  }

  // Export functions for manual control if needed
  window.reindeerAnimation = {
    start: startAnimation,
    stop: stopAnimation
  };
})();
