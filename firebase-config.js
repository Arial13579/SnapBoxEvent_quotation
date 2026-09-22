/* ═══════════════════════════════════════════════════════════════════════
 *  הגדרות לוח הבקרה של Snap Box
 *  ───────────────────────────────────────────────────────────────────────
 *  index.html (שמירת הצעות) + dashboard.html (תצוגה) קוראים מכאן.
 *  משתמש באותו חשבון Firebase החינמי של אתר ה-RSVP לחתונה, אבל באוסף
 *  נתונים נפרד לגמרי (snapbox_quotes) — אין שום קשר בין שני האתרים.
 *  בטוח להעלות את הקובץ הזה ל-GitHub — אין כאן סודות (המפתח הזה ציבורי
 *  מטבעו; ההרשאות האמיתיות נשמרות ב-Firestore Rules + כניסת גוגל).
 * ═══════════════════════════════════════════════════════════════════════ */

window.SNAPBOX_CONFIG = {

  /* ---- חשבון הגוגל היחיד שמורשה להיכנס ללוח הבקרה ---- */
  adminEmail: 'snapboxevent.official@gmail.com',

  firebase: {
    apiKey:            'AIzaSyCuC0SP-l3WSrZ57LdMbiEI15DwK8d1aQ4',
    authDomain:        'wedding-rsvp-e2e0f.firebaseapp.com',
    projectId:         'wedding-rsvp-e2e0f',
    storageBucket:     'wedding-rsvp-e2e0f.firebasestorage.app',
    messagingSenderId: '169119650995',
    appId:             '1:169119650995:web:4260a21d1e5a3312054cc6'
  }
};
