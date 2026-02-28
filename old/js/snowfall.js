// Snowfall Animation for Welcome Page
(function() {
  'use strict';

  let canvas, ctx;
  let snowflakes = [];
  let animationFrame;
  let isSnowing = false;

  class Snowflake {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = -10;
      this.radius = Math.random() * 4 + 2; // Snowflake size between 2-6px
      this.speed = Math.random() * 2 + 1; // Fall speed between 1-3
      this.drift = Math.random() * 1 - 0.5; // Horizontal drift
      this.opacity = Math.random() * 0.4 + 0.6; // Opacity between 0.6-1
    }

    update() {
      this.y += this.speed;
      this.x += this.drift;

      // Reset snowflake when it goes off screen
      if (this.y > canvas.height) {
        this.reset();
      }

      // Wrap horizontally
      if (this.x > canvas.width + 10) {
        this.x = -10;
      } else if (this.x < -10) {
        this.x = canvas.width + 10;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.fill();
    }
  }

  function initSnowfall() {
    console.log('[Snowfall] Initializing snowfall...');
    canvas = document.getElementById('snowfallCanvas');
    if (!canvas) {
      console.error('[Snowfall] Canvas element not found!');
      return;
    }
    console.log('[Snowfall] Canvas found:', canvas);

    ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('[Snowfall] Could not get 2D context from canvas!');
      return;
    }
    console.log('[Snowfall] Canvas context created:', ctx);

    resizeCanvas();
    console.log('[Snowfall] Canvas size:', canvas.width, 'x', canvas.height);

    // Create snowflakes
    const snowflakeCount = 150;
    for (let i = 0; i < snowflakeCount; i++) {
      const snowflake = new Snowflake();
      // Distribute initial positions across the screen
      snowflake.y = Math.random() * canvas.height;
      snowflakes.push(snowflake);
    }
    console.log('[Snowfall] Created', snowflakeCount, 'snowflakes');

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);

    // Don't start automatically - wait for welcome page to be visible
    console.log('[Snowfall] Initialization complete, waiting for welcome page');
  }

  function resizeCanvas() {
    if (!canvas) return;

    // Use full window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 72; // Subtract header height
  }

  let frameCount = 0;
  function animate() {
    if (!isSnowing) return;

    if (!ctx || !canvas) {
      console.error('[Snowfall] Context or canvas not available in animate()');
      isSnowing = false;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    snowflakes.forEach(snowflake => {
      snowflake.update();
      snowflake.draw();
    });

    // Log every 60 frames (about once per second)
    if (frameCount % 60 === 0) {
      console.log('[Snowfall] Animating... frame', frameCount, 'snowflakes:', snowflakes.length);
    }
    frameCount++;

    animationFrame = requestAnimationFrame(animate);
  }

  function startSnowfall() {
    if (!isSnowing) {
      console.log('[Snowfall] Starting snowfall animation');

      // Make sure we have canvas and context
      if (!canvas) {
        console.error('[Snowfall] Cannot start - canvas not found');
        return;
      }
      if (!ctx) {
        console.error('[Snowfall] Cannot start - context not initialized');
        return;
      }

      isSnowing = true;
      canvas.style.display = 'block';
      console.log('[Snowfall] Canvas displayed, starting animation');
      animate();
    }
  }

  function stopSnowfall() {
    console.log('[Snowfall] Stopping snowfall animation');
    isSnowing = false;
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
    }
  }

  // Listen for welcome page visibility
  if (window.eventBus) {
    window.eventBus.on('welcome:shown', () => {
      console.log('[Snowfall] Welcome page shown event received');
      // Small delay to ensure canvas is sized correctly
      setTimeout(() => {
        resizeCanvas();
        startSnowfall();
      }, 100);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('[Snowfall] DOM loaded, initializing...');
      initSnowfall();
      // Also check if welcome page is visible after init
      setTimeout(() => {
        const welcomePage = document.getElementById('welcomePage');
        if (welcomePage && welcomePage.style.display !== 'none') {
          console.log('[Snowfall] Welcome page is visible, ensuring snowfall is running');
          if (!isSnowing && ctx) {
            startSnowfall();
          }
        }
      }, 500);
    });
  } else {
    console.log('[Snowfall] DOM already loaded, initializing...');
    initSnowfall();
    setTimeout(() => {
      const welcomePage = document.getElementById('welcomePage');
      if (welcomePage && welcomePage.style.display !== 'none') {
        console.log('[Snowfall] Welcome page is visible, ensuring snowfall is running');
        if (!isSnowing && ctx) {
          startSnowfall();
        }
      }
    }, 500);
  }

  // Watch for welcome page visibility changes
  document.addEventListener('DOMContentLoaded', () => {
    const welcomePage = document.getElementById('welcomePage');
    if (welcomePage) {
      console.log('[Snowfall] Setting up welcome page observer');
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'style') {
            const display = welcomePage.style.display;
            console.log('[Snowfall] Welcome page display changed to:', display);
            if (display === 'none' || display === '') {
              stopSnowfall();
            } else if (display === 'flex' || display === 'block') {
              resizeCanvas();
              startSnowfall();
            }
          }
        });
      });

      observer.observe(welcomePage, {
        attributes: true,
        attributeFilter: ['style']
      });
    }
  });

  // Export functions for manual control if needed
  window.snowfallAnimation = {
    start: startSnowfall,
    stop: stopSnowfall,
    resize: resizeCanvas
  };
})();
