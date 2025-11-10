// Ludicrous Mode - The most ridiculous mode ever created
// Author: Claude (with pure chaos in mind)

(function() {
  'use strict';

  const ludicrousToggle = document.getElementById('ludicrousModeToggle');
  let isLudicrousMode = localStorage.getItem('ludicrousMode') === 'true';
  let confettiInterval = null;
  let colorInterval = null;
  let rotationAngle = 0;

  // Initialize ludicrous mode state
  function initLudicrousMode() {
    if (ludicrousToggle) {
      ludicrousToggle.checked = isLudicrousMode;
      if (isLudicrousMode) {
        enableLudicrousMode();
      }
    }
  }

  // Confetti burst on click
  function createConfetti(x, y) {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff6600', '#ff0099', '#00ff99'];
    const confettiCount = 30;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'ludicrous-confetti';
      confetti.style.left = x + 'px';
      confetti.style.top = y + 'px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = Math.random() * 10 + 5 + 'px';
      confetti.style.height = confetti.style.width;

      const angle = (Math.PI * 2 * i) / confettiCount;
      const velocity = Math.random() * 5 + 5;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity - 5;

      confetti.dataset.vx = vx;
      confetti.dataset.vy = vy;
      confetti.dataset.rotation = Math.random() * 360;

      document.body.appendChild(confetti);

      animateConfetti(confetti);

      setTimeout(() => confetti.remove(), 3000);
    }
  }

  function animateConfetti(confetti) {
    let x = parseFloat(confetti.style.left);
    let y = parseFloat(confetti.style.top);
    let vx = parseFloat(confetti.dataset.vx);
    let vy = parseFloat(confetti.dataset.vy);
    let rotation = parseFloat(confetti.dataset.rotation);

    function animate() {
      if (!document.body.contains(confetti)) return;

      vy += 0.3; // gravity
      x += vx;
      y += vy;
      rotation += 10;

      confetti.style.left = x + 'px';
      confetti.style.top = y + 'px';
      confetti.style.transform = `rotate(${rotation}deg)`;
      confetti.style.opacity = Math.max(0, 1 - (Date.now() - confetti.dataset.startTime) / 3000);

      if (y < window.innerHeight + 100) {
        requestAnimationFrame(animate);
      } else {
        confetti.remove();
      }
    }

    confetti.dataset.startTime = Date.now();
    animate();
  }

  // Random background color shifts
  function startColorShift() {
    const hues = [0, 30, 60, 120, 180, 240, 270, 300, 330];
    let currentHueIndex = 0;

    colorInterval = setInterval(() => {
      currentHueIndex = (currentHueIndex + 1) % hues.length;
      const hue = hues[currentHueIndex];
      document.documentElement.style.setProperty('--ludicrous-bg-hue', hue);
    }, 3000);
  }

  // Trippy wobble animation for cards
  function addWobbleToCards() {
    const style = document.createElement('style');
    style.id = 'ludicrous-wobble-style';
    style.textContent = `
      .ludicrous-mode .case-card,
      .ludicrous-mode .exam-card-style {
        animation: ludicrous-wobble 2s ease-in-out infinite !important;
      }

      .ludicrous-mode .case-card:hover,
      .ludicrous-mode .exam-card-style:hover {
        animation: ludicrous-mega-wobble 0.5s ease-in-out infinite !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Rainbow text effect
  function addRainbowText() {
    const style = document.createElement('style');
    style.id = 'ludicrous-rainbow-style';
    style.textContent = `
      .ludicrous-mode h1,
      .ludicrous-mode h2,
      .ludicrous-mode h3 {
        background: linear-gradient(90deg,
          #ff0000, #ff7f00, #ffff00, #00ff00,
          #0000ff, #4b0082, #9400d3, #ff0000);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: ludicrous-rainbow 3s linear infinite !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Spinning logo
  function spinLogo() {
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.style.animation = 'ludicrous-spin 2s linear infinite';
    }
  }

  // Vortex transition
  function showVortexTransition(callback) {
    const vortex = document.getElementById('ludicrousVortex');
    if (!vortex) {
      callback();
      return;
    }

    // Show vortex
    vortex.style.display = 'flex';
    document.body.classList.add('ludicrous-vortex-active');

    // Play dramatic sound effect (optional - using audio API)
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 2);
    } catch (e) {
      console.log('Audio not supported, continuing without sound');
    }

    // After 3 seconds, hide vortex and activate ludicrous mode
    setTimeout(() => {
      vortex.style.display = 'none';
      document.body.classList.remove('ludicrous-vortex-active');
      callback();
    }, 3000);
  }

  // Enable ludicrous mode
  function enableLudicrousMode() {
    console.log('🎉 LUDICROUS MODE ACTIVATED! 🎉');

    // Add ludicrous class to body
    document.body.classList.add('ludicrous-mode');

    // Add all the crazy effects
    addWobbleToCards();
    addRainbowText();
    spinLogo();
    startColorShift();

    // Confetti on every click
    document.addEventListener('click', handleClick);

    // Periodic random confetti bursts
    confettiInterval = setInterval(() => {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      createConfetti(x, y);
    }, 2000);

    // Welcome confetti explosion
    setTimeout(() => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const x = Math.random() * window.innerWidth;
          const y = Math.random() * window.innerHeight;
          createConfetti(x, y);
        }, i * 200);
      }
    }, 100);
  }

  function handleClick(e) {
    createConfetti(e.clientX, e.clientY);
  }

  // Disable ludicrous mode
  function disableLudicrousMode() {
    console.log('Ludicrous mode deactivated... boring!');

    document.body.classList.remove('ludicrous-mode');
    document.removeEventListener('click', handleClick);

    if (confettiInterval) {
      clearInterval(confettiInterval);
      confettiInterval = null;
    }

    if (colorInterval) {
      clearInterval(colorInterval);
      colorInterval = null;
    }

    // Remove added styles
    const wobbleStyle = document.getElementById('ludicrous-wobble-style');
    if (wobbleStyle) wobbleStyle.remove();

    const rainbowStyle = document.getElementById('ludicrous-rainbow-style');
    if (rainbowStyle) rainbowStyle.remove();

    // Remove all confetti
    document.querySelectorAll('.ludicrous-confetti').forEach(c => c.remove());

    // Reset logo
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.style.animation = '';
    }

    // Reset body animation
    document.body.style.animation = '';
  }

  // Toggle event listener
  if (ludicrousToggle) {
    ludicrousToggle.addEventListener('change', () => {
      isLudicrousMode = ludicrousToggle.checked;
      localStorage.setItem('ludicrousMode', isLudicrousMode);

      if (isLudicrousMode) {
        // Show vortex transition before enabling
        showVortexTransition(() => {
          enableLudicrousMode();
        });
      } else {
        disableLudicrousMode();
      }
    });
  }

  // Initialize on load
  initLudicrousMode();
})();
