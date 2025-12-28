// Exam Page View Tracker
// Automatically tracks when an exam page or OSCE timer is viewed

(function() {
  'use strict';

  let hasTracked = false; // Prevent duplicate tracking

  // Wait for Firebase and auth to be ready
  async function initExamTracking() {
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
      console.log('[Exam Tracker] Firebase not available yet, retrying...');
      setTimeout(initExamTracking, 500);
      return;
    }

    const auth = window.firebaseAuth || firebase.auth();
    const db = window.firebaseDb || firebase.firestore();

    if (!auth || !db) {
      console.log('[Exam Tracker] Auth or DB not available yet, retrying...');
      setTimeout(initExamTracking, 500);
      return;
    }

    // Wait for user to be authenticated (check once, don't listen to state changes)
    const user = auth.currentUser;

    if (!user) {
      // User not signed in yet, wait and retry once
      console.log('[Exam Tracker] Waiting for user authentication...');
      setTimeout(initExamTracking, 1000);
      return;
    }

    // Prevent duplicate tracking
    if (hasTracked) {
      console.log('[Exam Tracker] Already tracked this page view, skipping');
      return;
    }
    hasTracked = true;

    try {
      // Get exam/resource ID from URL
      const path = window.location.pathname;
      const fileName = path.split('/').pop();
      const resourceId = fileName.replace('.html', '');

      // Get resource title from document title or filename
      const fullTitle = document.title;
      const resourceTitle = fullTitle.split('|')[0].trim();

      // Determine resource type
      let resourceType = 'exam';
      if (resourceId.includes('osce-timer')) {
        resourceType = 'osce-timer';
      } else if (resourceId.includes('saq')) {
        resourceType = 'saq';
      } else if (resourceId.includes('mcq')) {
        resourceType = 'mcq';
      }

      console.log('[Exam Tracker] Tracking resource view:', resourceId, resourceTitle, resourceType);

      // Track in user's document
      const userRef = db.collection('users').doc(user.uid);
      await userRef.set({
        lastViewedExam: resourceId,
        lastViewedExamTitle: resourceTitle,
        lastViewedExamTime: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // Track in global exam analytics
      const examRef = db.collection('examAnalytics').doc(resourceId);
      await examRef.set({
        resourceId: resourceId,
        title: resourceTitle,
        type: resourceType,
        viewCount: firebase.firestore.FieldValue.increment(1),
        lastViewed: firebase.firestore.FieldValue.serverTimestamp(),
        uniqueViewers: firebase.firestore.FieldValue.arrayUnion(user.uid)
      }, { merge: true });

      console.log('[Exam Tracker] Successfully tracked exam view');

    } catch (error) {
      console.error('[Exam Tracker] Error tracking exam view:', error);
    }
  }

  // Start tracking when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initExamTracking, 1000);
    });
  } else {
    setTimeout(initExamTracking, 1000);
  }
})();
