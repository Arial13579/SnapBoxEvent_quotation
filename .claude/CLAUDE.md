# SnapBoxEvent_quotation — זיכרון קצר
מערכת הצעות המחיר של עמדת הצילום Snap Box (הבעלים). Firebase project `wedding-rsvp-e2e0f`, מסד `(default)`.
חשבון העסק (adminEmail): `snapboxevent.official@gmail.com`. GitHub Pages מפרסם מ-`main` (PR + squash).

## לוח הבקרה (`dashboard.html`) — 3 טאבים (2026-10-13)
- **הצעות ולקוחות** (מה שהיה) + לכל לקוח **שחתם** שורת פרטים: שם מלא, מיקום, שעת התחלה–סיום, כמות שעות (סיום לפני התחלה = אחרי חצות), מחיר בחוזה, מוזמנים, הערות הלקוח,
  ושדות שלי: שם החתן/כלה, **סוג חבילה** (בסיסי 1,000 · בסיסי פלוס 1,100 · פרימיום 1,200 · פרימיום פלוס 1,300 · גולד 1,400 · גולד פלוס 1,500 · יהלום 1,700 — המחיר מופיע מיד),
  ☐ מקדמה ₪200 שולמה, ☐ שולם (**כל השורה בירוק בהיר**), ☐ הכנסתי את האירוע, ההערות שלי. נשמר אוטומטית.
- **יומן אירועים**: רק הצעות חתומות, לפי תאריך האירוע (dd/mm/yyyy). כרטיס: שם, חתן/כלה, סוג, מיקום, שעות + כמות, מחיר/חבילה/מקדמה/יתרה, הערות, ההערות שלי, Google Calendar, Waze, החוזה החתום, ics.
- **הכנסות והוצאות**: הכנסה = כל הצעה חתומה (לפי מועד החתימה ומחיר החוזה). הוצאות ידניות (`snapbox_expenses`). מדדים חודש/שנה, גרף, CSV.

## נתונים
- `snapbox_quotes/{id}` — ההצעה. **הלקוח יכול לקרוא אותה לפי מזהה (הקישור `?k=`)** — לכן אסור לשמור בה מידע פנימי.
- `snapbox_events/{quoteId}` = `{couple, pkg, pkgPrice, depositPaid, paid, entered, ownerNotes, updatedAt}` — רק חשבון העסק.
- `snapbox_expenses/{id}` = `{date YYYY-MM-DD, amount, label, category, createdAt}` — רק חשבון העסק.
- הכללים לשני האוספים: `_tests/firestore-snippet.rules` — להדביק **בתוך** `match /databases/{database}/documents { … }` בכללים הקיימים (Firebase ← wedding-rsvp-e2e0f ← Firestore ← Rules/Security ← Publish). בלי זה: היומן וההכנסות עובדים, השמירה של השדות שלי וההוצאות מציגה הודעה ברורה.
- בדיקה: `_tests/dashboard.e2e.js` (אמולטורים, `RULES=open|closed`).
