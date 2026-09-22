/* Service Worker קטן שמטרתו יחידה: לאפשר כפתור "הוספה ליומן" עם מסך native
   אמיתי גם באייפון, למרות שכל הצעת מחיר היא עם תאריך/פרטים אחרים.
   אין דרך לארח קובץ .ics אמיתי שונה לכל קישור בלי שרת — אז ה-Service Worker
   "מתחזה" לשרת: כשהדף מנווט אל cal-event.ics?... הוא בונה את קובץ ה-ICS
   בזמן אמת מתוך פרטי ה-URL ומחזיר אותו עם Content-Type: text/calendar,
   בדיוק כאילו זה קובץ אמיתי — ספארי מזהה את זה ופותח את מסך "הוספה ליומן". */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (event.request.mode === 'navigate' && url.pathname.endsWith('/cal-event.ics')) {
        event.respondWith(buildIcsResponse(url.searchParams));
    }
});

function pad(n) { return String(n).padStart(2, '0'); }

function fmtIcsDate(ms) {
    const d = new Date(Number(ms));
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) +
        'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
}

function escapeIcs(s) {
    return String(s || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function buildIcsResponse(params) {
    const title    = params.get('title')    || 'Snap Box';
    const location = params.get('location') || '';
    const details  = params.get('details')  || '';
    const start    = params.get('start');
    const end      = params.get('end');

    const body = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Snap Box//Quote Calendar//HE',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:' + Date.now() + '-snapbox@arial13579.github.io',
        'DTSTAMP:' + fmtIcsDate(Date.now()),
        'DTSTART:' + fmtIcsDate(start),
        'DTEND:' + fmtIcsDate(end),
        'SUMMARY:' + escapeIcs(title),
        'LOCATION:' + escapeIcs(location),
        'DESCRIPTION:' + escapeIcs(details),
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    return new Response(body, {
        headers: { 'Content-Type': 'text/calendar; charset=utf-8' }
    });
}
