// access-control.js - Manage access restrictions for unauthenticated users

(function() {
  'use strict';

  // Configuration
  const FREE_QUESTION_LIMIT = 15;
  const FREE_EXAMS = {
    saq: ['saq-2024'],
    mcq: ['mcq-2024']
  };

  // Create auth gate modal
  function createAuthGateModal() {
    const modal = document.createElement('div');
    modal.id = 'authGateModal';
    modal.style.cssText = `
      display: none;
      position: fixed;
      z-index: 10000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      animation: fadeIn 0.3s ease-out;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      margin: 10% auto;
      padding: 50px 40px;
      border-radius: 20px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
      animation: slideDown 0.4s ease-out;
    `;

    const icon = document.createElement('div');
    icon.textContent = '🔒';
    icon.style.cssText = `
      font-size: 4rem;
      margin-bottom: 20px;
    `;

    const title = document.createElement('h2');
    title.textContent = 'Create an Account to Continue';
    title.style.cssText = `
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 1.8rem;
      color: #2c3e50;
      margin-bottom: 15px;
      font-weight: 400;
    `;

    const message = document.createElement('p');
    message.id = 'authGateMessage';
    message.textContent = 'Sign up to access all features and save your progress';
    message.style.cssText = `
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 1.1rem;
      color: #5a6c7d;
      margin-bottom: 30px;
      line-height: 1.6;
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 15px;
      justify-content: center;
    `;

    const signUpButton = document.createElement('button');
    signUpButton.textContent = 'Create Account';
    signUpButton.style.cssText = `
      background: #D97757;
      color: white;
      border: none;
      padding: 15px 35px;
      font-size: 1.1rem;
      border-radius: 10px;
      cursor: pointer;
      font-family: Georgia, 'Times New Roman', serif;
      transition: all 0.3s ease;
      flex: 1;
      max-width: 200px;
    `;

    signUpButton.addEventListener('mouseenter', () => {
      signUpButton.style.transform = 'translateY(-2px)';
      signUpButton.style.boxShadow = '0 10px 30px rgba(217, 119, 87, 0.3)';
      signUpButton.style.background = '#c66847';
    });

    signUpButton.addEventListener('mouseleave', () => {
      signUpButton.style.transform = 'translateY(0)';
      signUpButton.style.boxShadow = 'none';
      signUpButton.style.background = '#D97757';
    });

    signUpButton.addEventListener('click', () => {
      modal.style.display = 'none';
      const authModal = document.getElementById('authModal');
      if (authModal) {
        authModal.style.display = 'block';
        // Switch to sign up tab
        const signUpTab = document.getElementById('signUpTab');
        if (signUpTab) {
          signUpTab.click();
        }
      }
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Go Back';
    cancelButton.style.cssText = `
      background: transparent;
      color: #5a6c7d;
      border: 2px solid #e8ecef;
      padding: 15px 35px;
      font-size: 1.1rem;
      border-radius: 10px;
      cursor: pointer;
      font-family: Georgia, 'Times New Roman', serif;
      transition: all 0.3s ease;
      flex: 1;
      max-width: 200px;
    `;

    cancelButton.addEventListener('mouseenter', () => {
      cancelButton.style.borderColor = '#D97757';
      cancelButton.style.color = '#D97757';
    });

    cancelButton.addEventListener('mouseleave', () => {
      cancelButton.style.borderColor = '#e8ecef';
      cancelButton.style.color = '#5a6c7d';
    });

    cancelButton.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    buttonContainer.appendChild(signUpButton);
    buttonContainer.appendChild(cancelButton);

    modalContent.appendChild(icon);
    modalContent.appendChild(title);
    modalContent.appendChild(message);
    modalContent.appendChild(buttonContainer);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    return modal;
  }

  // Show auth gate modal
  function showAuthGate(message) {
    let modal = document.getElementById('authGateModal');
    if (!modal) {
      modal = createAuthGateModal();
    }

    const messageEl = document.getElementById('authGateMessage');
    if (messageEl && message) {
      messageEl.textContent = message;
    }

    modal.style.display = 'block';
  }

  // Check if user is authenticated
  function isUserAuthenticated() {
    return firebase.auth().currentUser !== null;
  }

  // Check if exam is free
  function isExamFree(examId) {
    // Check SAQ exams
    if (FREE_EXAMS.saq.includes(examId)) return true;
    // Check MCQ exams
    if (FREE_EXAMS.mcq.includes(examId)) return true;
    return false;
  }

  // Lock restricted exams on index page
  function lockRestrictedExams() {
    if (isUserAuthenticated()) return;

    // Lock SAQ exams
    const saqExams = ['2023', '2022'];
    saqExams.forEach(year => {
      const examCard = document.querySelector(`.case-card[data-exam="${year}"]`);
      if (examCard) {
        examCard.classList.add('locked-exam');
        examCard.onclick = function(e) {
          e.stopPropagation();
          showAuthGate('Create an account to access all past exams and track your progress');
          return false;
        };

        // Add lock overlay
        if (!examCard.querySelector('.lock-overlay')) {
          const lockOverlay = document.createElement('div');
          lockOverlay.className = 'lock-overlay';
          lockOverlay.innerHTML = `
            <div class="lock-content">
              <div class="lock-icon">🔒</div>
              <div class="lock-text">Sign in to access</div>
            </div>
          `;

          // Make lock badge clickable to open auth modal
          const lockContent = lockOverlay.querySelector('.lock-content');
          lockContent.onclick = function(e) {
            e.stopPropagation();
            const authModal = document.getElementById('authModal');
            if (authModal) {
              authModal.style.display = 'block';
              // Switch to sign up tab
              const signUpTab = document.getElementById('signUpTab');
              if (signUpTab) {
                signUpTab.click();
              }
            }
          };

          examCard.appendChild(lockOverlay);
        }
      }
    });

    // Lock MCQ exam
    const mcqExamCard = document.querySelector(`.case-card[data-exam="mcq-2023"]`);
    if (mcqExamCard) {
      mcqExamCard.classList.add('locked-exam');
      mcqExamCard.onclick = function(e) {
        e.stopPropagation();
        showAuthGate('Create an account to access all past exams and track your progress');
        return false;
      };

      // Add lock overlay
      if (!mcqExamCard.querySelector('.lock-overlay')) {
        const lockOverlay = document.createElement('div');
        lockOverlay.className = 'lock-overlay';
        lockOverlay.innerHTML = `
          <div class="lock-content">
            <div class="lock-icon">🔒</div>
            <div class="lock-text">Sign in to access</div>
          </div>
        `;

        // Make lock badge clickable to open auth modal
        const lockContent = lockOverlay.querySelector('.lock-content');
        lockContent.onclick = function(e) {
          e.stopPropagation();
          const authModal = document.getElementById('authModal');
          if (authModal) {
            authModal.style.display = 'block';
            // Switch to sign up tab
            const signUpTab = document.getElementById('signUpTab');
            if (signUpTab) {
              signUpTab.click();
            }
          }
        };

        mcqExamCard.appendChild(lockOverlay);
      }
    }
  }

  // Track question progress in exam
  function trackQuestionProgress() {
    if (isUserAuthenticated()) return;

    // Get current exam ID from URL
    const path = window.location.pathname;
    const examMatch = path.match(/\/(saq|mcq)-(\d{4})\.html/);

    if (!examMatch) return;

    const examType = examMatch[1];
    const examYear = examMatch[2];
    const examId = `${examType}-${examYear}`;

    // Check if this is a free exam
    if (!isExamFree(examId)) {
      // Redirect to year page with message
      showAuthGate('This exam requires an account. Create one to access all exams!');
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 3000);
      return;
    }

    // Track question views
    const questionKey = `exam_${examId}_question_views`;
    let viewedQuestions = parseInt(localStorage.getItem(questionKey) || '0');

    // Increment on question reveal
    const observer = new MutationObserver(() => {
      const revealedAnswers = document.querySelectorAll('.answer.revealed, .answer-content:not([style*="display: none"])');
      const currentCount = revealedAnswers.length;

      if (currentCount > viewedQuestions) {
        viewedQuestions = currentCount;
        localStorage.setItem(questionKey, viewedQuestions.toString());

        // Check if limit reached
        if (viewedQuestions >= FREE_QUESTION_LIMIT) {
          showAuthGate(`You've viewed ${FREE_QUESTION_LIMIT} questions. Create an account to access unlimited questions and save your progress!`);

          // Disable remaining reveal buttons
          const revealButtons = document.querySelectorAll('.reveal-answer-btn, .show-answer-btn');
          revealButtons.forEach((btn, index) => {
            if (index >= FREE_QUESTION_LIMIT) {
              btn.disabled = true;
              btn.style.opacity = '0.5';
              btn.style.cursor = 'not-allowed';
              btn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                showAuthGate(`You've reached the ${FREE_QUESTION_LIMIT}-question limit. Create an account to continue!`);
                return false;
              };
            }
          });

          observer.disconnect();
        }
      }
    });

    // Start observing when DOM is ready
    setTimeout(() => {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });

      // Check initial state
      const revealButtons = document.querySelectorAll('.reveal-answer-btn, .show-answer-btn');
      if (viewedQuestions >= FREE_QUESTION_LIMIT) {
        revealButtons.forEach((btn, index) => {
          if (index >= FREE_QUESTION_LIMIT) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.onclick = function(e) {
              e.preventDefault();
              e.stopPropagation();
              showAuthGate(`You've reached the ${FREE_QUESTION_LIMIT}-question limit. Create an account to continue!`);
              return false;
            };
          }
        });
      }
    }, 1000);
  }

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', () => {
    // Check if on exam index page
    if (window.location.pathname.includes('/year3/index.html') ||
        window.location.pathname.includes('/year4/index.html') ||
        window.location.pathname.endsWith('/year3/') ||
        window.location.pathname.endsWith('/year4/')) {
      lockRestrictedExams();

      // Re-lock when auth state changes
      firebase.auth().onAuthStateChanged(() => {
        lockRestrictedExams();
      });
    }

    // Check if on exam page
    if (window.location.pathname.includes('/exams/')) {
      trackQuestionProgress();
    }
  });

  // Export functions
  window.AccessControl = {
    showAuthGate,
    isUserAuthenticated,
    isExamFree,
    FREE_QUESTION_LIMIT
  };

})();
